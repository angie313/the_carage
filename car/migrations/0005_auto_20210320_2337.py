# Generated by Django 2.2 on 2021-03-20 23:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('car', '0004_auto_20210320_2300'),
    ]

    operations = [
        migrations.RenameField(
            model_name='servicerecord',
            old_name='receipt',
            new_name='service_receipt',
        ),
    ]
