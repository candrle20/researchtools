from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomUserViewSet, 
    SchoolViewSet, 
    LabViewSet, 
    LabMembershipViewSet,
    InstitutionViewSet,
    CustomTokenObtainPairView,
    UserTokenObtainPairView,
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'labs', LabViewSet, basename='lab')
router.register(r'lab-memberships', LabMembershipViewSet, basename='labmembership')
router.register(r'institutions', InstitutionViewSet, basename='institution')

urlpatterns = [
    path('', include(router.urls)),
    path('token/developer/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair_developer'),
    path('token/', UserTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] 