from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework import status, generics
from rest_framework.response import Response
from .models import RestaurantInfo
from .serializers import ResInfoSerializer


@api_view(['POST', 'GET'])
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


class ResInfoRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RestaurantInfo.objects.all()
    serializer_class = ResInfoSerializer
