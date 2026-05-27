/*
  Warnings:

  - You are about to drop the column `priceNGN` on the `Tour` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startingFromNGN` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "borderCrossings" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "descriptionFr" TEXT,
ADD COLUMN     "fromCode" TEXT,
ADD COLUMN     "fromCountry" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "toCode" TEXT,
ADD COLUMN     "toCountry" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "durationHours" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "priceNGN",
ADD COLUMN     "countryFr" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descriptionFr" TEXT,
ADD COLUMN     "destination" TEXT,
ADD COLUMN     "destinationFr" TEXT,
ADD COLUMN     "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "highlightsFr" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "image" TEXT,
ADD COLUMN     "startingFromNGN" INTEGER NOT NULL,
ADD COLUMN     "titleFr" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "badgeFr" TEXT,
ADD COLUMN     "basePriceNGN" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "descriptionFr" TEXT,
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "featuresFr" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "image" TEXT,
ADD COLUMN     "luggageCapacity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nameFr" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "BorderFee" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryFr" TEXT,
    "border" TEXT NOT NULL,
    "borderFr" TEXT,
    "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "feePerPersonNGN" INTEGER NOT NULL,
    "feeRoundTripNGN" INTEGER NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "servicesFr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documentsFr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tips" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tipsFr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BorderFee_pkey" PRIMARY KEY ("id")
);
