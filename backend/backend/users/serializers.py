# users/serializers.py
from rest_framework import serializers
from .models import Staff,Shift,Attendance,Payroll

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model=Attendance
        fields="__all__"

class StaffMiniSerializer(serializers.ModelSerializer):
    # shift=serializers.CharField(source='shift.shift_type',read_only=True)

    class Meta:
        model=Staff
        fields=['id','name','role','image','custom_role']
class PayrollSerializer(serializers.ModelSerializer):
    staff=StaffMiniSerializer(read_only=True)
    class Meta:
        model=Payroll
        fields="__all__"

# class ShiftMiniserializer(serializers.ModelSerializer):
#     class Meta:
#         model=Shift
#         fields='__all__'


class StaffSerializer(serializers.ModelSerializer):
    attendances=AttendanceSerializer(many=True,read_only=True)
    payrolls=PayrollSerializer(many=True,read_only=True)

    shift=serializers.CharField(source='shift.shift_type',read_only=True)
    class Meta:
        model = Staff
        fields = ['id','name','shift','phone','email','hire_date','role','custom_role','image','status','attendances','payrolls']
        



class ShiftSerializer(serializers.ModelSerializer):
    staff=StaffMiniSerializer(many=True,read_only=True)
    class Meta:
        model=Shift
        fields="__all__"

