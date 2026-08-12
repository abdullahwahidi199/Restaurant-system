from django.urls import path

from .views import (
    ContractorListCreateView,
    ContractorRetrieveUpdateView,
    ServiceContractListCreateView,
    ServiceContractRetrieveUpdateView,
    contractor_invoice_approve,
    contractor_invoice_attachment_delete,
    contractor_invoice_attachment_download,
    contractor_invoice_attachment_list_create,
    contractor_invoice_detail,
    contractor_invoice_list_create,
    contractor_ledger_view,
    contractor_payment_detail,
    contractor_payment_list_create,
    contractor_summary,
)


urlpatterns = [
    path("summary/", contractor_summary),
    path("contractors/", ContractorListCreateView.as_view()),
    path("contractors/<int:pk>/", ContractorRetrieveUpdateView.as_view()),
    path("contractors/<int:pk>/ledger/", contractor_ledger_view),
    path("contracts/", ServiceContractListCreateView.as_view()),
    path("contracts/<int:pk>/", ServiceContractRetrieveUpdateView.as_view()),
    path("invoices/", contractor_invoice_list_create),
    path("invoices/<int:pk>/", contractor_invoice_detail),
    path("invoices/<int:pk>/approve/", contractor_invoice_approve),
    path("invoices/<int:pk>/attachments/", contractor_invoice_attachment_list_create),
    path(
        "invoices/<int:pk>/attachments/<int:attachment_pk>/download/",
        contractor_invoice_attachment_download,
    ),
    path(
        "invoices/<int:pk>/attachments/<int:attachment_pk>/",
        contractor_invoice_attachment_delete,
    ),
    path("payments/", contractor_payment_list_create),
    path("payments/<int:pk>/", contractor_payment_detail),
]
