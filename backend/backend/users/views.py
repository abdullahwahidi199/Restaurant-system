# users/views.py
from rest_framework import viewsets
from .models import Attendance, LoginRateLimitConfig, Payroll, PayrollPayment, SalaryAdvance, Staff, Shift
from .serializers import (
    BranchMiniSerializer,
    LoginRateLimitConfigSerializer,
    PayrollPaymentSerializer,
    StaffSerializer,
    ShiftSerializer,
    PayrollSerializer,
    SalaryAdvanceSerializer,
    AttendanceSerializer,
    StaffListSerializer,
)
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.decorators import api_view,parser_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from datetime import date, timedelta
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .permissions import HasStaffRole, IsSuperAdmin
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.contrib.auth.models import User
from django.db.models import Count, F, Q, Sum
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from django.utils import timezone
from decimal import Decimal
from restaurants.permissions import IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin,IsCashier,IsFinanceManager,IsOperationsManager
from restaurants.branching import (
    ALL_BRANCH_ACCESS_ROLES,
    filter_queryset_for_request,
    get_active_branch,
    get_requested_branch,
)
from .payroll_services import (
    approve_payroll,
    create_payroll_payment,
    employee_payroll_history,
    generate_payroll,
)
from .login_rate_limit import (
    LoginRateLimitBlocked,
    LoginRateLimitUnavailable,
    check_login_allowed,
    record_failed_login,
    reset_login_attempts,
)
from audit.constants import AuditAction, AuditModule
from audit.services import (
    actor_name,
    calculate_field_changes,
    changed_new_values,
    changed_old_values,
    create_audit_log,
    record_instance_create,
    record_instance_delete,
    record_instance_update,
    snapshot_instance,
)


BRANCH_ADMIN_RESTRICTED_USER_ROLES = ALL_BRANCH_ACCESS_ROLES | {"BranchAdmin"}

STAFF_AUDIT_FIELDS = [
    "name",
    "email",
    "phone",
    "role",
    "custom_role",
    "status",
    "shift",
    "branches",
    "active_branch",
    "stations",
    "salary_type",
    "payroll_base_salary",
    "payment_day",
    "payroll_allowances",
    "payroll_deductions",
    "overtime_rate",
    "is_payroll_active",
]

PAYROLL_AUDIT_FIELDS = [
    "staff",
    "period_type",
    "period_start",
    "period_end",
    "base_salary",
    "allowances",
    "bonuses",
    "overtime_hours",
    "overtime_rate",
    "deductions",
    "advance_deductions",
    "gross_salary",
    "net_salary",
    "amount_paid",
    "status",
    "branch",
]

SALARY_ADVANCE_AUDIT_FIELDS = [
    "staff",
    "date",
    "amount",
    "reason",
    "notes",
    "applied_to",
    "branch",
]

ATTENDANCE_AUDIT_FIELDS = ["staff", "shift", "date", "status", "branch"]


def _security_restaurant_for_identifier(identifier):
    if not identifier:
        return None, None
    user = (
        User.objects.filter(username=identifier)
        .select_related("staff_profile__restaurant")
        .first()
    )
    staff = getattr(user, "staff_profile", None)
    return user, getattr(staff, "restaurant", None)


def _payroll_repr(payroll):
    return f"{payroll.staff.name} payroll {payroll.period_start} - {payroll.period_end}"


def rate_limit_blocked_response(exc):
    response = Response(
        {
            "detail": "Too many login attempts. Please try again later.",
            "retry_after": exc.retry_after,
        },
        status=status.HTTP_429_TOO_MANY_REQUESTS,
    )
    response["Retry-After"] = str(exc.retry_after)
    return response


