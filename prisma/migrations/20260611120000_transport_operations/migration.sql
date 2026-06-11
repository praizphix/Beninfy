-- Add operational booking fields without breaking existing booking rows.
ALTER TABLE "Booking"
ADD COLUMN "returnDate" TIMESTAMP(3),
ADD COLUMN "tripType" TEXT NOT NULL DEFAULT 'one_way',
ADD COLUMN "passengerName" TEXT,
ADD COLUMN "passengerEmail" TEXT,
ADD COLUMN "passengerPhone" TEXT,
ADD COLUMN "passportId" TEXT,
ADD COLUMN "nationality" TEXT,
ADD COLUMN "pickupAddress" TEXT,
ADD COLUMN "dropoffAddress" TEXT,
ADD COLUMN "specialRequirements" TEXT;

-- Physical fleet units belong to a public vehicle type/catalog entry.
CREATE TABLE "FleetVehicle" (
  "id" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "plateNumber" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'available',
  "currentCity" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FleetVehicle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FleetVehicle_plateNumber_key" ON "FleetVehicle"("plateNumber");

CREATE TABLE "Driver" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "status" TEXT NOT NULL DEFAULT 'available',
  "homeCity" TEXT,
  "licenseNumber" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VehicleBlock" (
  "id" TEXT NOT NULL,
  "fleetVehicleId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VehicleBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookingLeg" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  "departureDate" TIMESTAMP(3) NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "fleetVehicleId" TEXT,
  "driverId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'unassigned',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BookingLeg_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BookingLeg_bookingId_idx" ON "BookingLeg"("bookingId");
CREATE INDEX "BookingLeg_vehicleId_departureDate_idx" ON "BookingLeg"("vehicleId", "departureDate");
CREATE INDEX "BookingLeg_fleetVehicleId_departureDate_idx" ON "BookingLeg"("fleetVehicleId", "departureDate");
CREATE INDEX "BookingLeg_driverId_departureDate_idx" ON "BookingLeg"("driverId", "departureDate");

ALTER TABLE "FleetVehicle" ADD CONSTRAINT "FleetVehicle_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VehicleBlock" ADD CONSTRAINT "VehicleBlock_fleetVehicleId_fkey" FOREIGN KEY ("fleetVehicleId") REFERENCES "FleetVehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingLeg" ADD CONSTRAINT "BookingLeg_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingLeg" ADD CONSTRAINT "BookingLeg_fleetVehicleId_fkey" FOREIGN KEY ("fleetVehicleId") REFERENCES "FleetVehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BookingLeg" ADD CONSTRAINT "BookingLeg_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill existing one-way bookings as outbound legs.
INSERT INTO "BookingLeg" (
  "id",
  "bookingId",
  "direction",
  "from",
  "to",
  "departureDate",
  "vehicleId",
  "status",
  "updatedAt"
)
SELECT
  'leg_' || "id",
  "id",
  'outbound',
  "from",
  "to",
  "date",
  "vehicleId",
  'unassigned',
  CURRENT_TIMESTAMP
FROM "Booking"
WHERE NOT EXISTS (
  SELECT 1 FROM "BookingLeg" WHERE "BookingLeg"."bookingId" = "Booking"."id"
);
