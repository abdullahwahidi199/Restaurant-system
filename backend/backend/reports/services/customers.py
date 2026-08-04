from customers.models import Customer
from django.db.models import Count, Q
class CustomerReportService:
    @staticmethod
    def overview(restaurant, branch=None):
        customer_filter = Q(orders__restaurant=restaurant)
        order_filter = Q(orders__restaurant=restaurant)
        if branch:
            customer_filter &= Q(orders__branch=branch)
            order_filter &= Q(orders__branch=branch)

        customers = Customer.objects.filter(customer_filter).distinct()

        top_customers = customers.annotate(
            order_count=Count("orders", filter=order_filter)
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
