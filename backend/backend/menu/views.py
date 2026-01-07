from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Category,MenuItem,Review
from .serializers import CategorySerializer,MenuItemSerializer,ReveiwSerializer
from reports.models import Notification
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def category_list_create(request):
    if request.method == 'GET':
        categories = Category.objects.prefetch_related('menu_items').all() # will also get the related menu_items(optimized version)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        if request.user.staff_profile.is_demo:
            return Response({"detail":"Action is restricted in demo mode"},status=403)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([AllowAny])
class CategoryRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.prefetch_related('menu_items').all()
    serializer_class = CategorySerializer

    def update(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().update(request, *args, **kwargs)
    def destroy(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().destroy(request, *args, **kwargs)


@api_view(['GET','POST'])
@permission_classes([AllowAny])
def menu_item_list_create_view(request):
    if request.method=="GET":
        menu_items=MenuItem.objects.prefetch_related('reviews').select_related('category').all()
        serializer=MenuItemSerializer(menu_items,many=True)
        return Response(serializer.data)
    elif request.method=="POST":
        if request.user.staff_profile.is_demo:
            return Response({"detail":"Action is restricted in demo mode"},status=403)
        serializer=MenuItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@permission_classes([AllowAny])
class MenuItemRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MenuItem.objects.prefetch_related('reviews')
    serializer_class = MenuItemSerializer

    def update(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().update(request, *args, **kwargs)
    def destroy(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().destroy(request, *args, **kwargs)



@api_view(['GET',"POST"])
@permission_classes([AllowAny])
def review_list_create(request):
    if request.method=="GET":
        reviews=Review.objects.select_related('customer','menu_item','delivery').all()
        serializer=ReveiwSerializer(reviews,many=True)
        return Response(serializer.data)
    elif request.method=="POST":
        serializer=ReveiwSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@permission_classes([AllowAny])
class ReviewRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.select_related('customer', 'menu_item')
    serializer_class = ReveiwSerializer