
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import mark_attendance_view,staffApi,staffDetailsView
from .views import shiftApi,ShiftDetailsView,payrollView,PayrollDetailsView,DeliveryBoyListView,recent_month_attendance
from .views import (
    SalaryAdvanceDetailsView,
    payroll_approve_view,
    payroll_dashboard_view,
    payroll_generate_view,
    payroll_payment_list_create,
    salary_advance_list_create,
    staff_payroll_history_view,
    login_rate_limit_config_view,
)
from .views import MyTokenObtainPairView,create_admin,debug_users
from .session_tokens import SessionTokenRefreshView
from .session_views import (
    activity_history,
    activity_overview,
    activity_sessions,
    activity_socket_ticket,
    heartbeat,
    logout_session,
    revoke_session,
    revoke_user_sessions,
)
router = DefaultRouter()
# router.register(r'staff', StaffViewSet, basename='staff')
# router.register(r'shift',ShifViewSet,basename="shift")
# router.register(r'payroll',PayrollViewSet,basename="Payroll")

urlpatterns = [
    path('staff/',staffApi),
    path('staff/<int:id>/',staffDetailsView.as_view()),
    path('shift/',shiftApi),
    path('shift/<int:id>/',ShiftDetailsView.as_view()),
    path('attendance/mark/<int:shift_id>/',mark_attendance_view),
    path('payrolls/',payrollView),
    path('payrolls/dashboard/',payroll_dashboard_view),
    path('payrolls/generate/',payroll_generate_view),
    path('payrolls/<int:pk>/approve/',payroll_approve_view),
    path('payroll-payments/',payroll_payment_list_create),
    path('salary-advances/',salary_advance_list_create),
    path('salary-advances/<int:id>/',SalaryAdvanceDetailsView.as_view()),
    path('staff/<int:pk>/payroll-history/',staff_payroll_history_view),
    path('deliveryBoys/',DeliveryBoyListView),
    path('payrolls/<int:id>/',PayrollDetailsView.as_view()),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', SessionTokenRefreshView.as_view(), name='token_refresh'),
    path('activity/heartbeat/', heartbeat, name='activity-heartbeat'),
    path('activity/overview/', activity_overview, name='activity-overview'),
    path('activity/sessions/', activity_sessions, name='activity-sessions'),
    path('activity/history/', activity_history, name='activity-history'),
    path('activity/socket-ticket/', activity_socket_ticket, name='activity-socket-ticket'),
    path('activity/sessions/<uuid:session_id>/revoke/', revoke_session, name='activity-revoke-session'),
    path('activity/users/<int:user_id>/revoke/', revoke_user_sessions, name='activity-revoke-user'),
    path('activity/logout/', logout_session, name='activity-logout'),
    path('security/login-rate-limit/', login_rate_limit_config_view, name='login-rate-limit-config'),
    path('attendance/recent/',recent_month_attendance),
    path('create-admin/', create_admin),
    path('debug-users/',debug_users),
    path('', include(router.urls),),
]
