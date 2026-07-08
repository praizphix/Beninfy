ALTER TABLE "Payment"
ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'payonus',
ADD COLUMN "providerReference" TEXT,
ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN "checkoutAmount" INTEGER;

UPDATE "Payment"
SET "checkoutAmount" = "amountNGN"
WHERE "checkoutAmount" IS NULL;

CREATE UNIQUE INDEX "Payment_providerReference_key" ON "Payment"("providerReference");
