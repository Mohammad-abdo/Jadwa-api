# Jadwa Consulting Platform - Database Schema Documentation

## 📋 Overview

This document describes the complete database schema for the Jadwa Consulting Platform, built with Prisma ORM and MySQL.

## 🗂️ Database Structure

### Entity Relationship Diagram (Text-based)

See `ERD.md` for detailed ERD.

## 📊 Models Explanation

### 1. User & Authentication

**User Model**
- Central authentication model
- Supports multiple roles (CLIENT, CONSULTANT, ADMIN, etc.)
- Email verification and phone verification
- One-to-one relations with Client, Consultant, and Admin

**Client Model**
- Extended user profile for clients
- Stores personal information, city, sector
- Notification preferences (Email, App, WhatsApp)
- One-to-many with Bookings, Reports, FeasibilityStudies

**Consultant Model**
- Extended user profile for consultants
- Academic credentials, specialization, bio
- Rating system (calculated from bookings)
- Price per session, earnings tracking
- One-to-many with Bookings, AvailabilitySlots, Reports, Earnings

**Admin Model**
- Admin user profiles with role-based permissions
- Supports SUPER_ADMIN, ANALYST, SUPPORT, FINANCE roles
- JSON-based permissions system

### 2. Services Module

**Service Model**
- All platform services (Economic, Administrative, Financial, etc.)
- Bilingual support (title, description in Arabic)
- Category-based organization
- Price, icon, status management
- Many-to-one with Bookings

### 3. Booking System

**Booking Model**
- Core booking/consultation entity
- Links Client, Consultant, and Service
- Multiple booking types (Video, Chat, Study, Analysis)
- Status workflow: PENDING → CONFIRMED → COMPLETED
- Payment integration
- Rating and feedback system

**AvailabilitySlot Model**
- Consultant availability calendar
- Day of week + time slots
- Flexible scheduling system

### 4. Sessions & Communication

**Session Model**
- Chat and video session management
- Room ID for video calls (Zoom/Twilio integration)
- Session logs and duration tracking
- One-to-one with Booking
- One-to-many with Messages

**Message Model**
- Real-time messaging system
- Supports text, files, images, videos
- Read receipts
- Attachments as JSON array

### 5. Reports & Deliverables

**Report Model**
- Post-consultation reports
- Multiple formats (PDF, Word, Excel)
- Admin review workflow
- Status: DRAFT → UNDER_REVIEW → APPROVED

**FeasibilityStudy Model**
- Comprehensive feasibility studies
- Market, financial, legal analysis
- Risk assessment
- Revenue/cost projections
- File attachments

### 6. Payments & Financials

**Payment Model**
- Payment transactions
- Multiple payment methods (Card, Mada, Apple Pay, etc.)
- Gateway integration (transaction IDs)
- Invoice generation
- Status tracking

**Earning Model**
- Consultant earnings from payments
- Platform fee calculation
- Net amount after commission
- Links to Payment and Consultant

**Withdrawal Model**
- Consultant withdrawal requests
- Bank account details
- Admin approval workflow
- Status: PENDING → APPROVED → COMPLETED

### 7. Notifications

**Notification Model**
- System-wide notifications
- Multiple notification types
- Read/unread tracking
- Metadata for rich notifications
- User-specific notifications

### 8. Content Management

**Article Model**
- Blog posts and articles
- Bilingual content support
- SEO fields (slug, meta tags)
- Category and tags
- Publishing workflow

**CMSPage Model**
- Static pages (About, Terms, Privacy)
- Bilingual content
- SEO optimization
- Publishing control

### 9. Smart Platform Features

**EconomicIndicator Model**
- Economic data and indicators
- Time-series data support
- Category organization
- Source tracking

**Dashboard Model**
- Customizable dashboards
- JSON-based configuration
- Public/private dashboards
- User-specific or shared

**Dataset Model**
- Data file management
- CSV, Excel, JSON support
- Download tracking
- Public/private access

**SystemSetting Model**
- Platform configuration
- Key-value storage
- Category organization
- Settings management

## 🔗 Relationships

### One-to-One (1:1)
- User ↔ Client
- User ↔ Consultant
- User ↔ Admin
- Booking ↔ Session
- Booking ↔ Report
- Booking ↔ Payment

### One-to-Many (1:N)
- User → Bookings (as client)
- Consultant → Bookings
- Consultant → AvailabilitySlots
- Consultant → Reports
- Consultant → Earnings
- Consultant → Withdrawals
- Client → FeasibilityStudies
- Booking → Messages (via Session)
- User → Notifications
- User → Articles

### Many-to-Many (M:N)
- Implemented through junction tables or JSON arrays where appropriate

## 📈 Indexes

### Performance Indexes
- **User**: email, role
- **Client**: userId
- **Consultant**: userId, isAvailable, rating
- **Booking**: clientId, consultantId, status, scheduledAt, paymentStatus
- **Session**: bookingId, status, roomId
- **Message**: sessionId, senderId, receiverId, isRead
- **Payment**: clientId, consultantId, status, transactionId, invoiceNumber
- **Notification**: userId, isRead, type, createdAt
- **Article**: slug, status, category, publishedAt

## 🔐 Security Considerations

1. **Password Hashing**: Use bcrypt or Argon2 (not stored in schema)
2. **JWT Tokens**: Stored in application layer, not database
3. **Role-Based Access**: Enforced through UserRole enum
4. **Data Validation**: Prisma validates at ORM level
5. **Soft Deletes**: Consider adding `deletedAt` for critical models

## 🌱 Seed Data Suggestions

### Initial Data to Seed:

1. **System Settings**
   - Platform name, email, phone
   - Payment gateway credentials
   - Email/SMS provider settings
   - Platform commission rate

2. **Services**
   - Economic Consultations
   - Feasibility Studies
   - Financial Analysis
   - Administrative Services
   - Field & Survey Services
   - Digital Customer Services

3. **CMS Pages**
   - About Us
   - Terms & Conditions
   - Privacy Policy
   - Contact Us

4. **Super Admin User**
   - Default admin account
   - Full permissions

5. **Sample Categories**
   - Service categories
   - Article categories
   - Report types

## 🚀 Migration Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## 📝 Environment Variables

Create a `.env` file:

```env
DATABASE_URL="mysql://user:password@localhost:3306/jadwa_platform"
```

## 🔄 Future Enhancements

1. **Audit Logs**: Add audit trail for sensitive operations
2. **File Storage**: Integrate with S3/Cloud Storage
3. **Caching**: Redis for sessions and frequently accessed data
4. **Search**: Full-text search for articles and reports
5. **Analytics**: User behavior tracking
6. **Multi-tenancy**: If needed for white-label solutions

## 📊 Database Statistics

- **Total Models**: 25
- **Total Enums**: 12
- **Total Relations**: 40+
- **Indexes**: 50+

## ✅ Checklist for Production

- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Set up monitoring and alerts
- [ ] Review and optimize indexes
- [ ] Set up read replicas (if needed)
- [ ] Configure SSL/TLS for database connections
- [ ] Set up database migrations CI/CD
- [ ] Review and test all constraints
- [ ] Performance testing
- [ ] Security audit

