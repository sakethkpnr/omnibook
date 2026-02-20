from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import Event, Booking
from .serializers import (
    UserSerializer,
    EventSerializer,
    EventWriteSerializer,
    BookingSerializer,
    BookingCreateSerializer,
    AdminBookingSerializer,
)
from .permissions import IsAdminRole

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'access': str(refresh.access_token), 'user': UserSerializer(user).data}


# ----- Auth -----
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not all([username, email, password]):
        return Response(
            {'detail': 'username, email and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if User.objects.filter(username=username).exists():
        return Response({'username': ['This username is already taken.']}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'email': ['This email is already registered.']}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, email=email, password=password, role='user')
    return Response(get_tokens_for_user(user), status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    from django.contrib.auth import authenticate
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({'detail': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(get_tokens_for_user(user))


# ----- Public events -----
class EventList(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = EventSerializer

    def get_queryset(self):
        qs = Event.objects.all().order_by('date')
        source = self.request.query_params.get('source', '').strip()
        destination = self.request.query_params.get('destination', '').strip()
        date_str = self.request.query_params.get('date', '').strip()
        if source:
            qs = qs.filter(source__icontains=source)
        if destination:
            qs = qs.filter(destination__icontains=destination)
        if date_str:
            from datetime import datetime
            try:
                d = datetime.strptime(date_str, '%Y-%m-%d').date()
                qs = qs.filter(date__date=d)
            except ValueError:
                pass
        return qs


class EventDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Event.objects.all()
    serializer_class = EventSerializer


# ----- Bookings (authenticated user) -----
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book(request):
    ser = BookingCreateSerializer(data=request.data, context={'request': request})
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    booking = ser.save()
    return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class UserBookingList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-booking_date')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_payment(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, user=request.user)
    except Booking.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    booking.payment_status = 'SUCCESS'
    booking.save(update_fields=['payment_status'])
    return Response(BookingSerializer(booking).data)


# ----- Admin -----
class AdminEventListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventWriteSerializer
        return EventSerializer


class AdminEventUpdate(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = Event.objects.all()
    serializer_class = EventWriteSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminRole])
def admin_cancel_event(request):
    event_id = request.data.get('event_id')
    if event_id is None:
        return Response({'detail': 'event_id required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({'detail': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
    event.status = 'cancelled'
    event.save(update_fields=['status'])
    return Response(EventSerializer(event).data)


class AdminUserList(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer


class AdminBookingList(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminBookingSerializer
    queryset = Booking.objects.all().select_related('user', 'event').order_by('-booking_date')


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminRole])
def admin_stats(request):
    from django.db.models import Sum, F, Value
    from django.db.models.functions import Coalesce
    total_bookings = Booking.objects.count()
    payment_success = Booking.objects.filter(payment_status='SUCCESS').count()
    payment_pending = Booking.objects.filter(payment_status='PENDING').count()
    qs = Booking.objects.filter(payment_status='SUCCESS')
    rev = qs.aggregate(
        total=Sum(Coalesce('total_amount', F('quantity') * F('event__price')))
    )['total']
    return Response({
        'total_users': User.objects.count(),
        'total_bookings': total_bookings,
        'total_events': Event.objects.count(),
        'payment_success': payment_success,
        'payment_pending': payment_pending,
        'total_revenue': str(rev) if rev is not None else '0.00',
    })
