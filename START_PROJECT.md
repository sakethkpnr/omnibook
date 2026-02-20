# How to Start the Project

## Recommended Order: Backend First, Then Frontend

Start the **backend first** so the API is ready when the frontend loads.

---

## Step 1: Start Backend (Terminal 1)

```bash
# Navigate to backend folder
cd backend

# Activate virtual environment
venv\Scripts\activate

# Make sure MySQL database exists (if not already created)
# Run this in MySQL command line or MySQL Workbench:
# CREATE DATABASE eventflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Run migrations (only needed first time or after model changes)
python manage.py makemigrations core
python manage.py migrate

# Create admin user (only needed first time)
python manage.py createadmin

# Start Django development server
python manage.py runserver 8000
```

**You should see:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

✅ **Backend is running on http://127.0.0.1:8000**

---

## Step 2: Start Frontend (Terminal 2)

**Open a NEW terminal window** (keep backend running in Terminal 1):

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (only needed first time)
npm install

# Start Vite development server
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ **Frontend is running on http://localhost:5173**

---

## Step 3: Open in Browser

Open your browser and go to:
**http://localhost:5173**

You should see the EventFlow homepage!

---

## Quick Reference

### Backend Commands (Terminal 1)
```bash
cd backend
venv\Scripts\activate
python manage.py runserver 8000
```

### Frontend Commands (Terminal 2)
```bash
cd frontend
npm run dev
```

---

## Troubleshooting

### Backend won't start

**MySQL connection error:**
- Make sure MySQL is running
- Check `.env` file has correct password: `DB_PASSWORD=Saketh@120506`
- Verify database exists: `SHOW DATABASES;` in MySQL
- Check MySQL user has permissions

**Port 8000 already in use:**
```bash
# Use a different port
python manage.py runserver 8001
# Then update frontend/vite.config.js proxy target to http://127.0.0.1:8001
```

### Frontend can't connect to backend

**Check:**
1. Backend is running (Terminal 1 shows "Starting development server")
2. Backend URL is correct: http://127.0.0.1:8000
3. Frontend proxy in `vite.config.js` points to `http://127.0.0.1:8000`
4. Check browser console for errors

**Test backend directly:**
Open http://127.0.0.1:8000/api/events/ in browser - you should see JSON data or an empty array.

### Login fails

**Check:**
1. Backend is running
2. Admin user exists: `python manage.py createadmin`
3. Check browser console (F12) for API errors
4. Verify JWT token is stored in localStorage after login

---

## First Time Setup (Complete Checklist)

### Backend:
- [ ] MySQL installed and running
- [ ] Database `eventflow_db` created
- [ ] Virtual environment created: `python -m venv venv`
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] `.env` file created with MySQL password
- [ ] Migrations run: `python manage.py migrate`
- [ ] Admin user created: `python manage.py createadmin`

### Frontend:
- [ ] Node.js installed
- [ ] Dependencies installed: `npm install`
- [ ] `vite.config.js` has correct proxy settings

---

## Daily Startup (After First Setup)

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

That's it! Both servers will start and the app will be ready.

---

## Stopping the Servers

- **Backend:** Press `CTRL+C` in Terminal 1
- **Frontend:** Press `CTRL+C` in Terminal 2
