from customers.models import Customer
from django.db.models import Count
class CustomerReportService:
    @staticmethod
    def overview(restaurant):
        customers = Customer.objects.filter(restaurant=restaurant)

        top_customers = customers.annotate(
            order_count=Count("orders")
        ).order_by("-order_count")[:10]

        return {
            "total_customers": customers.count(),
            "top_customers": [
                {
                    "name": c.user.username if c.user else c.phone,
                    "orders": c.order_count
                }
                for c in top_customers
            ]
        }          