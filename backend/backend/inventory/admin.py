from django.contrib import admin
from .models import (
    Ingredient,
    PurchaseInvoice,
    PurchaseInvoiceAttachment,
    PurchaseInvoiceLine,
    Supplier,
    SupplierPayment,
)
# Register your models here.

admin.site.register(Ingredient)
admin.site.register(Supplier)
admin.site.register(PurchaseInvoice)
admin.site.register(PurchaseInvoiceLine)
admin.site.register(PurchaseInvoiceAttachment)
admin.site.register(SupplierPayment)
