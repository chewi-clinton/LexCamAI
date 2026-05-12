from django.contrib import admin
from .models import Lawyer, Specialization, LawyerDocument

admin.site.register(Lawyer)
admin.site.register(Specialization)
admin.site.register(LawyerDocument)
