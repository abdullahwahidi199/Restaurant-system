# users/views.py
from rest_framework import viewsets
from .models import Staff,Shift,Payroll
from .serializers import (
    BranchMiniSerializer,
    StaffSerializer,
    ShiftSerializer,
    PayrollSerializer,
    AttendanceSerializer,
    StaffListSerializer,
)
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.decorators import api_view,parser_classes
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from .models import Staff, Shift, Attendance
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .permissions import HasStaffRole
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from restaurants.permissions import IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin,IsCashier
from restaurants.branching import (
    ALL_BRANCH_ACCESS_ROLES,
    filter_queryset_for_request,
    get_active_branch,
    get_requested_branch,
)


BRANCH_ADMIN_RESTRICTED_USER_ROLES = ALL_BRANCH_ACCESS_ROLES | {"BranchAdmin"}

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
@permission_classes([IsAuthenticated,IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin])
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
            return Response(
                StaffListSerializer(staff_member).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=400)
    
class staffDetailsView(RetrieveUpdateDestroyAPIView):
    permission_classes=[IsAuthenticated,IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin]
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
        return super().update(request, *args, **kwargs)
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
        return super().destroy(request, *args, **kwargs)


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin])
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
    permission_classes = [IsAuthenticated, IsSameRestaurant, IsRestaurantAdmin]

    def get_queryset(self):
        restaurant = self.request.user.staff_profile.restaurant
        return filter_queryset_for_request(
            self.request,
            Shift.objects.filter(restaurant=restaurant),
            allow_all_for_admin=True,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin])
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

        Attendance.objects.update_or_create(
            staff=staff,
            shift=shift,
            date=attendance_date,
            branch=branch,
            defaults={
                'status': status_value,
                'restaurant': restaurant,
            }
        )

    return Response({'message': 'Attendance marked successfully!'})




@api_view(['GET','POST'])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin])
def payrollView(request):
    restaurant = request.user.staff_profile.restaurant
    if request.method=='GET':
        payroll = filter_queryset_for_request(
            request,
            Payroll.objects.select_related('staff').filter(
                restaurant=restaurant
            ),
            allow_all_for_admin=True,
        ).order_by('-generated_at')
        serializer=PayrollSerializer(payroll,many=True)
        return Response(serializer.data)

    if request.method=='POST':
        # print(request.data)
        branch = get_active_branch(request)
        serializer=PayrollSerializer(
            data=request.data,
            context={"request": request, "restaurant": restaurant, "branch": branch},
        )
        if serializer.is_valid():
            serializer.save(restaurant=restaurant, branch=branch)
            return Response({'message':'Payroll added successfully'})
        print(serializer.errors)
        return Response(serializer.errors,status=400)
    
class PayrollDetailsView(RetrieveUpdateDestroyAPIView):
    queryset=Payroll.objects.all()
    serializer_class=PayrollSerializer
    lookup_field='id'
    permission_classes=[IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin]
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


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsRestaurantAdmin|IsCashier])
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


@api_view(['GET'])
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


