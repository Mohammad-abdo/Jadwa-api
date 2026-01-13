import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import prisma from "./config/database.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import consultantRoutes from "./routes/consultantRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import monitoringRoutes from "./routes/monitoringRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
// Use absolute path to ensure correct file serving
const uploadsPath = path.join(__dirname, "../uploads");

// Verify uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  console.warn(`⚠️  Uploads directory not found: ${uploadsPath}`);
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`✅ Created uploads directory: ${uploadsPath}`);
}

// Explicit route handler for uploads to ensure files are served correctly
// This is placed before static middleware to handle file requests explicitly
app.get("/uploads/:ownerType/:fileName", (req, res) => {
  const { ownerType, fileName } = req.params;
  const filePath = path.join(uploadsPath, ownerType, fileName);

  // Normalize path to handle any path traversal attempts
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(path.normalize(uploadsPath))) {
    return res.status(403).json({ error: "Access denied" });
  }

  // Check if file exists
  if (!fs.existsSync(normalizedPath)) {
    // File not found in requested directory - check alternative locations
    // This handles cases where files might be in USER directory but URL points to MESSAGE
    let alternativePath = null;

    // If looking in MESSAGE but file might be in USER (migration case)
    if (ownerType === "MESSAGE") {
      const userPath = path.join(uploadsPath, "USER", fileName);
      if (fs.existsSync(userPath)) {
        alternativePath = userPath;
        console.warn(
          `⚠️  File found in USER directory instead of MESSAGE: ${fileName}`
        );
      }
    }

    // If looking in USER but file might be in MESSAGE
    if (ownerType === "USER" && !alternativePath) {
      const messagePath = path.join(uploadsPath, "MESSAGE", fileName);
      if (fs.existsSync(messagePath)) {
        alternativePath = messagePath;
        console.warn(
          `⚠️  File found in MESSAGE directory instead of USER: ${fileName}`
        );
      }
    }

    // If looking in ARTICLE but file might be in USER (directory didn't exist when uploaded)
    if (ownerType === "ARTICLE" && !alternativePath) {
      const userPath = path.join(uploadsPath, "USER", fileName);
      if (fs.existsSync(userPath)) {
        alternativePath = userPath;
        console.warn(
          `⚠️  File found in USER directory instead of ARTICLE: ${fileName}`
        );
      }
    }

    // If looking in GENERAL but file might be in USER
    if (ownerType === "GENERAL" && !alternativePath) {
      const userPath = path.join(uploadsPath, "USER", fileName);
      if (fs.existsSync(userPath)) {
        alternativePath = userPath;
        console.warn(
          `⚠️  File found in USER directory instead of GENERAL: ${fileName}`
        );
      }
    }

    // If looking in USER but file might be in GENERAL
    if (ownerType === "USER" && !alternativePath) {
      const generalPath = path.join(uploadsPath, "GENERAL", fileName);
      if (fs.existsSync(generalPath)) {
        alternativePath = generalPath;
        console.warn(
          `⚠️  File found in GENERAL directory instead of USER: ${fileName}`
        );
      }
    }

    // If found in alternative location, serve it
    if (alternativePath) {
      const ext = path.extname(fileName).toLowerCase();
      const contentTypes = {
        ".webm": "audio/webm",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".m4a": "audio/mp4",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
      };
      if (contentTypes[ext]) {
        res.setHeader("Content-Type", contentTypes[ext]);
      }
      return res.sendFile(path.resolve(alternativePath));
    }

    // File not found anywhere - log details
    const dirPath = path.join(uploadsPath, ownerType);
    let filesInDir = [];
    if (fs.existsSync(dirPath)) {
      try {
        filesInDir = fs.readdirSync(dirPath);
      } catch (err) {
        console.error("Error reading directory:", err);
      }
    }

    console.warn(`❌ File not found: ${normalizedPath}`);
    console.warn(`   Directory: ${dirPath} exists: ${fs.existsSync(dirPath)}`);
    console.warn(`   Files in directory: ${filesInDir.length}`);
    if (filesInDir.length > 0) {
      console.warn(`   Sample files:`, filesInDir.slice(0, 5));
    }

    // Check if requested file name matches any file (case-insensitive)
    const matchingFile = filesInDir.find(
      (f) => f.toLowerCase() === fileName.toLowerCase()
    );
    if (matchingFile && matchingFile !== fileName) {
      console.warn(
        `⚠️  Case mismatch: Requested "${fileName}" but found "${matchingFile}"`
      );
      // Try to serve the file with correct case
      const correctPath = path.join(uploadsPath, ownerType, matchingFile);
      if (fs.existsSync(correctPath)) {
        return res.sendFile(path.resolve(correctPath));
      }
    }

    return res.status(404).json({
      error: "File not found",
      path: req.path,
      filePath: normalizedPath,
      filesInDirectory: filesInDir.length,
      directoryExists: fs.existsSync(dirPath),
    });
  }

  // Set proper content type
  const ext = path.extname(fileName).toLowerCase();
  const contentTypes = {
    ".webm": "audio/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
  };
  if (contentTypes[ext]) {
    res.setHeader("Content-Type", contentTypes[ext]);
  }

  // Send the file
  res.sendFile(normalizedPath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error serving file" });
      }
    }
  });
});

// Serve uploaded files with static middleware as fallback
// This will handle any files not caught by the explicit route above
app.use(
  "/uploads",
  express.static(uploadsPath, {
    dotfiles: "ignore",
    etag: true,
    lastModified: true,
    maxAge: "1d",
    index: false,
    setHeaders: (res, filePath) => {
      // Set proper content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        ".webm": "audio/webm",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".m4a": "audio/mp4",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
      };
      if (contentTypes[ext]) {
        res.setHeader("Content-Type", contentTypes[ext]);
      }
    },
  })
);

// Log uploads directory for debugging
console.log(`📁 Serving uploads from: ${uploadsPath}`);
console.log(`📁 Uploads URL: http://localhost:${PORT}/uploads`);

// Debug endpoint to check if a file exists (development only)
if (process.env.NODE_ENV === "development") {
  app.get("/api/debug/file-check/:ownerType/:fileName", (req, res) => {
    const { ownerType, fileName } = req.params;
    const filePath = path.join(uploadsPath, ownerType, fileName);
    const exists = fs.existsSync(filePath);

    // List files in directory for debugging
    const dirPath = path.join(uploadsPath, ownerType);
    let filesInDir = [];
    if (fs.existsSync(dirPath)) {
      filesInDir = fs.readdirSync(dirPath);
    }

    res.json({
      exists,
      filePath,
      ownerType,
      fileName,
      url: `/uploads/${ownerType}/${fileName}`,
      fullUrl: `http://localhost:${PORT}/uploads/${ownerType}/${fileName}`,
      filesInDirectory: filesInDir.slice(0, 20), // Show first 20 files
    });
  });
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/consultants", consultantRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sliders", sliderRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🔗 CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`
  );
  console.log(`📁 Upload directory: ${path.join(__dirname, "../uploads")}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
