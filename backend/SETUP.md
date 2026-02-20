# Django Backend Setup Guide

## Prerequisites

1. **Python 3.8+** installed
2. **MySQL Server** installed and running
3. **MySQL Client** (for mysqlclient Python package)

## Step 1: Create MySQL Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE eventflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use a MySQL GUI tool to create a database named `eventflow_db`.

## Step 2: Install Python Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Note:** If `mysqlclient` installation fails on Windows, you may need:
- Install MySQL Connector/C from MySQL website
- Or use `pip install mysqlclient` with pre-built wheel
- Or temporarily use SQLite for development (change DATABASES in settings.py)

## Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
# Windows:
copy .env.example .env

# macOS/Linux:
# cp .env.example .env
```

Edit `.env` file and set your MySQL credentials:

```
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
DB_NAME=eventflow_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

## Step 4: Run Migrations

```bash
python manage.py makemigrations core
python manage.py migrate
```

This creates all database tables in MySQL.

## Step 5: Create Admin User

```bash
python manage.py createadmin
```

Default credentials:
- **Username:** admin
- **Password:** admin123

## Step 6: Run Development Server

```bash
python manage.py runserver 8000
```

Backend API will be available at: **http://127.0.0.1:8000/api/**

## Step 7: Test API Endpoints

Test login:
```bash
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

## Frontend Connection

The frontend is configured to proxy `/api` requests to `http://127.0.0.1:8000` (see `frontend/vite.config.js`).

Make sure:
1. Backend is running on port 8000
2. Frontend is running on port 5173
3. MySQL is running and database `eventflow_db` exists

## Troubleshooting

### MySQL Connection Error

- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Verify credentials in `.env` file
- Ensure MySQL user has permissions: `GRANT ALL PRIVILEGES ON eventflow_db.* TO 'root'@'localhost';`

### mysqlclient Installation Issues

On Windows, try:
```bash
pip install --upgrade pip
pip install mysqlclient
```

If it fails, temporarily use SQLite by changing `DATABASES` in `config/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Port Already in Use

If port 8000 is busy:
```bash
python manage.py runserver 8001
```
Then update `frontend/vite.config.js` proxy target to `http://127.0.0.1:8001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register/ | Register user |
| POST | /api/login/ | Login (returns JWT + user) |
| GET | /api/events/ | List events |
| GET | /api/events/:id/ | Event detail |
| POST | /api/book/ | Book tickets (auth) |
| GET | /api/bookings/user/ | User bookings (auth) |
| POST | /api/bookings/:id/complete_payment/ | Complete payment (auth) |
| POST | /api/admin/events/ | Create event (admin) |
| PUT | /api/admin/events/:id/ | Update event (admin) |
| DELETE | /api/admin/events/:id/ | Delete event (admin) |
| GET | /api/admin/users/ | List users (admin) |
| GET | /api/admin/stats/ | Dashboard stats (admin) |
