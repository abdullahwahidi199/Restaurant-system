from django.urls import path


from .views import category_list_create, CategoryRetrieveDestroyView,MenuItemRetrieveUpdateDestroyView,menu_item_list_create_view,platter_list_create_view,PlatterRetrieveUpdateDestroyView
from .views import (review_list_create,ReviewRetrieveDestroyView,public_categories,public_menu_items,public_menu_item_detail,
                    send_review,public_platters,public_platter_detail,MenuPrintView,menu_item_sales,
                    production_list_create,production_detail,station_list_create,StationRetrieveUpdateDestroyView
                    )


urlpatterns = [
    path('categories/', category_list_create, name='category-list-create'),
    path('categories/<int:pk>/', CategoryRetrieveDestroyView.as_view(), name='category-detail-destroy'),

    path('menu-items/', menu_item_list_create_view, name='menuitem-list-create'),
    path('menu-items/<int:pk>/', MenuItemRetrieveUpdateDestroyView.as_view(), name='menuitem-detail-destroy'),
    path('production/', production_list_create, name='production-list-create'),
    path('production/<int:pk>/', production_detail, name='production-detail'),
   
    path('stations/', station_list_create, name='station-list-create'),
    path(
    "stations/<int:pk>/",
    StationRetrieveUpdateDestroyView.as_view(),
    name="station-detail",
),

    path('menu-item-sales/', menu_item_sales, name='menuitem-sold'),
     path("menu-print/", MenuPrintView.as_view(), name="menu-print"),
    path('reviews/', review_list_create, name='review-list-create'),
    path('reviews/<int:pk>/', ReviewRetrieveDestroyView.as_view(), name='review-detail-destroy'),
    path('send-review/<slug:restaurant_slug>/<slug:branch_slug>/', send_review),
    path('send-review/<str:slug>/',send_review),

    path('public/<slug:restaurant_slug>/<slug:branch_slug>/categories/', public_categories),
    path('public/<slug:restaurant_slug>/<slug:branch_slug>/menu-items/', public_menu_items),
    path('public/<slug:restaurant_slug>/<slug:branch_slug>/menu-items/<int:pk>/', public_menu_item_detail),
    path('public/<str:slug>/categories/', public_categories),
path('public/<str:slug>/menu-items/', public_menu_items),
path('public/<str:slug>/menu-items/<int:pk>/', public_menu_item_detail),

path(
    'platters/',
    platter_list_create_view
),

path(
    'platters/<int:pk>/',
    PlatterRetrieveUpdateDestroyView.as_view()
),

path(
    'public/<slug:restaurant_slug>/<slug:branch_slug>/platters/',
    public_platters
),

path(
    'public/<slug:restaurant_slug>/<slug:branch_slug>/platters/<int:pk>/',
    public_platter_detail
),

path(
    'public/<slug:slug>/platters/',
    public_platters
),

path(
    'public/<slug:slug>/platters/<int:pk>/',
    public_platter_detail
),
]
