-- Allow route prices to carry a scope, so Lagos saloon Mainland and Island
-- prices can be managed separately from standard route/category fares.

ALTER TABLE "RoutePrice"
ADD COLUMN "pricingScope" TEXT NOT NULL DEFAULT 'default';

DROP INDEX IF EXISTS "RoutePrice_routeId_vehicleId_key";

CREATE UNIQUE INDEX "RoutePrice_routeId_vehicleId_pricingScope_key"
ON "RoutePrice"("routeId", "vehicleId", "pricingScope");
