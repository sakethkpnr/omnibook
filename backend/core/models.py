from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = [('user', 'User'), ('admin', 'Admin')]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username


class Event(models.Model):
    CATEGORY_CHOICES = [
        ('event', 'Event'),
        ('sports', 'Sports'),
        ('bus', 'Bus'),
        ('train', 'Train'),
    ]
    STATUS_CHOICES = [('active', 'Active'), ('cancelled', 'Cancelled')]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='event')
    date = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True)
    source = models.CharField(max_length=200, blank=True)
    destination = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    available_tickets = models.PositiveIntegerField(default=0)
    # seat_plan: null = simple quantity-based; or {"sections":[{"id":"A","name":"VIP","capacity":50,"price":500}]} for stadium
    # or {"seats":[{"id":"1","label":"Seat 1","price":50}]} for bus/train
    seat_plan = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def get_available_seats(self):
        """Return list of available seat IDs. For simple events, returns None."""
        if not self.seat_plan:
            return None
        booked = set()
        for b in self.bookings.filter(is_cancelled=False):
            for s in (b.selected_seats or []):
                booked.add(str(s))
        seats = []
        if self.seat_plan.get('sections'):
            for sec in self.seat_plan['sections']:
                cap = int(sec.get('capacity', 0))
                sid = str(sec.get('id', ''))
                for i in range(1, cap + 1):
                    seat_id = f"{sid}-{i}"
                    if seat_id not in booked:
                        seats.append({'id': seat_id, 'section': sid, 'label': f"{sec.get('name', sid)} #{i}", 'price': float(sec.get('price', self.price))})
        elif self.seat_plan.get('seats'):
            for s in self.seat_plan['seats']:
                seat_id = str(s.get('id', ''))
                if seat_id not in booked:
                    seats.append({'id': seat_id, 'section': None, 'label': s.get('label', seat_id), 'price': float(s.get('price', self.price))})
        return seats

    def get_seat_count(self):
        """Total seats from seat_plan, or available_tickets for simple events."""
        if not self.seat_plan:
            return self.available_tickets
        n = 0
        if self.seat_plan.get('sections'):
            for sec in self.seat_plan['sections']:
                n += int(sec.get('capacity', 0))
        elif self.seat_plan.get('seats'):
            n = len(self.seat_plan['seats'])
        return n

    class Meta:
        ordering = ['date']


class Booking(models.Model):
    PAYMENT_STATUS = [('PENDING', 'Pending'), ('SUCCESS', 'Success')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    quantity = models.PositiveIntegerField(default=1)
    selected_seats = models.JSONField(default=list, blank=True)  # e.g. ["A-1", "A-2"] or ["1", "2"]
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='PENDING')
    is_cancelled = models.BooleanField(default=False)
    booking_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} - {self.event.title} x{self.quantity}'

    class Meta:
        ordering = ['-booking_date']
