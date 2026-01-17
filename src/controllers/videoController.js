import videoService from "../services/videoService.js";

const getToken = async (req, res) => {
  try {
    const { channelName } = req.body;
    const uid = req.user ? req.user.id : 0; // Use authenticated user ID if available

    if (!channelName) {
      return res.status(400).json({ error: "Channel name is required" });
    }

    // In a real app, you might validate if the user is allowed to join this channel (booking/session ID)
    
    const token = videoService.generateToken(channelName, uid);

    res.json({
      token,
      channelName,
      uid: parseInt(uid) || 0,
      appId: process.env.AGORA_APP_ID
    });
  } catch (error) {
    console.error("Error generating Agora token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
};

export default {
  getToken,
};
