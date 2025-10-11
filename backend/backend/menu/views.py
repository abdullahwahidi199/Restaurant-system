from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Category,MenuItem,Review
from .serializers import CategorySerializer,MenuItemSerializer,ReveiwSerializer


@api_view(['GET', 'POST'])
def category_list_create(request):
    if request.method == 'GET':
        categories = Category.objects.prefetch_related('menu_items').all() # will also get the related menu_items(optimized version)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.prefetch_related('menu_items').all()
    serializer_class = CategorySerializer


@api_view(['GET','POST'])
def menu_item_list_create_view(request):
    if request.method=="GET":
        menu_items=MenuItem.objects.prefetch_related('reviews').all()
        serializer=MenuItemSerializer(menu_items,many=True)
        return Response(serializer.data)
    elif request.method=="POST":
        serializer=MenuItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MenuItemRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MenuItem.objects.prefetch_related('reviews')
    serializer_class = MenuItemSerializer


@api_view(['GET',"POST"])
def review_list_create(request):
    if request.method=="GET":
        reviews=Review.objects.select_related('customer','menu_item').all()
        serializer=ReveiwSerializer(reviews,many=True)
        return Response(serializer.data)
    elif request.method=="POST":
        serializer=ReveiwSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.select_related('customer', 'menu_item')
    serializer_class = ReveiwSerializer