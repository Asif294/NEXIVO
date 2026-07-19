from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from account.models import User
from account.serializers.user_serializer import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
)

REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60  # 30 days, matches REFRESH_TOKEN_LIFETIME


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        tags=['Account'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'email', 'password'],
            properties={
                'username': openapi.Schema(
                    type=openapi.TYPE_STRING, max_length=150
                ),
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD
                ),
                'full_name': openapi.Schema(
                    type=openapi.TYPE_STRING, max_length=255
                ),
                'phone_number': openapi.Schema(
                    type=openapi.TYPE_STRING, max_length=20
                ),
                'date_of_birth': openapi.Schema(
                    type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE
                ),
                'address': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    additional_properties=True
                ),
            },
        ),
        responses={
            status.HTTP_201_CREATED: openapi.Response(
                description='User created successfully'
            ),
            status.HTTP_400_BAD_REQUEST: openapi.Response(
                description='Validation error'
            )
        }
    )
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': 'Registration successful!',
                'email': user.email,
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        tags=['Account'],
        request_body=UserLoginSerializer,
        responses={
            status.HTTP_200_OK: openapi.Response(description='Login successful'),
            status.HTTP_400_BAD_REQUEST: openapi.Response(description='Invalid credentials'),
            status.HTTP_403_FORBIDDEN: openapi.Response(description='User not active or banned'),
        }
    )
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.validated_data["user"]

        if user.is_deleted:
            return Response(
                {"error": "You are banned. You cannot login."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not user.is_active:
            return Response(
                {"error": "Your account is not active."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response({
            "access": access_token,
            "user": UserSerializer(user).data,
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=not settings.DEBUG,  # only over HTTPS in production
            samesite="Lax",
            max_age=REFRESH_COOKIE_MAX_AGE,
        )
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        tags=['Account'],
        responses={
            status.HTTP_200_OK: openapi.Response(description='Logout successful'),
        }
    )
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass

        response = Response({"success": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie("refresh_token")
        return response


class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        tags=['Account'],
        responses={
            status.HTTP_200_OK: openapi.Response(description='New access token issued'),
            status.HTTP_401_UNAUTHORIZED: openapi.Response(description='Missing or invalid refresh token'),
        }
    )
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response(
                {"detail": "No refresh token provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(refresh_token)
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = Response(
            {"access": str(refresh.access_token)},
            status=status.HTTP_200_OK,
        )

        # ROTATE_REFRESH_TOKENS is on: blacklist the used refresh token and
        # issue a fresh one (for the user embedded in the token) as a new cookie.
        if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
            user_id = refresh.payload.get(settings.SIMPLE_JWT.get("USER_ID_CLAIM", "user_id"))
            user = User.objects.filter(pk=user_id).first()
            if user is not None:
                if settings.SIMPLE_JWT.get("BLACKLIST_AFTER_ROTATION"):
                    try:
                        refresh.blacklist()
                    except Exception:
                        pass
                new_refresh = RefreshToken.for_user(user)
                response.data["access"] = str(new_refresh.access_token)
                response.set_cookie(
                    key="refresh_token",
                    value=str(new_refresh),
                    httponly=True,
                    secure=not settings.DEBUG,
                    samesite="Lax",
                    max_age=REFRESH_COOKIE_MAX_AGE,
                )

        return response
