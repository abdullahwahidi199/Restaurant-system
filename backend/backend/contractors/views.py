import os
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.http import FileResponse
from rest_framework import filters, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from restaurants.branching import filter_queryset_for_request, get_active_branch
from restaurants.permissions import (
    IsInventoryManager,
    IsRestaurantActive,
    IsRestaurantAdmin,
    IsSameRestaurant,
    IsOperationsManager,IsFinanceManager
)
from audit.constants import AuditAction, AuditModule
from audit.services import (
    calculate_field_changes,
    changed_new_values,
    changed_old_values,
    create_audit_log,
    normalize_audit_value,
    snapshot_instance,
)

from .models import (
    Contractor,
    ContractorInvoice,
    ContractorInvoiceAttachment,
    ContractorPayment,
    ServiceContract,
)
from .serializers import (
    ContractorInvoiceAttachmentSerializer,
    ContractorInvoiceSerializer,
    ContractorPaymentSerializer,
    ContractorSerializer,
    ServiceContractSerializer,
)
from .services import (
    approve_contractor_invoice,
    contractor_ledger,
    create_contractor_invoice,
    create_contractor_payment,
)


class ContractorPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 100


CONTRACTOR_PERMISSIONS = [
    IsRestaurantAdmin | IsInventoryManager |IsOperationsManager |IsFinanceManager,
    IsSameRestaurant,
    IsRestaurantActive,
]


def _actor_name(request):
    staff = getattr(request.user, "staff_profile", None)
    return getattr(staff, "name", None) or request.user.get_username()


