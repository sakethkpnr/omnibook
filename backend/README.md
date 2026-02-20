# EventFlow Django Backend

Django REST Framework backend with MySQL database for Event Booking System.

## Quick Start

1. **Create MySQL database:**
   ```sql
   CREATE DATABASE eventflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Install dependencies:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   copy .env.example .env
   # Edit .env with your MySQL credentials
   ```

4. **Run migrations:**
   ```bash
   python manage.py makemigrations core
   python manage.py migrate
   ```

5. **Create admin user:**
   ```bash
   python manage.py createadmin
   ```

6. **Run server:**
   ```bash
   python manage.py runserver 8000
   ```

## Default Admin

- Username: `admin`
- Password: `admin123`

See [SETUP.md](./SETUP.md) for detailed setup instructions.
