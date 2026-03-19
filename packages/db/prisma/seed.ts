import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const bootstrapAdminUsername = process.env.BOOTSTRAP_ADMIN_USERNAME ?? "Admin1";
  const bootstrapAdminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "Admin1";
  const bootstrapAdminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL ?? "admin1@trackyourgold.internal";
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const marketBaseUrl = process.env.MARKET_API_BASE_URL ?? "__MARKET_API_BASE_URL__";
  const retailHost = process.env.RETAIL_MALABAR_HOST ?? "__RETAIL_MALABAR_HOST__";
  const retailPath = process.env.RETAIL_MALABAR_PATH ?? "__RETAIL_MALABAR_PATH__";

  await prisma.market.upsert({
    where: { slug: "qatar" },
    update: {},
    create: {
      slug: "qatar",
      nameEn: "Qatar",
      nameAr: "قطر",
      defaultCurrency: "QAR",
      isDefault: true
    }
  });

  const marketSource = await prisma.priceSource.upsert({
    where: { code: "market_metalsapi" },
    update: {},
    create: {
      code: "market_metalsapi",
      name: "Metals API",
      sourceType: "api",
      host: marketBaseUrl,
      path: "/",
      fetchMethod: "api_json",
      scrapingRisk: "low",
      confidence: "high",
      updateHintMinutes: 10
    }
  });

  const retailSource = await prisma.priceSource.upsert({
    where: { code: "retail_malabar" },
    update: {},
    create: {
      code: "retail_malabar",
      name: "Malabar Gold and Diamonds",
      sourceType: "retail_html",
      host: retailHost,
      path: retailPath,
      fetchMethod: "html_static",
      scrapingRisk: "medium",
      confidence: "medium",
      updateHintMinutes: 15
    }
  });

  await prisma.sourceHealth.upsert({
    where: { sourceId: marketSource.id },
    update: {},
    create: { sourceId: marketSource.id, staleAfterMinutes: 30 }
  });

  await prisma.sourceHealth.upsert({
    where: { sourceId: retailSource.id },
    update: {},
    create: { sourceId: retailSource.id, staleAfterMinutes: 360 }
  });

  await prisma.setting.upsert({
    where: { key: "homepage.hero" },
    update: {},
    create: {
      key: "homepage.hero",
      value: {
        titleEn: "Track what your gold is worth today — piece by piece.",
        titleAr: "تابع قيمة ذهبك اليوم — قطعة بقطعة",
        subtitleEn: "A clean vault for your jewelry, coins, and bars. Live QAR estimates from market rates and local retail boards.",
        subtitleAr: "خزنة بسيطة لمجوهراتك وسبائكك وعملاتك. تقديرات بالريال القطري من أسعار السوق ولوحات المتاجر."
      }
    }
  });

  const bootstrapPasswordHash = await bcrypt.hash(bootstrapAdminPassword, 10);

  await prisma.user.upsert({
    where: { email: bootstrapAdminEmail },
    update: {
      username: bootstrapAdminUsername,
      passwordHash: bootstrapPasswordHash,
      role: "ADMIN",
      language: "en"
    },
    create: {
      email: bootstrapAdminEmail,
      username: bootstrapAdminUsername,
      passwordHash: bootstrapPasswordHash,
      role: "ADMIN",
      language: "en"
    }
  });

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, role: "ADMIN", language: "en" },
      create: {
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        language: "en"
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
