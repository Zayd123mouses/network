# Generated by Django 3.1.7 on 2022-08-08 19:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0005_userfollowing'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='userfollowing',
            unique_together={('user_id', 'following_user_id')},
        ),
    ]
