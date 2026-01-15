
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Migrating Payment Keys...");

  // 1. Fetch generic keys
  const apiKeySetting = await prisma.systemSetting.findUnique({ where: { key: "paymentApiKey" } });
  const secretKeySetting = await prisma.systemSetting.findUnique({ where: { key: "paymentSecretKey" } });

  const apiKey = apiKeySetting?.value?.replace(/"/g, ''); // Remove quotes if JSON stringified
  const secretKey = secretKeySetting?.value?.replace(/"/g, '');

  if (apiKey) {
      console.log(`Found generic API Key. Migrating to moyasar_apiKey...`);
      await prisma.systemSetting.upsert({
        where: { key: "moyasar_apiKey" },
        update: { value: JSON.stringify(apiKey) },
        create: { key: "moyasar_apiKey", value: JSON.stringify(apiKey), description: "Moyasar Publishable Key", category: "payment" }
      });
  }

  if (secretKey) {
      console.log(`Found generic Secret Key. Migrating to moyasar_secretKey...`);
      await prisma.systemSetting.upsert({
        where: { key: "moyasar_secretKey" },
        update: { value: JSON.stringify(secretKey) },
        create: { key: "moyasar_secretKey", value: JSON.stringify(secretKey), description: "Moyasar Secret Key", category: "payment" }
      });
  }

  console.log("✅ Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
