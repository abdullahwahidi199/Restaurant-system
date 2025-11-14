
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import mark_attendance_view,staffApi,staffDetailsView
from .views import shiftApi,ShiftDetailsView,payrollView,PayrollDetailsView,DeliveryBoyListView,recent_month_attendance
from .views import MyTokenObtainPairView,create_admin,debug_users
from rest_framework_simplejwt.views import TokenRefreshView
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
    path('deliveryBoys/',DeliveryBoyListView),
    path('payrolls/<int:id>/',PayrollDetailsView.as_view()),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('attendance/recent/',recent_month_attendance),
    path('create-admin/', create_admin),
    path('debug-users/',debug_users),
    path('', include(router.urls),),
]
