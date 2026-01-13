# Database Setup Instructions

## 📋 Prerequisites

1. **XAMPP** (or MySQL server) installed and running
2. **Node.js** 18+ installed
3. **npm** or **yarn** package manager

## 🚀 Step-by-Step Setup

### Step 1: Start MySQL in XAMPP

1. Open **XAMPP Control Panel**
2. Start **MySQL** service
3. Make sure MySQL is running on port **3306** (default)

### Step 2: Create Database

**Option A: Using XAMPP phpMyAdmin**
1. Open browser and go to: `http://localhost/phpmyadmin`
2. Click on **"New"** or **"Databases"** tab
3. Database name: `jadwa_consulting`
4. Collation: `utf8mb4_unicode_ci`
5. Click **"Create"**

**Option B: Using MySQL Command Line**
```sql
CREATE DATABASE jadwa_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Configure Environment Variables

1. Navigate to `backend` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   copy .env.example .env
   ```
   (On Windows PowerShell: `Copy-Item .env.example .env`)

3. Edit `.env` file and update `DATABASE_URL`:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/jadwa_consulting?schema=public"
   ```
   
   **Note:** 
   - If your MySQL has a password, use: `mysql://root:YOUR_PASSWORD@localhost:3306/jadwa_consulting?schema=public`
   - If using different port, change `3306` to your port

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 5: Generate Prisma Client

```bash
npm run prisma:generate
```

### Step 6: Run Database Migrations

This will create all tables in the database:

```bash
npm run prisma:migrate
```

When prompted, enter a migration name (e.g., `init`)

### Step 7: Seed Database (Optional but Recommended)

This will create initial data including:
- System settings
- Services
- **Super Admin user** (email: `admin@jadwa.com`, password: `Admin@123`)
- Sample consultant
- Sample client

```bash
npm run prisma:seed
```

## ✅ Verify Setup

### Check Database Connection

```bash
npm run prisma:studio
```

This opens Prisma Studio where you can view all tables and data.

### Test Admin Login

1. Start backend server:
   ```bash
   npm run dev
   ```

2. Use these credentials to login:
   - **Email:** `admin@jadwa.com`
   - **Password:** `Admin@123`
   - **Role:** Admin (automatically detected)

## 🔧 Troubleshooting

### Error: Can't connect to MySQL

**Solution:**
1. Make sure XAMPP MySQL is running
2. Check MySQL port (default: 3306)
3. Verify database name in `.env` matches created database
4. Check MySQL username/password in `.env`

### Error: Access denied for user

**Solution:**
1. Check MySQL root password in `.env`
2. If no password, use: `mysql://root:@localhost:3306/...`
3. If has password, use: `mysql://root:YOUR_PASSWORD@localhost:3306/...`

### Error: Database does not exist

**Solution:**
1. Create database manually in phpMyAdmin
2. Or run: `CREATE DATABASE jadwa_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

### Error: Prisma Client not generated

**Solution:**
```bash
npm run prisma:generate
```

## 📝 Default Admin Credentials

After seeding:
- **Email:** `admin@jadwa.com`
- **Password:** `Admin@123`
- **Role:** `SUPER_ADMIN`

## 🔐 Security Note

**IMPORTANT:** Change the admin password after first login!

## 📊 Database Structure

After migration, you'll have **33 tables**:
- Users, Clients, Consultants, Admins
- Services, Bookings, Sessions
- Payments, Reports, Notifications
- And many more...

See `prisma/schema.prisma` for complete structure.

## 🎯 Next Steps

1. ✅ Database created
2. ✅ Tables migrated
3. ✅ Data seeded
4. ✅ Admin user created
5. 🚀 Start backend: `npm run dev`
6. 🚀 Start frontend: `cd ../marketpro && npm run dev`
7. 🔐 Login with admin credentials

