from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication import events
from apps.authentication.models import RefreshToken
from .serializers import UpdateProfileSerializer, UserProfileSerializer
from .services import anonymise_user


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserProfileSerializer})
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(request=UpdateProfileSerializer, responses={200: UserProfileSerializer})
    def patch(self, request):
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserProfileSerializer(request.user).data)

    @extend_schema(responses={204: None})
    def delete(self, request):
        user = request.user
        user_id = str(user.id)

        # Revoke all refresh tokens
        RefreshToken.objects.filter(user=user, revoked=False).update(revoked=True)

        # Anonymise
        anonymise_user(user)

        # Publish event
        events.publish_user_deleted(user_id=user_id)

        return Response(status=status.HTTP_204_NO_CONTENT)
