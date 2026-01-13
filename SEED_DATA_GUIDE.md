# Seed Data Guide

## How to Run Seed Data

### Step 1: Fix Prisma Generate Error (if needed)

If you get `EPERM` error when running `npx prisma generate`:

1. **Stop the backend server** (if running)
2. Close any processes using Prisma (VS Code, terminals)
3. Run: `npx prisma generate`
4. If still fails, run PowerShell/CMD as Administrator

See `FIX_PRISMA_GENERATE.md` for more details.

### Step 2: Run Seed Data

```bash
cd backend
npm run seed:data
```

Or directly:
```bash
node src/scripts/seedData.js
```

## What Gets Created

### Users
- **Admin**: `admin@test.com` / `admin123`
- **Client**: `client@test.com` / `client123`
- **Consultant**: `consultant@test.com` / `consultant123`

### Services
- Business Strategy Consultation (500 SAR)
- Financial Analysis (750 SAR)
- Market Research (1000 SAR)

### Test Data
- 1 Booking (VIDEO_CALL type, CONFIRMED status)
- 1 Session (with video room ID)
- 1 Payment (COMPLETED)
- 1 Earning (for consultant)
- 1 Support Ticket
- 2 Notifications

## Testing Video Call

### Steps:
1. **Login as Client**: `client@test.com` / `client123`
2. **Go to Chat**: Navigate to `/client/chat/test-booking-1` (or use booking ID from database)
3. **Start Video Call**: Click "Video Call" button
4. **Video Room**: A new window will open with the video call URL

### Alternative:
1. **Login as Consultant**: `consultant@test.com` / `consultant123`
2. **Go to Chat**: Navigate to `/consultant/chat/test-booking-1`
3. **Start Video Call**: Click "Video Call" button

### Note:
The video call URL uses `VIDEO_SERVICE_URL` environment variable or defaults to `https://meet.jadwa.com`. 
In production, integrate with Zoom/Twilio API for actual video calls.

## Re-running Seed Data

The script uses `upsert` and `findFirst` to avoid duplicates. You can safely run it multiple times.

## Troubleshooting

- **Booking not found**: Make sure seed data ran successfully
- **Video call not working**: Check that session has `roomId` and `status` is not `COMPLETED`
- **Permission errors**: Make sure backend server is stopped before running seed