def rate_limit_unavailable_response():
    return Response(
        {"detail": "Login is temporarily unavailable. Please try again shortly."},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


class PayrollPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 100

# class StaffViewSet(viewsets.ModelViewSet):
#     queryset = Staff.objects.all()
#     serializer_class = StaffSerializer

# class ShifViewSet(viewsets.ModelViewSet):
#     queryset=Shift.objects.all()
#     serializer_class=ShiftSerializer


def filter_staff_queryset_for_request(request, queryset, *, allow_all_for_admin=False):
    staff = request.user.staff_profile
    branch = get_requested_branch(
        request,
        allow_all=allow_all_for_admin,
        raise_exception=False,
    )

    if branch:
        if staff.is_branch_admin:
            return queryset.filter(
                branches=branch,
            ).filter(
                Q(id=staff.id) | ~Q(role__in=BRANCH_ADMIN_RESTRICTED_USER_ROLES)
            )

        return queryset.filter(
            Q(branches=branch) | Q(role__in=ALL_BRANCH_ACCESS_ROLES)
        )

    if allow_all_for_admin and staff.has_all_branch_access:
        return queryset

    return queryset.filter(branches__in=staff.get_available_branches())


@api_view(['GET','POST'])
@parser_classes([MultiPartParser,FormParser])
@permission_classes([IsAuthenticated,IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin|IsFinanceManager|IsOperationsManager])
def staffApi(request):
    staff=request.user.staff_profile
    restaurant=staff.restaurant
    if request.method=='GET':
        staff_queryset = filter_staff_queryset_for_request(
            request,
            Staff.objects.filter(restaurant=restaurant),
            allow_all_for_admin=True,
        ).select_related(
            'shift',
            'active_branch',
        ).prefetch_related(
            'deliveries',
            'branches',
        ).distinct()
        serializer=StaffListSerializer(staff_queryset,many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        # ensure requesting user is admin
        try:
            if request.user.staff_profile.role not in ['Admin', 'BranchAdmin']:
                return Response({'detail':'Only admin can add staff.'}, status=403)
            if request.user.staff_profile.is_demo:
                return Response({'detail':'Action restricted in demo mode.'},status=403)
        except:
            return Response({'detail':'Only staff can add staff.'}, status=403)

        serializer = StaffSerializer(
            data=request.data,
            context={
                "request": request,
                "restaurant": restaurant,
                "branch": get_active_branch(request, raise_exception=False),
            },
        )
        if serializer.is_valid():
            staff_member = serializer.save(restaurant=restaurant)
            record_instance_create(
                request=request,
                instance=staff_member,
                module=AuditModule.USERS,
                fields=STAFF_AUDIT_FIELDS,
                branch=get_active_branch(request, raise_exception=False),
                description=f"{actor_name(request)} created staff member {staff_member.name}.",
                severity="WARNING" if staff_member.role in BRANCH_ADMIN_RESTRICTED_USER_ROLES else "INFO",
            )
            return Response(
                StaffListSerializer(staff_member).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=400)
    
class staffDetailsView(RetrieveUpdateDestroyAPIView):
    permission_classes=[IsAuthenticated,IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin|IsFinanceManager]
    queryset=Staff.objects.all()
    serializer_class=StaffSerializer
    lookup_field='id'

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        return filter_staff_queryset_for_request(
            self.request,
            super().get_queryset().filter(restaurant=restaurant),
            allow_all_for_admin=True,
        ).distinct()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["restaurant"] = self.request.user.staff_profile.restaurant
        context["branch"] = get_active_branch(self.request, raise_exception=False)
        return context
    def update(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        instance = self.get_object()
        old_values = snapshot_instance(instance, fields=STAFF_AUDIT_FIELDS)
        response = super().update(request, *args, **kwargs)
        instance.refresh_from_db()
        module = AuditModule.ROLES if old_values.get("role") != instance.role else AuditModule.USERS
        record_instance_update(
            request=request,
            instance=instance,
            old_values=old_values,
            module=module,
            fields=STAFF_AUDIT_FIELDS,
            branch=get_active_branch(request, raise_exception=False),
            action=AuditAction.STATUS_CHANGE if module == AuditModule.ROLES else None,
            description=(
                f"{actor_name(request)} changed {instance.name}'s role from "
                f"{old_values.get('role')} to {instance.role}."
                if module == AuditModule.ROLES
                else f"{actor_name(request)} updated staff member {instance.name}."
            ),
            severity="CRITICAL" if module == AuditModule.ROLES else "INFO",
        )
        return response

    def destroy(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        target = self.get_object()
        if (
            request.user.staff_profile.is_branch_admin
            and target.role in BRANCH_ADMIN_RESTRICTED_USER_ROLES
        ):
            return Response(
                {'detail': 'Branch Admins cannot delete administrator accounts.'},
                status=403,
            )
        record_instance_delete(
            request=request,
            instance=target,
            module=AuditModule.USERS,
            fields=STAFF_AUDIT_FIELDS,
            branch=get_active_branch(request, raise_exception=False),
            description=f"{actor_name(request)} deleted staff member {target.name}.",
            severity="CRITICAL" if target.role in BRANCH_ADMIN_RESTRICTED_USER_ROLES else "WARNING",
        )
        return super().destroy(request, *args, **kwargs)


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin|IsOperationsManager])
def shiftApi(request):
    restaurant = request.user.staff_profile.restaurant
    if request.method=='GET':
        shift=filter_queryset_for_request(
            request,
            Shift.objects.filter(restaurant=restaurant),
            allow_all_for_admin=True,
        ).prefetch_related('staff').all()
        serializer=ShiftSerializer(shift,many=True)
        return Response(serializer.data)

    if request.method=='POST':
        
        if request.user.staff_profile.is_demo:
            return Response({'detail':'Action restricted in demo mode.'},status=403)
        

        branch = get_active_branch(request)

        serializer=ShiftSerializer(
            data=request.data,
            context={"request": request, "restaurant": restaurant, "branch": branch},
        )
        if serializer.is_valid():
            serializer.save(restaurant=restaurant, branch=branch)
            return Response({'message':'Shift added successfully'})
        print(serializer.errors)
        return Response(serializer.errors,status=400)
class ShiftDetailsView(RetrieveUpdateDestroyAPIView):
    serializer_class = ShiftSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticated, IsSameRestaurant, IsRestaurantAdmin|IsOperationsManager]

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        return filter_queryset_for_request(
            self.request,
            Shift.objects.filter(restaurant=restaurant),
            allow_all_for_admin=True,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin | IsOperationsManager])
