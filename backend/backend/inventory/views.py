import os
from decimal import Decimal

from django.http import FileResponse, HttpResponse
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import generics, filters
from django.db.models import F, Q
from .utils import update_menu_item_availability
from .models import (
    Ingredient,
    MenuItemIngredient,
    PurchaseInvoice,
    PurchaseInvoiceAttachment,
    PurchaseInvoiceLine,
    StockMovement,
    StockTransfer,
    StockTransferLog,
    Supplier,
    SupplierPayment,
)
from .pagination import StockMovementPagination
from datetime import timedelta
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from django.utils.timezone import now
from django.db.models import DecimalField, F, Sum, ExpressionWrapper
from .serializers import (
    IngredientSerializer,
    MenuItemIngredientSerializer,
    PurchaseInvoiceAttachmentSerializer,
    PurchaseInvoiceSerializer,
    StockMovementSerializer,
    StockTransferSerializer,
    SupplierPaymentSerializer,
    SupplierSerializer,
)
from .services import (
    change_ingredient_stock,
    create_purchase_invoice,
    create_supplier_payment,
    edit_stock_movement,
    get_effective_quantity,
    post_purchase_invoice_inventory,
    supplier_ledger,
)
from audit.constants import AuditAction, AuditModule
from audit.services import (
    actor_name,
    calculate_field_changes,
    changed_new_values,
    changed_old_values,
    create_audit_log,
    normalize_audit_value,
    record_instance_create,
    record_instance_delete,
    record_instance_update,
    snapshot_instance,
)
from restaurants.permissions import IsRestaurantAdmin,IsSameRestaurant,IsRestaurantActive,IsKitchenManager,IsInventoryManager,IsOperationsManager,IsFinanceManager
from restaurants.branching import filter_queryset_for_request, get_active_branch, get_requested_branch


def _purchase_invoice_audit_values(invoice):
    invoice = (
        PurchaseInvoice.objects
        .select_related("supplier", "branch", "created_by")
        .prefetch_related("lines__ingredient", "payments")
        .get(pk=invoice.pk)
    )
    return normalize_audit_value(
        {
            "invoice_number": invoice.invoice_number or f"PINV-{invoice.id}",
            "supplier": invoice.supplier.name if invoice.supplier_id else "Cash / No Supplier",
            "purchase_date": invoice.purchase_date,
            "due_date": invoice.due_date,
            "status": invoice.status,
            "total_amount": invoice.total_amount,
            "amount_paid": invoice.amount_paid,
            "remaining_balance": invoice.remaining_balance,
            "branch": invoice.branch.name if invoice.branch_id else None,
            "items": [
                {
                    "ingredient": line.ingredient.name,
                    "quantity": line.quantity,
                    "unit_price": line.unit_price,
                    "total_price": line.total_price,
                    "stock_movement": line.stock_movement_id,
                }
                for line in invoice.lines.all()
            ],
            "payments": [
                {
                    "id": payment.id,
                    "amount": payment.amount,
                    "date": payment.date,
                    "method": payment.payment_method,
                }
                for payment in invoice.payments.all()
            ],
        }
    )


def _supplier_audit_values(supplier):
    return snapshot_instance(
        supplier,
        fields=[
            "name",
            "contact_person",
            "phone",
            "email",
            "address",
            "notes",
            "is_active",
            "branch",
        ],
    )


def _actor_name(request):
    staff = getattr(request.user, "staff_profile", None)
    return getattr(staff, "name", None) or request.user.get_username()


INGREDIENT_AUDIT_FIELDS = [
    "name",
    "unit",
    "quantity_available",
    "minimum_threshold",
    "cost_per_unit",
    "is_active",
    "branch",
]

RECIPE_AUDIT_FIELDS = [
    "menu_item",
    "ingredient",
    "quantity_required",
]

STOCK_MOVEMENT_AUDIT_FIELDS = [
    "ingredient",
    "change_quantity",
    "movement_type",
    "unit_cost",
    "note",
    "branch",
]

STOCK_TRANSFER_AUDIT_FIELDS = [
    "ingredient",
    "quantity",
    "from_branch",
    "to_branch",
    "status",
    "notes",
    "created_by",
    "approved_by",
]



# INGREDIENT CRUD
from django.db.models import Count


def ingredient_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    qs = Ingredient.objects.filter(restaurant=restaurant)
    return filter_queryset_for_request(
        request,
        qs,
        allow_all_for_admin=True,
    )


def get_inventory_report_branch(request):
    return get_requested_branch(
        request,
        allow_all=True,
        raise_exception=False,
    )


class IngredientListCreateView(generics.ListCreateAPIView):

    serializer_class = IngredientSerializer
    permission_classes = [
        IsKitchenManager | IsRestaurantAdmin | IsInventoryManager |IsOperationsManager | IsFinanceManager,
        IsSameRestaurant,
        IsRestaurantActive
    ]

    def get_queryset(self):
        return ingredient_queryset_for_request(self.request).annotate(
            menu_items_count=Count('menu_items', distinct=True)
        )

    def perform_create(self, serializer):
        restaurant = self.request.user.staff_profile.restaurant
        branch = get_active_branch(self.request)
        ingredient = serializer.save(restaurant=restaurant, branch=branch)
        record_instance_create(
            request=self.request,
            instance=ingredient,
            module=AuditModule.INVENTORY,
            fields=INGREDIENT_AUDIT_FIELDS,
            description=f"{_actor_name(self.request)} created ingredient {ingredient.name}.",
        )

class IngredientPaginatedView(generics.ListAPIView):
    serializer_class = IngredientSerializer
    permission_classes = [IsRestaurantAdmin | IsKitchenManager | IsInventoryManager |IsOperationsManager, IsSameRestaurant, IsRestaurantActive]
    pagination_class = StockMovementPagination

    filter_backends = [filters.SearchFilter]
    search_fields = ['name']  # you can add more fields later

    def get_queryset(self):
        return ingredient_queryset_for_request(self.request).annotate(
            menu_items_count=Count('menu_items', distinct=True)
        )

class IngredientRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [IsRestaurantAdmin | IsInventoryManager |IsOperationsManager ,IsSameRestaurant,IsRestaurantActive]
    def get_queryset(self):
        return ingredient_queryset_for_request(self.request)

    def perform_update(self, serializer):
        old_values = snapshot_instance(self.get_object(), fields=INGREDIENT_AUDIT_FIELDS)
        ingredient = serializer.save()
        record_instance_update(
            request=self.request,
            instance=ingredient,
            old_values=old_values,
            module=AuditModule.INVENTORY,
            fields=INGREDIENT_AUDIT_FIELDS,
            description=f"{_actor_name(self.request)} updated ingredient {ingredient.name}.",
            severity="WARNING" if "quantity_available" in calculate_field_changes(old_values, snapshot_instance(ingredient, fields=INGREDIENT_AUDIT_FIELDS)) else "INFO",
        )

    def perform_destroy(self, instance):
        record_instance_delete(
            request=self.request,
            instance=instance,
            module=AuditModule.INVENTORY,
            fields=INGREDIENT_AUDIT_FIELDS,
            description=f"{_actor_name(self.request)} deleted ingredient {instance.name}.",
            severity="WARNING",
        )
        instance.delete()


