from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("payments", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="transaction",
            name="event_published",
            field=models.BooleanField(default=False),
        ),
    ]
