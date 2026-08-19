from rest_framework import serializers
from django.db.models import Q
from .models import (
    Ingredient,
    IngredientStock,
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
from menu.models import MenuItem
from restaurants.branching import get_active_branch
from restaurants.models import Branch
from .services import (
    get_effective_cost_per_unit,
    get_effective_minimum_threshold,
    get_effective_quantity,
    get_or_create_ingredient_stock,
)

class IngredientSerializer(serializers.ModelSerializer):
    menu_items_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Ingredient
        validators = []
        fields = '__all__'
        read_only_fields = ["restaurant", "branch"]

    def _restaurant(self):
        request = self.context.get("request")
        restaurant = self.context.get("restaurant")
        if restaurant:
            return restaurant
        if self.instance:
            return self.instance.restaurant
        if request and hasattr(request.user, "staff_profile"):
            return request.user.staff_profile.restaurant
        return None

    def _branch(self):
        request = self.context.get("request")
        branch = self.context.get("branch")
        if branch:
            return branch
        if self.instance:
            return self.instance.branch
        if request:
            return get_active_branch(request, raise_exception=False)
        return None

    def validate(self, attrs):
        attrs = super().validate(attrs)
        restaurant = self._restaurant()
        branch = self._branch()
        name = attrs.get("name", getattr(self.instance, "name", None))

        if not restaurant or not name:
            return attrs

        duplicate = Ingredient.objects.filter(
            restaurant=restaurant,
            branch=branch,
            name=name,
        )
        if self.instance:
            duplicate = duplicate.exclude(pk=self.instance.pk)

        if duplicate.exists():
            raise serializers.ValidationError(
                {"name": "An ingredient with this name already exists for this branch."}
            )

        return attrs

    def to_representation(self, obj):
        data = super().to_representation(obj)
        request = self.context.get("request")
        branch = self.context.get("branch")
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        if branch and obj.branch_id is None:
            data["stock_branch"] = None
            data["is_shared_definition"] = False
            return data
        data["stock_branch"] = obj.branch_id
        data["is_shared_definition"] = False

        return data

class MenuItemIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    unit = serializers.ReadOnlyField(source='ingredient.unit')
    unit_cost = serializers.ReadOnlyField(source='ingredient.cost_per_unit')

    ingredient_cost = serializers.SerializerMethodField()
    class Meta:
        model=MenuItemIngredient
        fields = [
            'id',
            'menu_item',
            'ingredient',
            'ingredient_name',
            'unit_cost',
            'unit',
            'quantity_required',
            'ingredient_cost',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        restaurant = self.context.get("restaurant")
        branch = self.context.get("branch")

        if not restaurant and request and hasattr(request.user, "staff_profile"):
            restaurant = request.user.staff_profile.restaurant
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        if restaurant:
            menu_items = MenuItem.objects.filter(
                restaurant=restaurant
            )
            if branch:
                menu_items = menu_items.filter(Q(branch=branch) | Q(branch__isnull=True))
            self.fields["menu_item"].queryset = menu_items
            ingredients = Ingredient.objects.filter(restaurant=restaurant)
            if branch:
                ingredients = ingredients.filter(Q(branch=branch) | Q(branch__isnull=True))
            self.fields["ingredient"].queryset = ingredients

    def validate(self, attrs):
        menu_item = attrs.get("menu_item", getattr(self.instance, "menu_item", None))
        ingredient = attrs.get("ingredient", getattr(self.instance, "ingredient", None))
        request = self.context.get("request")
        branch = self.context.get("branch")

        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        if menu_item and ingredient and menu_item.restaurant_id != ingredient.restaurant_id:
            raise serializers.ValidationError(
                {"ingredient": "This ingredient belongs to another restaurant."}
            )

        if (
            branch
            and menu_item
            and menu_item.branch_id
            and menu_item.branch_id != branch.id
        ):
            raise serializers.ValidationError(
                {"menu_item": "This menu item belongs to another branch."}
            )

        if (
            branch
            and ingredient
            and ingredient.branch_id
            and ingredient.branch_id != branch.id
        ):
            raise serializers.ValidationError(
                {"ingredient": "This ingredient belongs to another branch."}
            )

        return attrs
    def get_ingredient_cost(self, obj):
        request = self.context.get("request")
        branch = self.context.get("branch")
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)
        return obj.quantity_required * get_effective_cost_per_unit(obj.ingredient, branch)


class StockMovementSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    createt_by_name=serializers.ReadOnlyField(source='created_by.name')
    ingredient_unit = serializers.CharField(
        source="ingredient.unit",
        read_only=True
    )

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "ingredient",
            "ingredient_name",
            "ingredient_unit",  # ADD THIS
            "createt_by_name",
            "change_quantity",
            "unit_cost",
            "note",
            "movement_type",
            "created_at",
            "restaurant",
            "related_order",
            "created_by",
            "branch",
        ]
        read_only_fields = ["restaurant", "branch", "created_by", "related_order"]


