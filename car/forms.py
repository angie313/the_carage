from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Car, ServiceRecord
from datetime import date

class UserRegisterForm(UserCreationForm):

    class Meta:
        model = User   
        fields = [
            'username',
            'first_name',
            'last_name',
            'email',
            'password1',
            'password2'
        ]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # self.fields['email'].required = True
        self.fields['email'].unique = True
        self.fields['first_name'].required = False
        self.fields['last_name'].required = False
        

class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User   
        fields = [
            'username',
            'first_name',
            'last_name',
            'email',
        ]


class AddServiceForm(forms.ModelForm):

    work_type = forms.ChoiceField(choices=(('service','Service'), ('repair','Repair')))

    class Meta:
        model = ServiceRecord
        fields = [
            'work_type',
            'title',
            'description',
            'service_date',
            'location',
            'odometer',
            'service_receipt',
        ]
        widgets = {
            'service_date': forms.DateInput(attrs={'placeholder':'mm/dd/yyyy'})
        }