
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Updating Payment Keys in System Settings...");

  const publishableKey = "pk_test_4yDSHsgWZYpR7NPVSPqedrr1FUX2VuDkkX1wDC7A";
  const secretKey = "sk_test_5mxHUKSA9WWcr6**********"; // This is the masked one we have. User must replace logic if they want real one, or they can edit in UI.
  
  // Update Payment API Key (Secret) - Mapping to 'paymentSecretKey' logic based on seed.js
  // In seed.js: paymentApiKey (value="") and paymentSecretKey (value="")
  // Usually 'API Key' refers to the Secret Key in backend context, or Publishable in frontend.
  // Based on the UI screenshot 'API Key' and 'Secret Key', let's map:
  // UI 'API Key' -> settings 'paymentApiKey' -> Moyasar Publishable (often called API Key in some docs, but usually PK)
  // UI 'Secret Key' -> settings 'paymentSecretKey' -> Moyasar Secret
  
  // Let's check seed.js again...
  //     key: "paymentApiKey", value: ""
  //     key: "paymentSecretKey", value: ""
  
  await prisma.systemSetting.upsert({
    where: { key: "paymentApiKey" },
    update: { value: publishableKey },
    create: { key: "paymentApiKey", value: publishableKey, description: "Payment API/Publishable Key", category: "payment" }
  });

  await prisma.systemSetting.upsert({
    where: { key: "paymentSecretKey" },
    update: { value: secretKey },
    create: { key: "paymentSecretKey", value: secretKey, description: "Payment Secret Key", category: "payment" }
  });

  console.log("✅ Keys updated in database.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