@api_view(["GET"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def ingredient_purchase_history_view(request, pk):
    try:
        ingredient = ingredient_queryset_for_request(request).get(pk=pk)
    except Ingredient.DoesNotExist:
        return Response({"detail": "Ingredient not found."}, status=404)

    lines = (
        PurchaseInvoiceLine.objects.filter(
            ingredient=ingredient,
            invoice__restaurant=request.user.staff_profile.restaurant,
        )
        .exclude(invoice__status=PurchaseInvoice.STATUS_DRAFT)
        .select_related(
            "invoice",
            "invoice__supplier",
            "invoice__branch",
            "stock_movement",
        )
        .order_by("-invoice__purchase_date", "-invoice__created_at", "-id")
    )
    lines = filter_queryset_for_request(
        request,
        lines,
        branch_field="invoice__branch",
        allow_all_for_admin=True,
    )

    return Response(
        [
            {
                "id": line.id,
                "purchase_date": line.invoice.purchase_date,
                "supplier": line.invoice.supplier_id,
                "supplier_name": (
                    line.invoice.supplier.name
                    if line.invoice.supplier_id
                    else "Cash / No Supplier"
                ),
                "purchase_invoice": line.invoice_id,
                "invoice_number": line.invoice.invoice_number or f"PINV-{line.invoice_id}",
                "quantity": line.quantity,
                "unit_cost": line.unit_price,
                "total_cost": line.total_price,
                "stock_movement": line.stock_movement_id,
                "branch": line.invoice.branch_id,
                "branch_name": line.invoice.branch.name if line.invoice.branch_id else "",
            }
            for line in lines
        ]
    )


# MENU ITEM RECIPE
class MenuItemIngredientListCreateView(generics.ListCreateAPIView):
    queryset = MenuItemIngredient.objects.select_related('menu_item', 'ingredient')
    serializer_class = MenuItemIngredientSerializer
    permission_classes = [IsRestaurantAdmin | IsInventoryManager |IsOperationsManager , IsSameRestaurant, IsRestaurantActive]

    def get_queryset(self):
        staff = self.request.user.staff_profile
        restaurant = staff.restaurant
        qs = MenuItemIngredient.objects.filter(
            menu_item__restaurant=restaurant,
        )
        branch = get_requested_branch(
            self.request,
            allow_all=True,
            raise_exception=False,
        )
        if branch:
            qs = qs.filter(
                Q(menu_item__branch=branch) | Q(menu_item__branch__isnull=True),
                Q(ingredient__branch=branch) | Q(ingredient__branch__isnull=True),
            )
        elif not staff.has_all_branch_access:
            branches = staff.get_available_branches()
            qs = qs.filter(
                Q(menu_item__branch__in=branches) | Q(menu_item__branch__isnull=True),
                Q(ingredient__branch__in=branches) | Q(ingredient__branch__isnull=True),
            )
        return qs.select_related('menu_item', 'ingredient')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["restaurant"] = self.request.user.staff_profile.restaurant
        context["branch"] = get_active_branch(self.request, raise_exception=False)
        return context

    def perform_create(self, serializer):
        instance = serializer.save()
        branch = get_active_branch(self.request, raise_exception=False) or instance.ingredient.branch
        record_instance_create(
            request=self.request,
            instance=instance,
            module=AuditModule.MENU,
            fields=RECIPE_AUDIT_FIELDS,
            branch=branch,
            description=(
                f"{_actor_name(self.request)} added {instance.ingredient.name} "
                f"to recipe for {instance.menu_item.name}."
            ),
        )

        # 🔥 update availability after adding ingredient
        branch = get_active_branch(self.request, raise_exception=False)
        update_menu_item_availability(
            instance.menu_item,
            branch=branch or instance.ingredient.branch,
        )


class MenuItemIngredientDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemIngredientSerializer
    permission_classes = [IsRestaurantAdmin | IsInventoryManager |IsOperationsManager, IsRestaurantActive, IsSameRestaurant]

    def get_queryset(self):
        staff = self.request.user.staff_profile
        restaurant = staff.restaurant
        qs = MenuItemIngredient.objects.filter(
            menu_item__restaurant=restaurant,
        )
        branch = get_requested_branch(
            self.request,
            allow_all=True,
            raise_exception=False,
        )
        if branch:
            qs = qs.filter(
                Q(menu_item__branch=branch) | Q(menu_item__branch__isnull=True),
                Q(ingredient__branch=branch) | Q(ingredient__branch__isnull=True),
            )
        elif not staff.has_all_branch_access:
            branches = staff.get_available_branches()
            qs = qs.filter(
                Q(menu_item__branch__in=branches) | Q(menu_item__branch__isnull=True),
                Q(ingredient__branch__in=branches) | Q(ingredient__branch__isnull=True),
            )
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["restaurant"] = self.request.user.staff_profile.restaurant
        context["branch"] = get_active_branch(self.request, raise_exception=False)
        return context

    def perform_update(self, serializer):
        old_values = snapshot_instance(self.get_object(), fields=RECIPE_AUDIT_FIELDS)
        instance = serializer.save()
        branch = get_active_branch(self.request, raise_exception=False) or instance.ingredient.branch
        record_instance_update(
            request=self.request,
            instance=instance,
            old_values=old_values,
            module=AuditModule.MENU,
            fields=RECIPE_AUDIT_FIELDS,
            branch=branch,
            description=f"{_actor_name(self.request)} updated recipe for {instance.menu_item.name}.",
        )

        # 🔥 update availability after change
        branch = get_active_branch(self.request, raise_exception=False)
        update_menu_item_availability(
            instance.menu_item,
            branch=branch or instance.ingredient.branch,
        )
    def perform_destroy(self, instance):
        menu_item = instance.menu_item
        branch = get_active_branch(self.request, raise_exception=False) or instance.ingredient.branch
        record_instance_delete(
            request=self.request,
            instance=instance,
            module=AuditModule.MENU,
            fields=RECIPE_AUDIT_FIELDS,
            branch=branch,
            description=(
                f"{_actor_name(self.request)} removed {instance.ingredient.name} "
                f"from recipe for {menu_item.name}."
            ),
        )
        instance.delete()

        # 🔥 update availability after removal
        update_menu_item_availability(menu_item, branch=branch)


from rest_framework import filters

class StockMovementListView(generics.ListAPIView):
    serializer_class = StockMovementSerializer
    permission_classes = [
        IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
        IsSameRestaurant,
        IsRestaurantActive
    ]
    pagination_class = StockMovementPagination

    filter_backends = [filters.SearchFilter]
    search_fields = ['ingredient__name']

    def get_queryset(self):
        user = self.request.user
        restaurant = user.staff_profile.restaurant

        qs = (
            StockMovement.objects
            .select_related('ingredient')
            .filter(restaurant=restaurant)
            .filter(movement_type__in=['purchase', 'waste', 'adjustment'])
            .order_by('-created_at')
        )
        qs = filter_queryset_for_request(
            self.request,
            qs,
            allow_all_for_admin=True,
        )

        from_date = self.request.query_params.get('from')
        to_date = self.request.query_params.get('to')
        movement_id = self.request.query_params.get("movement") or self.request.query_params.get("id")

        if not from_date and not to_date and not movement_id:
            qs = qs.filter(created_at__gte=now() - timedelta(days=30))
        else:
            if from_date:
                qs = qs.filter(created_at__date__gte=from_date)

            if to_date:
                qs = qs.filter(created_at__date__lte=to_date)

        movement_type = self.request.query_params.get('type')

        if movement_type:
            qs = qs.filter(movement_type=movement_type)

        if movement_id:
            try:
                qs = qs.filter(pk=int(movement_id))
            except (TypeError, ValueError):
                qs = qs.none()

        return qs


def supplier_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    qs = Supplier.objects.filter(restaurant=restaurant)
    return filter_queryset_for_request(
        request,
        qs,
        allow_all_for_admin=True,
    )


class SupplierListCreateView(generics.ListCreateAPIView):
    serializer_class = SupplierSerializer
    permission_classes = [
        IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
        IsSameRestaurant,
        IsRestaurantActive
    ]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "contact_person", "phone", "email"]

    def get_queryset(self):
        qs = supplier_queryset_for_request(self.request)
        active = self.request.query_params.get("active")
        if active in ["true", "1"]:
            qs = qs.filter(is_active=True)
        elif active in ["false", "0"]:
            qs = qs.filter(is_active=False)
        return qs.order_by("name")

    def perform_create(self, serializer):
        restaurant = self.request.user.staff_profile.restaurant
        branch = get_active_branch(self.request)
        supplier = serializer.save(restaurant=restaurant, branch=branch)
        create_audit_log(
            request=self.request,
            restaurant=restaurant,
            branch=branch,
            action=AuditAction.CREATE,
            module=AuditModule.PROCUREMENT,
            object_type="Supplier",
            object_id=supplier.id,
            object_repr=str(supplier),
            description=f"{_actor_name(self.request)} created supplier {supplier.name}.",
            new_values=_supplier_audit_values(supplier),
        )


class SupplierRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = SupplierSerializer
    permission_classes = [
        IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
        IsSameRestaurant,
        IsRestaurantActive
    ]

    def get_queryset(self):
        return supplier_queryset_for_request(self.request)

    def perform_update(self, serializer):
        old_values = _supplier_audit_values(self.get_object())
        supplier = serializer.save()
        new_values = _supplier_audit_values(supplier)
        changes = calculate_field_changes(old_values, new_values)
        if not changes:
            return
        status_change = "is_active" in changes
        description = (
            f"{_actor_name(self.request)} {'activated' if supplier.is_active else 'deactivated'} supplier {supplier.name}."
            if status_change
            else f"{_actor_name(self.request)} updated supplier {supplier.name}."
        )
        create_audit_log(
            request=self.request,
            restaurant=supplier.restaurant,
            branch=supplier.branch,
            action=AuditAction.STATUS_CHANGE if status_change else AuditAction.UPDATE,
            module=AuditModule.PROCUREMENT,
            object_type="Supplier",
            object_id=supplier.id,
            object_repr=str(supplier),
            description=description,
            old_values=changed_old_values(changes),
            new_values=changed_new_values(changes),
            metadata={"changes": changes},
        )


def purchase_invoice_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    qs = PurchaseInvoice.objects.filter(restaurant=restaurant)
    return filter_queryset_for_request(
        request,
        qs,
        allow_all_for_admin=True,
    )


@api_view(["GET", "POST"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def purchase_invoice_list_create(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request, raise_exception=False)
    staff = getattr(request.user, "staff_profile", None)

    if request.method == "POST":
        try:
            invoice = create_purchase_invoice(
                request.data,
                restaurant=restaurant,
                branch=get_active_branch(request),
                created_by=staff,
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        new_values = _purchase_invoice_audit_values(invoice)
        create_audit_log(
            request=request,
            restaurant=invoice.restaurant,
            branch=invoice.branch,
            action=AuditAction.CREATE,
            module=AuditModule.PROCUREMENT,
            object_type="PurchaseInvoice",
            object_id=invoice.id,
            object_repr=invoice.invoice_number or f"PINV-{invoice.id}",
            description=(
                f"{_actor_name(request)} created purchase invoice "
                f"{invoice.invoice_number or f'PINV-{invoice.id}'} for {new_values.get('total_amount')} AFN."
            ),
            new_values=new_values,
            metadata={
                "stock_movement_ids": [
                    line.get("stock_movement")
                    for line in new_values.get("items", [])
                    if line.get("stock_movement")
                ]
            },
        )

        return Response(
            PurchaseInvoiceSerializer(invoice).data,
            status=status.HTTP_201_CREATED,
        )

    invoices = (
        purchase_invoice_queryset_for_request(request)
        .select_related("supplier", "branch", "created_by")
        .prefetch_related("lines__ingredient", "payments")
        .annotate(line_count=Count("lines"))
        .order_by("-purchase_date", "-created_at")
    )

    search = request.query_params.get("search")
    if search:
        invoices = invoices.filter(
            Q(invoice_number__icontains=search)
            | Q(supplier__name__icontains=search)
            | Q(lines__ingredient__name__icontains=search)
        ).distinct()

    status_filter = request.query_params.get("status")
    if status_filter:
        invoices = invoices.filter(status=status_filter)

    supplier_id = request.query_params.get("supplier")
    if supplier_id:
        invoices = invoices.filter(supplier_id=supplier_id)

    from_date = request.query_params.get("from")
    to_date = request.query_params.get("to")
    if from_date:
        invoices = invoices.filter(purchase_date__gte=from_date)
    if to_date:
        invoices = invoices.filter(purchase_date__lte=to_date)

    paginator = StockMovementPagination()
    page = paginator.paginate_queryset(invoices, request)
    serializer = PurchaseInvoiceSerializer(
        page,
        many=True,
        context={"request": request, "branch": branch},
    )
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def purchase_invoice_detail(request, pk):
    try:
        invoice = (
            purchase_invoice_queryset_for_request(request)
            .select_related("supplier", "branch", "created_by")
            .prefetch_related(
                "lines__ingredient",
                "payments__supplier",
                "attachments__uploaded_by",
            )
            .get(pk=pk)
        )
    except PurchaseInvoice.DoesNotExist:
        return Response({"detail": "Purchase invoice not found."}, status=404)

    return Response(PurchaseInvoiceSerializer(invoice).data)


ALLOWED_ATTACHMENT_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}


def _validate_attachment_file(uploaded_file):
    extension = os.path.splitext(uploaded_file.name or "")[1].lower()
    if extension not in ALLOWED_ATTACHMENT_EXTENSIONS:
        raise ValueError("Only JPG, JPEG, PNG, and PDF files are supported.")


@api_view(["GET", "POST"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def purchase_invoice_attachment_list_create(request, pk):
    try:
        invoice = purchase_invoice_queryset_for_request(request).get(pk=pk)
    except PurchaseInvoice.DoesNotExist:
        return Response({"detail": "Purchase invoice not found."}, status=404)

    if request.method == "GET":
        attachments = invoice.attachments.select_related("uploaded_by")
        return Response(
            PurchaseInvoiceAttachmentSerializer(
                attachments,
                many=True,
                context={"request": request},
            ).data
        )

    files = request.FILES.getlist("files") or request.FILES.getlist("file")
    if not files:
        return Response(
            {"detail": "Select at least one attachment."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    created = []
    try:
        for uploaded_file in files:
            _validate_attachment_file(uploaded_file)
            created.append(
                PurchaseInvoiceAttachment.objects.create(
                    invoice=invoice,
                    restaurant=invoice.restaurant,
                    branch=invoice.branch,
                    file=uploaded_file,
                    original_filename=uploaded_file.name,
                    content_type=getattr(uploaded_file, "content_type", "") or "",
                    file_size=getattr(uploaded_file, "size", 0) or 0,
                    uploaded_by=getattr(request.user, "staff_profile", None),
                )
            )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        PurchaseInvoiceAttachmentSerializer(
            created,
            many=True,
            context={"request": request},
        ).data,
        status=status.HTTP_201_CREATED,
    )


def _attachment_for_request(request, invoice_pk, attachment_pk):
    invoice = purchase_invoice_queryset_for_request(request).get(pk=invoice_pk)
    return PurchaseInvoiceAttachment.objects.get(
        pk=attachment_pk,
        invoice=invoice,
        restaurant=invoice.restaurant,
        branch=invoice.branch,
    )


@api_view(["GET"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def purchase_invoice_attachment_download(request, pk, attachment_pk):
    try:
        attachment = _attachment_for_request(request, pk, attachment_pk)
    except (PurchaseInvoice.DoesNotExist, PurchaseInvoiceAttachment.DoesNotExist):
        return Response({"detail": "Attachment not found."}, status=404)

    as_attachment = request.query_params.get("download") in ["1", "true"]
    response = FileResponse(
        attachment.file.open("rb"),
        as_attachment=as_attachment,
        filename=attachment.original_filename,
        content_type=attachment.content_type or "application/octet-stream",
    )
    if not as_attachment:
        response["Content-Disposition"] = (
            f'inline; filename="{attachment.original_filename}"'
        )
    return response


@api_view(["DELETE"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def purchase_invoice_attachment_delete(request, pk, attachment_pk):
    try:
        attachment = _attachment_for_request(request, pk, attachment_pk)
    except (PurchaseInvoice.DoesNotExist, PurchaseInvoiceAttachment.DoesNotExist):
        return Response({"detail": "Attachment not found."}, status=404)

    attachment.file.delete(save=False)
    attachment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def purchase_invoice_approve(request, pk):
    try:
        invoice = purchase_invoice_queryset_for_request(request).get(pk=pk)
    except PurchaseInvoice.DoesNotExist:
        return Response({"detail": "Purchase invoice not found."}, status=404)

    old_values = _purchase_invoice_audit_values(invoice)
    try:
        invoice = post_purchase_invoice_inventory(
            invoice,
            created_by=getattr(request.user, "staff_profile", None),
        )
    except Exception as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    new_values = _purchase_invoice_audit_values(invoice)
    changes = calculate_field_changes(old_values, new_values)
    create_audit_log(
        request=request,
        restaurant=invoice.restaurant,
        branch=invoice.branch,
        action=AuditAction.APPROVE,
        module=AuditModule.PROCUREMENT,
        object_type="PurchaseInvoice",
        object_id=invoice.id,
        object_repr=invoice.invoice_number or f"PINV-{invoice.id}",
        description=f"{_actor_name(request)} approved purchase invoice {invoice.invoice_number or f'PINV-{invoice.id}'}.",
        old_values=changed_old_values(changes),
        new_values=changed_new_values(changes),
        metadata={
            "changes": changes,
            "stock_movement_ids": [
                line.get("stock_movement")
                for line in new_values.get("items", [])
                if line.get("stock_movement")
            ],
        },
    )

    return Response(PurchaseInvoiceSerializer(invoice).data)


def supplier_payment_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    qs = SupplierPayment.objects.filter(restaurant=restaurant)
    return filter_queryset_for_request(
        request,
        qs,
        allow_all_for_admin=True,
    )


def _money_str(value):
    return f"{Decimal(value or 0).quantize(Decimal('0.01'))}"


def _payment_for_request(request, pk):
    return (
        supplier_payment_queryset_for_request(request)
        .select_related(
            "supplier",
            "purchase_invoice",
            "purchase_invoice__branch",
            "purchase_invoice__supplier",
            "restaurant",
            "branch",
            "created_by",
        )
        .get(pk=pk)
    )


def _payment_voucher_payload(payment, request=None):
    invoice = payment.purchase_invoice
    restaurant = payment.restaurant or invoice.restaurant
    branch = payment.branch or invoice.branch
    payments = list(
        invoice.payments.order_by("date", "created_at", "id")
    )

    paid_before = Decimal("0.00")
    for existing in payments:
        if existing.id == payment.id:
            break
        paid_before += Decimal(existing.amount or 0)

    current_payment = Decimal(payment.amount or 0)
    total_paid = paid_before + current_payment
    invoice_total = Decimal(invoice.total_amount or 0)
    remaining_after = max(invoice_total - total_paid, Decimal("0.00"))

    logo_url = None
    if restaurant and getattr(restaurant, "logo", None):
        try:
            logo_url = (
                request.build_absolute_uri(restaurant.logo.url)
                if request
                else restaurant.logo.url
            )
        except ValueError:
            logo_url = None

    return {
        "company": {
            "name": restaurant.name if restaurant else "",
            "logo_url": logo_url,
            "branch_name": branch.name if branch else "",
            "address": (branch.address if branch and branch.address else getattr(restaurant, "address", "")),
            "phone": (branch.phone if branch and branch.phone else getattr(restaurant, "phone", "")),
        },
        "payment": {
            "id": payment.id,
            "voucher_number": f"SPV-{payment.id:06d}",
            "date": payment.date.strftime("%Y-%m-%d"),
            "supplier_name": payment.supplier.name,
            "invoice_number": invoice.invoice_number or f"PINV-{invoice.id}",
            "payment_method": payment.get_payment_method_display(),
            "reference_number": payment.reference_number,
            "amount_paid": _money_str(current_payment),
            "currency": "AFN",
            "remaining_balance_after_payment": _money_str(remaining_after),
            "notes": payment.notes,
            "prepared_by": payment.created_by.name if payment.created_by else "System",
            "is_invoice_completed": remaining_after <= 0,
        },
        "invoice": {
            "id": invoice.id,
            "original_invoice_total": _money_str(invoice_total),
            "total_paid_before_this_payment": _money_str(paid_before),
            "current_payment": _money_str(current_payment),
            "total_paid": _money_str(total_paid),
            "remaining_balance": _money_str(remaining_after),
            "status": invoice.status,
        },
    }


@api_view(["GET"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def supplier_payment_detail(request, pk):
    try:
        payment = _payment_for_request(request, pk)
    except SupplierPayment.DoesNotExist:
        return Response({"detail": "Supplier payment not found."}, status=404)

    return Response(SupplierPaymentSerializer(payment).data)


@api_view(["GET"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager, 
    IsSameRestaurant,
    IsRestaurantActive
])
def supplier_payment_voucher(request, pk):
    try:
        payment = _payment_for_request(request, pk)
    except SupplierPayment.DoesNotExist:
        return Response({"detail": "Supplier payment not found."}, status=404)

    return Response(_payment_voucher_payload(payment, request=request))


@api_view(["GET"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def supplier_payment_voucher_pdf(request, pk):
    try:
        payment = _payment_for_request(request, pk)
    except SupplierPayment.DoesNotExist:
        return Response({"detail": "Supplier payment not found."}, status=404)

    data = _payment_voucher_payload(payment, request=request)

    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfgen import canvas

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="{data["payment"]["voucher_number"]}.pdf"'
    )

    p = canvas.Canvas(response, pagesize=A4)
    width, height = A4
    margin = 18 * mm
    y = height - margin

    if data["payment"]["is_invoice_completed"]:
        p.saveState()
        p.setFont("Helvetica-Bold", 72)
        p.setFillColor(colors.Color(0, 0, 0, alpha=0.08))
        p.translate(width / 2, height / 2)
        p.rotate(35)
        p.drawCentredString(0, 0, "PAID")
        p.restoreState()

    def line(text, x=margin, size=10, bold=False, gap=15):
        nonlocal y
        p.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        p.setFillColor(colors.black)
        p.drawString(x, y, str(text or ""))
        y -= gap

    def rule(gap=12):
        nonlocal y
        p.setStrokeColor(colors.black)
        p.line(margin, y, width - margin, y)
        y -= gap

    def table(rows, col_widths, row_height=21):
        nonlocal y
        x = margin
        p.setFont("Helvetica", 9)
        for row_index, row in enumerate(rows):
            x = margin
            if y < margin + row_height:
                p.showPage()
                y = height - margin
            for col_index, value in enumerate(row):
                w = col_widths[col_index]
                p.rect(x, y - row_height + 4, w, row_height, stroke=1, fill=0)
                p.setFont("Helvetica-Bold" if row_index == 0 or col_index == 0 else "Helvetica", 9)
                p.drawString(x + 4, y - row_height + 10, str(value or ""))
                x += w
            y -= row_height
        y -= 10

    company = data["company"]
    payment_data = data["payment"]
    invoice_data = data["invoice"]

    logo_drawn = False
    source_restaurant = payment.restaurant or payment.purchase_invoice.restaurant
    if source_restaurant and getattr(source_restaurant, "logo", None):
        try:
            p.drawImage(
                ImageReader(source_restaurant.logo.path),
                margin,
                y - 48,
                width=42,
                height=42,
                preserveAspectRatio=True,
                mask="auto",
            )
            logo_drawn = True
        except Exception:
            logo_drawn = False

    company_x = margin + 52 if logo_drawn else margin
    line(company["name"], x=company_x, size=16, bold=True, gap=18)
    line(f"Branch: {company['branch_name']}", x=company_x, size=10)
    line(f"Address: {company['address']}", x=company_x, size=10)
    line(f"Phone: {company['phone']}", x=company_x, size=10)
    y -= 6
    p.setFont("Helvetica-Bold", 14)
    p.drawCentredString(width / 2, y, "SUPPLIER PAYMENT VOUCHER")
    y -= 18
    rule()

    table(
        [
            ["Voucher No.", payment_data["voucher_number"], "Payment Date", payment_data["date"]],
            ["Supplier", payment_data["supplier_name"], "Invoice No.", payment_data["invoice_number"]],
            ["Payment Method", payment_data["payment_method"], "Reference", payment_data["reference_number"] or "-"],
            ["Amount Paid", f"{payment_data['currency']} {payment_data['amount_paid']}", "Balance After", f"{payment_data['currency']} {payment_data['remaining_balance_after_payment']}"],
            ["Payment ID", payment_data["id"], "Prepared By", payment_data["prepared_by"]],
        ],
        [90, 155, 90, 155],
    )

    line("Invoice Information", bold=True, gap=16)
    table(
        [
            ["Original Invoice Total", f"AFN {invoice_data['original_invoice_total']}"],
            ["Total Paid Before This Payment", f"AFN {invoice_data['total_paid_before_this_payment']}"],
            ["Current Payment", f"AFN {invoice_data['current_payment']}"],
            ["Total Paid", f"AFN {invoice_data['total_paid']}"],
            ["Remaining Balance", f"AFN {invoice_data['remaining_balance']}"],
        ],
        [190, 300],
    )

    if payment_data["notes"]:
        line("Notes", bold=True, gap=14)
        line(payment_data["notes"], size=9, gap=22)

    y -= 12
    line("Signatures", bold=True, gap=22)
    signature_labels = [
        "Prepared By",
        "Checked By",
        "Approved By",
        "Supplier Representative",
    ]
    col_width = (width - (2 * margin)) / 4
    start_y = y
    for index, label in enumerate(signature_labels):
        x = margin + (index * col_width)
        p.setFont("Helvetica-Bold", 8)
        p.drawCentredString(x + col_width / 2, start_y, label)
        p.setFont("Helvetica", 7)
        p.line(x + 8, start_y - 26, x + col_width - 8, start_y - 26)
        p.drawCentredString(x + col_width / 2, start_y - 36, "Signature")
        p.line(x + 8, start_y - 57, x + col_width - 8, start_y - 57)
        p.drawCentredString(x + col_width / 2, start_y - 67, "Name")

    p.setFont("Helvetica", 8)
    p.drawRightString(width - margin, margin / 2, f"Payment ID: {payment_data['id']}")
    p.showPage()
    p.save()
    return response


@api_view(["GET", "POST"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def supplier_payment_list_create(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request, raise_exception=False)

    if request.method == "POST":
        try:
            payment = create_supplier_payment(
                request.data,
                restaurant=restaurant,
                branch=get_active_branch(request),
                created_by=getattr(request.user, "staff_profile", None),
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        invoice = payment.purchase_invoice
        create_audit_log(
            request=request,
            restaurant=payment.restaurant,
            branch=payment.branch,
            action=AuditAction.PAYMENT,
            module=AuditModule.PROCUREMENT,
            object_type="PurchaseInvoice",
            object_id=invoice.id,
            object_repr=invoice.invoice_number or f"PINV-{invoice.id}",
            description=(
                f"{_actor_name(request)} recorded {payment.amount} AFN payment for "
                f"purchase invoice {invoice.invoice_number or f'PINV-{invoice.id}'}."
            ),
            old_values={},
            new_values={
                "payment_id": payment.id,
                "amount": normalize_audit_value(payment.amount),
                "payment_method": payment.payment_method,
                "date": normalize_audit_value(payment.date),
                "remaining_balance": normalize_audit_value(invoice.remaining_balance),
            },
            metadata={"supplier_payment_id": payment.id, "supplier": payment.supplier.name},
        )

        return Response(
            SupplierPaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED,
        )

    payments = (
        supplier_payment_queryset_for_request(request)
        .select_related("supplier", "purchase_invoice", "created_by")
        .order_by("-date", "-created_at")
    )

    search = request.query_params.get("search")
    if search:
        payments = payments.filter(
            Q(supplier__name__icontains=search)
            | Q(purchase_invoice__invoice_number__icontains=search)
            | Q(reference_number__icontains=search)
        )

    supplier_id = request.query_params.get("supplier")
    if supplier_id:
        payments = payments.filter(supplier_id=supplier_id)

    invoice_id = request.query_params.get("purchase_invoice")
    if invoice_id:
        payments = payments.filter(purchase_invoice_id=invoice_id)

    paginator = StockMovementPagination()
    page = paginator.paginate_queryset(payments, request)
    serializer = SupplierPaymentSerializer(
        page,
        many=True,
        context={"request": request, "branch": branch},
    )
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def supplier_ledger_view(request, pk):
    try:
        supplier = supplier_queryset_for_request(request).get(pk=pk)
    except Supplier.DoesNotExist:
        return Response({"detail": "Supplier not found."}, status=404)

    ledger = supplier_ledger(supplier)
    return Response(
        {
            "supplier": SupplierSerializer(supplier).data,
            "entries": ledger["entries"],
            "total_purchases": ledger["total_purchases"],
            "total_paid": ledger["total_paid"],
            "outstanding_balance": ledger["outstanding_balance"],
        }
    )


@api_view(["GET", "POST"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def stock_transfer_list_create(request):
    restaurant = request.user.staff_profile.restaurant
    staff = request.user.staff_profile
    branch = get_active_branch(request, raise_exception=False)

    if request.method == "GET":
        if staff.is_branch_admin and request.query_params.get("branch") == "all":
            return Response(
                {"detail": "Branch Admins cannot request all branch transfers."},
                status=status.HTTP_403_FORBIDDEN,
            )

        transfers = StockTransfer.objects.filter(
            restaurant=restaurant,
        ).select_related(
            "ingredient",
            "from_branch",
            "to_branch",
            "created_by",
            "approved_by",
        ).prefetch_related("logs")

        if request.query_params.get("branch") != "all" or not request.user.staff_profile.has_all_branch_access:
            transfers = transfers.filter(Q(from_branch=branch) | Q(to_branch=branch))

        status_filter = request.query_params.get("status")
        if status_filter:
            transfers = transfers.filter(status=status_filter)

        serializer = StockTransferSerializer(
            transfers.order_by("-created_at"),
            many=True,
            context={"request": request, "restaurant": restaurant, "branch": branch},
        )
        return Response(serializer.data)

    if staff.is_branch_admin:
        return Response(
            {"detail": "Branch Admins cannot perform cross-branch transfers."},
            status=status.HTTP_403_FORBIDDEN,
        )

    data = request.data.copy()
    data.setdefault("from_branch", branch.id if branch else None)

    serializer = StockTransferSerializer(
        data=data,
        context={"request": request, "restaurant": restaurant, "branch": branch},
    )
    if serializer.is_valid():
        try:
            transfer = serializer.save(
                restaurant=restaurant,
                created_by=getattr(request.user, "staff_profile", None),
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        StockTransferLog.objects.create(
            transfer=transfer,
            action="created",
            actor=getattr(request.user, "staff_profile", None),
            message="Transfer requested.",
        )
        record_instance_create(
            request=request,
            instance=transfer,
            module=AuditModule.MIGRATIONS,
            fields=STOCK_TRANSFER_AUDIT_FIELDS,
            branch=transfer.to_branch,
            description=(
                f"{_actor_name(request)} requested stock transfer of "
                f"{transfer.quantity} {transfer.ingredient.unit} {transfer.ingredient.name} "
                f"from {transfer.from_branch.name} to {transfer.to_branch.name}."
            ),
            severity="WARNING",
        )
        return Response(
            StockTransferSerializer(
                transfer,
                context={"request": request, "restaurant": restaurant, "branch": branch},
            ).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive,
])
def stock_transfer_action(request, pk):
    restaurant = request.user.staff_profile.restaurant
    staff = getattr(request.user, "staff_profile", None)
    action = request.data.get("action")

    if staff and staff.is_branch_admin:
        return Response(
            {"detail": "Branch Admins cannot perform cross-branch transfers."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        transfer = StockTransfer.objects.select_related(
            "ingredient",
            "from_branch",
            "to_branch",
        ).get(pk=pk, restaurant=restaurant)
    except StockTransfer.DoesNotExist:
        return Response({"detail": "Transfer not found."}, status=404)

    if transfer.status != "pending":
        return Response(
            {"detail": "Only pending transfers can be changed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if action not in ["approve", "reject", "cancel"]:
        return Response(
            {"action": "Use approve, reject, or cancel."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if action in ["reject", "cancel"]:
        old_values = snapshot_instance(transfer, fields=STOCK_TRANSFER_AUDIT_FIELDS)
        transfer.status = "rejected" if action == "reject" else "cancelled"
        transfer.approved_by = staff
        transfer.approved_at = now()
        transfer.save(update_fields=["status", "approved_by", "approved_at", "updated_at"])
        StockTransferLog.objects.create(
            transfer=transfer,
            action=transfer.status,
            actor=staff,
            message=f"Transfer {transfer.status}.",
        )
        record_instance_update(
            request=request,
            instance=transfer,
            old_values=old_values,
            module=AuditModule.MIGRATIONS,
            fields=STOCK_TRANSFER_AUDIT_FIELDS,
            action=AuditAction.REJECT if action == "reject" else AuditAction.CANCEL,
            branch=transfer.to_branch,
            description=f"{_actor_name(request)} {transfer.status} stock transfer #{transfer.id}.",
            severity="WARNING",
        )
        return Response(StockTransferSerializer(transfer).data)

    ingredient = transfer.ingredient
    destination_ingredient = ingredient
    if ingredient.branch_id:
        destination_ingredient, _ = Ingredient.objects.get_or_create(
            restaurant=restaurant,
            branch=transfer.to_branch,
            name=ingredient.name,
            defaults={
                "unit": ingredient.unit,
                "quantity_available": 0,
                "minimum_threshold": ingredient.minimum_threshold,
                "cost_per_unit": ingredient.cost_per_unit,
                "is_active": ingredient.is_active,
            },
        )

    try:
        change_ingredient_stock(
            ingredient,
            transfer.from_branch,
            -transfer.quantity,
        )
        change_ingredient_stock(
            destination_ingredient,
            transfer.to_branch,
            transfer.quantity,
        )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    StockMovement.objects.create(
        restaurant=restaurant,
        branch=transfer.from_branch,
        ingredient=ingredient,
        change_quantity=-transfer.quantity,
        movement_type="transfer_out",
        created_by=staff,
        note=f"Transfer #{transfer.id} to {transfer.to_branch.name}",
    )
    StockMovement.objects.create(
        restaurant=restaurant,
        branch=transfer.to_branch,
        ingredient=destination_ingredient,
        change_quantity=transfer.quantity,
        movement_type="transfer_in",
        created_by=staff,
        note=f"Transfer #{transfer.id} from {transfer.from_branch.name}",
    )

    old_values = snapshot_instance(transfer, fields=STOCK_TRANSFER_AUDIT_FIELDS)
    transfer.status = "approved"
    transfer.approved_by = staff
    transfer.approved_at = now()
    transfer.save(update_fields=["status", "approved_by", "approved_at", "updated_at"])
    StockTransferLog.objects.create(
        transfer=transfer,
        action="approved",
        actor=staff,
        message="Transfer approved and inventory moved.",
    )
    record_instance_update(
        request=request,
        instance=transfer,
        old_values=old_values,
        module=AuditModule.MIGRATIONS,
        fields=STOCK_TRANSFER_AUDIT_FIELDS,
        action=AuditAction.APPROVE,
        branch=transfer.to_branch,
        description=f"{_actor_name(request)} approved stock transfer #{transfer.id}.",
        severity="WARNING",
    )

    update_menu_item_availability_for_ingredient = destination_ingredient.menu_items.select_related("menu_item")
    for recipe in update_menu_item_availability_for_ingredient:
        update_menu_item_availability(recipe.menu_item, branch=transfer.to_branch)
        update_menu_item_availability(recipe.menu_item, branch=transfer.from_branch)

    return Response(
        StockTransferSerializer(
            transfer,
            context={"request": request, "restaurant": restaurant, "branch": transfer.to_branch},
        ).data
    )

# LOW STOCK
@api_view(['GET'])
@permission_classes([IsRestaurantAdmin | IsKitchenManager | IsInventoryManager|IsOperationsManager,IsSameRestaurant,IsRestaurantActive])
def low_stock_items(request):
    restaurant = request.user.staff_profile.restaurant

    branch = get_inventory_report_branch(request)
    items = ingredient_queryset_for_request(request)

    items = items.filter(quantity_available__lte=F('minimum_threshold'))

    serializer = IngredientSerializer(
        items,
        many=True,
        context={"request": request, "branch": branch},
    )
    return Response(serializer.data)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Ingredient
from decimal import Decimal

@api_view(['POST'])
@permission_classes([IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,IsSameRestaurant,IsRestaurantActive])
def add_stock_view(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request)

    try:
        invoice = create_purchase_invoice(
            request.data,
            restaurant=restaurant,
            branch=branch,
            created_by=getattr(request.user, 'staff_profile', None),
        )
    except Exception as exc:
        return Response(
            {'detail': str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    new_values = _purchase_invoice_audit_values(invoice)
    create_audit_log(
        request=request,
        restaurant=invoice.restaurant,
        branch=invoice.branch,
        action=AuditAction.CREATE,
        module=AuditModule.PROCUREMENT,
        object_type="PurchaseInvoice",
        object_id=invoice.id,
        object_repr=invoice.invoice_number or f"PINV-{invoice.id}",
        description=(
            f"{_actor_name(request)} created purchase invoice "
            f"{invoice.invoice_number or f'PINV-{invoice.id}'} from stock entry."
        ),
        new_values=new_values,
        metadata={"severity": "WARNING", "source": "add_stock"},
    )

    return Response(
        {
            'detail': 'Purchase invoice created successfully',
            'invoice': PurchaseInvoiceSerializer(invoice).data,
        },
        status=status.HTTP_200_OK
    )

from decimal import Decimal, InvalidOperation
@api_view(['PUT'])
@permission_classes([
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])



def edit_stock_movement_view(request, pk):

    movement = StockMovement.objects.get(
        id=pk,
        restaurant=request.user.staff_profile.restaurant,
        branch=get_active_branch(request),
    )
    old_values = snapshot_instance(movement, fields=STOCK_MOVEMENT_AUDIT_FIELDS)

    if movement.movement_type == "order":
        return Response({"detail": "Order movements cannot be edited"}, status=400)

    try:
        quantity = Decimal(str(request.data.get("quantity")))
    except:
        return Response({"detail": "Invalid quantity"}, status=400)
    
    # movement type
    new_type = request.data.get(
        "movement_type",
        movement.movement_type
    )

    # purchases cannot become other types
    if (
        movement.movement_type == "purchase"
        and new_type != "purchase"
    ):
        return Response(
            {
                "detail":
                "Purchase movements cannot change type"
            },
            status=400
        )

    # only adjustment/waste switch allowed
    if (
        movement.movement_type in ["adjustment", "waste"]
        and new_type not in ["adjustment", "waste"]
    ):
        return Response(
            {
                "detail":
                "Only adjustment and waste are allowed"
            },
        ) 

    unit_cost_raw = request.data.get("new_unit_cost")

    # 🔥 FIX HERE
    try:
        unit_cost = (
            Decimal(str(unit_cost_raw))
            if unit_cost_raw not in [None, ""]
            else None
        )
    except InvalidOperation:
        return Response({"detail": "Invalid unit cost"}, status=400)

    try:
        edit_stock_movement(
            movement=movement,
            new_quantity=quantity,
            new_movement_type=new_type,
            new_unit_cost=unit_cost
        )
        movement.refresh_from_db()
        record_instance_update(
            request=request,
            instance=movement,
            old_values=old_values,
            module=AuditModule.INVENTORY,
            fields=STOCK_MOVEMENT_AUDIT_FIELDS,
            branch=movement.branch,
            description=f"{_actor_name(request)} edited stock movement #{movement.id}.",
            severity="WARNING",
        )

        return Response({"detail": "Stock movement updated"})

    except ValueError as e:
        return Response({"detail": str(e)}, status=400)


from django.db.models import Prefetch, Q
from .serializers import IngredientUsageSerializer


@api_view(['GET'])
@permission_classes([
    IsRestaurantAdmin | IsKitchenManager | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def search_ingredient_usage_view(request):

    query = request.GET.get("q", "").strip()

    if not query:
        return Response([])

    restaurant = request.user.staff_profile.restaurant

    ingredients = (
        ingredient_queryset_for_request(request)
        .filter(
            Q(name__icontains=query)
        )
        .prefetch_related(
            Prefetch(
                "menu_items",
                queryset=MenuItemIngredient.objects.select_related(
                    "menu_item"
                )
            )
        )
    )

    serializer = IngredientUsageSerializer(
        ingredients,
        many=True,
        context={
            "request": request,
            "branch": get_active_branch(request, raise_exception=False),
        },
    )

    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,IsSameRestaurant,IsRestaurantActive ])
def adjust_stock_view(request):
    ingredient_id = request.data.get('ingredient')
    quantity = Decimal(request.data.get('quantity'))
    movement_type = request.data.get('movement_type') 

    if not ingredient_id or not quantity or not movement_type:
        return Response({'detail': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request)
    ingredient_filter = {
        "id": ingredient_id,
        "restaurant": restaurant,
        "branch": branch,
    }
    ingredient = Ingredient.objects.get(**ingredient_filter)

    if get_effective_quantity(ingredient, branch) + quantity < 0:
        return Response(
            {
                'detail': (
                    f'Insufficient stock. '
                    f'Available: {get_effective_quantity(ingredient, branch)}'
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    change_ingredient_stock(ingredient, branch, quantity)
    for recipe in ingredient.menu_items.select_related('menu_item'):
        update_menu_item_availability(recipe.menu_item, branch=branch)
    movement = StockMovement.objects.create(
        ingredient=ingredient,
        change_quantity=quantity,
        restaurant=ingredient.restaurant,
        branch=branch,
        movement_type=movement_type,
        created_by=getattr(request.user, 'staff_profile', None)
    )
    record_instance_create(
        request=request,
        instance=movement,
        module=AuditModule.INVENTORY,
        fields=STOCK_MOVEMENT_AUDIT_FIELDS,
        branch=branch,
        description=(
            f"{_actor_name(request)} adjusted stock for {ingredient.name} "
            f"by {quantity} ({movement_type})."
        ),
        severity="WARNING",
    )

    # Update menu item availability
    for recipe in ingredient.menu_items.select_related('menu_item'):
        update_menu_item_availability(recipe.menu_item, branch=branch)

    return Response({'detail': 'Stock adjusted successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsRestaurantAdmin | IsKitchenManager | IsInventoryManager |IsOperationsManager |IsFinanceManager,IsSameRestaurant,IsRestaurantActive])

def inventory_dashboard_summary(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_inventory_report_branch(request)

    ingredients = filter_queryset_for_request(
        request,
        Ingredient.objects.filter(is_active=True, restaurant=restaurant),
        allow_all_for_admin=True,
    )
    total_ingredients = ingredients.count()
    inventory_value = ingredients.aggregate(
        total=Coalesce(
            Sum(
                ExpressionWrapper(
                    F("quantity_available") * F("cost_per_unit"),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            0,
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
    )["total"]
    low_stock = ingredients.filter(
        quantity_available__lte=F('minimum_threshold')
    ).count()

    out_of_stock=ingredients.filter(quantity_available=0).count()


    since = now() - timedelta(days=30)
    top_consumed_ingredients=(
        filter_queryset_for_request(
            request,
            StockMovement.objects.filter(
            restaurant=restaurant,
            created_at__gte=since,
            movement_type='order',
            change_quantity__lt=0
            ),
            allow_all_for_admin=True,
        )
        .values('ingredient__name','ingredient__unit')
        .annotate(consumed=Sum('change_quantity'))
        .order_by('consumed')[:5]
    )

    high_waste_ingredients=(
        filter_queryset_for_request(
            request,
            StockMovement.objects.filter(
            restaurant=restaurant,
            created_at__gte=since,
            movement_type='waste'
            ),
            allow_all_for_admin=True,
        )
        .values('ingredient__name', 'ingredient__unit')
        .annotate(wasted=Sum('change_quantity'))
        .order_by('wasted')[:5]
    )

    return Response({
        "total_ingredients":total_ingredients,
        "inventory_value":inventory_value,
        'low_stock': low_stock,
        "out_of_stock":out_of_stock,
        "top_consumed_ingredients":top_consumed_ingredients,
        "high_waste_ingredients":high_waste_ingredients
    })



from io import BytesIO
from decimal import Decimal

from django.http import HttpResponse
from django.db.models import F
from django.utils.timezone import now

from rest_framework.decorators import api_view, permission_classes

from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter

from .models import Ingredient
from restaurants.permissions import (
    IsRestaurantAdmin,
    IsKitchenManager,
    IsInventoryManager,
    IsSameRestaurant,
    IsRestaurantActive
)


@api_view(['GET'])
@permission_classes([
    IsRestaurantAdmin | IsKitchenManager | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive
])
def inventory_pdf(request):

    restaurant = request.user.staff_profile.restaurant
    branch = get_inventory_report_branch(request)

    ingredients = filter_queryset_for_request(
        request,
        Ingredient.objects.filter(restaurant=restaurant),
        allow_all_for_admin=True,
    ).order_by("name")

    # =========================
    # QUERY PARAM FILTERS
    # =========================

    low_stock = request.GET.get("low_stock")
    out_of_stock = request.GET.get("out_of_stock")
    

    report_type = request.GET.get("type", "all")

    if report_type == "low_stock":
        ingredients = ingredients.filter(
            quantity_available__lte=F("minimum_threshold"),
            quantity_available__gt=0
        )

    elif report_type == "out_of_stock":
        ingredients = ingredients.filter(
            quantity_available=0
        )

    
    

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=18
    )

    elements = []
    styles = getSampleStyleSheet()


    title = Paragraph(
        f"{restaurant.name} Inventory Report",
        styles['Heading1']
    )

    elements.append(title)

    generated_at = Paragraph(
        f"Generated: {now().strftime('%Y-%m-%d %H:%M')}",
        styles['Normal']
    )

    elements.append(generated_at)

    elements.append(Spacer(1, 16))

 

    data = [[
        "Ingredient",
        "Unit",
        "Available",
        "Minimum",
        "Cost/Unit",
        "Status",
        "Total Value"
    ]]

    total_inventory_value = Decimal("0.00")

    rows = []
    for item in ingredients:
        rows.append({
            "name": item.name,
            "unit": item.unit,
            "quantity": item.quantity_available,
            "minimum": item.minimum_threshold,
            "cost": item.cost_per_unit,
        })

    for row in rows:

        total_value = (
            row["quantity"] * row["cost"]
        )

        total_inventory_value += total_value

        # Better stock status
        if row["quantity"] == 0:
            status = "Out of Stock"

        elif row["quantity"] <= row["minimum"]:
            status = "Low Stock"

        else:
            status = "Good"

        data.append([
            row["name"],
            row["unit"],
            str(row["quantity"]),
            str(row["minimum"]),
            f"AFN{row['cost']:.2f}",
            status,
            f"AFN{total_value:.2f}"
        ])

    # =========================
    # TABLE
    # =========================

    table = Table(
        data,
        repeatRows=1,
        colWidths=[120, 50, 70, 70, 70, 90, 90]
    )

    table.setStyle(TableStyle([

        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4f46e5")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),

        # Body
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),

        # Grid
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),

        # Alignment
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),

        # Font size
        ('FONTSIZE', (0, 0), (-1, -1), 9),

        # Padding
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),

    ]))

    elements.append(table)

    elements.append(Spacer(1, 20))

    # =========================
    # SUMMARY
    # =========================

    summary = Paragraph(
        f"""
        <b>Total Ingredients:</b> {len(rows)}
        <br/>
        <b>Total Inventory Value:</b> ${total_inventory_value:.2f}
        """,
        styles['Heading3']
    )

    elements.append(summary)

    # =========================
    # BUILD PDF
    # =========================

    doc.build(elements)

    buffer.seek(0)

    response = HttpResponse(
        buffer,
        content_type='application/pdf'
    )

    response['Content-Disposition'] = (
        'attachment; filename="inventory_report.pdf"'
    )
    create_audit_log(
        request=request,
        restaurant=restaurant,
        branch=branch,
        action=AuditAction.EXPORT,
        module=AuditModule.REPORTS,
        object_type="ReportExport",
        object_id="inventory:pdf",
        object_repr="Inventory PDF",
        description=f"{_actor_name(request)} exported inventory report as PDF.",
        metadata={
            "severity": "WARNING",
            "report_type": "inventory",
            "format": "pdf",
            "filter": report_type,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
        },
    )

    return response