def mark_attendance_view(request, shift_id=None):
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request)
    if request.user.staff_profile.is_demo:
        return Response(
            {'detail': 'Action restricted in demo mode.'},
            status=status.HTTP_403_FORBIDDEN
        )
    attendance_data = request.data.get('attendance', [])
    attendance_date = request.data.get('date', str(date.today()))

    if not attendance_data:
        return Response({'error': 'No attendance data provided.'}, status=400)

    for record in attendance_data:
        staff_id = record.get('staff_id')
        status_value = record.get('status', 'Present')

        try:
            staff = Staff.objects.get(
                id=staff_id,
                restaurant=restaurant,
                branches=branch,
            )
        except Staff.DoesNotExist:
            continue

        shift = None
        if shift_id:
            try:
                shift = Shift.objects.get(
                    id=shift_id,
                    restaurant=restaurant,
                    branch=branch,
                )
            except Shift.DoesNotExist:
                shift = None
        else:
            # fallback if shift_id not in URL
            shift_id_record = record.get('shift_id')
            if shift_id_record:
                try:
                    shift = Shift.objects.get(
                        id=shift_id_record,
                        restaurant=restaurant,
                        branch=branch,
                    )
                except Shift.DoesNotExist:
                    shift = None

        existing = Attendance.objects.filter(
            staff=staff,
            shift=shift,
            date=attendance_date,
            branch=branch,
        ).first()
        old_values = snapshot_instance(existing, fields=ATTENDANCE_AUDIT_FIELDS)
        attendance, created = Attendance.objects.update_or_create(
            staff=staff,
            shift=shift,
            date=attendance_date,
            branch=branch,
            defaults={
                'status': status_value,
                'restaurant': restaurant,
            }
        )
        if created:
            record_instance_create(
                request=request,
                instance=attendance,
                module=AuditModule.ATTENDANCE,
                fields=ATTENDANCE_AUDIT_FIELDS,
                description=(
                    f"{actor_name(request)} recorded attendance for "
                    f"{staff.name} on {attendance_date}."
                ),
                severity="WARNING",
            )
        else:
            record_instance_update(
                request=request,
                instance=attendance,
                old_values=old_values,
                module=AuditModule.ATTENDANCE,
                fields=ATTENDANCE_AUDIT_FIELDS,
                description=(
                    f"{actor_name(request)} corrected attendance for "
                    f"{staff.name} on {attendance_date}."
                ),
                severity="WARNING",
            )

    return Response({'message': 'Attendance marked successfully!'})




