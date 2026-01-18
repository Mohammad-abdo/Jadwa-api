# Jadwa Consulting Platform - API Documentation

## Base URL
```
https://jadwa.developteam.siteapi
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Authentication (`/api/auth`)

#### Register
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "client@example.com",
    "password": "Password123",
    "role": "CLIENT",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+966501234567",
    "city": "Riyadh",
    "sector": "Technology"
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "client@example.com",
    "password": "Password123"
  }
  ```

#### Get Profile
- **GET** `/api/auth/profile`
- **Auth:** Required

#### Update Profile
- **PUT** `/api/auth/profile`
- **Auth:** Required

#### Change Password
- **PUT** `/api/auth/change-password`
- **Auth:** Required
- **Body:**
  ```json
  {
    "currentPassword": "OldPassword123",
    "newPassword": "NewPassword123"
  }
  ```

---

### Services (`/api/services`)

#### Get All Services
- **GET** `/api/services`
- **Query Params:** `category`, `status`, `search`

#### Get Service by ID
- **GET** `/api/services/:id`

#### Create Service (Admin)
- **POST** `/api/services`
- **Auth:** Admin/Super Admin

#### Update Service (Admin)
- **PUT** `/api/services/:id`
- **Auth:** Admin/Super Admin

#### Delete Service (Admin)
- **DELETE** `/api/services/:id`
- **Auth:** Admin/Super Admin

---

### Bookings (`/api/bookings`)

#### Get Bookings
- **GET** `/api/bookings`
- **Auth:** Required
- **Query Params:** `status`, `type`

#### Get Booking by ID
- **GET** `/api/bookings/:id`
- **Auth:** Required

#### Create Booking (Client)
- **POST** `/api/bookings`
- **Auth:** Client
- **Body:**
  ```json
  {
    "consultantId": "uuid",
    "serviceId": "uuid",
    "bookingType": "VIDEO_CALL",
    "scheduledAt": "2024-01-15T10:00:00Z",
    "selectedTimeSlot": "10:00-11:00",
    "duration": 60,
    "price": 500,
    "clientNotes": "Optional notes"
  }
  ```

#### Update Booking Status
- **PUT** `/api/bookings/:id/status`
- **Auth:** Consultant/Admin
- **Body:**
  ```json
  {
    "status": "CONFIRMED",
    "consultantNotes": "Optional notes"
  }
  ```

#### Cancel Booking
- **PUT** `/api/bookings/:id/cancel`
- **Auth:** Required

#### Rate Booking (Client)
- **POST** `/api/bookings/:id/rate`
- **Auth:** Client
- **Body:**
  ```json
  {
    "rating": 5,
    "comment": "Great consultation!"
  }
  ```

---

### Consultants (`/api/consultants`)

#### Get All Consultants
- **GET** `/api/consultants`
- **Query Params:** `search`, `specialization`, `minRating`, `isAvailable`

#### Get Consultant by ID
- **GET** `/api/consultants/:id`

#### Get Consultant Availability
- **GET** `/api/consultants/:id/availability`
- **Query Params:** `date`

#### Update Profile (Consultant)
- **PUT** `/api/consultants/profile`
- **Auth:** Consultant

#### Set Availability (Consultant)
- **PUT** `/api/consultants/availability`
- **Auth:** Consultant
- **Body:**
  ```json
  {
    "slots": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00",
        "isAvailable": true
      }
    ]
  }
  ```

---

### Payments (`/api/payments`)

#### Get Payments
- **GET** `/api/payments`
- **Auth:** Required
- **Query Params:** `status`

#### Get Payment by ID
- **GET** `/api/payments/:id`
- **Auth:** Required

#### Create Payment
- **POST** `/api/payments`
- **Auth:** Required
- **Body:**
  ```json
  {
    "bookingId": "uuid",
    "method": "CREDIT_CARD",
    "transactionId": "txn_123",
    "gatewayResponse": {}
  }
  ```

#### Update Payment Status
- **PUT** `/api/payments/:id/status`
- **Body:**
  ```json
  {
    "status": "COMPLETED",
    "transactionId": "txn_123"
  }
  ```

---

### Reports (`/api/reports`)

#### Get Reports
- **GET** `/api/reports`
- **Auth:** Required
- **Query Params:** `status`

#### Get Report by ID
- **GET** `/api/reports/:id`
- **Auth:** Required

#### Upload Report (Consultant)
- **POST** `/api/reports`
- **Auth:** Consultant
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `bookingId`: string
  - `title`: string
  - `reportType`: string
  - `summary`: string
  - `pdf`: file
  - `word`: file (optional)

