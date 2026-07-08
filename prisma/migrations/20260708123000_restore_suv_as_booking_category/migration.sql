-- Restore SUV as the customer-facing booking category.
-- Physical SUV models such as Highlander and RAV4 should be fleet units under "suv".

UPDATE "BookingLeg"
SET "vehicleId" = 'suv'
WHERE "vehicleId" IN ('highlander', 'rav4-2010');

UPDATE "Booking"
SET "vehicleId" = 'suv'
WHERE "vehicleId" IN ('highlander', 'rav4-2010');

UPDATE "FleetVehicle"
SET "vehicleId" = 'suv', "updatedAt" = CURRENT_TIMESTAMP
WHERE "vehicleId" IN ('highlander', 'rav4-2010')
   OR "id" IN (
    'fleet-highlander-2013-01',
    'fleet-highlander-2013-02',
    'fleet-highlander-2013-03',
    'fleet-highlander-2013-04',
    'fleet-rav4-2010-01'
  );

DELETE FROM "Vehicle"
WHERE "id" IN ('highlander', 'rav4-2010');
