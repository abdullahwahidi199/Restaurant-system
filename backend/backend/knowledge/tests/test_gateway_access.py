import unittest
from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import Mock, patch

from django.utils import timezone

from knowledge.access import can_read_document, resolve_principal
from knowledge.errors import GatewayError
from knowledge.tests.gateway_helpers import identity


class PrincipalTests(unittest.TestCase):
    def setUp(self):
        today = timezone.now().date()
        restaurant = SimpleNamespace(pk=13, is_active=True, subscription=SimpleNamespace(is_active=True, starts_at=today - timedelta(days=1), expires_at=today + timedelta(days=1)))
        branch = SimpleNamespace(pk=14, id=14, restaurant_id=13, is_active=True)
        self.staff = SimpleNamespace(pk=12, restaurant_id=13, restaurant=restaurant, role="Admin", custom_role=None, status="Active", active_branch=branch,
                                     get_available_branches=Mock(), can_access_branch=Mock(return_value=True))
        self.staff.get_available_branches.return_value.filter.return_value.exists.return_value = True
        self.current = SimpleNamespace(pk=11, is_authenticated=True, is_active=True, is_superuser=False, staff_profile=self.staff, has_perm=Mock(return_value=False))
        self.User = Mock()
        self.User.DoesNotExist = type("DoesNotExist", (Exception,), {})
        self.User.objects.select_related.return_value.get.return_value = self.current
        self.user = SimpleNamespace(pk=11, is_authenticated=True)
        self.patcher = patch("django.contrib.auth.get_user_model", return_value=self.User)
        self.patcher.start()
        self.addCleanup(self.patcher.stop)

    def assert_denied(self, code):
        with self.assertRaises(GatewayError) as caught:
            resolve_principal(self.user)
        self.assertEqual(caught.exception.code, code)

    def test_current_account_reloaded_and_existing_activity_permissions_used(self):
        principal = resolve_principal(self.user)
        self.assertEqual(principal.role, "Admin")
        self.assertEqual(principal.branch_id, "14")
        self.assertTrue(principal.monitor_activity)
        self.assertTrue(principal.revoke_sessions)
        self.User.objects.select_related.return_value.get.assert_called_once_with(pk=11)
        self.staff.can_access_branch.assert_called_once_with(self.staff.active_branch)
        self.staff.role = "Waiter"
        self.assertEqual(resolve_principal(self.user).role, "Waiter")

    def test_inactive_missing_anonymous_and_unknown_custom_roles_denied(self):
        self.user.is_authenticated = False
        self.assert_denied("authentication_required")
        self.user.is_authenticated = True
        self.current.is_active = False
        self.assert_denied("access_denied")
        self.current.is_active = True
        self.staff.role, self.staff.custom_role = "Other", "Admin"
        self.assert_denied("access_denied")
        self.staff.role = "SuperAdmin"  # Role name is not Django is_superuser.
        self.assert_denied("access_denied")
        self.current.staff_profile = None
        self.assert_denied("access_denied")

    def test_subscription_and_restaurant_rules_enforced(self):
        self.staff.restaurant.is_active = False
        self.assert_denied("restaurant_unavailable")
        self.staff.restaurant.is_active = True
        self.staff.restaurant.subscription.expires_at = timezone.now().date() - timedelta(days=1)
        self.assert_denied("restaurant_unavailable")

    def test_branch_ownership_assignment_and_active_state_enforced_read_only(self):
        self.staff.active_branch.restaurant_id = 99
        self.assert_denied("branch_required")
        self.staff.active_branch.restaurant_id = 13
        self.staff.active_branch.is_active = False
        self.assert_denied("branch_required")
        self.staff.active_branch.is_active = True
        self.staff.get_available_branches.return_value.filter.return_value.exists.return_value = False
        self.assert_denied("branch_required")
        self.staff.get_available_branches.return_value.filter.return_value.exists.return_value = True
        self.staff.can_access_branch.return_value = False
        self.assert_denied("branch_required")
        self.staff.active_branch = None
        self.assert_denied("branch_required")
        # There is no get_or_set_active_branch/save call in this read-only adapter.
        self.assertFalse(hasattr(self.staff, "save"))

    def test_superuser_requires_real_active_account_not_role_label(self):
        self.current.is_superuser = True
        self.current.staff_profile = None
        self.assertTrue(resolve_principal(self.user).superuser)
        self.current.is_active = False
        self.assert_denied("access_denied")


class DocumentPolicyTests(unittest.TestCase):
    def doc(self, did="operator_modules_payroll_payroll", **kwargs):
        return {"document_id": did, "document_type": "operator_guide", "availability": "operator_guidance", "status": "source_verified", "roles": ["Waiter"], **kwargs}

    def test_explicit_policy_not_frontmatter_or_superadmin_role_name(self):
        self.assertFalse(can_read_document(identity("Waiter"), self.doc()))
        self.assertTrue(can_read_document(identity("FinanceManager"), self.doc(roles=[])))
        self.assertFalse(can_read_document(identity("Admin"), self.doc(did="unknown_id", roles=["Admin"])))
        self.assertFalse(can_read_document(identity("SuperAdmin"), self.doc(did="operator_modules_administration_platform")))
        self.assertTrue(can_read_document(identity(superuser=True), self.doc(did="operator_modules_administration_platform")))

    def test_block_unavailable_unverified_qa_and_internal_technical(self):
        for kwargs in ({"status": "needs_verification"}, {"availability": "unmounted"}, {"availability": "inactive"}, {"availability": "qa_only"}, {"document_type": "quality_assurance"}, {"document_type": "index"}):
            with self.subTest(kwargs=kwargs):
                self.assertFalse(can_read_document(identity(superuser=True), self.doc(**kwargs)))
        self.assertFalse(can_read_document(identity(), self.doc(document_type="backend_reference")))
        self.assertTrue(can_read_document(identity(superuser=True), self.doc(document_type="backend_reference")))

    def test_branch_admin_transfer_and_mixed_audit_guide_restrictions(self):
        transfer = self.doc(did="operator_modules_inventory_transfers")
        self.assertFalse(can_read_document(identity("BranchAdmin"), transfer))
        self.assertTrue(can_read_document(identity("InventoryManager"), transfer))
        audit = self.doc(did="operator_modules_audit_audit_activity")
        self.assertFalse(can_read_document(identity("BranchAdmin", monitor_activity=True), audit))
        self.assertTrue(can_read_document(identity("Admin", monitor_activity=True, revoke_sessions=True), audit))
