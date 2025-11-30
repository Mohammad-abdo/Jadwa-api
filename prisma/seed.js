// Comprehensive Seed data for Jadwa Consulting Platform
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive seed...");

  // Hash password helper
  const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
  };

  // 1. Create Comprehensive System Settings
  console.log("📝 Creating system settings...");
  const systemSettings = [
    {
      key: "platformName",
      value: "Jadwa Consulting Platform",
      description: "Platform name",
      category: "general",
    },
    {
      key: "platformEmail",
      value: "info@jadwa.com",
      description: "Platform contact email",
      category: "general",
    },
    {
      key: "platformPhone",
      value: "+966 12 345 6789",
      description: "Platform contact phone",
      category: "general",
    },
    {
      key: "platformAddress",
      value: "Riyadh, Saudi Arabia",
      description: "Platform address",
      category: "general",
    },
    {
      key: "enableNotifications",
      value: "true",
      description: "Enable notifications",
      category: "general",
    },
    {
      key: "enableEmailNotifications",
      value: "true",
      description: "Enable email notifications",
      category: "general",
    },
    {
      key: "paymentGateway",
      value: "tap",
      description: "Payment gateway",
      category: "payment",
    },
    {
      key: "paymentApiKey",
      value: "",
      description: "Payment API key",
      category: "payment",
    },
    {
      key: "paymentSecretKey",
      value: "",
      description: "Payment secret key",
      category: "payment",
    },
    {
      key: "commissionRate",
      value: "15",
      description: "Commission rate percentage",
      category: "payment",
    },
    {
      key: "enableAutoPayout",
      value: "false",
      description: "Enable auto payout",
      category: "payment",
    },
    {
      key: "videoService",
      value: "zoom",
      description: "Video service",
      category: "integration",
    },
    {
      key: "videoApiKey",
      value: "",
      description: "Video API key",
      category: "integration",
    },
    {
      key: "emailService",
      value: "smtp",
      description: "Email service",
      category: "integration",
    },
    {
      key: "smtpHost",
      value: "",
      description: "SMTP host",
      category: "integration",
    },
    {
      key: "smtpPort",
      value: "587",
      description: "SMTP port",
      category: "integration",
    },
    {
      key: "smtpUser",
      value: "",
      description: "SMTP username",
      category: "integration",
    },
    {
      key: "smtpPassword",
      value: "",
      description: "SMTP password",
      category: "integration",
    },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }

  // 2. Create Comprehensive Services
  console.log("🛠️ Creating comprehensive services...");
  const services = [
    // ========== الخدمات الاقتصادية (Economic Services) ==========
    {
      title: "General Economic Consultations",
      titleAr: "الاستشارات الاقتصادية العامة",
      description: "Market and sector analysis, investment opportunity studies, and economic performance evaluation for projects. Includes analysis of markets and sectors, investment opportunity studies, and project economic performance assessment.",
      descriptionAr: "تحليل الأسواق والقطاعات، دراسات الفرص الاستثمارية، وتقييم الأداء الاقتصادي للمشاريع. يشمل تحليل الأسواق والقطاعات، دراسات الفرص الاستثمارية، وتقييم الأداء الاقتصادي للمشاريع.",
      category: "ECONOMIC",
      targetAudience: "Companies, Individuals, Government Entities",
      type: "Consultation",
      price: 500.0,
      status: "ACTIVE",
      order: 1,
    },
    {
      title: "Quantitative Economic Analysis (Econometric Analysis)",
      titleAr: "التحليل الاقتصادي الكمي (Econometric Analysis)",
      description: "Building econometric models (ARDL, VECM, GARCH, SARIMAX), forecasting economic indicators, and analyzing relationships between economic variables (GDP, Inflation, Unemployment).",
      descriptionAr: "بناء نماذج قياسية (ARDL – VECM – GARCH – SARIMAX)، التنبؤ بالمؤشرات الاقتصادية، وتحليل العلاقة بين المتغيرات الاقتصادية (الناتج – التضخم – البطالة).",
      category: "ECONOMIC",
      targetAudience: "Researchers, Government Entities, Financial Institutions",
      type: "Analysis",
      price: 8000.0,
      status: "ACTIVE",
      order: 2,
    },
    {
      title: "Economic Feasibility Analysis for Projects",
      titleAr: "تحليل الجدوى الاقتصادية للمشاريع",
      description: "Supply and demand analysis, economic returns estimation, and risk and uncertainty analysis for projects.",
      descriptionAr: "تحليل العرض والطلب، تقدير العوائد الاقتصادية، وتحليل المخاطر وعدم اليقين.",
      category: "ECONOMIC",
      targetAudience: "Investors, Entrepreneurs",
      type: "Study",
      price: 6000.0,
      status: "ACTIVE",
      order: 3,
    },
    {
      title: "Regional and Local Economy Studies",
      titleAr: "دراسات الاقتصاد الإقليمي والمحلي",
      description: "Assessment of development project impacts, analysis of city and regional economies (e.g., Makkah), and regional development indicators.",
      descriptionAr: "تقييم تأثير المشاريع التنموية، تحليل اقتصاد المدن والمناطق (مثل مكة المكرمة)، ومؤشرات التنمية الإقليمية.",
      category: "ECONOMIC",
      targetAudience: "Government Entities, Chambers of Commerce, Investors",
      type: "Study",
      price: 7000.0,
      status: "ACTIVE",
      order: 4,
    },
    // ========== الخدمات الإدارية (Administrative Services) ==========
    {
      title: "Organizational and Administrative Consultations",
      titleAr: "الاستشارات التنظيمية والإدارية",
      description: "Organizational structure development, work environment and process improvement, and administrative transformation planning.",
      descriptionAr: "تطوير الهياكل التنظيمية، تحسين بيئة العمل وسير العمليات، وبناء خطط التحول الإداري.",
      category: "ADMINISTRATIVE",
      targetAudience: "Companies, Government Entities",
      type: "Consultation",
      price: 400.0,
      status: "ACTIVE",
      order: 5,
    },
    {
      title: "Business Process Re-engineering (BPR)",
      titleAr: "إعادة هندسة العمليات (Business Process Re-engineering)",
      description: "Operational process analysis, waste and deficiency identification, and process flow mapping design.",
      descriptionAr: "تحليل العمليات التشغيلية، تحديد الهدر والقصور، وتصميم خرائط تدفق الإجراءات.",
      category: "ADMINISTRATIVE",
      targetAudience: "Service Entities, Private Sector",
      type: "Consultation",
      price: 5000.0,
      status: "ACTIVE",
      order: 6,
    },
    {
      title: "Performance Management and Strategic Planning",
      titleAr: "إدارة الأداء والتخطيط الاستراتيجي",
      description: "Strategic plan formulation, performance indicators (KPI & OKR), and execution efficiency evaluation and monitoring.",
      descriptionAr: "صياغة الخطط الاستراتيجية، مؤشرات الأداء KPI & OKR، وتقييم كفاءة التنفيذ والمتابعة.",
      category: "ADMINISTRATIVE",
      targetAudience: "Institutions, Government Entities",
      type: "Consultation",
      price: 4500.0,
      status: "ACTIVE",
      order: 7,
    },
    {
      title: "Human Resources Management and Institutional Development",
      titleAr: "إدارة الموارد البشرية والتطوير المؤسسي",
      description: "Employment policies and structuring, incentive and retention plans for personnel, and leadership and talent development.",
      descriptionAr: "سياسات التوظيف والهيكلة، خطط التحفيز والاحتفاظ بالكوادر، وتطوير القيادات والمواهب.",
      category: "ADMINISTRATIVE",
      targetAudience: "Companies and Institutions",
      type: "Consultation",
      price: 3500.0,
      status: "ACTIVE",
      order: 8,
    },
    // ========== الخدمات المالية والمحاسبية (Financial & Accounting Services) ==========
    {
      title: "Financial Feasibility Studies",
      titleAr: "دراسات الجدوى المالية",
      description: "Financial analysis and cash flows, feasibility indicators calculation (NPV, IRR, Payback), and financial sensitivity analysis.",
      descriptionAr: "التحليل المالي والتدفقات النقدية، احتساب مؤشرات الجدوى (NPV – IRR – Payback)، وتحليل الحساسية المالية.",
      category: "FINANCIAL_ACCOUNTING",
      targetAudience: "Investors, Banks, Companies",
      type: "Study",
      price: 5000.0,
      status: "ACTIVE",
      order: 9,
    },
    {
      title: "Financial Analysis and Financial Planning for Companies",
      titleAr: "التحليل المالي والتخطيط المالي للشركات",
      description: "Financial position evaluation, accounting statements analysis, and project financing strategies development.",
      descriptionAr: "تقييم المراكز المالية، تحليل القوائم المحاسبية، ووضع استراتيجيات تمويل المشاريع.",
      category: "FINANCIAL_ACCOUNTING",
      targetAudience: "Private Sector, Investors",
      type: "Analysis",
      price: 3000.0,
      status: "ACTIVE",
      order: 10,
    },
    {
      title: "Financial Risk Management",
      titleAr: "إدارة المخاطر المالية",
      description: "Market and operational risk measurement, risk mitigation policy design, and financial compliance reports.",
      descriptionAr: "قياس المخاطر السوقية والتشغيلية، تصميم سياسات الحد من المخاطر، وتقارير الالتزام المالي.",
      category: "FINANCIAL_ACCOUNTING",
      targetAudience: "Companies, Financial Institutions",
      type: "Consultation",
      price: 4000.0,
      status: "ACTIVE",
      order: 11,
    },
    // ========== خدمات التحليل والتقارير (Analysis & Reports Services) ==========
    {
      title: "Periodic Economic Reports",
      titleAr: "التقارير الاقتصادية الدورية",
      description: "Monthly and quarterly reports on the Saudi economy, sector performance reports (Real Estate, Transportation, Trade, Tourism), and special reports for Makkah (Hajj and Umrah economy).",
      descriptionAr: "تقارير شهرية وفصلية عن الاقتصاد السعودي، تقارير أداء القطاعات (العقار – النقل – التجارة – السياحة)، وتقارير خاصة لمدينة مكة المكرمة (اقتصاد الحج والعمرة).",
      category: "ANALYSIS_REPORTS",
      targetAudience: "Government Entities, Investors",
      type: "Report",
      price: 2000.0,
      status: "ACTIVE",
      order: 12,
    },
    {
      title: "Econometric Analysis and Economic Intelligence",
      titleAr: "التحليل القياسي والذكاء الاقتصادي",
      description: "Building smart economic indicators, interactive dashboards, and AI-powered predictive reports.",
      descriptionAr: "بناء مؤشرات اقتصادية ذكية، لوحات بيانات تفاعلية (Dashboards)، وتقارير تنبؤية معتمدة على الذكاء الاصطناعي.",
      category: "ANALYSIS_REPORTS",
      targetAudience: "Decision Makers, Researchers",
      type: "Analysis",
      price: 10000.0,
      status: "ACTIVE",
      order: 13,
    },
    {
      title: "Economic Bulletins and Summaries",
      titleAr: "النشرات والموجزات الاقتصادية",
      description: "Weekly market summaries, local and global economic trend reports, and economic policy bulletins.",
      descriptionAr: "موجز السوق الأسبوعي، تقارير الاتجاهات الاقتصادية المحلية والعالمية، ونشرات السياسات الاقتصادية.",
      category: "ANALYSIS_REPORTS",
      targetAudience: "General Clients, Economics Enthusiasts",
      type: "Report",
      price: 500.0,
      status: "ACTIVE",
      order: 14,
    },
    // ========== الخدمات الميدانية والاستطلاعية (Field & Survey Services) ==========
    {
      title: "Field Studies and Data Collection",
      titleAr: "الدراسات الميدانية وجمع البيانات",
      description: "Economic questionnaires and market opinion surveys, statistical sample analysis, and field economic database preparation.",
      descriptionAr: "استبيانات اقتصادية واستطلاعات رأي السوق، تحليل العينة الإحصائية، وإعداد قواعد بيانات اقتصادية ميدانية.",
      category: "FIELD_SURVEY",
      targetAudience: "Companies, Government Entities",
      type: "Study",
      price: 4000.0,
      status: "ACTIVE",
      order: 15,
    },
    {
      title: "Field Advisory Visits",
      titleAr: "الزيارات الاستشارية الميدانية",
      description: "On-ground project evaluation, detailed reports for small and medium enterprises.",
      descriptionAr: "تقييم المشروعات على أرض الواقع، تقارير تفصيلية للمنشآت الصغيرة والمتوسطة.",
      category: "FIELD_SURVEY",
      targetAudience: "Institutions and Small and Medium Enterprises",
      type: "Consultation",
      price: 2500.0,
      status: "ACTIVE",
      order: 16,
    },
    // ========== خدمات العملاء الرقمية (Digital Customer Services) ==========
    {
      title: "Instant Consultations via Chat or Video",
      titleAr: "الاستشارات الفورية عبر الشات أو الفيديو",
      description: "Real-time consultations with specialized consultants through chat or video calls.",
      descriptionAr: "استشارات فورية مع مستشارين متخصصين عبر الشات أو الفيديو.",
      category: "DIGITAL_CUSTOMER",
      targetAudience: "All Clients",
      type: "Consultation",
      price: 300.0,
      status: "ACTIVE",
      order: 17,
    },
    {
      title: "Appointment Booking and Session Management",
      titleAr: "حجز المواعيد وإدارة الجلسات",
      description: "Integrated appointment system with calendar and specialized consultants.",
      descriptionAr: "نظام مواعيد متكامل مع تقويم واستشاريين متخصصين.",
      category: "DIGITAL_CUSTOMER",
      targetAudience: "Individuals, Companies",
      type: "Service",
      price: 0.0,
      status: "ACTIVE",
      order: 18,
    },
    {
      title: "Download Reports and Studies",
      titleAr: "تحميل التقارير والدراسات",
      description: "Direct access to client reports and studies in their account.",
      descriptionAr: "وصول مباشر لتقارير ودراسات العميل في حسابه.",
      category: "DIGITAL_CUSTOMER",
      targetAudience: "Registered Clients",
      type: "Service",
      price: 0.0,
      status: "ACTIVE",
      order: 19,
    },
    {
      title: "Electronic Payment and Invoice Issuance",
      titleAr: "الدفع الإلكتروني وإصدار الفواتير",
      description: "Secure electronic payment and automatic invoice generation.",
      descriptionAr: "تسديد إلكتروني آمن وتوليد فواتير تلقائية.",
      category: "DIGITAL_CUSTOMER",
      targetAudience: "All Clients",
      type: "Service",
      price: 0.0,
      status: "ACTIVE",
      order: 20,
    },
    // ========== دراسات الجدوى المتكاملة (Integrated Feasibility Studies) ==========
    {
      title: "Market Feasibility Study",
      titleAr: "دراسة الجدوى السوقية",
      description: "Market and competitor analysis, demand and supply estimation, and target market share identification.",
      descriptionAr: "تحليل السوق والمنافسين وتقدير حجم الطلب والعرض وتحديد الحصة السوقية المستهدفة.",
      category: "ANALYSIS_REPORTS",
      targetAudience: "Investors, Entrepreneurs",
      type: "Study",
      price: 6000.0,
      status: "ACTIVE",
      order: 21,
    },
    {
      title: "Financial Feasibility Study (Comprehensive)",
      titleAr: "دراسة الجدوى المالية",
      description: "Cost and revenue estimation, profitability assessment using financial performance indicators.",
      descriptionAr: "تقدير التكاليف والإيرادات المتوقعة وتقييم الربحية باستخدام مؤشرات الأداء المالي.",
      category: "FINANCIAL_ACCOUNTING",
      targetAudience: "Investors, Banks, Investment Funds",
      type: "Study",
      price: 8000.0,
      status: "ACTIVE",
      order: 22,
    },
    {
      title: "Legal and Regulatory Feasibility Study",
      titleAr: "دراسة الجدوى القانونية والتنظيمية",
      description: "Analysis of the legal environment for the project, identification of regulatory requirements and necessary licenses.",
      descriptionAr: "تحليل البيئة القانونية للمشروع وتحديد المتطلبات النظامية والتراخيص اللازمة.",
      category: "ANALYSIS_REPORTS",
      targetAudience: "Companies, Investors, Startups",
      type: "Study",
      price: 3000.0,
      status: "ACTIVE",
      order: 23,
    },
  ];

  await prisma.service.createMany({
    data: services,
    skipDuplicates: true,
  });

  const createdServices = await prisma.service.findMany({
    where: {
      title: {
        in: services.map((s) => s.title),
      },
    },
  });

  // 3. Create Super Admin
  console.log("👤 Creating super admin...");
  const adminPassword = await hashPassword("Admin@123");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@jadwa.com" },
    update: {
      password: adminPassword,
      role: "SUPER_ADMIN",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
    },
    create: {
      email: "admin@jadwa.com",
      password: adminPassword,
      role: "SUPER_ADMIN",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      admin: {
        create: {
          firstName: "Super",
          lastName: "Admin",
          adminRole: "SUPER_ADMIN",
          permissions: JSON.stringify(["*"]),
        },
      },
    },
  });

  if (adminUser && !adminUser.admin) {
    await prisma.admin.upsert({
      where: { userId: adminUser.id },
      update: {
        firstName: "Super",
        lastName: "Admin",
        adminRole: "SUPER_ADMIN",
        permissions: JSON.stringify(["*"]),
      },
      create: {
        userId: adminUser.id,
        firstName: "Super",
        lastName: "Admin",
        adminRole: "SUPER_ADMIN",
        permissions: JSON.stringify(["*"]),
      },
    });
  }

  // 4. Create Multiple Consultants
  console.log("👨‍💼 Creating consultants...");
  const consultantsData = [
    {
      email: "consultant1@jadwa.com",
      password: "Consultant@123",
      firstName: "أحمد",
      lastName: "محمد",
      academicDegree: "دكتوراه في الاقتصاد",
      specialization: "الاستشارات الاقتصادية",
      bio: "خبير اقتصادي مع أكثر من 15 عاماً من الخبرة في الاستشارات الاقتصادية والمالية",
      expertiseFields: ["الاقتصاد", "الاستثمار", "التحليل المالي"],
      pricePerSession: 500.0,
      yearsOfExperience: 15,
      languages: ["العربية", "الإنجليزية"],
      certifications: ["شهادة استشاري اقتصادي معتمد"],
      education: ["دكتوراه في الاقتصاد - جامعة الملك سعود"],
      city: "الرياض",
      country: "السعودية",
      isVerified: true,
      isAvailable: true,
    },
    {
      email: "consultant2@jadwa.com",
      password: "Consultant@123",
      firstName: "فاطمة",
      lastName: "علي",
      academicDegree: "ماجستير في الإدارة",
      specialization: "الاستشارات الإدارية",
      bio: "خبيرة في الإدارة والتنظيم مع خبرة واسعة في تطوير الشركات",
      expertiseFields: ["الإدارة", "التنظيم", "التطوير"],
      pricePerSession: 400.0,
      yearsOfExperience: 10,
      languages: ["العربية", "الإنجليزية", "الفرنسية"],
      certifications: ["شهادة استشاري إداري معتمد"],
      education: ["ماجستير في الإدارة - جامعة الملك فهد"],
      city: "جدة",
      country: "السعودية",
      isVerified: true,
      isAvailable: true,
    },
    {
      email: "consultant3@jadwa.com",
      password: "Consultant@123",
      firstName: "محمد",
      lastName: "خالد",
      academicDegree: "دكتوراه في المالية",
      specialization: "التحليل المالي",
      bio: "خبير مالي مع خبرة في التحليل المالي والتقارير المالية",
      expertiseFields: ["المالية", "المحاسبة", "التحليل"],
      pricePerSession: 600.0,
      yearsOfExperience: 12,
      languages: ["العربية", "الإنجليزية"],
      certifications: ["شهادة محلل مالي معتمد"],
      education: ["دكتوراه في المالية - جامعة الملك عبدالعزيز"],
      city: "الدمام",
      country: "السعودية",
      isVerified: true,
      isAvailable: true,
    },
  ];

  const createdConsultants = [];
  for (const consultantData of consultantsData) {
    const consultantPassword = await hashPassword(consultantData.password);
    const consultantUser = await prisma.user.upsert({
      where: { email: consultantData.email },
      update: {
        password: consultantPassword,
        role: "CONSULTANT",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
      create: {
        email: consultantData.email,
        password: consultantPassword,
        role: "CONSULTANT",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        consultant: {
          create: {
            firstName: consultantData.firstName,
            lastName: consultantData.lastName,
            academicDegree: consultantData.academicDegree,
            specialization: consultantData.specialization,
            bio: consultantData.bio,
            expertiseFields: JSON.stringify(consultantData.expertiseFields),
            pricePerSession: consultantData.pricePerSession,
            languages: JSON.stringify(consultantData.languages),
            certifications: JSON.stringify(consultantData.certifications),
            education: JSON.stringify(consultantData.education),
            city: consultantData.city,
            country: consultantData.country,
            isVerified: consultantData.isVerified,
            isAvailable: consultantData.isAvailable,
            ...(consultantData.yearsOfExperience !== undefined && {
              yearsOfExperience: consultantData.yearsOfExperience,
            }),
          },
        },
      },
    });

    if (consultantUser && !consultantUser.consultant) {
      await prisma.consultant.upsert({
        where: { userId: consultantUser.id },
        update: {
          firstName: consultantData.firstName,
          lastName: consultantData.lastName,
          academicDegree: consultantData.academicDegree,
          specialization: consultantData.specialization,
          bio: consultantData.bio,
          expertiseFields: JSON.stringify(consultantData.expertiseFields),
          pricePerSession: consultantData.pricePerSession,
          languages: JSON.stringify(consultantData.languages),
          certifications: JSON.stringify(consultantData.certifications),
          education: JSON.stringify(consultantData.education),
          city: consultantData.city,
          country: consultantData.country,
          isVerified: consultantData.isVerified,
          isAvailable: consultantData.isAvailable,
          ...(consultantData.yearsOfExperience !== undefined && {
            yearsOfExperience: consultantData.yearsOfExperience,
          }),
        },
        create: {
          userId: consultantUser.id,
          firstName: consultantData.firstName,
          lastName: consultantData.lastName,
          academicDegree: consultantData.academicDegree,
          specialization: consultantData.specialization,
          bio: consultantData.bio,
          expertiseFields: JSON.stringify(consultantData.expertiseFields),
          pricePerSession: consultantData.pricePerSession,
          languages: JSON.stringify(consultantData.languages),
          certifications: JSON.stringify(consultantData.certifications),
          education: JSON.stringify(consultantData.education),
          city: consultantData.city,
          country: consultantData.country,
          isVerified: consultantData.isVerified,
          isAvailable: consultantData.isAvailable,
          ...(consultantData.yearsOfExperience !== undefined && {
            yearsOfExperience: consultantData.yearsOfExperience,
          }),
        },
      });
    }

    const consultant = await prisma.consultant.findUnique({
      where: { userId: consultantUser.id },
    });
    if (consultant) createdConsultants.push(consultant);
  }

  // 5. Create Multiple Clients
  console.log("👥 Creating clients...");
  const clientsData = [
    {
      email: "client1@jadwa.com",
      password: "Client@123",
      firstName: "خالد",
      lastName: "السعيد",
      city: "الرياض",
      sector: "التجارة",
      companyName: "شركة السعيد للتجارة",
      companySize: "50-100",
      jobTitle: "مدير عام",
      country: "السعودية",
      dateOfBirth: new Date("1985-05-15"),
      gender: "ذكر",
      notificationEmail: true,
      notificationApp: true,
      notificationWhatsApp: false,
    },
    {
      email: "client2@jadwa.com",
      password: "Client@123",
      firstName: "سارة",
      lastName: "أحمد",
      city: "جدة",
      sector: "الخدمات",
      companyName: "شركة الخدمات المتقدمة",
      companySize: "20-50",
      jobTitle: "رئيسة قسم",
      country: "السعودية",
      dateOfBirth: new Date("1990-08-20"),
      gender: "أنثى",
      notificationEmail: true,
      notificationApp: true,
      notificationWhatsApp: true,
    },
    {
      email: "client3@jadwa.com",
      password: "Client@123",
      firstName: "عبدالله",
      lastName: "محمد",
      city: "الدمام",
      sector: "الصناعة",
      companyName: "مصنع المنتجات الصناعية",
      companySize: "100+",
      jobTitle: "مدير الإنتاج",
      country: "السعودية",
      dateOfBirth: new Date("1988-03-10"),
      gender: "ذكر",
      notificationEmail: true,
      notificationApp: true,
      notificationWhatsApp: false,
    },
  ];

  const createdClients = [];
  for (const clientData of clientsData) {
    const clientPassword = await hashPassword(clientData.password);
    const clientUser = await prisma.user.upsert({
      where: { email: clientData.email },
      update: {
        password: clientPassword,
        role: "CLIENT",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
      create: {
        email: clientData.email,
        password: clientPassword,
        role: "CLIENT",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        client: {
          create: {
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            city: clientData.city,
            sector: clientData.sector,
            companyName: clientData.companyName,
            companySize: clientData.companySize,
            jobTitle: clientData.jobTitle,
            country: clientData.country,
            dateOfBirth: clientData.dateOfBirth,
            gender: clientData.gender,
            notificationEmail: clientData.notificationEmail,
            notificationApp: clientData.notificationApp,
            notificationWhatsApp: clientData.notificationWhatsApp,
          },
        },
      },
    });

    if (clientUser && !clientUser.client) {
      await prisma.client.upsert({
        where: { userId: clientUser.id },
        update: {
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          city: clientData.city,
          sector: clientData.sector,
          companyName: clientData.companyName,
          companySize: clientData.companySize,
          jobTitle: clientData.jobTitle,
          country: clientData.country,
          dateOfBirth: clientData.dateOfBirth,
          gender: clientData.gender,
          notificationEmail: clientData.notificationEmail,
          notificationApp: clientData.notificationApp,
          notificationWhatsApp: clientData.notificationWhatsApp,
        },
        create: {
          userId: clientUser.id,
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          city: clientData.city,
          sector: clientData.sector,
          companyName: clientData.companyName,
          companySize: clientData.companySize,
          jobTitle: clientData.jobTitle,
          country: clientData.country,
          dateOfBirth: clientData.dateOfBirth,
          gender: clientData.gender,
          notificationEmail: clientData.notificationEmail,
          notificationApp: clientData.notificationApp,
          notificationWhatsApp: clientData.notificationWhatsApp,
        },
      });
    }

    const client = await prisma.client.findUnique({
      where: { userId: clientUser.id },
    });
    if (client) createdClients.push(client);
  }

  // 6. Create Bookings
  console.log("📅 Creating bookings...");
  if (
    createdClients.length > 0 &&
    createdConsultants.length > 0 &&
    createdServices.length > 0
  ) {
    const bookings = [];
    for (let i = 0; i < 10; i++) {
      const client = createdClients[i % createdClients.length];
      const consultant = createdConsultants[i % createdConsultants.length];
      const service = createdServices[i % createdServices.length];
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + i);

      bookings.push({
        clientId: client.id,
        consultantId: consultant.id,
        serviceId: service.id,
        bookingType: i % 2 === 0 ? "VIDEO_CALL" : "CONSULTATION",
        scheduledAt: scheduledDate,
        duration: 60, // Default 60 minutes
        status:
          i % 4 === 0
            ? "PENDING"
            : i % 4 === 1
            ? "CONFIRMED"
            : i % 4 === 2
            ? "COMPLETED"
            : "CANCELLED",
        price: parseFloat(service.price),
        clientNotes: `Booking ${i + 1} client notes`,
      });
    }

    await prisma.booking.createMany({
      data: bookings,
      skipDuplicates: true,
    });
  }

  // 7. Create Payments
  console.log("💳 Creating payments...");
  const bookings = await prisma.booking.findMany({
    where: { status: "COMPLETED" },
    take: 5,
  });

  for (const booking of bookings) {
    const invoiceNumber = `INV-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        amount: booking.price,
        currency: "SAR",
        method: "CREDIT_CARD",
        status: "COMPLETED",
        paidAt: new Date(),
      },
      create: {
        bookingId: booking.id,
        clientId: booking.clientId,
        consultantId: booking.consultantId,
        amount: booking.price,
        currency: "SAR",
        method: "CREDIT_CARD",
        status: "COMPLETED",
        invoiceNumber,
        transactionId: `TXN-${Date.now()}`,
        paidAt: new Date(),
      },
    });
  }

  // 8. Create Reports
  console.log("📊 Creating reports...");
  const completedBookings = await prisma.booking.findMany({
    where: { status: "COMPLETED" },
    take: 5,
  });

  for (const booking of completedBookings) {
    await prisma.report.upsert({
      where: { bookingId: booking.id },
      update: {
        title: `Report for Booking ${booking.id.substring(0, 8)}`,
        reportType: "CONSULTATION",
        summary: "This is a sample report summary",
        status: "APPROVED",
        approvedAt: new Date(),
      },
      create: {
        bookingId: booking.id,
        clientId: booking.clientId,
        consultantId: booking.consultantId,
        title: `Report for Booking ${booking.id.substring(0, 8)}`,
        reportType: "CONSULTATION",
        summary: "This is a sample report summary",
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });
  }

  // 9. Create Earnings for Consultants
  console.log("💰 Creating earnings...");
  for (const consultant of createdConsultants) {
    const consultantPayments = await prisma.payment.findMany({
      where: {
        consultantId: consultant.id,
        status: "COMPLETED",
      },
      take: 3,
    });

    for (const payment of consultantPayments) {
      const platformFee = parseFloat(payment.amount) * 0.15;
      const netAmount = parseFloat(payment.amount) - platformFee;

      // Check if earning already exists
      const existingEarning = await prisma.earning.findFirst({
        where: {
          consultantId: consultant.id,
          paymentId: payment.id,
        },
      });

      if (!existingEarning) {
        await prisma.earning.create({
          data: {
            consultantId: consultant.id,
            paymentId: payment.id,
            amount: parseFloat(payment.amount),
            platformFee,
            netAmount,
            status: "available",
          },
        });
      }
    }

    // Update consultant total earnings
    const totalEarnings = await prisma.earning.aggregate({
      where: { consultantId: consultant.id },
      _sum: { netAmount: true },
    });

    await prisma.consultant.update({
      where: { id: consultant.id },
      data: {
        totalEarnings: totalEarnings._sum.netAmount || 0,
      },
    });
  }

  // 10. Create CMS Pages
  console.log("📄 Creating CMS pages...");
  const cmsPages = [
    {
      title: "About Us",
      titleAr: "من نحن",
      slug: "about",
      content:
        "<p>Jadwa Consulting Platform is a leading provider of economic and administrative consulting services.</p>",
      contentAr:
        "<p>منصة جدوى للاستشارات هي مزود رائد لخدمات الاستشارات الاقتصادية والإدارية.</p>",
      metaTitle: "About Us - Jadwa Consulting",
      metaDescription: "Learn about Jadwa Consulting Platform and our mission",
      isPublished: true,
      order: 1,
    },
    {
      title: "Terms & Conditions",
      titleAr: "الشروط والأحكام",
      slug: "terms",
      content: "<p>Terms and conditions content...</p>",
      contentAr: "<p>محتوى الشروط والأحكام...</p>",
      metaTitle: "Terms & Conditions - Jadwa Consulting",
      metaDescription:
        "Terms and conditions for using Jadwa Consulting Platform",
      isPublished: true,
      order: 2,
    },
    {
      title: "Privacy Policy",
      titleAr: "سياسة الخصوصية",
      slug: "privacy",
      content: "<p>Privacy policy content...</p>",
      contentAr: "<p>محتوى سياسة الخصوصية...</p>",
      metaTitle: "Privacy Policy - Jadwa Consulting",
      metaDescription: "Privacy policy for Jadwa Consulting Platform",
      isPublished: true,
      order: 3,
    },
  ];

  await prisma.cMSPage.createMany({
    data: cmsPages,
    skipDuplicates: true,
  });

  // 11. Create Articles
  console.log("📰 Creating articles...");
  const articles = [
    {
      title: "Economic Trends in 2025",
      titleAr: "الاتجاهات الاقتصادية في 2025",
      slug: "economic-trends-2025",
      content: "Comprehensive analysis of economic trends...",
      contentAr: "تحليل شامل للاتجاهات الاقتصادية...",
      excerpt: "Key economic trends to watch in 2025",
      excerptAr: "الاتجاهات الاقتصادية الرئيسية لمتابعتها في 2025",
      category: "ECONOMIC",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: adminUser.id,
    },
    {
      title: "Investment Opportunities in Saudi Arabia",
      titleAr: "فرص الاستثمار في المملكة العربية السعودية",
      slug: "investment-opportunities-saudi",
      content: "Exploring investment opportunities...",
      contentAr: "استكشاف فرص الاستثمار...",
      excerpt: "Discover the best investment opportunities",
      excerptAr: "اكتشف أفضل فرص الاستثمار",
      category: "ECONOMIC",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: adminUser.id,
    },
  ];

  await prisma.article.createMany({
    data: articles,
    skipDuplicates: true,
  });

  // 12. Create Economic Indicators
  console.log("📊 Creating economic indicators...");
  const indicators = [
    {
      name: "GDP Growth Rate",
      nameAr: "معدل نمو الناتج المحلي",
      value: 3.5,
      unit: "%",
      category: "Macroeconomic",
      period: "2025-Q1",
      source: "SAMA",
    },
    {
      name: "Inflation Rate",
      nameAr: "معدل التضخم",
      value: 2.1,
      unit: "%",
      category: "Macroeconomic",
      period: "2025-Q1",
      source: "SAMA",
    },
    {
      name: "Unemployment Rate",
      nameAr: "معدل البطالة",
      value: 5.8,
      unit: "%",
      category: "Labor",
      period: "2025-Q1",
      source: "GASTAT",
    },
  ];

  await prisma.economicIndicator.createMany({
    data: indicators,
    skipDuplicates: true,
  });

  // 13. Create Notifications
  console.log("🔔 Creating notifications...");
  const notifications = [];
  for (const client of createdClients) {
    notifications.push({
      userId:
        (await prisma.user.findUnique({ where: { email: client.email || "" } }))
          ?.id || "",
      title: "Welcome to Jadwa Platform",
      titleAr: "مرحباً بك في منصة جدوى",
      message: "Thank you for joining our platform",
      messageAr: "شكراً لانضمامك إلى منصتنا",
      type: "INFO",
      isRead: false,
    });
  }

  for (const notification of notifications) {
    if (notification.userId) {
      await prisma.notification.create({
        data: notification,
      });
    }
  }

  // 14. Create Availability Slots for Consultants
  console.log("📅 Creating availability slots...");
  for (const consultant of createdConsultants) {
    const slots = [];
    // Create slots for each day of the week (Sunday = 0 to Saturday = 6)
    for (let day = 0; day < 7; day++) {
      slots.push({
        consultantId: consultant.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: day !== 5, // Friday not available
      });
    }
    await prisma.availabilitySlot.createMany({
      data: slots,
      skipDuplicates: true,
    });
  }

  // 15. Create Sessions
  console.log("💬 Creating sessions...");
  const confirmedBookings = await prisma.booking.findMany({
    where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    take: 5,
  });

  for (const booking of confirmedBookings) {
    await prisma.session.upsert({
      where: { bookingId: booking.id },
      update: {
        sessionType: booking.bookingType === "VIDEO_CALL" ? "video" : "chat",
        status: booking.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
        startTime: booking.scheduledAt,
        roomId:
          booking.bookingType === "VIDEO_CALL" ? `room-${booking.id}` : null,
      },
      create: {
        bookingId: booking.id,
        sessionType: booking.bookingType === "VIDEO_CALL" ? "video" : "chat",
        status: booking.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
        startTime: booking.scheduledAt,
        roomId:
          booking.bookingType === "VIDEO_CALL" ? `room-${booking.id}` : null,
      },
    });
  }

  // 16. Create Messages
  console.log("💌 Creating messages...");
  const sessions = await prisma.session.findMany({
    take: 5,
    include: {
      booking: {
        include: {
          client: { include: { user: true } },
          consultant: { include: { user: true } },
        },
      },
    },
  });

  for (const session of sessions) {
    if (session.booking) {
      const clientUserId = session.booking.client.userId;
      const consultantUserId = session.booking.consultant.userId;

      // Create sample messages
      const messages = [
        {
          sessionId: session.id,
          senderId: clientUserId,
          receiverId: consultantUserId,
          content: "مرحباً، أريد استشارة حول مشروعي",
          messageType: "text",
          isRead: true,
        },
        {
          sessionId: session.id,
          senderId: consultantUserId,
          receiverId: clientUserId,
          content: "مرحباً، سأكون سعيداً بمساعدتك. ما هو نوع المشروع؟",
          messageType: "text",
          isRead: true,
        },
        {
          sessionId: session.id,
          senderId: clientUserId,
          receiverId: consultantUserId,
          content: "مشروع تجاري جديد في مجال التجزئة",
          messageType: "text",
          isRead: false,
        },
      ];

      for (const msg of messages) {
        await prisma.message.create({
          data: {
            ...msg,
            createdAt: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24 hours
          },
        });
      }
    }
  }

  // 17. Create Feasibility Studies
  console.log("📊 Creating feasibility studies...");
  for (let i = 0; i < 3; i++) {
    const client = createdClients[i % createdClients.length];
    const consultant = createdConsultants[i % createdConsultants.length];

    await prisma.feasibilityStudy.create({
      data: {
        clientId: client.id,
        consultantId: consultant.id,
        title: `دراسة جدوى مشروع ${i + 1}`,
        description: `دراسة جدوى شاملة للمشروع رقم ${i + 1}`,
        marketStudy: "تحليل السوق والمنافسين",
        financialStudy: "التحليل المالي والاستثماري",
        legalStudy: "الجوانب القانونية والتنظيمية",
        riskAnalysis: "تحليل المخاطر والتحديات",
        expectedRevenues: 1000000 + i * 500000,
        expectedCosts: 800000 + i * 400000,
        status: i === 0 ? "COMPLETED" : i === 1 ? "UNDER_REVIEW" : "DRAFT",
        completedAt: i === 0 ? new Date() : null,
      },
    });
  }

  // 18. Create Withdrawals
  console.log("💸 Creating withdrawals...");
  for (const consultant of createdConsultants) {
    const availableEarnings = await prisma.earning.findMany({
      where: {
        consultantId: consultant.id,
        status: "available",
      },
      take: 2,
    });

    for (const earning of availableEarnings) {
      await prisma.withdrawal.create({
        data: {
          consultantId: consultant.id,
          userId: consultant.userId,
          amount: earning.netAmount,
          bankName: "البنك الأهلي السعودي",
          accountNumber: `123456789${consultant.id.substring(0, 3)}`,
          iban: `SA1234567890123456789${consultant.id.substring(0, 3)}`,
          status: "PENDING",
        },
      });
    }
  }

  // 19. Create Roles
  console.log("👥 Creating roles...");
  const roles = [
    {
      name: "Super Admin",
      nameAr: "مدير عام",
      description: "Full system access",
      isSystem: true,
    },
    {
      name: "Admin",
      nameAr: "مدير",
      description: "Administrative access",
      isSystem: true,
    },
    {
      name: "Analyst",
      nameAr: "محلل",
      description: "Data analysis access",
      isSystem: true,
    },
    {
      name: "Finance",
      nameAr: "مالي",
      description: "Financial operations access",
      isSystem: true,
    },
    {
      name: "Support",
      nameAr: "دعم",
      description: "Customer support access",
      isSystem: true,
    },
  ];

  const createdRoles = [];
  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
    createdRoles.push(createdRole);
  }

  // 20. Create Permissions
  console.log("🔐 Creating permissions...");
  const permissions = [
    {
      name: "users.read",
      nameAr: "قراءة المستخدمين",
      resource: "users",
      action: "read",
    },
    {
      name: "users.create",
      nameAr: "إنشاء المستخدمين",
      resource: "users",
      action: "create",
    },
    {
      name: "users.update",
      nameAr: "تحديث المستخدمين",
      resource: "users",
      action: "update",
    },
    {
      name: "users.delete",
      nameAr: "حذف المستخدمين",
      resource: "users",
      action: "delete",
    },
    {
      name: "bookings.read",
      nameAr: "قراءة الحجوزات",
      resource: "bookings",
      action: "read",
    },
    {
      name: "bookings.create",
      nameAr: "إنشاء الحجوزات",
      resource: "bookings",
      action: "create",
    },
    {
      name: "bookings.update",
      nameAr: "تحديث الحجوزات",
      resource: "bookings",
      action: "update",
    },
    {
      name: "payments.read",
      nameAr: "قراءة المدفوعات",
      resource: "payments",
      action: "read",
    },
    {
      name: "payments.create",
      nameAr: "إنشاء المدفوعات",
      resource: "payments",
      action: "create",
    },
    {
      name: "reports.read",
      nameAr: "قراءة التقارير",
      resource: "reports",
      action: "read",
    },
    {
      name: "reports.create",
      nameAr: "إنشاء التقارير",
      resource: "reports",
      action: "create",
    },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const createdPerm = await prisma.permission.upsert({
      where: { name: perm.name },
      update: perm,
      create: perm,
    });
    createdPermissions.push(createdPerm);
  }

  // 21. Create Role Permissions
  console.log("🔗 Assigning permissions to roles...");
  const superAdminRole = createdRoles.find((r) => r.name === "Super Admin");
  if (superAdminRole) {
    for (const perm of createdPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // 22. Create User Role Assignments
  console.log("👤 Assigning roles to users...");
  if (adminUser && superAdminRole) {
    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        assignedBy: adminUser.id,
      },
    });
  }

  // 23. Create Specialties
  console.log("🎯 Creating specialties...");
  const specialties = [
    {
      name: "Economic Consulting",
      nameAr: "الاستشارات الاقتصادية",
      category: "Economic",
    },
    {
      name: "Financial Analysis",
      nameAr: "التحليل المالي",
      category: "Financial",
    },
    {
      name: "Administrative Consulting",
      nameAr: "الاستشارات الإدارية",
      category: "Administrative",
    },
    {
      name: "Feasibility Studies",
      nameAr: "دراسات الجدوى",
      category: "Analysis",
    },
    {
      name: "Market Research",
      nameAr: "البحوث التسويقية",
      category: "Analysis",
    },
  ];

  const createdSpecialties = [];
  for (const specialty of specialties) {
    const created = await prisma.specialty.upsert({
      where: { name: specialty.name },
      update: specialty,
      create: specialty,
    });
    createdSpecialties.push(created);
  }

  // 24. Create Consultant Specialties
  console.log("🎓 Assigning specialties to consultants...");
  for (let i = 0; i < createdConsultants.length; i++) {
    const consultant = createdConsultants[i];
    const specialty = createdSpecialties[i % createdSpecialties.length];

    await prisma.consultantSpecialty.upsert({
      where: {
        consultantId_specialtyId: {
          consultantId: consultant.id,
          specialtyId: specialty.id,
        },
      },
      update: {},
      create: {
        consultantId: consultant.id,
        specialtyId: specialty.id,
        yearsOfExperience: consultant.yearsOfExperience || 5,
      },
    });
  }

  // 25. Create Support Tickets
  console.log("🎫 Creating support tickets...");
  const ticketNumbers = [];
  for (let i = 0; i < 5; i++) {
    const client = createdClients[i % createdClients.length];
    const clientUser = await prisma.user.findUnique({
      where: { email: clientsData[i % clientsData.length].email },
    });

    if (clientUser) {
      const ticketNumber = `TKT-${new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "")}-${String(i + 1).padStart(5, "0")}`;
      ticketNumbers.push(ticketNumber);

      const ticket = await prisma.supportTicket.upsert({
        where: { ticketNumber },
        update: {},
        create: {
          ticketNumber,
          userId: clientUser.id,
          subject: `مشكلة في النظام ${i + 1}`,
          description: `وصف المشكلة رقم ${i + 1}`,
          status: i === 0 ? "RESOLVED" : i === 1 ? "IN_PROGRESS" : "OPEN",
          priority: i === 0 ? "LOW" : i === 1 ? "HIGH" : "MEDIUM",
          category: i % 2 === 0 ? "technical" : "billing",
          tags: JSON.stringify(["urgent", "payment"]),
          resolvedAt: i === 0 ? new Date() : null,
        },
      });

      // Create comments for tickets
      if (i === 0) {
        await prisma.ticketComment.create({
          data: {
            ticketId: ticket.id,
            userId: clientUser.id,
            comment: "تم حل المشكلة بنجاح",
            isInternal: false,
          },
        });
      }
    }
  }

  // 26. Create Datasets
  console.log("📊 Creating datasets...");
  const datasets = [
    {
      title: "Economic Indicators 2025",
      titleAr: "المؤشرات الاقتصادية 2025",
      description: "Comprehensive economic indicators dataset",
      fileUrl: "/datasets/economic-indicators-2025.csv",
      fileType: "CSV",
      category: "Economic",
      tags: JSON.stringify(["economic", "indicators", "2025"]),
      isPublic: true,
    },
    {
      title: "Market Analysis Data",
      titleAr: "بيانات تحليل السوق",
      description: "Market analysis dataset",
      fileUrl: "/datasets/market-analysis.xlsx",
      fileType: "Excel",
      category: "Market",
      tags: JSON.stringify(["market", "analysis"]),
      isPublic: false,
    },
  ];

  await prisma.dataset.createMany({
    data: datasets,
    skipDuplicates: true,
  });

  // 27. Create Dashboards
  console.log("📈 Creating dashboards...");
  const dashboards = [
    {
      title: "Main Dashboard",
      titleAr: "لوحة التحكم الرئيسية",
      description: "Main system dashboard",
      config: JSON.stringify({ widgets: ["revenue", "sessions", "users"] }),
      isPublic: false,
    },
    {
      title: "Economic Dashboard",
      titleAr: "لوحة التحكم الاقتصادية",
      description: "Economic indicators dashboard",
      config: JSON.stringify({ widgets: ["gdp", "inflation", "unemployment"] }),
      isPublic: true,
    },
  ];

  await prisma.dashboard.createMany({
    data: dashboards,
    skipDuplicates: true,
  });

  // 28. Create KPI Metrics
  console.log("📊 Creating KPI metrics...");
  const kpiMetrics = [
    {
      metricName: "daily_sessions",
      metricValue: 25.0,
      period: new Date().toISOString().split("T")[0],
      category: "sessions",
    },
    {
      metricName: "monthly_revenue",
      metricValue: 50000.0,
      period: `${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}`,
      category: "revenue",
    },
    {
      metricName: "active_users",
      metricValue: 150.0,
      period: new Date().toISOString().split("T")[0],
      category: "users",
    },
  ];

  for (const metric of kpiMetrics) {
    await prisma.kPIMetric.upsert({
      where: {
        metricName_period: {
          metricName: metric.metricName,
          period: metric.period,
        },
      },
      update: metric,
      create: metric,
    });
  }

  // 29. Create Service Commissions
  console.log("💰 Creating service commissions...");
  const serviceCommissions = [
    {
      serviceCategory: "ECONOMIC",
      commissionRate: 15.0,
      isActive: true,
    },
    {
      serviceCategory: "ADMINISTRATIVE",
      commissionRate: 12.0,
      isActive: true,
    },
    {
      serviceCategory: "FINANCIAL_ACCOUNTING",
      commissionRate: 18.0,
      isActive: true,
    },
  ];

  for (const commission of serviceCommissions) {
    await prisma.serviceCommission.create({
      data: commission,
    });
  }

  // 30. Create System Logs
  console.log("📝 Creating system logs...");
  const systemLogs = [
    {
      level: "INFO",
      message: "System started successfully",
      context: JSON.stringify({ version: "1.0.0", module: "system" }),
    },
    {
      level: "WARNING",
      message: "High memory usage detected",
      context: JSON.stringify({ memoryUsage: "85%", module: "system" }),
    },
    {
      level: "ERROR",
      message: "Database connection timeout",
      context: JSON.stringify({ timeout: 5000, module: "database" }),
    },
  ];

  await prisma.systemLog.createMany({
    data: systemLogs,
    skipDuplicates: true,
  });

  // 31. Create Audit Logs
  console.log("🔍 Creating audit logs...");
  if (adminUser) {
    const auditLogs = [
      {
        userId: adminUser.id,
        action: "CREATE",
        resourceType: "user",
        resourceId: createdClients[0]?.id || "",
        changes: JSON.stringify({ email: clientsData[0].email }),
        description: "Created new user",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      },
      {
        userId: adminUser.id,
        action: "UPDATE",
        resourceType: "booking",
        resourceId: confirmedBookings[0]?.id || "",
        changes: JSON.stringify({ status: "CONFIRMED" }),
        description: "Updated booking status",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      },
    ];

    await prisma.auditLog.createMany({
      data: auditLogs,
      skipDuplicates: true,
    });
  }

  // 32. Create Categories
  console.log("📂 Creating categories...");
  const categoriesData = [
    {
      name: "Economic Consulting",
      nameAr: "الاستشارات الاقتصادية",
      slug: "economic-consulting",
      description: "Economic and financial consulting services",
      descriptionAr: "خدمات الاستشارات الاقتصادية والمالية",
      icon: "DollarOutlined",
      color: "#1a4d3a",
      isActive: true,
      order: 1,
      parentSlug: null,
    },
    {
      name: "Administrative Consulting",
      nameAr: "الاستشارات الإدارية",
      slug: "administrative-consulting",
      description: "Administrative and organizational consulting",
      descriptionAr: "الاستشارات الإدارية والتنظيمية",
      icon: "TeamOutlined",
      color: "#2d5f4f",
      isActive: true,
      order: 2,
      parentSlug: null,
    },
    {
      name: "Financial Analysis",
      nameAr: "التحليل المالي",
      slug: "financial-analysis",
      description: "Financial analysis and reporting services",
      descriptionAr: "خدمات التحليل المالي والتقارير",
      icon: "BarChartOutlined",
      color: "#d4af37",
      isActive: true,
      order: 3,
      parentSlug: null,
    },
    {
      name: "Feasibility Studies",
      nameAr: "دراسات الجدوى",
      slug: "feasibility-studies",
      description: "Comprehensive feasibility studies for projects",
      descriptionAr: "دراسات الجدوى الشاملة للمشاريع",
      icon: "FileTextOutlined",
      color: "#f4d03f",
      isActive: true,
      order: 4,
      parentSlug: null,
    },
    {
      name: "Market Research",
      nameAr: "البحوث التسويقية",
      slug: "market-research",
      description: "Market research and analysis services",
      descriptionAr: "خدمات البحوث التسويقية والتحليل",
      icon: "SearchOutlined",
      color: "#1a4d3a",
      isActive: true,
      order: 5,
      parentSlug: null,
    },
    {
      name: "Investment Consulting",
      nameAr: "استشارات الاستثمار",
      slug: "investment-consulting",
      description: "Investment and portfolio consulting",
      descriptionAr: "استشارات الاستثمار والمحافظ",
      icon: "RiseOutlined",
      color: "#2d5f4f",
      isActive: true,
      order: 6,
      parentSlug: "economic-consulting", // Child of Economic Consulting
    },
    {
      name: "Business Development",
      nameAr: "تطوير الأعمال",
      slug: "business-development",
      description: "Business development and growth strategies",
      descriptionAr: "تطوير الأعمال واستراتيجيات النمو",
      icon: "ThunderboltOutlined",
      color: "#d4af37",
      isActive: true,
      order: 7,
      parentSlug: "administrative-consulting", // Child of Administrative Consulting
    },
  ];

  const createdCategories = [];
  for (const categoryData of categoriesData) {
    // Handle parentId - find parent by slug
    let finalParentId = null;
    if (categoryData.parentSlug) {
      const parentCategory = createdCategories.find(c => c.slug === categoryData.parentSlug);
      if (parentCategory) {
        finalParentId = parentCategory.id;
      }
    }

    const { parentSlug, ...categoryCreateData } = categoryData;
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {
        ...categoryCreateData,
        parentId: finalParentId,
      },
      create: {
        ...categoryCreateData,
        parentId: finalParentId,
      },
    });
    createdCategories.push(category);
  }

  // 33. Create Partners
  console.log("🤝 Creating partners...");
  const partnersData = [
    {
      name: "Saudi Economic Association",
      nameAr: "الجمعية الاقتصادية السعودية",
      description: "Leading economic research and consulting organization",
      descriptionAr: "منظمة رائدة في البحوث الاقتصادية والاستشارات",
      website: "https://www.sea.org.sa",
      isActive: true,
      order: 1,
    },
    {
      name: "King Fahd University of Petroleum & Minerals",
      nameAr: "جامعة الملك فهد للبترول والمعادن",
      description: "Premier educational and research institution",
      descriptionAr: "مؤسسة تعليمية وبحثية رائدة",
      website: "https://www.kfupm.edu.sa",
      isActive: true,
      order: 2,
    },
    {
      name: "Saudi Investment Bank",
      nameAr: "بنك الاستثمار السعودي",
      description: "Leading financial services provider",
      descriptionAr: "مزود رائد للخدمات المالية",
      website: "https://www.saib.com.sa",
      isActive: true,
      order: 3,
    },
    {
      name: "Ministry of Commerce",
      nameAr: "وزارة التجارة",
      description: "Government entity supporting business development",
      descriptionAr: "جهة حكومية تدعم تطوير الأعمال",
      website: "https://www.mc.gov.sa",
      isActive: true,
      order: 4,
    },
    {
      name: "Saudi Business Center",
      nameAr: "مركز الأعمال السعودي",
      description: "Business support and consulting services",
      descriptionAr: "خدمات دعم الأعمال والاستشارات",
      website: "https://www.sbc.gov.sa",
      isActive: true,
      order: 5,
    },
  ];

  const createdPartners = [];
  for (const partnerData of partnersData) {
    // Check if partner exists
    const existing = await prisma.partner.findFirst({
      where: { name: partnerData.name },
    });
    
    let partner;
    if (existing) {
      partner = await prisma.partner.update({
        where: { id: existing.id },
        data: partnerData,
      });
    } else {
      partner = await prisma.partner.create({
        data: partnerData,
      });
    }
    createdPartners.push(partner);
  }

  // 34. Link Categories to Consultants
  console.log("🔗 Linking categories to consultants...");
  if (createdConsultants.length > 0 && createdCategories.length > 0) {
    // Link first consultant to Economic Consulting
    if (createdConsultants[0] && createdCategories[0]) {
      await prisma.consultant.update({
        where: { id: createdConsultants[0].id },
        data: { categoryId: createdCategories[0].id },
      });
    }
    // Link second consultant to Administrative Consulting
    if (createdConsultants[1] && createdCategories[1]) {
      await prisma.consultant.update({
        where: { id: createdConsultants[1].id },
        data: { categoryId: createdCategories[1].id },
      });
    }
    // Link third consultant to Financial Analysis
    if (createdConsultants[2] && createdCategories[2]) {
      await prisma.consultant.update({
        where: { id: createdConsultants[2].id },
        data: { categoryId: createdCategories[2].id },
      });
    }
  }

  // 35. Link Categories to Services
  console.log("🔗 Linking categories to services...");
  if (createdServices.length > 0 && createdCategories.length > 0) {
    const serviceUpdates = [
      { serviceIndex: 0, categoryIndex: 0 }, // Economic Consultations -> Economic Consulting
      { serviceIndex: 1, categoryIndex: 3 }, // Feasibility Studies -> Feasibility Studies
      { serviceIndex: 2, categoryIndex: 2 }, // Financial Analysis -> Financial Analysis
      { serviceIndex: 3, categoryIndex: 1 }, // Administrative Consulting -> Administrative Consulting
    ];

    for (const update of serviceUpdates) {
      if (createdServices[update.serviceIndex] && createdCategories[update.categoryIndex]) {
        await prisma.service.update({
          where: { id: createdServices[update.serviceIndex].id },
          data: { categoryId: createdCategories[update.categoryIndex].id },
        });
      }
    }
  }

  // 36. Link Categories to Articles
  console.log("🔗 Linking categories to articles...");
  if (articles.length > 0 && createdCategories.length > 0 && adminUser) {
    const articleUpdates = [
      { articleIndex: 0, categoryIndex: 0 }, // First article -> Economic Consulting
      { articleIndex: 1, categoryIndex: 1 }, // Second article -> Administrative Consulting
      { articleIndex: 2, categoryIndex: 2 }, // Third article -> Financial Analysis
    ];

    for (const update of articleUpdates) {
      if (articles[update.articleIndex] && createdCategories[update.categoryIndex]) {
        const article = await prisma.article.findFirst({
          where: {
            authorId: adminUser.id,
            title: articles[update.articleIndex].title,
          },
        });
        if (article) {
          await prisma.article.update({
            where: { id: article.id },
            data: { categoryId: createdCategories[update.categoryIndex].id },
          });
        }
      }
    }
  }

  // 37. Create Backups
  console.log("💾 Creating backup records...");
  await prisma.backup.create({
    data: {
      backupType: "full",
      backupLocation: "/backups/full-backup-2025-01-15.sql",
      backupSize: BigInt(1024 * 1024 * 500), // 500MB
      tablesIncluded: JSON.stringify(["users", "bookings", "payments"]),
      status: "completed",
      startedAt: new Date(Date.now() - 3600000), // 1 hour ago
      completedAt: new Date(Date.now() - 3500000), // 10 minutes later
      createdBy: "system",
    },
  });

  console.log("✅ Comprehensive seed completed successfully!");
  console.log("\n📋 Default Credentials:");
  console.log("Admin: admin@jadwa.com / Admin@123");
  console.log("Consultant 1: consultant1@jadwa.com / Consultant@123");
  console.log("Consultant 2: consultant2@jadwa.com / Consultant@123");
  console.log("Consultant 3: consultant3@jadwa.com / Consultant@123");
  console.log("Client 1: client1@jadwa.com / Client@123");
  console.log("Client 2: client2@jadwa.com / Client@123");
  console.log("Client 3: client3@jadwa.com / Client@123");
  console.log("\n📊 Created Data:");
  console.log(`- ${systemSettings.length} System Settings`);
  console.log(`- ${services.length} Services`);
  console.log(`- ${createdConsultants.length} Consultants`);
  console.log(`- ${createdClients.length} Clients`);
  console.log(`- 10 Bookings`);
  console.log(`- 5 Payments`);
  console.log(`- 5 Reports`);
  console.log(`- Multiple Earnings`);
  console.log(`- ${cmsPages.length} CMS Pages`);
  console.log(`- ${articles.length} Articles`);
  console.log(`- ${indicators.length} Economic Indicators`);
  console.log(`- Availability Slots`);
  console.log(`- Sessions`);
  console.log(`- Messages`);
  console.log(`- Feasibility Studies`);
  console.log(`- Withdrawals`);
  console.log(`- ${createdRoles.length} Roles`);
  console.log(`- ${createdPermissions.length} Permissions`);
  console.log(`- ${createdSpecialties.length} Specialties`);
  console.log(`- Support Tickets`);
  console.log(`- Datasets`);
  console.log(`- Dashboards`);
  console.log(`- KPI Metrics`);
  console.log(`- Service Commissions`);
  console.log(`- System Logs`);
  console.log(`- Audit Logs`);
  console.log(`- Backups`);
  console.log(`- ${createdCategories.length} Categories`);
  console.log(`- ${createdPartners.length} Partners`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
