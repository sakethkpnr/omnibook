# OmniBook Node.js Backend

## 1. Change DB name

Edit `.env`:

```
DB_NAME=eventflow_db    ← change to your database name
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

## 2. Create database and tables

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS eventflow_db;"
mysql -u root -p eventflow_db < init.sql
```

## 3. Install and start

```bash
cd backend-node
npm install
node create-admin.js
npm start
```

API runs at **http://localhost:8000**

## 4. Run frontend

```bash
cd frontend
npm run dev
```

Frontend proxies `/api` to `http://localhost:8000` (see `vite.config.js`).
