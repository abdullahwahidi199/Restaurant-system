from django.urls import path

from inventory.views import (
    SupplierListCreateView,
    SupplierRetrieveUpdateView,
    purchase_invoice_attachment_delete,
    purchase_invoice_attachment_download,
    purchase_invoice_attachment_list_create,
    purchase_invoice_approve,
    purchase_invoice_detail,
    purchase_invoice_list_create,
    supplier_ledger_view,
    supplier_payment_detail,
    supplier_payment_list_create,
    supplier_payment_voucher,
    supplier_payment_voucher_pdf,
)


urlpatterns = [
    path("suppliers/", SupplierListCreateView.as_view()),
    path("suppliers/<int:pk>/", SupplierRetrieveUpdateView.as_view()),
    path("suppliers/<int:pk>/ledger/", supplier_ledger_view),
    path("purchase-invoices/", purchase_invoice_list_create),
    path("purchase-invoices/<int:pk>/", purchase_invoice_detail),
    path("purchase-invoices/<int:pk>/approve/", purchase_invoice_approve),
    path("purchase-invoices/<int:pk>/attachments/", purchase_invoice_attachment_list_create),
    path(
        "purchase-invoices/<int:pk>/attachments/<int:attachment_pk>/download/",
        purchase_invoice_attachment_download,
    ),
    path(
        "purchase-invoices/<int:pk>/attachments/<int:attachment_pk>/",
        purchase_invoice_attachment_delete,
    ),
    path("supplier-payments/", supplier_payment_list_create),
    path("supplier-payments/<int:pk>/", supplier_payment_detail),
    path("supplier-payments/<int:pk>/voucher/", supplier_payment_voucher),
    path("supplier-payments/<int:pk>/voucher-pdf/", supplier_payment_voucher_pdf),
]
