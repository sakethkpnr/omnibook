from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Event, Booking


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role',)
    fieldsets = BaseUserAdmin.fieldsets + (('Role', {'fields': ('role',)}),)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location', 'price', 'available_tickets', 'status')
    list_filter = ('status',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'quantity', 'payment_status', 'booking_date')
    list_filter = ('payment_status',)
