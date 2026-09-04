-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Nooryi Studio',
    "tagline" TEXT NOT NULL DEFAULT 'منصة حجز الفنانين الأولى',
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "facebook" TEXT,
    "instagram" TEXT,
    "tiktok" TEXT,
    "youtube" TEXT,
    "whatsapp" TEXT,
    "twitter" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "iban" TEXT,
    "paymentPhone" TEXT,
    "paymentNote" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- Insert default data
INSERT INTO "SiteSetting" (
    "id", "siteName", "tagline", "email", "phone", "address",
    "currency", "timezone", "facebook", "instagram", "tiktok",
    "youtube", "whatsapp", "twitter", "bankName", "bankAccount",
    "iban", "paymentPhone", "paymentNote", "updatedAt"
) VALUES (
    'site_settings',
    'Nooryi Studio',
    'منصة حجز الفنانين الأولى',
    'info@noorystudio.com',
    '+20 100 000 0000',
    'القاهرة، مصر',
    'EGP',
    'Africa/Cairo',
    NULL, NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NOW()
);