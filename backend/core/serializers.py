from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Event, Booking

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')
        read_only_fields = ('id', 'role')


class EventSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=True)
    available_seats = serializers.SerializerMethodField()
    seat_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = (
            'id', 'title', 'description', 'category', 'date', 'location',
            'source', 'destination', 'image', 'price', 'available_tickets',
            'seat_plan', 'status', 'created_at', 'available_seats', 'seat_count'
        )

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
        read_only_fields = ('id', 'created_at')

    def get_available_seats(self, obj):
        return obj.get_available_seats()

    def get_seat_count(self, obj):
        return obj.get_seat_count()


class EventWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = (
            'id', 'title', 'description', 'category', 'date', 'location',
            'source', 'destination', 'image', 'price', 'available_tickets',
            'seat_plan', 'status'
        )


class BookingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateTimeField(source='event.date', read_only=True)
    event_category = serializers.CharField(source='event.category', read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'user', 'event', 'event_title', 'event_date', 'event_category', 'quantity', 'selected_seats', 'total_amount', 'payment_status', 'booking_date')
        read_only_fields = ('id', 'user', 'booking_date')


class AdminBookingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateTimeField(source='event.date', read_only=True)
    event_price = serializers.DecimalField(source='event.price', max_digits=10, decimal_places=2, read_only=True)
    event_category = serializers.CharField(source='event.category', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'user', 'user_username', 'user_email', 'event', 'event_title', 'event_date', 'event_price', 'event_category', 'quantity', 'selected_seats', 'total_amount', 'payment_status', 'booking_date')


class BookingCreateSerializer(serializers.ModelSerializer):
    event_id = serializers.IntegerField(write_only=True)
    selected_seats = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True)

    class Meta:
        model = Booking
        fields = ('event_id', 'quantity', 'selected_seats')

    def validate_event_id(self, value):
        if not Event.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Event not found.')
        return value

    def validate(self, attrs):
        event_id = attrs.get('event_id')
        quantity = attrs.get('quantity', 1)
        selected_seats = attrs.get('selected_seats') or []
        event = Event.objects.get(pk=event_id)

        if event.status != 'active':
            raise serializers.ValidationError({'detail': 'Event is not available for booking.'})

        if event.seat_plan:
            available = event.get_available_seats()
            if not available:
                raise serializers.ValidationError({'detail': 'No seats available.'})
            avail_ids = {s['id'] for s in available}
            for sid in selected_seats:
                if str(sid) not in avail_ids:
                    raise serializers.ValidationError({'detail': f'Seat {sid} is not available.'})
            if len(selected_seats) < 1:
                raise serializers.ValidationError({'detail': 'Please select at least one seat.'})
            attrs['_selected_seats'] = [str(s) for s in selected_seats]
            attrs['_seat_list'] = available
        else:
            if event.available_tickets < quantity:
                raise serializers.ValidationError({'detail': 'Not enough tickets available.'})
            if quantity < 1:
                raise serializers.ValidationError({'detail': 'Quantity must be at least 1.'})
        return attrs

    def create(self, validated_data):
        event_id = validated_data.pop('event_id')
        quantity = validated_data.get('quantity', 1)
        selected_seats = validated_data.pop('_selected_seats', None)
        seat_list = validated_data.pop('_seat_list', None)
        event = Event.objects.get(pk=event_id)

        total_amount = None
        from decimal import Decimal
        if event.seat_plan and selected_seats and seat_list:
            price_map = {s['id']: s['price'] for s in seat_list}
            total_amount = Decimal(str(round(sum(price_map.get(sid, 0) for sid in selected_seats), 2)))
            quantity = len(selected_seats)
        else:
            total_amount = event.price * quantity

        booking = Booking.objects.create(
            user=self.context['request'].user,
            event=event,
            quantity=quantity,
            selected_seats=selected_seats or [],
            total_amount=total_amount,
        )
        if not event.seat_plan:
            event.available_tickets -= quantity
            event.save(update_fields=['available_tickets'])
        return booking