@api_view(['GET','POST'])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin |IsFinanceManager])
def payrollView(request):
    restaurant = request.user.staff_profile.restaurant
    if request.method=='GET':
        payroll = filter_queryset_for_request(
            request,
            Payroll.objects.select_related('staff', 'branch').prefetch_related(
                'payments',
                'applied_advances',
            ).filter(
                restaurant=restaurant
            ),
            allow_all_for_admin=True,
        ).order_by('-period_start', '-generated_at')

        status_filter = request.query_params.get("status")
        if status_filter:
            payroll = payroll.filter(status=status_filter)

        staff_id = request.query_params.get("staff")
        if staff_id:
            payroll = payroll.filter(staff_id=staff_id)

        period_type = request.query_params.get("period_type")
        if period_type:
            payroll = payroll.filter(period_type=period_type)

        date_from = request.query_params.get("from")
        date_to = request.query_params.get("to")
        if date_from:
            payroll = payroll.filter(period_end__gte=date_from)
        if date_to:
            payroll = payroll.filter(period_start__lte=date_to)

        search = request.query_params.get("search")
        if search:
            payroll = payroll.filter(
                Q(staff__name__icontains=search)
                | Q(staff__role__icontains=search)
                | Q(notes__icontains=search)
            )

        paginator = PayrollPagination()
        page = paginator.paginate_queryset(payroll, request)
        serializer=PayrollSerializer(page,many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)

    if request.method=='POST':
        # print(request.data)
        branch = get_active_branch(request)
        serializer=PayrollSerializer(
            data=request.data,
            context={"request": request, "restaurant": restaurant, "branch": branch},
        )
        if serializer.is_valid():
            payroll = serializer.save(restaurant=restaurant, branch=branch)
            record_instance_create(
                request=request,
                instance=payroll,
                module=AuditModule.PAYROLL,
                fields=PAYROLL_AUDIT_FIELDS,
                object_repr=_payroll_repr(payroll),
                description=f"{actor_name(request)} created payroll for {payroll.staff.name}.",
                severity="WARNING",
            )
            return Response({'message':'Payroll added successfully'})
        print(serializer.errors)
        return Response(serializer.errors,status=400)
    
class PayrollDetailsView(RetrieveUpdateDestroyAPIView):
    queryset=Payroll.objects.all()
    serializer_class=PayrollSerializer
    lookup_field='id'
    permission_classes=[IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin |IsFinanceManager]
    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        return filter_queryset_for_request(
            self.request,
            super().get_queryset().filter(restaurant=restaurant),
            allow_all_for_admin=True,
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        restaurant = self.request.user.staff_profile.restaurant
        context["restaurant"] = restaurant
        context["branch"] = get_active_branch(self.request, raise_exception=False)
        return context

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_values = snapshot_instance(instance, fields=PAYROLL_AUDIT_FIELDS)
        response = super().update(request, *args, **kwargs)
        instance.refresh_from_db()
        record_instance_update(
            request=request,
            instance=instance,
            old_values=old_values,
            module=AuditModule.PAYROLL,
            fields=PAYROLL_AUDIT_FIELDS,
            object_repr=_payroll_repr(instance),
            description=f"{actor_name(request)} updated payroll for {instance.staff.name}.",
            severity="WARNING",
        )
        return response

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        record_instance_delete(
            request=request,
            instance=instance,
            module=AuditModule.PAYROLL,
            fields=PAYROLL_AUDIT_FIELDS,
            object_repr=_payroll_repr(instance),
            description=f"{actor_name(request)} deleted payroll for {instance.staff.name}.",
            severity="CRITICAL",
        )
        return super().destroy(request, *args, **kwargs)


def payroll_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    return filter_queryset_for_request(
        request,
        Payroll.objects.filter(restaurant=restaurant),
        allow_all_for_admin=True,
    )


def salary_advance_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    return filter_queryset_for_request(
        request,
        SalaryAdvance.objects.filter(restaurant=restaurant),
        allow_all_for_admin=True,
    )


def payroll_payment_queryset_for_request(request):
    restaurant = request.user.staff_profile.restaurant
    return filter_queryset_for_request(
        request,
        PayrollPayment.objects.filter(restaurant=restaurant),
        allow_all_for_admin=True,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin | IsFinanceManager])
