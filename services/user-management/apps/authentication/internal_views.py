from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings

from .serializers import ValidateTokenSerializer
from .services import validate_access_token

User = get_user_model()


class ValidateTokenView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=ValidateTokenSerializer, responses={200: {"type": "object"}})
    def post(self, request):
        serializer = ValidateTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = validate_access_token(serializer.validated_data["token"])
        if result is None:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(result)


class InternalUserDetailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, pk):
        key = request.headers.get("X-Internal-Key", "")
        if key != settings.INTERNAL_SERVICE_KEY:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "user_id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "preferred_language": user.preferred_language,
        })
