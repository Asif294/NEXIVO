from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    LogoutView,
    CookieTokenRefreshView,
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', LogoutView.as_view(), name='user-logout'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token-refresh'),
]
