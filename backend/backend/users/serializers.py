# users/serializers.py
from rest_framework import serializers
from .models import Staff,Shift,Attendance,Payroll
from orders.seriailizers import OrderMiniSerializer
from django.contrib.auth.models import User



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

class ShiftSerializer(serializers.ModelSerializer):
    staff=StaffMiniSerializer(many=True,read_only=True)
    class Meta:
        model=Shift
        fields="__all__"
class AttendanceSerializer(serializers.ModelSerializer):
    staff = StaffMiniSerializer(read_only=True)
    shift = ShiftSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = "__all__"


class StaffSerializer(serializers.ModelSerializer):
    attendances=AttendanceSerializer(many=True,read_only=True)
    payrolls=PayrollSerializer(many=True,read_only=True)
    deliveries=OrderMiniSerializer(many=True,read_only=True)
    shift = serializers.PrimaryKeyRelatedField(
    queryset=Shift.objects.all(), 
    required=False
)
    shift_name=serializers.CharField(source="shift.shift_type",read_only=True)
    # shift_info=ShiftSerializer(many=True,read_only=True)
    
    username=serializers.CharField(write_only=True,required=False,allow_blank=True)
    password=serializers.CharField(write_only=True,required=False,allow_blank=True)
    class Meta:
        model = Staff
        fields = ['id','name','shift','is_demo','phone','email','shift_name'
                  ,'hire_date','role','custom_role','deliveries',
                  'image','status','attendances','payrolls','vehicle_number',
                  'username','password']
    def create(self,validated_data):
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)

        staff=Staff.objects.create(**validated_data)
        if username and password:
            user=User.objects.create(username=username,email=staff.email,first_name=staff.name)
            user.set_password(password)
            user.save()
            staff.user=user
            staff.save()
        return staff

    def update(self, instance, validated_data):
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if username or password:
            user = instance.user
            if not user and username:
                user = User.objects.create(username=username, email=instance.email, first_name=instance.name)
                instance.user = user
            if user and username:
                user.username = username
            if user and password:
                user.set_password(password)
            if user:
                user.save()
                instance.save()
        return instance




