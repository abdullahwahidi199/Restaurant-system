from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum,F,FloatField,Count
from django.db.models.functions import TruncDate
from django.db import models
from users.models import Staff,Attendance
from menu.models import MenuItem,Review
from orders.models import Order,OrderItem
from menu.serializers import MenuItemSerializer

class DashboardSummaryAPIView(APIView):
    
    def get(self,request):
        today= timezone.now().date()
        week_start=today-timedelta(days=7)
        month_start=today.replace(day=1)
        last_30_days=today-timedelta(days=30)

        total_staff=Staff.objects.count()
        menu_items=MenuItem.objects.count()
        attedance_today=Attendance.objects.filter(date=today,status="Present").count()
        total_attendance=Staff.objects.count()
        attendance_rate=round((attedance_today/total_attendance)*100,2) if total_attendance else 0
        

        avg_rating = Review.objects.aggregate(avg=models.Avg("rating"))["avg"] or 0

        total_orders_today=Order.objects.filter(created_at=today).count()
        total_orders_week=Order.objects.filter(created_at__gte=week_start).count()
        total_orders_month=Order.objects.filter(created_at__gte=month_start).count()

        orders_today = Order.objects.filter(created_at__date=today)
        revenue_today = sum(order.get_total() for order in orders_today)
        orders_week = Order.objects.filter(created_at__date__gte=week_start)
        revenue_week = sum(order.get_total() for order in orders_week)
        orders_month = Order.objects.filter(created_at__date__gte=month_start)
        revenue_month = sum(order.get_total() for order in orders_month)

        deliveries_today_count = Order.objects.filter(created_at__date=today,  order_type='delivery').count()
        deliveries_this_month_count=Order.objects.filter(created_at__date__gte=month_start, order_type='delivery').count()
        deliveries_this_week_count=Order.objects.filter(created_at__date__gte=week_start,order_type='delivery').count()

        # deliveries_today=Order.objects.filter(created_at__date=today)
        # revenue_of_deliveries_today=Sum(order.get_total() for order in deliveries_today)
        # deliveries_this_month=Order.objects.filter(created_at__date__gte=month_start,order_type='delivery')
        # revenue_of_deliveries_this_month=Sum(order.get_total() for order in deliveries_this_month)
        # deliveries_this_week=Order.objects.filter(created_at__date__gte=week_start,order_type="delivery")
        # revenue_of_deliveries_week=Sum(order.get_total() for order in deliveries_this_week)
        def get_best_selling_items(start_date):
            return (
                OrderItem.objects.filter(order__created_at__gte=start_date)
                .values(item_name=F("menu_item__name"),unit_price=F("menu_item__price"))
                .annotate(
                    total_sales=Sum("quantity"),
                    total_revenue=Sum(
                        F("quantity") * F("menu_item__price"),
                        output_field=FloatField()
                    )
                )
                .order_by("-total_sales")[:5]
            )
        
        total_sold_product_month=(
            OrderItem.objects.filter(order__created_at__gte=month_start)
            .aggregate(total_sold=Sum("quantity"))['total_sold'] or 0
        )
        # Daily sales for the last one month
        daily_sales = (
            Order.objects.filter(created_at__date__gte=last_30_days)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(
                total_orders=Count("id"),
                total_revenue=Sum(F("items__quantity") * F("items__menu_item__price"), output_field=FloatField())
            )
            .order_by("date")
        )

        #maps over daily sales and returns the required data
        daily_sales_data = [
            {
                "date": item["date"].strftime("%Y-%m-%d"),
                "orders": item["total_orders"] or 0,
                "revenue": round(item["total_revenue"] or 0, 2),
            }
            for item in daily_sales
        ]
        data = {
            "best_selling_today": get_best_selling_items(today),
            "best_selling_week": get_best_selling_items(week_start),
            "best_selling_month": get_best_selling_items(month_start),
        }
        
                
        delivery_boys_performance = (
            Staff.objects.filter(role="DeliveryBoy")
            .annotate(
                deliveries_count=Count(
                    "deliveries",
                    filter=models.Q(deliveries__created_at__gte=month_start)
                ),
                total_revenue=Sum(
                    F("deliveries__items__quantity") * F("deliveries__items__menu_item__price"),
                    filter=models.Q(deliveries__created_at__gte=month_start),
                    output_field=FloatField()
                ),
                
            )
            .values("id", "name", "image", "deliveries_count", "total_revenue")
        )

        return Response({
            "total_staff": total_staff,
            "menu_items": menu_items,
            "attendance_rate": attendance_rate,
            "average_rating": avg_rating,
            "total_orders_today": total_orders_today,
            "total_orders_week": total_orders_week,
            "total_orders_month": total_orders_month,
            "revenue_today": revenue_today,
            "revenue_week": revenue_week,
            "revenue_month": revenue_month,
            "total_sold_products_month": total_sold_product_month,
            "best_selling_items": data,
            "daily_sales": daily_sales_data,
            "deliveries_today_count":deliveries_today_count,
            "deliveries_this_month_count":deliveries_this_month_count,
            "deliveries_this_week_count":deliveries_this_week_count,
            "delivery_boys_performance": delivery_boys_performance,
            # "deliveries_today":deliveries_today,
            # "deliveries_this_week":deliveries_this_week,
            # "deliveries_this_month":deliveries_this_month,
            # "revenue_of_deliveries_today":revenue_of_deliveries_today,
            # "revenue_of_deliveries_month":revenue_of_deliveries_this_month,
            # "revenue_of_deliveries_week":revenue_of_deliveries_week
                          })
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(APIView):
    def get(self, request):
        notifications = Notification.objects.filter(is_read=False).order_by('-created_at')[:10]  # latest 10
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
class MarkAsReadView(APIView):
    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read.'})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
