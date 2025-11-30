import prisma from "../config/database.js";
import bcrypt from "bcryptjs";

/**
 * Seed test data for development
 */
async function seedData() {
  try {
    console.log("🌱 Starting data seeding... from abdo ");

    // Create test admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@test.com" },
      update: {},
      create: {
        email: "admin@test.com",
        password: adminPassword,
        role: "ADMIN",
        isActive: true,
        admin: {
          create: {
            firstName: "Admin",
            lastName: "User",
            phone: "+966501234567",
          },
        },
      },
      include: { admin: true },
    });
    console.log("✅ Admin created:", admin.email);

    // Create test client
    const clientPassword = await bcrypt.hash("client123", 10);
    const clientUser = await prisma.user.upsert({
      where: { email: "client@test.com" },
      update: {},
      create: {
        email: "client@test.com",
        password: clientPassword,
        role: "CLIENT",
        isActive: true,
        phone: "+966501234568",
        client: {
          create: {
            firstName: "Ahmed",
            lastName: "Al-Saud",
            city: "Riyadh",
            country: "Saudi Arabia",
            sector: "Technology",
            companyName: "Tech Solutions Co.",
            companySize: "MEDIUM",
            accountType: "COMPANY",
          },
        },
      },
      include: { client: true },
    });
    console.log("✅ Client created:", clientUser.email);

    // Create test consultant
    const consultantPassword = await bcrypt.hash("consultant123", 10);
    const consultantUser = await prisma.user.upsert({
      where: { email: "consultant@test.com" },
      update: {},
      create: {
        email: "consultant@test.com",
        password: consultantPassword,
        role: "CONSULTANT",
        isActive: true,
        phone: "+966501234569",
        consultant: {
          create: {
            firstName: "Mohammed",
            lastName: "Al-Rashid",
            city: "Jeddah",
            country: "Saudi Arabia",
            academicDegree: "PhD",
            specialization: "Business Strategy",
            bio: "Experienced business consultant with 15+ years of experience",
            yearsOfExperience: 15,
            pricePerSession: 500,
            sessionDuration: 60,
            isVerified: true,
            isAvailable: true,
            acceptsSessions: true,
            bankName: "Al Rajhi Bank",
            bankAccount: "1234567890",
            IBAN: "SA1234567890123456789012",
          },
        },
      },
      include: { consultant: true },
    });
    console.log("✅ Consultant created:", consultantUser.email);

    // Create test services
    const services = [
      {
        title: "Business Strategy Consultation",
        titleAr: "استشارة استراتيجية الأعمال",
        description: "Comprehensive business strategy consultation",
        descriptionAr: "استشارة استراتيجية شاملة للأعمال",
        category: "ECONOMIC",
        price: 500,
        status: "ACTIVE",
        order: 1,
      },
      {
        title: "Financial Analysis",
        titleAr: "التحليل المالي",
        description: "Detailed financial analysis and reporting",
        descriptionAr: "تحليل مالي وتقارير مفصلة",
        category: "FINANCIAL_ACCOUNTING",
        price: 750,
        status: "ACTIVE",
        order: 2,
      },
      {
        title: "Market Research",
        titleAr: "البحث السوقي",
        description: "Comprehensive market research and analysis",
        descriptionAr: "بحث سوقي وتحليل شامل",
        category: "FIELD_SURVEY",
        price: 1000,
        status: "ACTIVE",
        order: 3,
      },
    ];

    for (const service of services) {
      await prisma.service.upsert({
        where: { title: service.title },
        update: service,
        create: service,
      });
    }
    console.log("✅ Services created");

    // Create a booking for testing video calls
    const service = await prisma.service.findFirst({
      where: { category: "ECONOMIC" },
    });

    if (service && clientUser.client && consultantUser.consultant) {
      // Check if booking already exists
      let booking = await prisma.booking.findFirst({
        where: {
          clientId: clientUser.client.id,
          consultantId: consultantUser.consultant.id,
          serviceId: service.id,
        },
      });

      if (!booking) {
        booking = await prisma.booking.create({
          data: {
            clientId: clientUser.client.id,
            consultantId: consultantUser.consultant.id,
            serviceId: service.id,
            bookingType: "VIDEO_CALL",
            status: "CONFIRMED",
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            duration: 60,
            notes: "Test booking for video call",
          },
        });
        console.log("✅ Test booking created:", booking.id);
      } else {
        console.log("✅ Test booking already exists:", booking.id);
      }

      // Create a session for the booking
      let session = await prisma.session.findUnique({
        where: { bookingId: booking.id },
      });

      if (!session) {
        session = await prisma.session.create({
          data: {
            bookingId: booking.id,
            sessionType: "video",
            status: "SCHEDULED",
            roomId: `room-${booking.id}-${Date.now()}`,
          },
        });
        console.log("✅ Test session created:", session.id);
      } else {
        console.log("✅ Test session already exists:", session.id);
      }

      // Create a payment for the booking (if not exists)
      let payment = await prisma.payment.findFirst({
        where: { bookingId: booking.id },
      });

      if (!payment) {
        payment = await prisma.payment.create({
          data: {
            bookingId: booking.id,
            clientId: clientUser.client.id,
            consultantId: consultantUser.consultant.id,
            amount: service.price || 500,
            currency: "SAR",
            method: "ONLINE",
            status: "COMPLETED",
            paidAt: new Date(),
            transactionId: `TXN-${Date.now()}`,
            invoiceNumber: `INV-${Date.now()}`,
          },
        });
        console.log("✅ Test payment created:", payment.id);
      } else {
        console.log("✅ Test payment already exists:", payment.id);
      }

      // Create earning for consultant (if not exists)
      let earning = await prisma.earning.findFirst({
        where: { paymentId: payment.id },
      });

      if (!earning) {
        const platformFee = (payment.amount * 0.15).toFixed(2);
        const netAmount = (payment.amount - parseFloat(platformFee)).toFixed(2);
        earning = await prisma.earning.create({
          data: {
            consultantId: consultantUser.consultant.id,
            paymentId: payment.id,
            amount: payment.amount,
            platformFee: parseFloat(platformFee),
            netAmount: parseFloat(netAmount),
            status: "available",
          },
        });
        console.log("✅ Test earning created:", earning.id);
      } else {
        console.log("✅ Test earning already exists:", earning.id);
      }
    }

    // Create support tickets for testing
    let supportTicket = await prisma.supportTicket.findFirst({
      where: {
        userId: clientUser.id,
        subject: "Test Support Ticket",
      },
    });

    if (!supportTicket) {
      supportTicket = await prisma.supportTicket.create({
        data: {
          userId: clientUser.id,
          ticketNumber: `TKT-${Date.now()}`,
          subject: "Test Support Ticket",
          subjectAr: "تذكرة دعم تجريبية",
          description:
            "This is a test support ticket for testing the support system",
          descriptionAr: "هذه تذكرة دعم تجريبية لاختبار نظام الدعم",
          category: "TECHNICAL",
          priority: "MEDIUM",
          status: "OPEN",
        },
      });
      console.log("✅ Test support ticket created:", supportTicket.id);
    } else {
      console.log("✅ Test support ticket already exists:", supportTicket.id);
    }

    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: clientUser.id,
          type: "BOOKING_CONFIRMED",
          title: "Booking Confirmed",
          titleAr: "تم تأكيد الحجز",
          message: "Your booking has been confirmed",
          messageAr: "تم تأكيد حجزك",
          link: "/client/bookings",
        },
        {
          userId: consultantUser.id,
          type: "NEW_BOOKING",
          title: "New Booking",
          titleAr: "حجز جديد",
          message: "You have a new booking",
          messageAr: "لديك حجز جديد",
          link: "/consultant/bookings",
        },
      ],
    });
    console.log("✅ Test notifications created");

    console.log("🎉 Data seeding completed successfully!");
    console.log("\n📝 Test Accounts:");
    console.log("Admin: admin@test.com / admin123");
    console.log("Client: client@test.com / client123");
    console.log("Consultant: consultant@test.com / consultant123");
    console.log("\n📋 Test Data Created:");
    console.log("- 3 Services");
    console.log("- 1 Booking (for video call testing)");
    console.log("- 1 Session (with video room)");
    console.log("- 1 Payment");
    console.log("- 1 Earning");
    console.log("- 1 Support Ticket");
    console.log("- 2 Notifications");
    console.log("\n🎥 Video Call Testing:");
    console.log("1. Login as client@test.com or consultant@test.com");
    console.log(
      `2. Go to /client/chat/${
        booking?.id || "BOOKING_ID"
      } or /consultant/chat/${booking?.id || "BOOKING_ID"}`
    );
    console.log('3. Click "Video Call" button');
    console.log("4. Video room will be generated and opened in new window");
    console.log(
      "\n💡 Note: Replace BOOKING_ID with actual booking ID from database"
    );
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export default seedData;
