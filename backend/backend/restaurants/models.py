from django.db import models
from django.utils import timezone
from django.utils.text import slugify
import qrcode
from io import BytesIO
from django.core.files import File



class Restaurant(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()

    logo = models.ImageField(upload_to='restaurant_logos/', null=True, blank=True)

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