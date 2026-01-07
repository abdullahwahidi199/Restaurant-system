# users/views.py
from rest_framework import viewsets
from .models import Staff,Shift,Payroll
from .serializers import StaffSerializer,ShiftSerializer,PayrollSerializer,AttendanceSerializer
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.decorators import api_view,parser_classes
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from .models import Staff, Shift, Attendance
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .permissions import isStaffRole
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework.permissions import AllowAny


# class StaffViewSet(viewsets.ModelViewSet):
#     queryset = Staff.objects.all()
#     serializer_class = StaffSerializer

# class ShifViewSet(viewsets.ModelViewSet):
#     queryset=Shift.objects.all()
#     serializer_class=ShiftSerializer


@api_view(['GET','POST'])
@parser_classes([MultiPartParser,FormParser])
@permission_classes([IsAuthenticated, isStaffRole])
def staffApi(request):
    if request.method=='GET':
        staff=Staff.objects.select_related('shift').prefetch_related('deliveries').all()
        serializer=StaffSerializer(staff,many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        # ensure requesting user is admin
        try:
            if  request.user.staff_profile.role != 'Admin':
                return Response({'detail':'Only admin can add staff.'}, status=403)
            if request.user.staff_profile.is_demo:
                return Response({'detail':'Action restricted in demo mode.'},status=403)
        except:
            return Response({'detail':'Only staff can add staff.'}, status=403)

        serializer = StaffSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'Staff added successfully'})
        return Response(serializer.errors, status=400)
    
class staffDetailsView(RetrieveUpdateDestroyAPIView):
    queryset=Staff.objects.all()
    serializer_class=StaffSerializer
    lookup_field='id'

    def update(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().update(request, *args, **kwargs)
    def destroy(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().destroy(request, *args, **kwargs)


@api_view(['GET','POST'])

def shiftApi(request):
    
    if request.method=='GET':
        shift=Shift.objects.prefetch_related('staff').all()
        serializer=ShiftSerializer(shift,many=True)
        return Response(serializer.data)

    if request.method=='POST':
        
        if request.user.staff_profile.is_demo:
            return Response({'detail':'Action restricted in demo mode.'},status=403)
        

        serializer=ShiftSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'Shift added successfully'})
        print(serializer.errors)
        return Response(serializer.errors,status=400)
    
class ShiftDetailsView(RetrieveUpdateDestroyAPIView):
    queryset=Shift.objects.all()
    serializer_class=ShiftSerializer
    lookup_field='id'



@api_view(['POST'])
def mark_attendance_view(request, shift_id=None):
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
            staff = Staff.objects.get(id=staff_id)
        except Staff.DoesNotExist:
            continue

        shift = None
        if shift_id:
            try:
                shift = Shift.objects.get(id=shift_id)
            except Shift.DoesNotExist:
                shift = None
        else:
            # fallback if shift_id not in URL
            shift_id_record = record.get('shift_id')
            if shift_id_record:
                try:
                    shift = Shift.objects.get(id=shift_id_record)
                except Shift.DoesNotExist:
                    shift = None

        Attendance.objects.update_or_create(
            staff=staff,
            shift=shift,
            date=attendance_date,
            defaults={'status': status_value}
        )

    return Response({'message': 'Attendance marked successfully!'})




@api_view(['GET','POST'])
def payrollView(request):
    if request.method=='GET':
        payroll=Payroll.objects.select_related('staff').all().order_by('-generated_at')
        serializer=PayrollSerializer(payroll,many=True)
        return Response(serializer.data)

    if request.method=='POST':
        # print(request.data)
        serializer=PayrollSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'Payroll added successfully'})
        print(serializer.errors)
        return Response(serializer.errors,status=400)
    
class PayrollDetailsView(RetrieveUpdateDestroyAPIView):
    queryset=Payroll.objects.all()
    serializer_class=PayrollSerializer
    lookup_field='id'


@api_view(['GET','POST'])
def DeliveryBoyListView(request):
    if request.method=='GET':
        dileveryBoys=Staff.objects.filter(role='DeliveryBoy')
        serializer=StaffSerializer(dileveryBoys,many=True)
        return Response(serializer.data)
    

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        return super().get_token(user)

        try:
            staff=user.staff_profile
            token['role']=staff.role
            token['staff_id']=staff.id
        except Staff.DoesNotExist:
            token['role']='Customer'
        return token
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        try:
            staff = user.staff_profile
            data['role'] = staff.role
            data['staff_id'] = staff.id
            data['name'] = staff.name
            data['is_demo']=staff.is_demo
        except Staff.DoesNotExist:
            data['role'] = 'Customer'
            data['is_demo'] = False
        return data
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['GET'])
def recent_month_attendance(request):
    today=date.today()
    first_date_of_month=today.replace(day=1)

    attendances=Attendance.objects.filter(date__gte=first_date_of_month).select_related('staff','shift')
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
