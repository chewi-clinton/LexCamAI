from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication import events
from apps.authentication.models import RefreshToken, User
from .serializers import UpdateProfileSerializer, UserProfileSerializer, ChangePasswordSerializer
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


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password updated successfully."})


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "total_users": User.objects.filter(is_active=True).count(),
        })


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response({"error": "Admin only."}, status=403)
        users = User.objects.all().order_by("-created_at")
        data = [{
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "city": u.city or "",
            "preferred_language": (u.preferred_language or "fr").upper(),
            "role": u.role,
            "is_active": u.is_active,
            "is_email_verified": u.is_email_verified,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        } for u in users]
        return Response(data)
