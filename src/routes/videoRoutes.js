import express from "express";
import videoController from "../controllers/videoController.js";
import { authenticate } from "../middleware/auth.js"; // Correct middleware

const router = express.Router();

// Route to get Agora token
// Using POST so we can send channelName in body securely
// Added 'authenticate' middleware to ensure only logged-in users can generate tokens
router.post("/token", authenticate, videoController.getToken);

export default router;
