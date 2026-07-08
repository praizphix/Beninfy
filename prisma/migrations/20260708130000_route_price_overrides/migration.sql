-- Admin-managed route prices. These override the code fallback pricing table.

CREATE TABLE "RoutePrice" (
  "id" TEXT NOT NULL,
  "routeId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "amountNGN" INTEGER NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RoutePrice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoutePrice_routeId_vehicleId_key" ON "RoutePrice"("routeId", "vehicleId");
CREATE INDEX "RoutePrice_vehicleId_idx" ON "RoutePrice"("vehicleId");

ALTER TABLE "RoutePrice"
ADD CONSTRAINT "RoutePrice_routeId_fkey"
FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
