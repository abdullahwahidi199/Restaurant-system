from io import BytesIO

from django.conf import settings
from django.core.files.base import ContentFile
from django.db import migrations, models
from django.utils.text import slugify
import qrcode


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


def make_unique_branch_slug(Branch, restaurant_id, name, branch_id):
    base_slug = slugify(name) or "branch"
    candidate = base_slug
    counter = 2

    while Branch.objects.filter(
        restaurant_id=restaurant_id,
        slug=candidate,
    ).exclude(pk=branch_id).exists():
        candidate = f"{base_slug}-{counter}"
        counter += 1

    return candidate


def populate_branch_slugs_and_qr(apps, schema_editor):
    Restaurant = apps.get_model("restaurants", "Restaurant")
    Branch = apps.get_model("restaurants", "Branch")

    for restaurant in Restaurant.objects.all().order_by("id"):
        public_url = build_public_url(f"/{restaurant.slug}")
        file_name = f"{restaurant.slug}_brand_qr.png"
        replace_field_file(restaurant.qr_code, file_name, build_qr_png(public_url))
        restaurant.save(update_fields=["qr_code"])

    for branch in Branch.objects.select_related("restaurant").order_by("restaurant_id", "id"):
        branch.slug = make_unique_branch_slug(
            Branch,
            branch.restaurant_id,
            branch.name,
            branch.id,
        )
        public_url = build_public_url(f"/{branch.restaurant.slug}/{branch.slug}")
        file_name = f"{branch.restaurant.slug}_{branch.slug}_qr.png"
        replace_field_file(branch.qr_code, file_name, build_qr_png(public_url))

        settings_data = dict(branch.settings or {})
        settings_data["_public_qr_url"] = public_url
        branch.settings = settings_data
        branch.save(update_fields=["slug", "qr_code", "settings"])


def clear_branch_slugs_and_qr(apps, schema_editor):
    Branch = apps.get_model("restaurants", "Branch")
    Branch.objects.update(slug="", qr_code="")


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0012_disable_shared_modes"),
    ]

    operations = [
        migrations.AddField(
            model_name="branch",
            name="slug",
            field=models.SlugField(blank=True, default="", max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="branch",
            name="qr_code",
            field=models.ImageField(blank=True, null=True, upload_to="branch_qr_codes/"),
        ),
        migrations.RunPython(populate_branch_slugs_and_qr, clear_branch_slugs_and_qr),
        migrations.AddConstraint(
            model_name="branch",
            constraint=models.UniqueConstraint(
                fields=("restaurant", "slug"),
                name="unique_branch_slug_per_restaurant",
            ),
        ),
    ]
