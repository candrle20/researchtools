"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from search.views import (
    ResearcherViewSet, 
    ProtocolViewSet, 
    ProtocolReviewViewSet,
    get_user_info,
    CustomTokenObtainPairView,
    register_researcher,
    SchoolViewSet,
    LaboratoryViewSet,
    ProtocolStandardViewSet,
    LabJoinRequestViewSet
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'researchers', ResearcherViewSet, basename='researcher')
router.register(r'protocols', ProtocolViewSet, basename='protocol')
router.register(r'reviews', ProtocolReviewViewSet, basename='review')
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'laboratories', LaboratoryViewSet, basename='laboratory')
router.register(r'standards', ProtocolStandardViewSet, basename='standard')
router.register(r'lab-requests', LabJoinRequestViewSet, basename='lab-request')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/', get_user_info, name='user_info'),
    path('api/register/researcher/', register_researcher, name='register_researcher'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)