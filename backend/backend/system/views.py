from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework import status, generics
from rest_framework.response import Response
from .models import RestaurantInfo
from .serializers import ResInfoSerializer
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny


@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def RestaurantInfoCreateListView(request):
    if request.method == "GET":
        info = RestaurantInfo.objects.all()
        serializer = ResInfoSerializer(info, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        serializer = ResInfoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([AllowAny])
class ResInfoRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RestaurantInfo.objects.all()
    serializer_class = ResInfoSerializer
