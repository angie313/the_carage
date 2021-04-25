from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Car, ServiceRecord
from datetime import date
from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import ValidationError

class UserRegisterForm(UserCreationForm):

    class Meta:
        model = User   
        fields = [
            'username',
            'email',
            'password1',
            'password2'
        ]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].help_text = 'At least 3 characters letters, digits and/or @/./+/-/_ only'
        self.fields['email'].unique = True
        self.fields['password1'].help_text = _("At least 8 characters. Cannot be all numbers")
        self.fields['password2'].label = _('Comfirm password')
        self.fields['password2'].help_text = None

    def clean_username(self):
        username_data = self.cleaned_data['username']
        if len(username_data) < 3:
            raise ValidationError('Username must be at least 3 characters long.')
        if User.objects.filter(username=username_data):
            raise ValidationError('This username has been used.')

        return username_data

    def clean_email(self):
        email_data = self.cleaned_data['email']
        if User.objects.filter(email=email_data):
            raise ValidationError('An account has been created using this email.')

        return email_data


class UserUpdateForm(forms.ModelForm):
    username = forms.CharField(help_text=None, 
                widget=forms.TextInput(attrs={'placeholder':'letters, digits and @/./+/-/_ only', 'readonly':'readonly'}))

    class Meta:
        model = User   
        fields = [
            'username',
            'first_name',
            'last_name',
            'email',
        ]

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        email = cleaned_data.get('email')
        if User.objects.filter(email=email).exclude(username=username):
            raise ValidationError('Another account has been created using this email.')

        return cleaned_data


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