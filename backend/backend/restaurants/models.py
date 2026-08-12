from django.db import models
from django.utils import timezone
from django.utils.text import slugify
import qrcode
from io import BytesIO
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError


def build_public_url(path):
    base_url = getattr(settings, "BASE_URL", "https://pakhlai.com").rstrip("/")
    return f"{base_url}{path}"


def build_qr_png(url):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(fill_color="black", back_color="white")

    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return ContentFile(buffer.getvalue())


def replace_field_file(field_file, file_name, content):
    generated_name = field_file.field.generate_filename(field_file.instance, file_name)
    storage = field_file.storage

    if field_file.name and field_file.name != generated_name:
        try:
            storage.delete(field_file.name)
        except Exception:
            pass

    if storage.exists(generated_name):
        storage.delete(generated_name)

    field_file.save(file_name, content, save=False)


def invalidate_public_restaurant_cache(slug):
    if not slug:
        return
    from django.core.cache import cache

    cache.delete(f"public_restaurant_entry:{slug}")


def make_unique_restaurant_slug(name, pk=None):
    base_slug = slugify(name) or "restaurant"
    candidate = base_slug
    counter = 1

    while Restaurant.objects.filter(slug=candidate).exclude(pk=pk).exists():
        candidate = f"{base_slug}-{counter}"
        counter += 1

    return candidate


def make_unique_branch_slug(restaurant, name, pk=None):
    base_slug = slugify(name) or "branch"
    candidate = base_slug
    counter = 2

    while Branch.objects.filter(
        restaurant=restaurant,
        slug=candidate,
    ).exclude(pk=pk).exists():
        candidate = f"{base_slug}-{counter}"
        counter += 1

    return candidate



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
    cover_image = models.ImageField(
        upload_to='restaurant_covers/',
        null=True,
        blank=True,
    )
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

    
    def get_public_path(self):
        return f"/menu/{self.slug}"

    def get_public_url(self):
        return build_public_url(self.get_public_path())

    def regenerate_brand_qr_code(self, force=False):
        if not self.pk or not self.slug:
            return False

        file_name = f"{self.slug}_brand_qr.png"
        expected_name = self.qr_code.field.generate_filename(self, file_name)

        if not force and self.qr_code and self.qr_code.name == expected_name:
            return False

        replace_field_file(
            self.qr_code,
            file_name,
            build_qr_png(self.get_public_url()),
        )
        Restaurant.objects.filter(pk=self.pk).update(qr_code=self.qr_code.name)
        return True

    def save(self, *args, **kwargs):
        old_slug = None
        if self.pk:
            old_slug = Restaurant.objects.filter(pk=self.pk).values_list(
                "slug",
                flat=True,
            ).first()

        self.slug = make_unique_restaurant_slug(self.name, self.pk)

        update_fields = kwargs.get("update_fields")
        if update_fields is not None and "name" in update_fields and "slug" not in update_fields:
            kwargs["update_fields"] = set(update_fields) | {"slug"}

        super().save(*args, **kwargs)

        slug_changed = old_slug != self.slug
        self.regenerate_brand_qr_code(force=slug_changed or not self.qr_code)

        if old_slug and slug_changed:
            invalidate_public_restaurant_cache(old_slug)

        invalidate_public_restaurant_cache(self.slug)

        if slug_changed:
            for branch in self.branches.all():
                branch.regenerate_qr_code(force=True)

        

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        old_slug = self.slug
        result = super().delete(*args, **kwargs)
        invalidate_public_restaurant_cache(old_slug)
        return result
    
class Subscription(models.Model):
    restaurant = models.OneToOneField(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="subscription"
    )
    starts_at = models.DateField()
    expires_at = models.DateField()

    max_branches = models.PositiveIntegerField(default=1)

   
    is_active = models.BooleanField(default=True)

    @property
    def is_valid(self):
        today = timezone.now().date()
        return self.is_active and self.starts_at <= today <= self.expires_at

    def __str__(self):
        return f"{self.restaurant.name} Subscription"
    
    @property
    def branches_used(self):
        return self.restaurant.branches.count()

    @property
    def branches_remaining(self):
        return max(0, self.max_branches - self.branches_used)
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
    slug = models.SlugField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
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
    qr_code = models.ImageField(upload_to="branch_qr_codes/", blank=True, null=True)
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
            ),
            models.UniqueConstraint(
                fields=["restaurant", "slug"],
                name="unique_branch_slug_per_restaurant",
            )
        ]
        ordering = ["-is_main_branch", "name"]

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

    def clean(self):
        super().clean()
        if not self.pk:
            subscription = getattr(self.restaurant, "subscription", None)

            if not subscription:
                raise ValidationError(
                    "This restaurant does not have an active subscription."
                )

            if not subscription.is_valid:
                raise ValidationError(
                    "The restaurant subscription has expired."
                )

            current = self.restaurant.branches.count()

            if current >= subscription.max_branches:
                raise ValidationError(
                    f"This subscription allows a maximum of, please contact the system owner to upgrade the subscription."
                    f"{subscription.max_branches} branches."
                )
        if self.is_main_branch:
            if not self.is_active:
                raise ValidationError("Main branch must remain active.")

            existing = Branch.objects.filter(
                restaurant=self.restaurant,
                is_main_branch=True
            ).exclude(pk=self.pk)
            if existing.exists():
                raise ValidationError("A restaurant can only have one main branch.")

    def get_public_path(self):
        return f"/menu/{self.restaurant.slug}"

    def get_public_url(self):
        return build_public_url(self.get_public_path())

    def regenerate_qr_code(self, force=False):
        if not self.pk or not self.slug or not self.restaurant_id:
            return False

        target_url = self.get_public_url()
        settings_data = dict(self.settings or {})
        previous_url = settings_data.get("_public_qr_url")
        file_name = f"{self.restaurant.slug}_{self.slug}_qr.png"
        expected_name = self.qr_code.field.generate_filename(self, file_name)

        if (
            not force
            and self.qr_code
            and self.qr_code.name == expected_name
            and previous_url == target_url
        ):
            return False

        replace_field_file(
            self.qr_code,
            file_name,
            build_qr_png(target_url),
        )
        settings_data["_public_qr_url"] = target_url
        self.settings = settings_data
        Branch.objects.filter(pk=self.pk).update(
            qr_code=self.qr_code.name,
            settings=settings_data,
        )
        invalidate_public_restaurant_cache(self.restaurant.slug)
        return True

    def save(self, *args, **kwargs):
        old_slug = None
        old_name = None
        if self.pk:
            old_branch = Branch.objects.filter(pk=self.pk).only("name", "slug").first()
            if old_branch:
                old_name = old_branch.name
                old_slug = old_branch.slug

        if not self.slug or old_name != self.name:
            self.slug = make_unique_branch_slug(self.restaurant, self.name, self.pk)

        update_fields = kwargs.get("update_fields")
        if update_fields is not None and "name" in update_fields and "slug" not in update_fields:
            kwargs["update_fields"] = set(update_fields) | {"slug"}

        self.full_clean()
        result = super().save(*args, **kwargs)
        self.regenerate_qr_code(force=old_slug != self.slug or not self.qr_code)
        invalidate_public_restaurant_cache(self.restaurant.slug)
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
        restaurant_slug = self.restaurant.slug
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

        result = super().delete(*args, **kwargs)
        invalidate_public_restaurant_cache(restaurant_slug)
        return result


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
