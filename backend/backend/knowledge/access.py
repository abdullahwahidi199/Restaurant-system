"""Reviewed documentation policy; never authorize using AI args/frontmatter roles."""
from dataclasses import dataclass
from types import SimpleNamespace

from .errors import GatewayError
from .markdown import canonical_json, digest

POLICY_VERSION = "2026-10-28.1"
ADMINS = frozenset({"Admin", "BranchAdmin"})
FINANCE = ADMINS | {"FinanceManager"}
OPERATIONS = ADMINS | {"OperationsManager"}
STOCK = OPERATIONS | {"InventoryManager"}
PROCUREMENT = STOCK | {"FinanceManager"}
SERVICE = ADMINS | {"Manager", "Waiter", "Cashier", "Kitchen_manager"}
LOGIN_ROLES = STOCK | {"Manager", "Waiter", "Cashier", "Kitchen_manager", "Call_operator", "FinanceManager"}

# This policy authorizes reading guides, not performing every action they discuss.
# Mixed-role handoff guides explicitly retain their per-action permission caveats.
# Evidence: restaurants.permissions role classes; users.models.Staff branch methods;
# contractors.views.CONTRACTOR_PERMISSIONS; inventory.views purchase/payment/stock
# permissions; orders.views cashier/reservation/discount/table decorators;
# menu.views.CanReadOrManageMenu; users.views attendance/payroll decorators;
# audit.views and users.permissions activity permissions. See GATEWAY.md policy table.
DOCUMENT_ROLES = {
    "operator_modules_billing_cashier": ADMINS | {"Cashier"},
    "operator_modules_branches_branches": frozenset({"Admin"}),
    "operator_modules_contractors_services": FINANCE,
    "operator_modules_customers_feedback": ADMINS,
    "operator_modules_dashboard_dashboard": ADMINS,
    "operator_modules_discounts_discount_cards": ADMINS | {"Cashier", "Manager"},
    "operator_modules_discounts_requests": ADMINS | {"Cashier", "Manager"},
    "operator_modules_employees_attendance_shifts": OPERATIONS,
    "operator_modules_employees_staff": ADMINS,
    "operator_modules_expenses_expenses": PROCUREMENT,
    "operator_modules_inventory_stock": STOCK,
    "operator_modules_inventory_transfers": STOCK - {"BranchAdmin"},
    "operator_modules_kitchen_preparation": ADMINS | {"Kitchen_manager"},
    "operator_modules_menu_menu": STOCK,
    "operator_modules_menu_stations": STOCK,
    "operator_modules_orders_order_lists": ADMINS | {"Manager"},
    "operator_modules_orders_waiter_tables": ADMINS | {"Manager", "Waiter"},
    "operator_modules_payroll_payroll": FINANCE,
    "operator_modules_procurement_payments_attachments": PROCUREMENT,
    "operator_modules_procurement_purchasing": PROCUREMENT,
    "operator_modules_production_daily_production": STOCK | {"Kitchen_manager"},
    "operator_modules_public_ordering_customer_handoff": ADMINS | {"Cashier", "Call_operator"},
    "operator_modules_reports_report_controls": ADMINS,
    "operator_modules_reservations_reservations": ADMINS | {"Cashier", "Manager"},
    "operator_modules_settings_restaurant_branch_settings": ADMINS,
    "operator_modules_tables_table_setup": OPERATIONS,
    "operator_forms_order_entry": ADMINS | {"Waiter", "Manager", "Cashier", "Call_operator"},
    "operator_forms_form_submission_reference": ADMINS,
    "operator_navigation_application_navigation": LOGIN_ROLES,
    "operator_navigation_common_interface_controls": LOGIN_ROLES,
    "operator_navigation_page_directory": ADMINS,
    "operator_navigation_sidebar_directory": ADMINS,
    "operator_troubleshooting_errors_and_recovery": ADMINS,
    "operator_role_guides_administrators": ADMINS,
    "operator_role_guides_cashier": ADMINS | {"Cashier"},
    "operator_role_guides_kitchen": ADMINS | {"Kitchen_manager"},
    "operator_role_guides_manager": ADMINS | {"Manager"},
    "operator_role_guides_specialists": ADMINS,  # Mixed HR/finance/platform guide.
    "operator_role_guides_waiter": ADMINS | {"Waiter"},
    "operator_workflows_branch_setup": ADMINS,
    "operator_workflows_dine_in_to_payment": SERVICE,
    "operator_workflows_financial_obligations": FINANCE,
    "operator_workflows_reservation_to_service": ADMINS | {"Cashier", "Manager", "Waiter"},
    "operator_workflows_restock_and_prepare": STOCK,
    "operator_workflows_staff_to_payroll": FINANCE,
    "operator_workflows_takeaway_delivery": ADMINS | {"Cashier", "Call_operator", "Kitchen_manager"},
}


