# Generated by Django 2.2 on 2021-03-09 19:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('car', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='car',
            name='vin',
            field=models.CharField(blank=True, max_length=50, null=True, unique=True),
        ),
    ]
