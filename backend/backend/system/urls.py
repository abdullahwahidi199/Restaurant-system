from .views import RestaurantInfoCreateListView,ResInfoRetrieveDestroyView,RestaurantInfoBySlugView
from django.urls import path
urlpatterns=[
    path('restaurant-info/',RestaurantInfoCreateListView),
    path('restaurant-info/<int:pk>/',ResInfoRetrieveDestroyView.as_view()),
     path('restaurant-info/slug/<slug:slug>/', RestaurantInfoBySlugView.as_view()),

]