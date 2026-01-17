import agoraAccessToken from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = agoraAccessToken;

const generateToken = (channelName, uid) => {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId) {
    throw new Error("Agora App ID not found in environment variables");
  }

  // If no certificate is present, return null.
  // This likely means the project is in "App ID only" mode,
  // so the frontend should try to join without a token.
  if (!appCertificate) {
    console.error("Agora App Certificate not found in environment variables");
    // Throw an error so the frontend knows something is wrong,
    // rather than trying to join without a token (which fails if the project is in Secure Mode).
    throw new Error(
      "Agora App Certificate is missing. Please add AGORA_APP_CERTIFICATE to your .env file.",
    );
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  // Build the token
  // If uid is 0 or null, we can let Agora handle it, but typically we pass the user ID or 0.
  // We'll treat uid as a number if possible, else 0.
  const uidInt = parseInt(uid) || 0;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uidInt,
    role,
    privilegeExpiredTs,
  );

  return token;
};

export default {
  generateToken,
};
