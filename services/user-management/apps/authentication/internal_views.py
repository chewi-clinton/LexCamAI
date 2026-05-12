from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ValidateTokenSerializer
from .services import validate_access_token


class ValidateTokenView(APIView):
    """
    Internal endpoint — validate a JWT access token.
    Returns {user_id, role} on success, 401 on failure.
    Not exposed to public traffic; should be protected at the network level.
    """
    permission_classes = [AllowAny]

    @extend_schema(request=ValidateTokenSerializer, responses={200: {"type": "object"}})
    def post(self, request):
        serializer = ValidateTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = validate_access_token(serializer.validated_data["token"])
        if result is None:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(result)
