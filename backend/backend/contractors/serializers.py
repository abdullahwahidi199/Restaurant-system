from rest_framework import serializers

from restaurants.branching import get_active_branch

from .models import (
    Contractor,
    ContractorInvoice,
    ContractorInvoiceAttachment,
    ContractorInvoiceLine,
    ContractorPayment,
    ServiceContract,
)


class ContractorSerializer(serializers.ModelSerializer):
    branch_name = serializers.ReadOnlyField(source="branch.name")
    total_invoiced = serializers.DecimalField(
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
        model = Contractor
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
            "total_invoiced",
            "total_paid",
            "outstanding_balance",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "restaurant",
            "branch",
            "total_invoiced",
            "total_paid",
            "outstanding_balance",
            "created_at",
            "updated_at",
        ]


class ServiceContractSerializer(serializers.ModelSerializer):
    contractor_name = serializers.ReadOnlyField(source="contractor.name")
    branch_name = serializers.ReadOnlyField(source="branch.name")
    created_by_name = serializers.ReadOnlyField(source="created_by.name")
    invoice_count = serializers.SerializerMethodField()
    total_invoiced = serializers.SerializerMethodField()

    class Meta:
        model = ServiceContract
        fields = [
            "id",
            "restaurant",
            "branch",
            "branch_name",
            "contractor",
            "contractor_name",
            "title",
            "start_date",
            "end_date",
            "contract_value",
            "status",
            "notes",
            "created_by",
            "created_by_name",
            "invoice_count",
            "total_invoiced",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "restaurant",
            "branch",
            "created_by",
            "created_at",
            "updated_at",
            "invoice_count",
            "total_invoiced",
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
            contractors = Contractor.objects.filter(restaurant=restaurant)
            if branch:
                contractors = contractors.filter(branch=branch)
            self.fields["contractor"].queryset = contractors

    def validate(self, attrs):
        contractor = attrs.get("contractor", getattr(self.instance, "contractor", None))
        request = self.context.get("request")
        branch = self.context.get("branch")
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        if contractor and branch and contractor.branch_id != branch.id:
            raise serializers.ValidationError(
                {"contractor": "This contractor belongs to another branch."}
            )

        return attrs

    def get_invoice_count(self, obj):
        return obj.invoices.exclude(status=ContractorInvoice.STATUS_DRAFT).count()

    def get_total_invoiced(self, obj):
        total = sum(
            (invoice.total_amount for invoice in obj.invoices.exclude(status=ContractorInvoice.STATUS_DRAFT)),
            0,
        )
        return f"{total:.2f}"


class ContractorInvoiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractorInvoiceLine
        fields = [
            "id",
            "invoice",
            "service_type",
            "description",
            "quantity",
            "unit_price",
            "total_price",
        ]
        read_only_fields = ["invoice", "total_price"]


class ContractorInvoiceAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source="uploaded_by.name")
    file_type = serializers.ReadOnlyField()
    download_url = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()

    class Meta:
        model = ContractorInvoiceAttachment
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
            f"/api/contractors/invoices/{obj.invoice_id}/"
            f"attachments/{obj.id}/download/"
        )
        if download:
            path += "?download=1"
        return request.build_absolute_uri(path) if request else path

    def get_download_url(self, obj):
        return self._url(obj, download=True)

    def get_preview_url(self, obj):
        return self._url(obj)


class ContractorPaymentSerializer(serializers.ModelSerializer):
    contractor_name = serializers.ReadOnlyField(source="contractor.name")
    invoice_number = serializers.SerializerMethodField()
    created_by_name = serializers.ReadOnlyField(source="created_by.name")
    remaining_balance = serializers.SerializerMethodField()

    class Meta:
        model = ContractorPayment
        fields = [
            "id",
            "restaurant",
            "branch",
            "contractor",
            "contractor_name",
            "invoice",
            "invoice_number",
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
        if not obj.invoice_id:
            return None
        return obj.invoice.invoice_number or f"CINV-{obj.invoice_id}"

    def get_remaining_balance(self, obj):
        if not obj.invoice_id:
            return "0.00"
        return obj.invoice.remaining_balance


class ContractorInvoiceSerializer(serializers.ModelSerializer):
    contractor_name = serializers.ReadOnlyField(source="contractor.name")
    contract_title = serializers.ReadOnlyField(source="contract.title")
    branch_name = serializers.ReadOnlyField(source="branch.name")
    created_by_name = serializers.ReadOnlyField(source="created_by.name")
    lines = ContractorInvoiceLineSerializer(many=True, read_only=True)
    payments = ContractorPaymentSerializer(many=True, read_only=True)
    attachments = ContractorInvoiceAttachmentSerializer(many=True, read_only=True)
    remaining_balance = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        read_only=True,
    )
    line_count = serializers.SerializerMethodField()

    class Meta:
        model = ContractorInvoice
        fields = [
            "id",
            "restaurant",
            "branch",
            "branch_name",
            "contractor",
            "contractor_name",
            "contract",
            "contract_title",
            "invoice_number",
            "invoice_date",
            "due_date",
            "description",
            "total_amount",
            "amount_paid",
            "remaining_balance",
            "status",
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
            "created_by",
            "created_at",
            "updated_at",
        ]

    def get_line_count(self, obj):
        annotated = getattr(obj, "line_count", None)
        if annotated is not None:
            return annotated
        return obj.lines.count()