@dataclass(frozen=True)
class Principal:
    user_id: str
    staff_id: str = ""
    restaurant_id: str = ""
    branch_id: str = ""
    role: str = ""
    superuser: bool = False
    monitor_activity: bool = False
    revoke_sessions: bool = False

    @property
    def binding(self):
        return digest(canonical_json({**self.__dict__, "policy": POLICY_VERSION}))


def resolve_principal(user):
    """Reload authoritative account/context, read-only, on every tool call.

    The caller must already authenticate the execution context (e.g. using the
    existing SessionJWTAuthentication, including session revocation). A user ID
    in tool arguments is never accepted. No branch auto-assignment helpers run.
    """
    from django.contrib.auth import get_user_model
    from restaurants.permissions import IsRestaurantActive
    from users.permissions import CanMonitorUserActivity, CanRevokeUserSessions

    if not user or not getattr(user, "is_authenticated", False) or not getattr(user, "pk", None):
        raise GatewayError("authentication_required", "An authenticated staff execution context is required.")
    User = get_user_model()
    try:
        current = User.objects.select_related("staff_profile__restaurant__subscription", "staff_profile__active_branch").get(pk=user.pk)
    except User.DoesNotExist:
        raise GatewayError("access_denied", "The account is not available.") from None
    if not current.is_active:
        raise GatewayError("access_denied", "The account is not available.")
    if current.is_superuser:
        return Principal(str(current.pk), superuser=True)
    staff = getattr(current, "staff_profile", None)
    if not staff or not staff.restaurant_id or staff.status != "Active" or staff.role not in LOGIN_ROLES:
        raise GatewayError("access_denied", "An eligible active restaurant staff account is required.")
    request = SimpleNamespace(user=current)
    if not IsRestaurantActive().has_permission(request, None):
        raise GatewayError("restaurant_unavailable", "The restaurant and subscription must be active.")
    branch = staff.active_branch
    if not branch or not branch.is_active or branch.restaurant_id != staff.restaurant_id or not staff.get_available_branches().filter(pk=branch.pk).exists() or not staff.can_access_branch(branch):
        raise GatewayError("branch_required", "Select an authorized active branch before using the knowledge gateway.")
    return Principal(
        str(current.pk), str(staff.pk), str(staff.restaurant_id), str(branch.pk), staff.role,
        monitor_activity=bool(CanMonitorUserActivity().has_permission(request, None)),
        revoke_sessions=bool(CanRevokeUserSessions().has_permission(request, None)),
    )


def can_read_document(principal, document):
    if document["status"] not in {"source_verified", "runtime_verified", "automated_test_verified"}:
        return False
    if document["availability"] in {"inactive", "unmounted", "needs_verification", "qa_only"} or document["document_type"] in {"quality_assurance", "index"}:
        return False
    if principal.superuser:
        return True
    if document["document_type"] in {"backend_reference", "interface_reference"}:
        return False  # Restricted until granular technical-document policy is reviewed.
    if document["document_id"] == "operator_modules_audit_audit_activity":
        # Mixed guide includes production movements AND session monitoring/revocation.
        return principal.role in ADMINS and principal.monitor_activity and principal.revoke_sessions
    return principal.role in DOCUMENT_ROLES.get(document["document_id"], frozenset())
