from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import SetPasswordForm
from .forms import UserRegisterForm, UserUpdateForm, AddServiceForm
from django.contrib.auth.models import User
from .models import Car, ServiceRecord
from django.views.generic import ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required

import json
from django.http import HttpResponse, JsonResponse
from django.core import serializers

from django.conf import settings


def index(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    return render(request, 'car/home.html')


def register(request):

    if request.method == "POST":
        reg_form = UserRegisterForm(request.POST)

        if reg_form.is_valid():
            reg_form.save()      
            
            messages.success(request, f'Your account has been created! You may log in now.')
            return redirect('login-page')
    
    reg_form = UserRegisterForm()
    
    return render(request, 'car/register.html', {'reg_form': reg_form})


@login_required
def profile(request, pk):
    this_user = User.objects.get(id=pk)
    if request.method == "POST":
        if 'u-btn' in request.POST:       
            u_form = UserUpdateForm(request.POST, instance=this_user)
            if u_form.is_valid():
                u_form.save()
                messages.success(request, f'Profile has been successfully updated.')
                return redirect('profile-page', pk)

            for val in u_form.errors.values():
                messages.error(request, val)

        if 'p-btn' in request.POST:       
            p_form = SetPasswordForm(this_user, request.POST)
            if p_form.is_valid():
                u_pass = p_form.save()
                update_session_auth_hash(request, u_pass)
                messages.success(request, f'Password has been successfully updated.')
                return redirect('logout-page')

            for val in p_form.errors.values():
                messages.error(request, val)


    u_form = UserUpdateForm(instance=this_user)
    p_form = SetPasswordForm(this_user)
    return render(request, 'car/profile.html', 
                    {'u_form': u_form, 'p_form': p_form, 'this_user': this_user})



class DashboardView(LoginRequiredMixin, ListView):
    # model = Car
    template_name = 'car/dashboard.html'  # default: <app_name>/<model_name>_<viewtype>.html
    context_object_name = 'user_all_cars'   # default to 'object_list' for all cars if not set
    def get_queryset(self):
        return Car.objects.filter(owner=self.request.user)


@login_required
def add_car(request):
    if request.method == 'POST':
        this_user = User.objects.get(id=request.user.id) 
        if request.POST.get('by-ymm', None):
            new_car = Car.objects.create(
                owner=this_user, make=request.POST['make'], 
                model=request.POST['model'], year=request.POST['year']
            )
            # return JsonResponse({'car_id': 11})


        elif request.POST.get('by-vin', None):
            car_specs = json.loads(request.POST['res-data'])['specifications']
            new_car = Car.objects.create(
                owner=this_user, make=car_specs['make'], model=car_specs['model'], 
                year=car_specs['year'], trim=car_specs['trim'], vin=car_specs['vin'], 
                engine=car_specs['engine'], transmission=car_specs['transmission']
            )
            # return JsonResponse({'car_id': 20})

        return JsonResponse({'car_id': new_car.id})

    return redirect('dashboard')
    

@login_required
def del_car(request, pk):
    this_car = Car.objects.get(id=pk)
    car_name = f'{this_car.year} {this_car.make} {this_car.model}'
    this_car.delete()

    return JsonResponse({'success': car_name + ' successfully deleted!'})


@login_required
def car_view(request, pk):
    this_car = Car.objects.get(id=pk)
    all_services = this_car.svc_records.filter(work_type='service')
    all_repairs = this_car.svc_records.filter(work_type='repair')
    context = {
        'this_car': this_car,
        'service_form': AddServiceForm(),
        'all_services': all_services,
        'all_repairs': all_repairs,
        'google_map_api': settings.GOOGLE_MAP_API_KEY
    }

    return render(request, 'car/car_detail.html', context)


@login_required
def edit_car(request, pk):
    get_car = Car.objects.filter(id=pk)

    if request.method == 'POST':
        if request.POST.get('res-data', None):
            car_specs = json.loads(request.POST['res-data'])['specifications']
            get_car.update(
                year=car_specs['year'], make=car_specs['make'], model=car_specs['model'],
                trim=car_specs['trim'], engine=car_specs['engine'], 
                vin=car_specs['vin'], transmission=car_specs['transmission'],
            )
            this_car = Car.objects.get(id=pk)
            return JsonResponse({'success': {'trim':this_car.trim, 'engine':this_car.engine, 'trans':this_car.transmission}})
        
        else:
            Car.objects.filter(id=pk).update(
                year=request.POST['year'], make=request.POST['make'], model=request.POST['model'],
                trim=request.POST['trim'], engine=request.POST['engine'], vin=request.POST['vin'],
                transmission=request.POST['transmission'], odometer=request.POST['odometer'],
            )

        return redirect('car-view', pk)
    
    return redirect('dashboard')


@login_required
def add_vin(request, pk):
    this_car = Car.objects.get(id=request.POST['id'])
    this_car.vin = request.POST['vin']
    this_car.save()
    return JsonResponse({'success': this_car.vin})


@login_required
def add_record(request, pk):
    if request.method == "POST":
        this_car = Car.objects.get(id=pk)
        rec_form = AddServiceForm(data=request.POST, files=request.FILES)
        if rec_form.is_valid():
            new_record = rec_form.save(commit=False)    
            new_record.car = this_car
            new_record.save()
            
            svc_dict = {
                'pk': new_record.id,
                'title': new_record.title,
                'description': new_record.description,
                'location': new_record.location,
                'work_type': new_record.work_type,
                'service_date': new_record.service_date,
                'odometer': new_record.odometer,
                'car_all_records': this_car.svc_records.count(),
                'car_svc_record': this_car.svc_records.filter(work_type='service').count(),
                'car_repair_record': this_car.svc_records.filter(work_type='repair').count(),
            }
            # return redirect(f'/my-cars/{pk}')
            
        return JsonResponse(svc_dict, content_type="application/json")
    

@login_required
def remove_record(request, pk):
    this_record = ServiceRecord.objects.get(id=pk)
    record = f'Record {this_record.title} successfully deleted!'
    this_record.delete()

    return JsonResponse({'success': record})


def get_record_info(request, pk):
    this_record = ServiceRecord.objects.filter(id=pk)
    serialized_obj = serializers.serialize('json', this_record)
    return HttpResponse(serialized_obj, content_type='application/json')
    


def edit_record(request, pk):
    this_record = ServiceRecord.objects.filter(id=pk).first()
    this_car = this_record.car.id
    if request.method == "POST":
        rec_form = AddServiceForm(data=request.POST, files=request.FILES, instance=this_record)
        if rec_form.is_valid():
            rec_form.save()
            messages.success(request, f'The record has been successfully updated!')
        return redirect('car-view', this_car)


def warranty_data(request):

    warranty = {
        "message": {
            "code": 0,
            "message": "ok",
            "credentials": "valid",
            "version": "v3.0.0",
            "endpoint": "warranty",
            "counter": 4
        },

        "data": [
            {
                "type": "Basic",
                "criteria": "3 year / 36,000 miles",
                "note": "",
                "max_miles": 36000,
                "max_year": 3,
                "transferable": True
            },
            {
                "type": "Federal Emissions",
                "criteria": "8 year / 80,000 miles",
                "note": "",
                "max_miles": 80000,
                "max_year": 8,
                "transferable": True
            },
            {
                "type": "Electric/Hybrid",
                "criteria": "8 year / 100,000 miles",
                "note": "Battery components only",
                "max_miles": 100000,
                "max_year": 8,
                "transferable": True
            },
            {
                "type": "Powertrain",
                "criteria": "5 year / 60,000 miles",
                "note": "",
                "max_miles": 60000,
                "max_year": 5,
                "transferable": True
            }
        ]
    }

    warranty_data = json.dumps(warranty)

    return HttpResponse(warranty_data, content_type='application/json')






# Testing vin decoder API Data

def testdata(request, vin):
   
    car_data = {
    
    "vin": vin,
    "specifications": {
        "vin": "5TDYKRFH8FS078210",
        "year": "2015",
        "make": "Toyota",
        "model": "Highlander",
        "trim": "Limited",
        "engine": "3.5-L V-6 DOHC 24V",
        "style": "FWD V-6",
        "made_in": "United States",
        "steering_type": "Rack & Pinion",
        "anti_brake_system": "4-Wheel ABS",
        "type": "Sport Utility Vehicle",
        "overall_height": "68.10 inches",
        "overall_length": "191.10 inches",
        "overall_width": "75.80 inches",
        "standard_seating": "7",
        "highway_mileage": "25 miles/gallon",
        "city_mileage": "19 miles/gallon",
        "fuel_type": "Regular Unleaded",
        "drive_type": "Front-Wheel Drive",
        "transmission": "6-Speed Automatic"}
    }

    json_data = json.dumps(car_data)

    return HttpResponse(json_data, content_type='application/json')





