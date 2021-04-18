from django.urls import path
from django.contrib.staticfiles.storage import staticfiles_storage
from .views import (index, register, DashboardView, 
            add_car, del_car, profile, car_view, edit_car, add_vin, 
            add_record, remove_record, get_record_info, 
            edit_record, testdata, warranty_data)
from django.contrib.auth import views as auth_views
from django.views.generic.base import RedirectView


urlpatterns = [
    path('', index),
    path('register', register, name='register-page'),
    path('login', auth_views.LoginView.as_view(template_name='car/login.html'), name='login-page'),
    path('logout', auth_views.LogoutView.as_view(template_name='car/home.html')),
    path('profile/<int:pk>', profile, name='profile-page'),
    path('my-cars', DashboardView.as_view(), name='dashboard'),
    path('my-cars/add', add_car),
    path('my-cars/delete/<int:pk>', del_car),
    path('my-cars/<int:pk>', car_view, name="car-view"),
    path('my-cars/edit/<int:pk>', edit_car, name="edit-car"),
    path('my-cars/add-vin/<int:pk>', add_vin),
    path('my-cars/warranty', warranty_data),
    path('my-cars/<int:pk>/add-service', add_record, name='add-record'),
    path('my-cars/service/<int:pk>/delete', remove_record, name='remove-record'), 
    path('my-cars/get-service-info/<int:pk>', get_record_info),
    path('my-cars/service/edit/<int:pk>', edit_record, name='edit-record'),
    path('test-data/<str:vin>', testdata), 

    path(
        "favicon.ico",
        RedirectView.as_view(url=staticfiles_storage.url("favicon.ico")),
    ),
]