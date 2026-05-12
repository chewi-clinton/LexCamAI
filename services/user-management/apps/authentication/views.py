from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import events
from .serializers import (
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    RefreshTokenSerializer,
    RegisterSerializer,
    ResendOTPSerializer,
    ResetPasswordSerializer,
    VerifyEmailSerializer,
)
from .services import (
    check_password,
    delete_otp,
    generate_access_token,
    generate_otp,
    generate_refresh_token_pair,
    hash_password,
    revoke_refresh_token,
    validate_refresh_token,
    verify_otp,
)

User = get_user_model()


def _send_otp_email(user: "User", code: str, otp_type: str) -> None:
    if otp_type == "email_verify":
        subject = "LexCam — Verify your email"
        body = f"Your verification code is: {code}\n\nThis code expires in 10 minutes."
    else:
        subject = "LexCam — Password reset code"
        body = f"Your password reset code is: {code}\n\nThis code expires in 10 minutes."
    send_mail(subject, body, None, [user.email], fail_silently=True)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=RegisterSerializer, responses={201: {"type": "object"}})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = User.objects.create(
            email=data["email"],
            full_name=data["full_name"],
            phone=data.get("phone") or None,
            city=data.get("city", ""),
            preferred_language=data.get("preferred_language", "fr"),
            consent_given_at=timezone.now(),
        )
        user.password = hash_password(data["password"])
        user.save(update_fields=["password"])

        code = generate_otp(str(user.id), "email_verify")
        _send_otp_email(user, code, "email_verify")

        return Response(
            {"message": "Registration successful. Please verify your email."},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=LoginSerializer, responses={200: {"type": "object"}})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user = User.objects.get(email=data["email"].lower())
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(data["password"], user.password):
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"detail": "Account is inactive."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_email_verified:
            return Response(
                {"detail": "Email not verified. Please verify your email first."},
                status=status.HTTP_403_FORBIDDEN,
            )

        access_token = generate_access_token(user)
        raw_refresh, _ = generate_refresh_token_pair(user)

        return Response({
            "access_token": access_token,
            "refresh_token": raw_refresh,
            "token_type": "Bearer",
        })


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=RefreshTokenSerializer, responses={200: {"type": "object"}})
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        db_token = validate_refresh_token(serializer.validated_data["refresh_token"])
        if not db_token:
            return Response({"detail": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

        access_token = generate_access_token(db_token.user)
        return Response({"access_token": access_token, "token_type": "Bearer"})


class LogoutView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=LogoutSerializer, responses={200: {"type": "object"}})
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        revoke_refresh_token(serializer.validated_data["refresh_token"])
        return Response({"message": "Logged out successfully."})


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=VerifyEmailSerializer, responses={200: {"type": "object"}})
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user = User.objects.get(email=data["email"].lower())
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_email_verified:
            return Response({"message": "Email already verified."})

        if not verify_otp(str(user.id), "email_verify", data["code"]):
            return Response({"detail": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])

        # Publish event
        events.publish_user_registered(
            user_id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            preferred_language=user.preferred_language,
        )

        return Response({"message": "Email verified successfully."})


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=ResendOTPSerializer, responses={200: {"type": "object"}})
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user = User.objects.get(email=data["email"].lower())
        except User.DoesNotExist:
            # Return 200 to avoid user enumeration
            return Response({"message": "If the email exists, a new OTP has been sent."})

        otp_type = data.get("type", "email_verify")

        if otp_type == "email_verify" and user.is_email_verified:
            return Response({"message": "Email already verified."})

        code = generate_otp(str(user.id), otp_type)
        _send_otp_email(user, code, otp_type)

        return Response({"message": "If the email exists, a new OTP has been sent."})


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=ForgotPasswordSerializer, responses={200: {"type": "object"}})
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.get(email=serializer.validated_data["email"].lower())
            code = generate_otp(str(user.id), "password_reset")
            _send_otp_email(user, code, "password_reset")
        except User.DoesNotExist:
            pass  # Avoid enumeration

        return Response({"message": "If the email exists, a reset code has been sent."})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=ResetPasswordSerializer, responses={200: {"type": "object"}})
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user = User.objects.get(email=data["email"].lower())
        except User.DoesNotExist:
            return Response({"detail": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)

        if not verify_otp(str(user.id), "password_reset", data["code"]):
            return Response({"detail": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        user.password = hash_password(data["new_password"])
        user.save(update_fields=["password"])

        # Revoke all existing refresh tokens for security
        from .models import RefreshToken as RT
        RT.objects.filter(user=user, revoked=False).update(revoked=True)

        return Response({"message": "Password reset successfully."})