#### Review Report (Admin)
- **PUT** `/api/reports/:id/review`
- **Auth:** Admin/Super Admin
- **Body:**
  ```json
  {
    "status": "APPROVED",
    "adminNotes": "Optional notes"
  }
  ```

---

### Messages (`/api/messages`)

#### Get Messages
- **GET** `/api/messages/session/:sessionId`
- **Auth:** Required

#### Send Message
- **POST** `/api/messages/session/:sessionId`
- **Auth:** Required
- **Body:**
  ```json
  {
    "content": "Hello!",
    "messageType": "text",
    "attachments": []
  }
  ```

#### Mark Messages as Read
- **PUT** `/api/messages/session/:sessionId/read`
- **Auth:** Required

---

### Sessions (`/api/sessions`)

#### Get Session by Booking
- **GET** `/api/sessions/booking/:bookingId`
- **Auth:** Required

#### Start Session
- **POST** `/api/sessions/booking/:bookingId/start`
- **Auth:** Required
- **Body:**
  ```json
  {
    "roomId": "room_123"
  }
  ```

#### End Session
- **POST** `/api/sessions/booking/:bookingId/end`
- **Auth:** Required

---

### Notifications (`/api/notifications`)

#### Get Notifications
- **GET** `/api/notifications`
- **Auth:** Required
- **Query Params:** `isRead`, `type`, `limit`

#### Mark as Read
- **PUT** `/api/notifications/:id/read`
- **Auth:** Required

#### Mark All as Read
- **PUT** `/api/notifications/read-all`
- **Auth:** Required

#### Delete Notification
- **DELETE** `/api/notifications/:id`
- **Auth:** Required

---

### Admin (`/api/admin`)

#### Get Dashboard Stats
- **GET** `/api/admin/dashboard/stats`
- **Auth:** Admin/Super Admin

#### Get Clients
- **GET** `/api/admin/clients`
- **Auth:** Admin/Super Admin
- **Query Params:** `search`, `status`

#### Get Consultants
- **GET** `/api/admin/consultants`
- **Auth:** Admin/Super Admin
- **Query Params:** `search`, `status`

#### Review Consultant
- **PUT** `/api/admin/consultants/:id/review`
- **Auth:** Admin/Super Admin
- **Body:**
  ```json
  {
    "action": "approve"
  }
  ```

#### Toggle User Status
- **PUT** `/api/admin/users/:userId/status`
- **Auth:** Admin/Super Admin
- **Body:**
  ```json
  {
    "isActive": true
  }
  ```

#### Reset User Password
- **PUT** `/api/admin/users/:userId/reset-password`
- **Auth:** Admin/Super Admin
- **Body:**
  ```json
  {
    "newPassword": "NewPassword123"
  }
  ```

---

### Articles (`/api/articles`)

#### Get All Articles
- **GET** `/api/articles`
- **Query Params:** `status`, `category`, `search`

#### Get Article by Slug
- **GET** `/api/articles/:slug`

#### Create Article (Admin)
- **POST** `/api/articles`
- **Auth:** Admin/Super Admin

#### Update Article (Admin)
- **PUT** `/api/articles/:id`
- **Auth:** Admin/Super Admin

#### Delete Article (Admin)
- **DELETE** `/api/articles/:id`
- **Auth:** Admin/Super Admin

---

### CMS (`/api/cms`)

#### Get All Pages
- **GET** `/api/cms`
- **Query Params:** `isPublished`

#### Get Page by Slug
- **GET** `/api/cms/:slug`

#### Create Page (Admin)
- **POST** `/api/cms`
- **Auth:** Admin/Super Admin

#### Update Page (Admin)
- **PUT** `/api/cms/:id`
- **Auth:** Admin/Super Admin

#### Delete Page (Admin)
- **DELETE** `/api/cms/:id`
- **Auth:** Admin/Super Admin

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "details": [] // Optional, for validation errors
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Enums

### UserRole
- `CLIENT`
- `CONSULTANT`
- `ADMIN`
- `SUPER_ADMIN`
- `ANALYST`
- `SUPPORT`
- `FINANCE`

### BookingType
- `VIDEO_CALL`
- `CHAT`
- `ECONOMIC_STUDY`
- `FINANCIAL_ANALYSIS`
- `FEASIBILITY_STUDY`
- `CONSULTATION`
- `REPORT_REQUEST`

### BookingStatus
- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `COMPLETED`
- `REJECTED`

### PaymentStatus
- `PENDING`
- `COMPLETED`
- `FAILED`
- `REFUNDED`

### PaymentMethod
- `CREDIT_CARD`
- `APPLE_PAY`
- `MADA`
- `BANK_TRANSFER`
- `STC_PAY`