def payroll_dashboard_view(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_requested_branch(request, allow_all=True, raise_exception=False)
    today = timezone.localdate()
    month_start = today.replace(day=1)
    year_start = today.replace(month=1, day=1)

    payrolls = payroll_queryset_for_request(request).select_related("staff", "branch")
    payments = payroll_payment_queryset_for_request(request).select_related("staff", "payroll")
    advances = salary_advance_queryset_for_request(request)
    staff_qs = filter_staff_queryset_for_request(
        request,
        Staff.objects.filter(restaurant=restaurant, is_payroll_active=True),
        allow_all_for_admin=True,
    ).distinct()

    approved = payrolls.filter(status__in=[Payroll.STATUS_APPROVED, Payroll.STATUS_PAID])
    cost_this_month = sum(
        (payroll.expense_amount for payroll in approved.filter(period_end__gte=month_start)),
        Decimal("0.00"),
    )
    cost_this_year = sum(
        (payroll.expense_amount for payroll in approved.filter(period_end__gte=year_start)),
        Decimal("0.00"),
    )
    outstanding = sum(
        (payroll.remaining_balance for payroll in approved.exclude(status=Payroll.STATUS_PAID)),
        Decimal("0.00"),
    )

    upcoming = []
    for staff in staff_qs.order_by("payment_day", "name")[:12]:
        upcoming.append(
            {
                "id": staff.id,
                "name": staff.name,
                "role": staff.role,
                "salary_type": staff.salary_type,
                "base_salary": staff.payroll_base_salary,
                "payment_day": staff.payment_day,
                "branch": staff.active_branch.name if staff.active_branch_id else "",
            }
        )

    awaiting = [
        {
            "id": payroll.id,
            "staff_id": payroll.staff_id,
            "staff_name": payroll.staff.name,
            "period_start": payroll.period_start,
            "period_end": payroll.period_end,
            "net_salary": payroll.net_salary,
            "amount_paid": payroll.amount_paid,
            "remaining_balance": payroll.remaining_balance,
            "status": payroll.status,
        }
        for payroll in approved.exclude(status=Payroll.STATUS_PAID)
        .select_related("staff")
        .order_by("period_end")[:12]
    ]

    return Response(
        {
            "branch": branch.name if branch else "All Branches",
            "active_payroll_staff": staff_qs.count(),
            "draft_payrolls": payrolls.filter(status=Payroll.STATUS_DRAFT).count(),
            "approved_payrolls": payrolls.filter(status=Payroll.STATUS_APPROVED).count(),
            "paid_payrolls": payrolls.filter(status=Payroll.STATUS_PAID).count(),
            "payroll_cost_this_month": cost_this_month,
            "payroll_cost_this_year": cost_this_year,
            "outstanding_salaries": outstanding,
            "salary_advances_this_month": advances.filter(date__gte=month_start).aggregate(total=Sum("amount"))["total"] or Decimal("0.00"),
            "recent_payments": PayrollPaymentSerializer(
                payments.order_by("-date", "-created_at")[:8],
                many=True,
                context={"request": request},
            ).data,
            "upcoming_payroll": upcoming,
            "employees_awaiting_payment": awaiting,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin | IsFinanceManager])
def payroll_generate_view(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request)
    try:
        payrolls = generate_payroll(
            request.data,
            restaurant=restaurant,
            branch=branch,
            created_by=getattr(request.user, "staff_profile", None),
        )
    except Exception as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    create_audit_log(
        request=request,
        restaurant=restaurant,
        branch=branch,
        action=AuditAction.CREATE,
        module=AuditModule.PAYROLL,
        object_type="PayrollBatch",
        object_id=",".join(str(payroll.id) for payroll in payrolls),
        object_repr=f"{len(payrolls)} payroll records",
        description=f"{actor_name(request)} generated {len(payrolls)} payroll records.",
        new_values={"count": len(payrolls)},
        metadata={
            "severity": "WARNING",
            "payroll_ids": [payroll.id for payroll in payrolls],
        },
    )

    return Response(
        PayrollSerializer(
            payrolls,
            many=True,
            context={"request": request, "restaurant": restaurant, "branch": branch},
        ).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin ])
