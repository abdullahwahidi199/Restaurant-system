from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework import status, generics
from rest_framework.response import Response
from .models import RestaurantInfo
from .serializers import ResInfoSerializer
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from restaurants.models import Restaurant
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from restaurants.serializers import RestaurantSerializer
from restaurants.models import Restaurant
from django.utils import timezone
from rest_framework.exceptions import NotFound
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def RestaurantInfoCreateListView(request):
    if request.method == "GET":
        info = RestaurantInfo.objects.all()
        serializer = ResInfoSerializer(info, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        if request.user.staff_profile.is_demo:
            return Response({"detail":"Action restricted in demo mode!"},status=403)
        serializer = ResInfoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([AllowAny])
class ResInfoRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RestaurantInfo.objects.all()
    serializer_class = ResInfoSerializer
    def update(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().update(request, *args, **kwargs)
    def destroy(self, request, *args, **kwargs):
        if request.user.staff_profile.is_demo:
            return Response({'detail': 'Action restricted in demo mode.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class RestaurantInfoBySlugView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        restaurant = get_object_or_404(Restaurant, slug=slug)

        # 🔴 Check restaurant + subscription
        subscription = getattr(restaurant, "subscription", None)
        today = timezone.now().date()

        is_active = (
            restaurant.is_active and
            subscription and
            subscription.is_active and
            subscription.starts_at <= today <= subscription.expires_at
        )

        if not is_active:
            raise NotFound("Restaurant not found")

        serializer = RestaurantSerializer(restaurant)
        return Response(serializer.data)