class SupplierSerializer(serializers.ModelSerializer):
    branch_name = serializers.ReadOnlyField(source="branch.name")
    total_purchases = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        read_only=True,
    )
    total_paid = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        read_only=True,
    )
    outstanding_balance = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Supplier
        validators = []
        fields = [
            "id",
            "name",
            "contact_person",
            "phone",
            "email",
            "address",
            "notes",
            "is_active",
            "restaurant",
            "branch",
            "branch_name",
            "total_purchases",
            "total_paid",
            "outstanding_balance",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "restaurant",
            "branch",
            "total_purchases",
            "total_paid",
            "outstanding_balance",
            "created_at",
            "updated_at",
        ]


class PurchaseInvoiceLineSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source="ingredient.name")
    ingredient_unit = serializers.ReadOnlyField(source="ingredient.unit")

    class Meta:
        model = PurchaseInvoiceLine
        fields = [
            "id",
            "invoice",
            "ingredient",
            "ingredient_name",
            "ingredient_unit",
            "quantity",
            "unit_price",
            "total_price",
            "stock_movement",
        ]
        read_only_fields = ["invoice", "total_price", "stock_movement"]


class PurchaseInvoiceAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source="uploaded_by.name")
    file_type = serializers.ReadOnlyField()
    download_url = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseInvoiceAttachment
        fields = [
            "id",
            "invoice",
            "original_filename",
            "content_type",
            "file_size",
            "file_type",
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_at",
            "download_url",
            "preview_url",
        ]
        read_only_fields = [
            "invoice",
            "original_filename",
            "content_type",
            "file_size",
            "file_type",
            "uploaded_by",
            "uploaded_at",
            "download_url",
            "preview_url",
        ]

    def _url(self, obj, download=False):
        request = self.context.get("request")
        path = (
            f"/api/procurement/purchase-invoices/{obj.invoice_id}/"
            f"attachments/{obj.id}/download/"
        )
        if download:
            path += "?download=1"
        return request.build_absolute_uri(path) if request else path

    def get_download_url(self, obj):
        return self._url(obj, download=True)

    def get_preview_url(self, obj):
        return self._url(obj)


class SupplierPaymentSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source="supplier.name")
    invoice_number = serializers.SerializerMethodField()
    created_by_name = serializers.ReadOnlyField(source="created_by.name")
    remaining_balance = serializers.SerializerMethodField()
    voucher_number = serializers.SerializerMethodField()

    class Meta:
        model = SupplierPayment
        fields = [
            "id",
            "restaurant",
            "branch",
            "supplier",
            "supplier_name",
            "purchase_invoice",
            "invoice_number",
            "voucher_number",
            "date",
            "amount",
            "payment_method",
            "reference_number",
            "notes",
            "created_by",
            "created_by_name",
            "remaining_balance",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "restaurant",
            "branch",
            "created_by",
            "created_at",
            "updated_at",
            "remaining_balance",
        ]

    def get_invoice_number(self, obj):
        if not obj.purchase_invoice_id:
            return None
        return obj.purchase_invoice.invoice_number or f"PINV-{obj.purchase_invoice_id}"

    def get_remaining_balance(self, obj):
        if not obj.purchase_invoice_id:
            return "0.00"
        return obj.purchase_invoice.remaining_balance

    def get_voucher_number(self, obj):
        return f"SPV-{obj.id:06d}" if obj.id else None


class PurchaseInvoiceSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source="supplier.name")
    branch_name = serializers.ReadOnlyField(source="branch.name")
    created_by_name = serializers.ReadOnlyField(source="created_by.name")
    lines = PurchaseInvoiceLineSerializer(many=True, read_only=True)
    payments = SupplierPaymentSerializer(many=True, read_only=True)
    attachments = PurchaseInvoiceAttachmentSerializer(many=True, read_only=True)
    remaining_balance = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        read_only=True,
    )
    line_count = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseInvoice
        fields = [
            "id",
            "restaurant",
            "branch",
            "branch_name",
            "supplier",
            "supplier_name",
            "invoice_number",
            "purchase_date",
            "due_date",
            "notes",
            "total_amount",
            "amount_paid",
            "remaining_balance",
            "status",
            "is_inventory_posted",
            "created_by",
            "created_by_name",
            "line_count",
            "lines",
            "payments",
            "attachments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "restaurant",
            "branch",
            "total_amount",
            "amount_paid",
            "remaining_balance",
            "status",
            "is_inventory_posted",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def get_line_count(self, obj):
        annotated = getattr(obj, "line_count", None)
        if annotated is not None:
            return annotated
        return obj.lines.count()


class StockTransferLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.ReadOnlyField(source="actor.name")

    class Meta:
        model = StockTransferLog
        fields = ["id", "action", "message", "actor", "actor_name", "created_at"]


class StockTransferSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source="ingredient.name")
    from_branch_name = serializers.ReadOnlyField(source="from_branch.name")
    to_branch_name = serializers.ReadOnlyField(source="to_branch.name")
    created_by_name = serializers.ReadOnlyField(source="created_by.name")
    approved_by_name = serializers.ReadOnlyField(source="approved_by.name")
    logs = StockTransferLogSerializer(many=True, read_only=True)

    class Meta:
        model = StockTransfer
        fields = [
            "id",
            "restaurant",
            "ingredient",
            "ingredient_name",
            "from_branch",
            "from_branch_name",
            "to_branch",
            "to_branch_name",
            "quantity",
            "status",
            "notes",
            "created_by",
            "created_by_name",
            "approved_by",
            "approved_by_name",
            "created_at",
            "approved_at",
            "updated_at",
            "logs",
        ]
        read_only_fields = [
            "restaurant",
            "status",
            "created_by",
            "approved_by",
            "created_at",
            "approved_at",
            "updated_at",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        restaurant = self.context.get("restaurant")
        branch = self.context.get("branch")

        if not restaurant and request and hasattr(request.user, "staff_profile"):
            restaurant = request.user.staff_profile.restaurant
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        if restaurant:
            ingredients = Ingredient.objects.filter(restaurant=restaurant, is_active=True)
            if branch:
                ingredients = ingredients.filter(branch=branch)
            self.fields["ingredient"].queryset = ingredients
            self.fields["from_branch"].queryset = Branch.objects.filter(
                restaurant=restaurant,
                is_active=True,
            )
            self.fields["to_branch"].queryset = Branch.objects.filter(
                restaurant=restaurant,
                is_active=True,
            )

    def validate(self, attrs):
        from_branch = attrs.get("from_branch", getattr(self.instance, "from_branch", None))
        to_branch = attrs.get("to_branch", getattr(self.instance, "to_branch", None))
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", None))
        ingredient = attrs.get("ingredient", getattr(self.instance, "ingredient", None))

        if from_branch and to_branch and from_branch.id == to_branch.id:
            raise serializers.ValidationError(
                {"to_branch": "Destination branch must be different."}
            )

        if quantity is not None and quantity <= 0:
            raise serializers.ValidationError(
                {"quantity": "Quantity must be greater than zero."}
            )

        if ingredient and from_branch and ingredient.branch_id and ingredient.branch_id != from_branch.id:
            raise serializers.ValidationError(
                {"ingredient": "This ingredient does not belong to the source branch."}
            )

        if ingredient and from_branch and ingredient.branch_id is None:
            get_or_create_ingredient_stock(ingredient, from_branch)

        return attrs


from rest_framework import serializers
from .models import Ingredient


class IngredientUsageSerializer(serializers.ModelSerializer):

    menu_items = serializers.SerializerMethodField()
    quantity_available = serializers.SerializerMethodField()
    minimum_threshold = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = [
            "id",
            "name",
            "unit",
            "quantity_available",
            "minimum_threshold",
            "menu_items"
        ]

    def _branch(self):
        request = self.context.get("request")
        branch = self.context.get("branch")
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)
        return branch

    def get_quantity_available(self, obj):
        return get_effective_quantity(obj, self._branch())

    def get_minimum_threshold(self, obj):
        return get_effective_minimum_threshold(obj, self._branch())

    def get_menu_items(self, obj):
        branch = self._branch()

        recipes = obj.menu_items.select_related(
            "menu_item"
        ).all()

        return [
            {
                "id": recipe.menu_item.id,
                "name": recipe.menu_item.name,
                "price": recipe.menu_item.get_effective_price(branch),
                "quantity_required": recipe.quantity_required,
                "is_available": recipe.menu_item.is_available_for_branch(branch)
            }
            for recipe in recipes
        ]
