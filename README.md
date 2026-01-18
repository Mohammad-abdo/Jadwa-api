# Jadwa Consulting Platform - Backend API

Backend API server for Jadwa Consulting Platform built with Node.js, Express, and Prisma ORM.

## 📋 Features

- RESTful API architecture
- Prisma ORM with MySQL
- JWT authentication
- Role-based access control (RBAC)
- File upload support
- Payment gateway integration
- Real-time notifications
- Comprehensive error handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up database:**
```bash
# Create database
mysql -u root -p
CREATE DATABASE jadwa_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

4. **Start development server:**
```bash
npm run dev
```

The API will be available at `https://jadwa.developteam.site`

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.js            # Seed data
│   └── migrations/        # Database migrations
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
├── uploads/               # Uploaded files
├── .env                   # Environment variables
├── .env.example           # Environment template
└── package.json
```

## 🔌 API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation.

### Main Endpoints

**Authentication** (`/api/auth`)
- Register, Login, Profile Management, Password Change

**Services** (`/api/services`)
- CRUD operations for services (Admin only for create/update/delete)

**Bookings** (`/api/bookings`)
- Create, view, update, cancel bookings
- Rate completed bookings

**Consultants** (`/api/consultants`)
- Browse consultants, view profiles, check availability
- Update profile and set availability (Consultant only)

**Payments** (`/api/payments`)
- Create payments, view payment history
- Update payment status (webhook support)

**Reports** (`/api/reports`)
- Upload reports (Consultant)
- View and download reports
- Review reports (Admin)

**Messages** (`/api/messages`)
- Send and receive messages in sessions
- Mark messages as read

**Sessions** (`/api/sessions`)
- Start/end consultation sessions
- View session details

**Notifications** (`/api/notifications`)
- Get notifications, mark as read, delete

**Admin** (`/api/admin`)
- Dashboard statistics
- Manage clients and consultants
- User management

**Articles** (`/api/articles`)
- Blog/article management (Admin)
- Public article viewing

**CMS** (`/api/cms`)
- Static page management (Admin)
- Public page viewing

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Token Structure:**
- Access Token: Short-lived (7 days)
- Refresh Token: Long-lived (30 days)

## 📝 Environment Variables

See `.env.example` for all available environment variables.

## 🗄️ Database

The project uses Prisma ORM with MySQL. See `prisma/README.md` for detailed database documentation.

### Common Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed

# Reset database (WARNING: Deletes all data)
npm run prisma:reset
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📦 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update database URL for production
3. Set secure JWT secrets
4. Configure CORS for production domain
5. Set up SSL/TLS
6. Configure reverse proxy (nginx)
7. Set up process manager (PM2)

```bash
# Build (if needed)
npm run build

# Start production server
npm start
```

## 🔒 Security Best Practices

- Use environment variables for secrets
- Enable HTTPS in production
- Implement rate limiting
- Validate all inputs
- Use parameterized queries (Prisma handles this)
- Implement CORS properly
- Regular security updates

## 📚 Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Private - All rights reserved