def payroll_approve_view(request, pk):
    try:
        payroll = payroll_queryset_for_request(request).get(pk=pk)
    except Payroll.DoesNotExist:
        return Response({"detail": "Payroll record not found."}, status=404)

    old_values = snapshot_instance(payroll, fields=PAYROLL_AUDIT_FIELDS)
    payroll = approve_payroll(payroll)
    record_instance_update(
        request=request,
        instance=payroll,
        old_values=old_values,
        module=AuditModule.PAYROLL,
        fields=PAYROLL_AUDIT_FIELDS,
        action=AuditAction.APPROVE,
        object_repr=_payroll_repr(payroll),
        description=f"{actor_name(request)} approved payroll for {payroll.staff.name}.",
        severity="CRITICAL",
    )
    return Response(PayrollSerializer(payroll, context={"request": request}).data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin | IsFinanceManager])
def payroll_payment_list_create(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request, raise_exception=False)

    if request.method == "POST":
        try:
            payment = create_payroll_payment(
                request.data,
                restaurant=restaurant,
                branch=get_active_branch(request),
                created_by=getattr(request.user, "staff_profile", None),
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        create_audit_log(
            request=request,
            restaurant=payment.restaurant,
            branch=payment.branch,
            action=AuditAction.PAYMENT,
            module=AuditModule.PAYROLL,
            object_type="PayrollPayment",
            object_id=payment.id,
            object_repr=str(payment),
            description=(
                f"{actor_name(request)} recorded {payment.amount} AFN payroll "
                f"payment for {payment.staff.name}."
            ),
            new_values=snapshot_instance(
                payment,
                fields=[
                    "payroll",
                    "staff",
                    "date",
                    "amount",
                    "payment_method",
                    "reference_number",
                    "branch",
                ],
            ),
            metadata={"severity": "WARNING", "payroll_id": payment.payroll_id},
        )
        return Response(
            PayrollPaymentSerializer(payment, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    payments = payroll_payment_queryset_for_request(request).select_related(
        "staff",
        "payroll",
        "branch",
    ).order_by("-date", "-created_at")
    search = request.query_params.get("search")
    if search:
        payments = payments.filter(
            Q(staff__name__icontains=search)
            | Q(reference_number__icontains=search)
            | Q(notes__icontains=search)
        )
    staff_id = request.query_params.get("staff")
    if staff_id:
        payments = payments.filter(staff_id=staff_id)
    payroll_id = request.query_params.get("payroll")
    if payroll_id:
        payments = payments.filter(payroll_id=payroll_id)

    paginator = PayrollPagination()
    page = paginator.paginate_queryset(payments, request)
    serializer = PayrollPaymentSerializer(
        page,
        many=True,
        context={"request": request, "branch": branch},
    )
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin | IsFinanceManager])
def salary_advance_list_create(request):
    restaurant = request.user.staff_profile.restaurant
    branch = get_active_branch(request, raise_exception=False)

    if request.method == "POST":
        serializer = SalaryAdvanceSerializer(
            data=request.data,
            context={"request": request, "restaurant": restaurant, "branch": branch},
        )
        if serializer.is_valid():
            advance = serializer.save(
                restaurant=restaurant,
                branch=get_active_branch(request),
                created_by=getattr(request.user, "staff_profile", None),
            )
            record_instance_create(
                request=request,
                instance=advance,
                module=AuditModule.PAYROLL,
                fields=SALARY_ADVANCE_AUDIT_FIELDS,
                description=f"{actor_name(request)} created salary advance for {advance.staff.name}.",
                severity="WARNING",
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    advances = salary_advance_queryset_for_request(request).select_related(
        "staff",
        "applied_to",
        "branch",
    ).order_by("-date", "-created_at")
    search = request.query_params.get("search")
    if search:
        advances = advances.filter(
            Q(staff__name__icontains=search)
            | Q(reason__icontains=search)
            | Q(notes__icontains=search)
        )
    staff_id = request.query_params.get("staff")
    if staff_id:
        advances = advances.filter(staff_id=staff_id)
    applied = request.query_params.get("applied")
    if applied in ["true", "1"]:
        advances = advances.filter(applied_to__isnull=False)
    elif applied in ["false", "0"]:
        advances = advances.filter(applied_to__isnull=True)

    paginator = PayrollPagination()
    page = paginator.paginate_queryset(advances, request)
    serializer = SalaryAdvanceSerializer(
        page,
        many=True,
        context={"request": request, "branch": branch},
    )
    return paginator.get_paginated_response(serializer.data)


class SalaryAdvanceDetailsView(RetrieveUpdateDestroyAPIView):
    serializer_class = SalaryAdvanceSerializer
    lookup_field = "id"
    permission_classes=[IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin | IsFinanceManager]

    def get_queryset(self):
        return salary_advance_queryset_for_request(self.request)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["restaurant"] = self.request.user.staff_profile.restaurant
        context["branch"] = get_active_branch(self.request, raise_exception=False)
        return context

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_values = snapshot_instance(instance, fields=SALARY_ADVANCE_AUDIT_FIELDS)
        response = super().update(request, *args, **kwargs)
        instance.refresh_from_db()
        record_instance_update(
            request=request,
            instance=instance,
            old_values=old_values,
            module=AuditModule.PAYROLL,
            fields=SALARY_ADVANCE_AUDIT_FIELDS,
            description=f"{actor_name(request)} updated salary advance for {instance.staff.name}.",
            severity="WARNING",
        )
        return response

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        record_instance_delete(
            request=request,
            instance=instance,
            module=AuditModule.PAYROLL,
            fields=SALARY_ADVANCE_AUDIT_FIELDS,
            description=f"{actor_name(request)} deleted salary advance for {instance.staff.name}.",
            severity="WARNING",
        )
        return super().destroy(request, *args, **kwargs)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin | IsFinanceManager])
