# users/views.py
from rest_framework import viewsets
from .models import Staff,Shift,Payroll
from .serializers import StaffSerializer,ShiftSerializer,PayrollSerializer
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from .models import Staff, Shift, Attendance

# class StaffViewSet(viewsets.ModelViewSet):
#     queryset = Staff.objects.all()
#     serializer_class = StaffSerializer

# class ShifViewSet(viewsets.ModelViewSet):
#     queryset=Shift.objects.all()
#     serializer_class=ShiftSerializer

@api_view(['GET','POST'])
def staffApi(request):
    if request.method=='GET':
        staff=Staff.objects.select_related('shift').all()
        serializer=StaffSerializer(staff,many=True)
        return Response(serializer.data)

    if request.method=='POST':
        print(request.data)
        serializer=StaffSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'Staff added successfully'})
        print(serializer.errors)
        return Response(serializer.errors,status=400)
    
class staffDetailsView(RetrieveUpdateDestroyAPIView):
    queryset=Staff.objects.all()
    serializer_class=StaffSerializer
    lookup_field='id'


@api_view(['GET','POST'])
def shiftApi(request):
    if request.method=='GET':
        shift=Shift.objects.prefetch_related('staff').all()
        serializer=ShiftSerializer(shift,many=True)
        return Response(serializer.data)

    if request.method=='POST':
        print(request.data)
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


