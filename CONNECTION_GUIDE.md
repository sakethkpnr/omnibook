# Frontend-Backend-Database Connection Guide

## Complete Setup Steps

### 1. MySQL Database Setup

**Create the database:**
```sql
CREATE DATABASE eventflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Verify MySQL is running:**
```bash
mysql -u root -p
# Enter your MySQL password
```

### 2. Backend Setup

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

# Create .env file
copy .env.example .env
# Edit .env and set your MySQL password:
# DB_PASSWORD=your_mysql_password

# Run migrations
python manage.py makemigrations core
python manage.py migrate

# Create admin user
python manage.py createadmin

# Start backend server
python manage.py runserver 8000
```

Backend will run at: **http://127.0.0.1:8000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Frontend will run at: **http://localhost:5173**

### 4. Verify Connection

1. **Backend is running** on port 8000
2. **Frontend is running** on port 5173
3. **MySQL database** `eventflow_db` exists
4. **Frontend proxy** is configured in `frontend/vite.config.js`:
   ```js
   proxy: {
     '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
   }
   ```

### 5. Test Login

1. Open **http://localhost:5173** in browser
2. Click **"Sign up"** or use admin credentials:
   - Username: `admin`
   - Password: `admin123`
3. You should be able to login and see events

## Troubleshooting

### Backend won't start

**MySQL connection error:**
- Check MySQL is running: `mysql -u root -p`
- Verify database exists: `SHOW DATABASES;`
- Check `.env` file has correct credentials
- Grant permissions: `GRANT ALL PRIVILEGES ON eventflow_db.* TO 'root'@'localhost';`

**mysqlclient installation fails:**
- Windows: Install MySQL Connector/C first
- Or temporarily use SQLite (change `DATABASES` in `config/settings.py`)

### Frontend can't connect to backend

**Check:**
1. Backend is running on port 8000
2. Frontend proxy in `vite.config.js` points to `http://127.0.0.1:8000`
3. No CORS errors in browser console
4. Network tab shows API requests going to `/api/...`

**Test backend directly:**
```bash
curl http://127.0.0.1:8000/api/events/
```

### Login fails

**Check:**
1. Backend is running
2. Database has admin user: `python manage.py createadmin`
3. Check browser console for errors
4. Verify JWT token is stored in localStorage after login

## File Structure

```
project_aws/
├── backend/
│   ├── config/
│   │   ├── settings.py      # MySQL config
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── core/
│   │   ├── models.py        # User, Event, Booking
│   │   ├── serializers.py   # DRF serializers
│   │   ├── views.py         # API endpoints
│   │   ├── urls.py          # URL routing
│   │   ├── admin.py
│   │   ├── permissions.py
│   │   └── management/commands/createadmin.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                 # MySQL credentials
│
└── frontend/
    ├── src/
    │   ├── services/api.js   # Axios client (baseURL: '/api')
    │   ├── context/AuthContext.jsx
    │   └── ...
    └── vite.config.js        # Proxy: /api -> http://127.0.0.1:8000
```

## Quick Commands Reference

**Backend:**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**Create admin:**
```bash
cd backend
python manage.py createadmin
```

**Reset database:**
```bash
cd backend
python manage.py migrate core zero
python manage.py migrate
python manage.py createadmin
```