def staff_payroll_history_view(request, pk):
    try:
        staff_member = filter_staff_queryset_for_request(
            request,
            Staff.objects.filter(restaurant=request.user.staff_profile.restaurant),
            allow_all_for_admin=True,
        ).get(pk=pk)
    except Staff.DoesNotExist:
        return Response({"detail": "Staff member not found."}, status=404)

    history = employee_payroll_history(staff_member)
    return Response(
        {
            "staff": StaffSerializer(
                staff_member,
                context={"request": request},
            ).data,
            "payrolls": PayrollSerializer(
                history["payrolls"],
                many=True,
                context={"request": request},
            ).data,
            "payments": PayrollPaymentSerializer(
                history["payments"],
                many=True,
                context={"request": request},
            ).data,
            "advances": SalaryAdvanceSerializer(
                history["advances"],
                many=True,
                context={"request": request},
            ).data,
            "total_earnings": history["total_earnings"],
            "total_deductions": history["total_deductions"],
            "total_paid": history["total_paid"],
            "total_advances": history["total_advances"],
        }
    )


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin|IsCashier ])
def DeliveryBoyListView(request):
    if request.method=='GET':
        restaurant = request.user.staff_profile.restaurant
        active_branch = get_active_branch(request, raise_exception=False)

        dileveryBoys = Staff.objects.filter(
            role='DeliveryBoy',
            restaurant=restaurant
        )
        if active_branch:
            dileveryBoys = dileveryBoys.filter(branches=active_branch)
        serializer=StaffSerializer(dileveryBoys,many=True)
        return Response(serializer.data)
    
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        try:
            staff = user.staff_profile
            token['role'] = staff.role
            token['staff_id'] = staff.id
            token['restaurant_id'] = staff.restaurant.id if staff.restaurant else None
            active_branch = staff.get_or_set_active_branch()
            token['active_branch_id'] = active_branch.id if active_branch else None
        except Staff.DoesNotExist:
            token['role'] = 'Customer'
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        try:
            staff = user.staff_profile
            data['role'] = staff.role
            data['staff_id'] = staff.id
            data['name'] = staff.name
            data['is_demo'] = staff.is_demo
            data['restaurant_id'] = staff.restaurant.id if staff.restaurant else None
            active_branch = staff.get_or_set_active_branch()
            branches = staff.get_available_branches()
            data['active_branch'] = (
                BranchMiniSerializer(active_branch).data if active_branch else None
            )
            data['branches'] = BranchMiniSerializer(branches, many=True).data
            data['requires_branch_selection'] = branches.count() > 1
            data['stations'] = [s.id for s in staff.stations.all()]
            data['station_names'] = [s.name for s in staff.stations.all()]
        except Staff.DoesNotExist:
            data['role'] = 'Customer'
            data['is_demo'] = False
            data['restaurant_id'] = None
            data['active_branch'] = None
            data['branches'] = []
            data['requires_branch_selection'] = False
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        identifier = request.data.get("username", "")
        target_user, target_restaurant = _security_restaurant_for_identifier(identifier)
        try:
            config = check_login_allowed(
                request,
                namespace="staff",
                identifier=identifier,
            )
        except LoginRateLimitBlocked as exc:
            return rate_limit_blocked_response(exc)
        except LoginRateLimitUnavailable:
            return rate_limit_unavailable_response()

        try:
            response = super().post(request, *args, **kwargs)
        except Exception:
            if target_restaurant:
                create_audit_log(
                    request=request,
                    user=target_user,
                    restaurant=target_restaurant,
                    action=AuditAction.LOGIN_FAILED,
                    module=AuditModule.SECURITY,
                    object_type="Login",
                    object_id=str(identifier or "unknown"),
                    object_repr=str(identifier or "unknown"),
                    description=f"Failed login attempt for {identifier or 'unknown user'}.",
                    metadata={"severity": "WARNING", "username": identifier},
                )
            try:
                record_failed_login(
                    request,
                    namespace="staff",
                    identifier=identifier,
                    config=config,
                )
            except LoginRateLimitUnavailable:
                return rate_limit_unavailable_response()
            raise

        try:
            reset_login_attempts(request, namespace="staff", identifier=identifier)
        except LoginRateLimitUnavailable:
            return rate_limit_unavailable_response()
        login_user = target_user
        staff = getattr(login_user, "staff_profile", None)
        if staff and staff.restaurant:
            create_audit_log(
                request=request,
                user=login_user,
                restaurant=staff.restaurant,
                branch=staff.active_branch,
                action=AuditAction.LOGIN_SUCCESS,
                module=AuditModule.SECURITY,
                object_type="Login",
                object_id=str(login_user.id),
                object_repr=staff.name,
                description=f"{staff.name} logged in successfully.",
                metadata={
                    "severity": "INFO",
                    "role": staff.role,
                    "active_branch": staff.active_branch.name if staff.active_branch_id else None,
                },
            )
        return response


