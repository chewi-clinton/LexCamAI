from .base import *
from decouple import config

DEBUG = False
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="").split(",")
