from django.db import models
from django.contrib.auth.models import User


class Car(models.Model):
    owner = models.ForeignKey(User, related_name='cars', on_delete=models.CASCADE)

    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    trim = models.CharField(max_length=50, blank=True, default="N/A")
    vin = models.CharField(max_length=50, blank=True, null=False)
    engine = models.CharField(max_length=100, blank=True, default="N/A")
    transmission = models.CharField(max_length=100, blank=True, default="N/A")
    odometer = models.IntegerField(blank=True, default=0)


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Owner {self.owner.username}: {self.year} {self.make} {self.model}'

class ServiceRecord(models.Model):
    car = models.ForeignKey(Car, related_name='svc_records', on_delete=models.CASCADE)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=False)
    location = models.CharField(max_length=255, blank=True, null=False)
    work_type = models.CharField(max_length=50)
    service_date = models.DateField(null=True, blank=True)
    odometer = models.PositiveIntegerField(blank=True, default=0)
    service_receipt = models.ImageField(upload_to='images/', blank=True, default='invoice_receipt.png', help_text="Keep a copy of your receipt here")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.title} Record for {self.car.year} {self.car.make} {self.car.model}'