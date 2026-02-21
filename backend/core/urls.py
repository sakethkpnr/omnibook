from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login),
    path('events/', views.EventList.as_view()),
    path('events/<int:pk>/', views.EventDetailView.as_view()),
    path('book/', views.book),
    path('bookings/user/', views.UserBookingList.as_view()),
    path('bookings/<int:pk>/complete_payment/', views.complete_payment),
    path('bookings/<int:pk>/cancel/', views.cancel_booking),
    path('admin/events/', views.AdminEventListCreate.as_view()),
    path('admin/events/<int:pk>/', views.AdminEventUpdate.as_view()),
    path('admin/events/cancel/', views.admin_cancel_event),
    path('admin/users/', views.AdminUserList.as_view()),
    path('admin/bookings/', views.AdminBookingList.as_view()),
    path('admin/stats/', views.admin_stats),
]
