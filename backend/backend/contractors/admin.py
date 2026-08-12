from django.contrib import admin

from .models import (
    Contractor,
    ContractorInvoice,
    ContractorInvoiceAttachment,
    ContractorInvoiceLine,
    ContractorPayment,
    ServiceContract,
)


admin.site.register(Contractor)
admin.site.register(ServiceContract)
admin.site.register(ContractorInvoice)
admin.site.register(ContractorInvoiceLine)
admin.site.register(ContractorInvoiceAttachment)
admin.site.register(ContractorPayment)
