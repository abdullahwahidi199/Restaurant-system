from io import BytesIO

from django.conf import settings
from django.core.files.base import ContentFile
from django.db import migrations
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


def regenerate_menu_qr_codes(apps, schema_editor):
    Restaurant = apps.get_model("restaurants", "Restaurant")
    Branch = apps.get_model("restaurants", "Branch")

    for restaurant in Restaurant.objects.exclude(slug="").order_by("id"):
        public_url = build_public_url(f"/menu/{restaurant.slug}")
        file_name = f"{restaurant.slug}_brand_qr.png"
        replace_field_file(restaurant.qr_code, file_name, build_qr_png(public_url))
        restaurant.save(update_fields=["qr_code"])

    for branch in Branch.objects.select_related("restaurant").exclude(
        restaurant__slug="",
    ).order_by("restaurant_id", "id"):
        public_url = build_public_url(f"/menu/{branch.restaurant.slug}")
        file_name = f"{branch.restaurant.slug}_{branch.slug}_qr.png"
        replace_field_file(branch.qr_code, file_name, build_qr_png(public_url))

        settings_data = dict(branch.settings or {})
        settings_data["_public_qr_url"] = public_url
        branch.settings = settings_data
        branch.save(update_fields=["qr_code", "settings"])


class Migration(migrations.Migration):

    dependencies = [
        ("restaurants", "0016_subscription_max_branches"),
    ]

    operations = [
        migrations.RunPython(regenerate_menu_qr_codes, migrations.RunPython.noop),
    ]
