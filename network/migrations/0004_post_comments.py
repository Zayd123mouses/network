# Generated by Django 3.2.14 on 2022-08-03 17:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_auto_20220801_1515'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='comments',
            field=models.IntegerField(default=0),
        ),
    ]