@api_view(["GET", "PATCH", "PUT"])
@permission_classes([IsSuperAdmin])
def login_rate_limit_config_view(request):
    config = LoginRateLimitConfig.load()

    if request.method == "GET":
        return Response(LoginRateLimitConfigSerializer(config).data)

    old_values = snapshot_instance(config)
    serializer = LoginRateLimitConfigSerializer(
        config,
        data=request.data,
        partial=request.method == "PATCH",
    )
    if serializer.is_valid():
        config = serializer.save()
        old_actor, restaurant = _security_restaurant_for_identifier(request.user.get_username())
        if restaurant:
            new_values = snapshot_instance(config)
            changes = calculate_field_changes(old_values, new_values)
            if changes:
                create_audit_log(
                    request=request,
                    user=old_actor or request.user,
                    restaurant=restaurant,
                    action=AuditAction.CONFIG_CHANGE,
                    module=AuditModule.SECURITY,
                    object_type="LoginRateLimitConfig",
                    object_id=config.pk,
                    object_repr=str(config),
                    description=f"{actor_name(request)} changed login rate-limit settings.",
                    old_values=changed_old_values(changes),
                    new_values=changed_new_values(changes),
                    metadata={"changes": changes, "severity": "CRITICAL"},
                )
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin | IsOperationsManager])
def recent_month_attendance(request):
    today=date.today()
    first_date_of_month=today.replace(day=1)

    attendances=filter_queryset_for_request(
        request,
        Attendance.objects.filter(
            date__gte=first_date_of_month,
            restaurant=request.user.staff_profile.restaurant,
        ),
        allow_all_for_admin=True,
    ).select_related('staff','shift')
    serializer = AttendanceSerializer(attendances, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def create_admin(request):
    try:
        
        if User.objects.filter(username="thirdAdmin").exists():
            return Response({"message": "Admin user already exists"}, status=400)

        user = User.objects.create_superuser(
            username="thirdAdmin",
            email="thirdadmin@example.com",
            password="admin123"
        )

       
        Staff.objects.create(
            user=user,
            name="thirdAdmin",
            email="thirdadmin@example.com",
            role="Admin",
            phone="0000590000",
            hire_date=date.today(),
            status="Active"
        )

        return Response({"message": "Admin created successfully!"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def debug_users(request):
    users = User.objects.values("id", "username", "is_active", "is_superuser", "is_staff",'password')
    return Response(list(users))
