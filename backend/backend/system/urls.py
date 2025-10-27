from .views import RestaurantInfoCreateListView,ResInfoRetrieveDestroyView
from django.urls import path
urlpatterns=[
    path('restaurant-info/',RestaurantInfoCreateListView),
    path('restaurant-info/<int:pk>/',ResInfoRetrieveDestroyView.as_view())

]