def _contractor_audit_values(contractor):
    return snapshot_instance(
        contractor,
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


def _service_contract_audit_values(contract):
    return snapshot_instance(
        contract,
        fields=[
            "contractor",
            "title",
            "start_date",
            "end_date",
            "contract_value",
            "status",
            "notes",
            "branch",
        ],
    )


def _contractor_invoice_audit_values(invoice):
    invoice = (
        ContractorInvoice.objects
        .select_related("contractor", "contract", "branch", "created_by")
        .prefetch_related("lines", "payments")
        .get(pk=invoice.pk)
    )
    return normalize_audit_value(
        {
            "invoice_number": invoice.invoice_number or f"CINV-{invoice.id}",
            "contractor": invoice.contractor.name,
            "contract": invoice.contract.title if invoice.contract_id else None,
            "invoice_date": invoice.invoice_date,
            "due_date": invoice.due_date,
            "description": invoice.description,
            "status": invoice.status,
            "total_amount": invoice.total_amount,
            "amount_paid": invoice.amount_paid,
            "remaining_balance": invoice.remaining_balance,
            "branch": invoice.branch.name if invoice.branch_id else None,
            "items": [
                {
                    "service_type": line.service_type,
                    "description": line.description,
                    "quantity": line.quantity,
                    "unit_price": line.unit_price,
                    "total_price": line.total_price,
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


def contractor_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    qs = Contractor.objects.filter(restaurant=restaurant)
    return filter_queryset_for_request(
        request,
        qs,
        allow_all_for_admin=True,
    )


def service_contract_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    qs = ServiceContract.objects.filter(restaurant=restaurant)
    return filter_queryset_for_request(
        request,
        qs,
        allow_all_for_admin=True,
    )


def contractor_invoice_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    qs = ContractorInvoice.objects.filter(restaurant=restaurant)
    return filter_queryset_for_request(
        request,
        qs,
        allow_all_for_admin=True,
    )


def contractor_payment_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    qs = ContractorPayment.objects.filter(restaurant=restaurant)
    return filter_queryset_for_request(
        request,
        qs,
        allow_all_for_admin=True,
    )


class ContractorListCreateView(generics.ListCreateAPIView):
    serializer_class = ContractorSerializer
    permission_classes = CONTRACTOR_PERMISSIONS
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "contact_person", "phone", "email"]
    pagination_class = ContractorPagination

    def get_queryset(self):
        qs = contractor_queryset_for_request(self.request)
        active = self.request.query_params.get("active")
        if active in ["true", "1"]:
            qs = qs.filter(is_active=True)
        elif active in ["false", "0"]:
            qs = qs.filter(is_active=False)
        return qs.order_by("name")

    def perform_create(self, serializer):
        restaurant = self.request.user.staff_profile.restaurant
        branch = get_active_branch(self.request)
        contractor = serializer.save(restaurant=restaurant, branch=branch)
        create_audit_log(
            request=self.request,
            restaurant=restaurant,
            branch=branch,
            action=AuditAction.CREATE,
            module=AuditModule.CONTRACTORS,
            object_type="Contractor",
            object_id=contractor.id,
            object_repr=contractor.name,
            description=f"{_actor_name(self.request)} created contractor {contractor.name}.",
            new_values=_contractor_audit_values(contractor),
        )


class ContractorRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ContractorSerializer
    permission_classes = CONTRACTOR_PERMISSIONS

    def get_queryset(self):
        return contractor_queryset_for_request(self.request)

    def perform_update(self, serializer):
        old_values = _contractor_audit_values(self.get_object())
        contractor = serializer.save()
        new_values = _contractor_audit_values(contractor)
        changes = calculate_field_changes(old_values, new_values)
        if not changes:
            return
        status_change = "is_active" in changes
        description = (
            f"{_actor_name(self.request)} {'activated' if contractor.is_active else 'deactivated'} contractor {contractor.name}."
            if status_change
            else f"{_actor_name(self.request)} updated contractor {contractor.name}."
        )
        create_audit_log(
            request=self.request,
            restaurant=contractor.restaurant,
            branch=contractor.branch,
            action=AuditAction.STATUS_CHANGE if status_change else AuditAction.UPDATE,
            module=AuditModule.CONTRACTORS,
            object_type="Contractor",
            object_id=contractor.id,
            object_repr=contractor.name,
            description=description,
            old_values=changed_old_values(changes),
            new_values=changed_new_values(changes),
            metadata={"changes": changes},
        )


class ServiceContractListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceContractSerializer
    permission_classes = CONTRACTOR_PERMISSIONS
    pagination_class = ContractorPagination

    def get_queryset(self):
        qs = (
            service_contract_queryset_for_request(self.request)
            .select_related("contractor", "branch", "created_by")
            .order_by("-start_date", "-created_at")
        )

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(contractor__name__icontains=search)
                | Q(notes__icontains=search)
            )

        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        contractor_id = self.request.query_params.get("contractor")
        if contractor_id:
            qs = qs.filter(contractor_id=contractor_id)

        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["restaurant"] = self.request.user.staff_profile.restaurant
        context["branch"] = get_active_branch(self.request, raise_exception=False)
        return context

    def perform_create(self, serializer):
        restaurant = self.request.user.staff_profile.restaurant
        branch = get_active_branch(self.request)
        contract = serializer.save(
            restaurant=restaurant,
            branch=branch,
            created_by=getattr(self.request.user, "staff_profile", None),
        )
        create_audit_log(
            request=self.request,
            restaurant=restaurant,
            branch=branch,
            action=AuditAction.CREATE,
            module=AuditModule.CONTRACTORS,
            object_type="ServiceContract",
            object_id=contract.id,
            object_repr=str(contract),
            description=f"{_actor_name(self.request)} created service contract {contract.title}.",
            new_values=_service_contract_audit_values(contract),
        )


class ServiceContractRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ServiceContractSerializer
    permission_classes = CONTRACTOR_PERMISSIONS

    def get_queryset(self):
        return service_contract_queryset_for_request(self.request)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["restaurant"] = self.request.user.staff_profile.restaurant
        context["branch"] = get_active_branch(self.request, raise_exception=False)
        return context

    def perform_update(self, serializer):
        old_values = _service_contract_audit_values(self.get_object())
        contract = serializer.save()
        new_values = _service_contract_audit_values(contract)
        changes = calculate_field_changes(old_values, new_values)
        if not changes:
            return
        action = AuditAction.STATUS_CHANGE if "status" in changes else AuditAction.UPDATE
        create_audit_log(
            request=self.request,
            restaurant=contract.restaurant,
            branch=contract.branch,
            action=action,
            module=AuditModule.CONTRACTORS,
            object_type="ServiceContract",
            object_id=contract.id,
            object_repr=str(contract),
            description=f"{_actor_name(self.request)} updated service contract {contract.title}.",
            old_values=changed_old_values(changes),
            new_values=changed_new_values(changes),
            metadata={"changes": changes},
        )


@api_view(["GET"])
@permission_classes(CONTRACTOR_PERMISSIONS)
def contractor_summary(request):
    contractors = contractor_queryset_for_request(request)
    invoices = contractor_invoice_queryset_for_request(request).exclude(
        status=ContractorInvoice.STATUS_DRAFT
    )
    payments = contractor_payment_queryset_for_request(request)

    total_invoiced = (
        invoices.aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")
    )
    total_paid = (
        payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    )
    outstanding = max(total_invoiced - total_paid, Decimal("0.00"))

    return Response(
        {
            "active_contractors": contractors.filter(is_active=True).count(),
            "inactive_contractors": contractors.filter(is_active=False).count(),
            "open_invoices": invoices.filter(
                status__in=[
                    ContractorInvoice.STATUS_APPROVED,
                    ContractorInvoice.STATUS_PARTIALLY_PAID,
                ]
            ).count(),
            "total_invoiced": total_invoiced,
            "total_paid": total_paid,
            "outstanding_balance": outstanding,
        }
    )


@api_view(["GET", "POST"])
@permission_classes(CONTRACTOR_PERMISSIONS)
def contractor_invoice_list_create(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request, raise_exception=False)
    staff = getattr(request.user, "staff_profile", None)

    if request.method == "POST":
        try:
            invoice = create_contractor_invoice(
                request.data,
                restaurant=restaurant,
                branch=get_active_branch(request),
                created_by=staff,
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        values = _contractor_invoice_audit_values(invoice)
        create_audit_log(
            request=request,
            restaurant=invoice.restaurant,
            branch=invoice.branch,
            action=AuditAction.CREATE,
            module=AuditModule.CONTRACTORS,
            object_type="ContractorInvoice",
            object_id=invoice.id,
            object_repr=invoice.invoice_number or f"CINV-{invoice.id}",
            description=(
                f"{_actor_name(request)} created contractor invoice "
                f"{invoice.invoice_number or f'CINV-{invoice.id}'} for {values.get('total_amount')} AFN."
            ),
            new_values=values,
        )

        return Response(
            ContractorInvoiceSerializer(
                invoice,
                context={"request": request, "branch": branch},
            ).data,
            status=status.HTTP_201_CREATED,
        )

    invoices = (
        contractor_invoice_queryset_for_request(request)
        .select_related("contractor", "contract", "branch", "created_by")
        .prefetch_related("lines", "payments", "attachments")
        .annotate(line_count=Count("lines"))
        .order_by("-invoice_date", "-created_at")
    )

    search = request.query_params.get("search")
    if search:
        invoices = invoices.filter(
            Q(invoice_number__icontains=search)
            | Q(contractor__name__icontains=search)
            | Q(contract__title__icontains=search)
            | Q(description__icontains=search)
            | Q(lines__service_type__icontains=search)
            | Q(lines__description__icontains=search)
        ).distinct()

    status_filter = request.query_params.get("status")
    if status_filter:
        invoices = invoices.filter(status=status_filter)

    contractor_id = request.query_params.get("contractor")
    if contractor_id:
        invoices = invoices.filter(contractor_id=contractor_id)

    contract_id = request.query_params.get("contract")
    if contract_id:
        invoices = invoices.filter(contract_id=contract_id)

    from_date = request.query_params.get("from")
    to_date = request.query_params.get("to")
    if from_date:
        invoices = invoices.filter(invoice_date__gte=from_date)
    if to_date:
        invoices = invoices.filter(invoice_date__lte=to_date)

    paginator = ContractorPagination()
    page = paginator.paginate_queryset(invoices, request)
    serializer = ContractorInvoiceSerializer(
        page,
        many=True,
        context={"request": request, "branch": branch},
    )
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
@permission_classes(CONTRACTOR_PERMISSIONS)
def contractor_invoice_detail(request, pk):
    try:
        invoice = (
            contractor_invoice_queryset_for_request(request)
            .select_related("contractor", "contract", "branch", "created_by")
            .prefetch_related(
                "lines",
                "payments__contractor",
                "attachments__uploaded_by",
            )
            .get(pk=pk)
        )
    except ContractorInvoice.DoesNotExist:
        return Response({"detail": "Contractor invoice not found."}, status=404)

    return Response(
        ContractorInvoiceSerializer(
            invoice,
            context={"request": request},
        ).data
    )


@api_view(["POST"])
@permission_classes(CONTRACTOR_PERMISSIONS)
def contractor_invoice_approve(request, pk):
    try:
        invoice = contractor_invoice_queryset_for_request(request).get(pk=pk)
    except ContractorInvoice.DoesNotExist:
        return Response({"detail": "Contractor invoice not found."}, status=404)

    old_values = _contractor_invoice_audit_values(invoice)
    try:
        invoice = approve_contractor_invoice(invoice)
    except Exception as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    new_values = _contractor_invoice_audit_values(invoice)
    changes = calculate_field_changes(old_values, new_values)
    create_audit_log(
        request=request,
        restaurant=invoice.restaurant,
        branch=invoice.branch,
        action=AuditAction.APPROVE,
        module=AuditModule.CONTRACTORS,
        object_type="ContractorInvoice",
        object_id=invoice.id,
        object_repr=invoice.invoice_number or f"CINV-{invoice.id}",
        description=f"{_actor_name(request)} approved contractor invoice {invoice.invoice_number or f'CINV-{invoice.id}'}.",
        old_values=changed_old_values(changes),
        new_values=changed_new_values(changes),
        metadata={"changes": changes},
    )

    return Response(ContractorInvoiceSerializer(invoice, context={"request": request}).data)


ALLOWED_ATTACHMENT_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}


def _validate_attachment_file(uploaded_file):
    extension = os.path.splitext(uploaded_file.name or "")[1].lower()
    if extension not in ALLOWED_ATTACHMENT_EXTENSIONS:
        raise ValueError("Only JPG, JPEG, PNG, and PDF files are supported.")


@api_view(["GET", "POST"])
@permission_classes(CONTRACTOR_PERMISSIONS)
def contractor_invoice_attachment_list_create(request, pk):
    try:
        invoice = contractor_invoice_queryset_for_request(request).get(pk=pk)
    except ContractorInvoice.DoesNotExist:
        return Response({"detail": "Contractor invoice not found."}, status=404)

    if request.method == "GET":
        attachments = invoice.attachments.select_related("uploaded_by")
        return Response(
            ContractorInvoiceAttachmentSerializer(
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
                ContractorInvoiceAttachment.objects.create(
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
        ContractorInvoiceAttachmentSerializer(
            created,
            many=True,
            context={"request": request},
        ).data,
        status=status.HTTP_201_CREATED,
    )


def _attachment_for_request(request, invoice_pk, attachment_pk):
    invoice = contractor_invoice_queryset_for_request(request).get(pk=invoice_pk)
    return ContractorInvoiceAttachment.objects.get(
        pk=attachment_pk,
        invoice=invoice,
        restaurant=invoice.restaurant,
        branch=invoice.branch,
    )


@api_view(["GET"])
@permission_classes(CONTRACTOR_PERMISSIONS)
def contractor_invoice_attachment_download(request, pk, attachment_pk):
    try:
        attachment = _attachment_for_request(request, pk, attachment_pk)
    except (ContractorInvoice.DoesNotExist, ContractorInvoiceAttachment.DoesNotExist):
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
@permission_classes(CONTRACTOR_PERMISSIONS)
def contractor_invoice_attachment_delete(request, pk, attachment_pk):
    try:
        attachment = _attachment_for_request(request, pk, attachment_pk)
    except (ContractorInvoice.DoesNotExist, ContractorInvoiceAttachment.DoesNotExist):
        return Response({"detail": "Attachment not found."}, status=404)

    attachment.file.delete(save=False)
    attachment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@permission_classes(CONTRACTOR_PERMISSIONS)
def contractor_payment_list_create(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request, raise_exception=False)
    staff = getattr(request.user, "staff_profile", None)

    if request.method == "POST":
        try:
            payment = create_contractor_payment(
                request.data,
                restaurant=restaurant,
                branch=get_active_branch(request),
                created_by=staff,
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        invoice = payment.invoice
        create_audit_log(
            request=request,
            restaurant=payment.restaurant,
            branch=payment.branch,
            action=AuditAction.PAYMENT,
            module=AuditModule.CONTRACTORS,
            object_type="ContractorInvoice",
            object_id=invoice.id,
            object_repr=invoice.invoice_number or f"CINV-{invoice.id}",
            description=(
                f"{_actor_name(request)} recorded {payment.amount} AFN payment for "
                f"contractor invoice {invoice.invoice_number or f'CINV-{invoice.id}'}."
            ),
            new_values={
                "payment_id": payment.id,
                "amount": normalize_audit_value(payment.amount),
                "payment_method": payment.payment_method,
                "date": normalize_audit_value(payment.date),
                "remaining_balance": normalize_audit_value(invoice.remaining_balance),
            },
            metadata={"contractor_payment_id": payment.id, "contractor": payment.contractor.name},
        )

        return Response(
            ContractorPaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED,
        )

    payments = (
        contractor_payment_queryset_for_request(request)
        .select_related("contractor", "invoice", "branch", "created_by")
        .order_by("-date", "-created_at")
    )

    search = request.query_params.get("search")
    if search:
        payments = payments.filter(
            Q(contractor__name__icontains=search)
            | Q(invoice__invoice_number__icontains=search)
            | Q(reference_number__icontains=search)
            | Q(notes__icontains=search)
        )

    contractor_id = request.query_params.get("contractor")
    if contractor_id:
        payments = payments.filter(contractor_id=contractor_id)

    invoice_id = request.query_params.get("invoice")
    if invoice_id:
        payments = payments.filter(invoice_id=invoice_id)

    from_date = request.query_params.get("from")
    to_date = request.query_params.get("to")
    if from_date:
        payments = payments.filter(date__gte=from_date)
    if to_date:
        payments = payments.filter(date__lte=to_date)

    paginator = ContractorPagination()
    page = paginator.paginate_queryset(payments, request)
    serializer = ContractorPaymentSerializer(
        page,
        many=True,
        context={"request": request, "branch": branch},
    )
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
@permission_classes(CONTRACTOR_PERMISSIONS)
def contractor_payment_detail(request, pk):
    try:
        payment = (
            contractor_payment_queryset_for_request(request)
            .select_related("contractor", "invoice", "branch", "created_by")
            .get(pk=pk)
        )
    except ContractorPayment.DoesNotExist:
        return Response({"detail": "Contractor payment not found."}, status=404)

    return Response(ContractorPaymentSerializer(payment).data)


@api_view(["GET"])
@permission_classes(CONTRACTOR_PERMISSIONS)
def contractor_ledger_view(request, pk):
    try:
        contractor = (
            contractor_queryset_for_request(request)
            .prefetch_related("invoices", "payments")
            .get(pk=pk)
        )
    except Contractor.DoesNotExist:
        return Response({"detail": "Contractor not found."}, status=404)

    ledger = contractor_ledger(contractor)
    return Response(
        {
            "contractor": ContractorSerializer(contractor).data,
            "entries": ledger["entries"],
            "total_invoiced": ledger["total_invoiced"],
            "total_paid": ledger["total_paid"],
            "outstanding_balance": ledger["outstanding_balance"],
        }
    )
