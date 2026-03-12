from django.urls import path
from .views import investigate_stream

urlpatterns = [
    path("stream/", investigate_stream),
]