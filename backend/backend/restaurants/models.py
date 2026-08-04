from django.db import models
from django.utils import timezone
from django.utils.text import slugify
import qrcode
from io import BytesIO
from django.core.files import File
from django.core.exceptions import ValidationError



class Restaurant(models.Model):
    DATA_MODE_CHOICES = [
        ("separate", "Separate"),
    ]

    PRICING_MODE_CHOICES = [
        ("branch", "Branch Pricing"),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()

    logo = models.ImageField(upload_to='restaurant_logos/', null=True, blank=True)
    slogan=models.TextField(blank=True, null=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    min_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    manager_discount_limit = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10
    )

    admin_discount_limit = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100
    )

    menu_mode = models.CharField(
        max_length=20,
        choices=DATA_MODE_CHOICES,
        default="separate",
    )
    ingredient_mode = models.CharField(
        max_length=20,
        choices=DATA_MODE_CHOICES,
        default="separate",
    )
    recipe_mode = models.CharField(
        max_length=20,
        choices=DATA_MODE_CHOICES,
        default="separate",
    )
    pricing_mode = models.CharField(
        max_length=20,
        choices=PRICING_MODE_CHOICES,
        default="branch",
    )

    delivery_radius_km = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5
    )
    base_delivery_fee = models.DecimalField(
    max_digits=6,
    decimal_places=2,
    default=0
)

    price_per_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0
    )
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    website = models.URLField(blank=True, null=True)
    opening_hours = models.CharField(max_length=100, blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    x = models.URLField(blank=True, null=True)
    delivery_available = models.BooleanField(default=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    
    def save(self, *args, **kwargs):
    # Always regenerate slug when name changes
        base_slug = slugify(self.name)
        slug = base_slug
        counter = 1

        while Restaurant.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        self.slug = slug

        super().save(*args, **kwargs)
        from django.conf import settings
        qr_url = f"{settings.BASE_URL}/menu/{self.slug}"
        print("QR URL:", qr_url)

        qr = qrcode.make(qr_url)

        buffer = BytesIO()
        
        qr.save(buffer, format='PNG')

        file_name = f"{self.slug}_qr.png"

        self.qr_code.save(file_name, File(buffer), save=False)

        

    def __str__(self):
        return self.name
    
class Subscription(models.Model):
    restaurant = models.OneToOneField(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="subscription"
    )
    starts_at = models.DateField()
    expires_at = models.DateField()
    is_active = models.BooleanField(default=True)

    @property
    def is_valid(self):
        today = timezone.now().date()
        return self.is_active and self.starts_at <= today <= self.expires_at

    def __str__(self):
        return f"{self.restaurant.name} Subscription"
    @property
    def days_left(self):
        today = timezone.now().date()
        return (self.expires_at - today).days

    @property
    def is_expiring_soon(self):
        return 0 <= self.days_left <= 10


class Branch(models.Model):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="branches"
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    receipt_header = models.CharField(max_length=255, blank=True)
    receipt_footer = models.TextField(blank=True)
    receipt_template = models.TextField(blank=True)
    tax_rate = models.DecimalField(
        max_digits=6,
        decimal_places=3,
        null=True,
        blank=True,
    )
    service_charge_rate = models.DecimalField(
        max_digits=6,
        decimal_places=3,
        null=True,
        blank=True,
    )
    kitchen_printer = models.CharField(max_length=120, blank=True)
    opening_hours = models.CharField(max_length=120, blank=True)
    delivery_available = models.BooleanField(null=True, blank=True)
    delivery_radius_km = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )
    base_delivery_fee = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )
    price_per_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )
    min_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    cash_drawer_enabled = models.BooleanField(default=True)
    cash_drawer_name = models.CharField(max_length=120, blank=True)
    logo = models.ImageField(upload_to="branch_logos/", null=True, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    is_main_branch = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("restaurant", "code")
        constraints = [
            models.UniqueConstraint(
                fields=["restaurant"],
                condition=models.Q(is_main_branch=True),
                name="unique_main_branch_per_restaurant",
            )
        ]
        ordering = ["-is_main_branch", "name"]

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

    def clean(self):
        if self.is_main_branch:
            if not self.is_active:
                raise ValidationError("Main branch must remain active.")

            existing = Branch.objects.filter(
                restaurant=self.restaurant,
                is_main_branch=True
            ).exclude(pk=self.pk)
            if existing.exists():
                raise ValidationError("A restaurant can only have one main branch.")

    def save(self, *args, **kwargs):
        self.full_clean()
        result = super().save(*args, **kwargs)
        from .branching import sync_all_branch_access_staff

        sync_all_branch_access_staff(self.restaurant)
        return result

    def has_operational_data(self):
        ignored_accessors = {"staff_members", "active_staff"}

        for relation in self._meta.related_objects:
            if relation.get_accessor_name() in ignored_accessors:
                continue

            manager = getattr(self, relation.get_accessor_name(), None)
            if manager is not None and manager.exists():
                return True

        return False

    def delete(self, *args, **kwargs):
        if self.is_main_branch:
            raise ValidationError("Main branch cannot be deleted.")

        if self.has_operational_data():
            raise ValidationError(
                "This branch contains operational data and cannot be deleted."
            )

        branchless_staff = self.staff_members.annotate(
            branch_count=models.Count("branches")
        ).filter(branch_count__lte=1)
        if branchless_staff.exists():
            raise ValidationError(
                "This branch is the only assigned branch for one or more staff members."
            )

        for staff in self.active_staff.all():
            replacement = staff.branches.filter(
                restaurant=self.restaurant,
                is_active=True,
            ).exclude(pk=self.pk).first()
            if replacement:
                staff.active_branch = replacement
                staff.save(update_fields=["active_branch"])

        return super().delete(*args, **kwargs)


class BranchDataMigrationLog(models.Model):
    STATUS_CHOICES = [
        ("running", "Running"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    MIGRATION_TYPE_CHOICES = [
        ("ingredients", "Ingredients"),
        ("categories", "Menu Categories"),
        ("menu_items", "Menu Items"),
        ("platters", "Platters"),
        ("modifiers", "Modifiers"),
        ("everything", "Everything"),
    ]

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="branch_data_migrations",
    )
    source_branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="outgoing_data_migrations",
    )
    destination_branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="incoming_data_migrations",
    )
    migration_type = models.CharField(max_length=30, choices=MIGRATION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="running")
    created_by = models.ForeignKey(
        "users.Staff",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="branch_data_migrations",
    )
    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(null=True, blank=True)
    imported_count = models.PositiveIntegerField(default=0)
    skipped_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    summary = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["restaurant", "started_at"], name="bdm_rest_started_idx"),
            models.Index(fields=["destination_branch", "status"], name="bdm_dest_status_idx"),
        ]

    @property
    def duration_seconds(self):
        if not self.finished_at:
            return None
        return (self.finished_at - self.started_at).total_seconds()

    def __str__(self):
        return (
            f"{self.get_migration_type_display()}: "
            f"{self.source_branch.name} -> {self.destination_branch.name}"
        )
