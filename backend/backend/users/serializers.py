# users/serializers.py
from rest_framework import serializers
from .models import Staff,Shift,Attendance,Payroll
from orders.seriailizers import OrderMiniSerializer
from django.contrib.auth.models import User
from orders.models import Reservation
from orders.seriailizers import ReservationSerializer,ReservationMiniSerializer
from restaurants.branching import ensure_staff_branch_assignment, get_active_branch
from restaurants.models import Branch
from rest_framework.exceptions import PermissionDenied


GLOBAL_STAFF_ROLES = {"Admin", "SuperAdmin"}
BRANCH_ADMIN_ROLE = "BranchAdmin"
PRIVILEGED_STAFF_ROLES = GLOBAL_STAFF_ROLES | {BRANCH_ADMIN_ROLE}


class BranchMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ["id", "name", "code", "is_main_branch", "is_active"]


class StaffMiniSerializer(serializers.ModelSerializer):
    # shift=serializers.CharField(source='shift.shift_type',read_only=True)

    class Meta:
        model=Staff
        fields=['id','name','role','image','custom_role']
class PayrollSerializer(serializers.ModelSerializer):
    staff=StaffMiniSerializer(read_only=True)
    staff_id = serializers.PrimaryKeyRelatedField(
        source="staff",
        queryset=Staff.objects.none(),
        write_only=True,
    )

    class Meta:
        model=Payroll
        fields=[
            "id",
            "staff",
            "staff_id",
            "period_start",
            "period_end",
            "base_salary",
            "deductions",
            "net_salary",
            "bonuses",
            "generated_at",
            "restaurant",
            "branch",
        ]
        read_only_fields = ["restaurant", "branch", "net_salary", "generated_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        restaurant = self.context.get("restaurant")
        branch = self.context.get("branch")

        if not restaurant and request and hasattr(request.user, "staff_profile"):
            restaurant = request.user.staff_profile.restaurant
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        if restaurant:
            staff = Staff.objects.filter(restaurant=restaurant)
            if branch:
                staff = staff.filter(branches=branch)
            self.fields["staff_id"].queryset = staff.distinct()

    def validate(self, attrs):
        request = self.context.get("request")
        branch = self.context.get("branch")
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        staff = attrs.get("staff", getattr(self.instance, "staff", None))
        if branch and staff and not staff.can_access_branch(branch):
            raise serializers.ValidationError(
                {"staff_id": "This staff member cannot access this branch."}
            )

        period_start = attrs.get("period_start", getattr(self.instance, "period_start", None))
        period_end = attrs.get("period_end", getattr(self.instance, "period_end", None))
        if period_start and period_end and period_start > period_end:
            raise serializers.ValidationError(
                {"period_end": "Period end must be after period start."}
            )

        return attrs

# class ShiftMiniserializer(serializers.ModelSerializer):
#     class Meta:
#         model=Shift
#         fields='__all__'

class ShiftSerializer(serializers.ModelSerializer):
    staff=StaffMiniSerializer(many=True,read_only=True)
    class Meta:
        model=Shift
        fields="__all__"
        read_only_fields = ["restaurant", "branch"]
class AttendanceSerializer(serializers.ModelSerializer):
    staff = StaffMiniSerializer(read_only=True)
    shift = ShiftSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = "__all__"
        read_only_fields = ["restaurant", "branch"]


class StaffListSerializer(serializers.ModelSerializer):
    shift_name = serializers.SerializerMethodField()
    branches = BranchMiniSerializer(many=True, read_only=True)
    active_branch = BranchMiniSerializer(read_only=True)
    branch_ids = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = [
            'id',
            'name',
            'role',
            'phone',
            'email',
            'shift',
            'shift_name',
            'status',
            'image',
            'custom_role',
            'hire_date',
            'vehicle_number',
            'branches',
            'active_branch',
            'branch_ids',
        ]
    
    def get_shift_name(self, obj):
        return obj.shift.shift_type if obj.shift else None

    def get_branch_ids(self, obj):
        return list(obj.branches.values_list("id", flat=True))

class StaffSerializer(serializers.ModelSerializer):
    attendances=AttendanceSerializer(many=True,read_only=True)
    payrolls=PayrollSerializer(many=True,read_only=True)
    deliveries=OrderMiniSerializer(many=True,read_only=True)
    shift = serializers.PrimaryKeyRelatedField(
    queryset=Shift.objects.all(), 
    required=False
)   
    created_orders=OrderMiniSerializer(many=True,read_only=True)
    shift_name = serializers.SerializerMethodField()
    branches = BranchMiniSerializer(many=True, read_only=True)
    active_branch = BranchMiniSerializer(read_only=True)
    branch_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Branch.objects.none(),
        write_only=True,
        required=False,
    )

    def get_shift_name(self, obj):
        return obj.shift.shift_type if obj.shift else None
    # shift_info=ShiftSerializer(many=True,read_only=True)
    reservations = ReservationMiniSerializer(many=True,read_only=True)
    username=serializers.CharField(write_only=True,required=False,allow_blank=True)
    password=serializers.CharField(write_only=True,required=False,allow_blank=True)
    class Meta:
        model = Staff
        fields = ['id','name','shift','is_demo','phone','email','shift_name'
                  ,'hire_date','role','custom_role','deliveries','created_orders','reservations',
                  'image','status','attendances','payrolls','vehicle_number',
                  'username','password','branches','branch_ids','active_branch']

    def _request_staff(self):
        request = self.context.get("request")
        if request and hasattr(request.user, "staff_profile"):
            return request.user.staff_profile
        return None

    def _context_branch(self):
        branch = self.context.get("branch")
        request = self.context.get("request")
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)
        return branch

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        restaurant = self.context.get("restaurant")
        request = self.context.get("request")

        if not restaurant and self.instance is not None:
            restaurant = self.instance.restaurant

        if not restaurant and request and hasattr(request.user, "staff_profile"):
            restaurant = request.user.staff_profile.restaurant

        if restaurant:
            branch = self._context_branch()
            branch_queryset = Branch.objects.filter(
                restaurant=restaurant,
                is_active=True,
            )
            request_staff = self._request_staff()
            if request_staff and request_staff.is_branch_admin and branch:
                branch_queryset = branch_queryset.filter(id=branch.id)
            self.fields["branch_ids"].queryset = branch_queryset
            shifts = Shift.objects.filter(
                restaurant=restaurant,
            )
            if branch:
                shifts = shifts.filter(branch=branch)
            self.fields["shift"].queryset = shifts

    def to_internal_value(self, data):
        restaurant = self.context.get("restaurant")
        request = self.context.get("request")

        if not restaurant and self.instance is not None:
            restaurant = self.instance.restaurant
        if not restaurant and request and hasattr(request.user, "staff_profile"):
            restaurant = request.user.staff_profile.restaurant

        has_branch_ids = (
            "branch_ids" in data
            if hasattr(data, "__contains__")
            else False
        )
        if restaurant and has_branch_ids:
            raw_values = (
                data.getlist("branch_ids")
                if hasattr(data, "getlist")
                else data.get("branch_ids")
            )
            if raw_values in (None, ""):
                raw_values = []
            elif not isinstance(raw_values, (list, tuple)):
                raw_values = [raw_values]

            request_staff = self._request_staff()
            branch = self._context_branch()
            if request_staff and request_staff.is_branch_admin:
                allowed_branch_id = str(branch.id) if branch else None
                for value in raw_values:
                    if value in (None, ""):
                        continue
                    if not allowed_branch_id or str(value) != allowed_branch_id:
                        raise PermissionDenied(
                            "Branch Admins cannot assign users to another branch."
                        )

            requested_ids = []
            invalid = False
            for value in raw_values:
                if value in (None, ""):
                    continue
                try:
                    requested_ids.append(int(value))
                except (TypeError, ValueError):
                    invalid = True
                    break

            if requested_ids:
                valid_count = Branch.objects.filter(
                    id__in=requested_ids,
                    restaurant=restaurant,
                    is_active=True,
                ).count()
                invalid = invalid or valid_count != len(set(requested_ids))

            if invalid:
                data = data.copy() if hasattr(data, "copy") else dict(data)
                if hasattr(data, "setlist"):
                    data.setlist("branch_ids", [])
                else:
                    data["branch_ids"] = []

        return super().to_internal_value(data)

    def validate(self, attrs):
        branch_ids = attrs.get("branch_ids", None)
        role = attrs.get("role", getattr(self.instance, "role", None))
        shift = attrs.get("shift", getattr(self.instance, "shift", None))
        branch = self.context.get("branch")
        request = self.context.get("request")

        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        if (
            branch_ids is not None
            and not branch_ids
            and role not in GLOBAL_STAFF_ROLES
        ):
            if branch:
                attrs["branch_ids"] = [branch]
            else:
                raise serializers.ValidationError(
                    {"branch_ids": "At least one branch is required for this role."}
                )

        if role == BRANCH_ADMIN_ROLE:
            selected_branches = attrs.get("branch_ids", branch_ids)
            if selected_branches is None:
                if branch:
                    attrs["branch_ids"] = [branch]
                else:
                    raise serializers.ValidationError(
                        {"branch_ids": "Branch Admin must be assigned to one branch."}
                    )
            elif len(selected_branches) != 1:
                raise serializers.ValidationError(
                    {"branch_ids": "Branch Admin must be assigned to exactly one branch."}
                )

        request_staff = self._request_staff()
        if request_staff and request_staff.is_branch_admin:
            if not branch:
                raise PermissionDenied(
                    "No active branch is assigned to this Branch Admin."
                )

            target = self.instance
            if target and target.pk != request_staff.pk and target.role in PRIVILEGED_STAFF_ROLES:
                raise PermissionDenied(
                    "Branch Admins cannot manage administrator accounts."
                )

            if target and target.pk == request_staff.pk and role != target.role:
                raise PermissionDenied(
                    "Branch Admins cannot change their own role."
                )

            if not target and role in PRIVILEGED_STAFF_ROLES:
                raise PermissionDenied(
                    "Branch Admins cannot create administrator accounts."
                )

            if target and target.pk != request_staff.pk and role in PRIVILEGED_STAFF_ROLES:
                raise PermissionDenied(
                    "Branch Admins cannot promote users to administrator roles."
                )

            requested_branches = attrs.get("branch_ids")
            if requested_branches and any(b.id != branch.id for b in requested_branches):
                raise PermissionDenied(
                    "Branch Admins cannot move users to another branch."
                )
            attrs["branch_ids"] = [branch]

        if branch and shift and shift.branch_id != branch.id:
            raise serializers.ValidationError(
                {"shift": "This shift belongs to another branch."}
            )

        return attrs
    
    
    def create(self,validated_data):
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)
        branch_ids = validated_data.pop("branch_ids", None)
        branch = self.context.get("branch")
        request = self.context.get("request")

        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        staff=Staff.objects.create(**validated_data)
        if username and password:
            user=User.objects.create(username=username,email=staff.email,first_name=staff.name)
            user.set_password(password)
            user.save()
            staff.user=user
            staff.save()
        if (
            (branch_ids is None or not branch_ids)
            and branch
            and staff.role not in GLOBAL_STAFF_ROLES
        ):
            branch_ids = [branch]
        ensure_staff_branch_assignment(staff, branch_ids)
        return staff

    def update(self, instance, validated_data):
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)
        branch_ids = validated_data.pop("branch_ids", None)
        previous_role = instance.role
        branch = self.context.get("branch")
        request = self.context.get("request")

        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

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
        if (
            (branch_ids is None or not branch_ids)
            and branch
            and previous_role in GLOBAL_STAFF_ROLES
            and instance.role not in GLOBAL_STAFF_ROLES
        ):
            branch_ids = [branch]
        ensure_staff_branch_assignment(instance, branch_ids)
        return instance




