-- Split SUV pricing into model-level booking types so RAV4 2010 can use its
-- special fare while Highlander and the base SUV category keep standard SUV fare.

INSERT INTO "Vehicle" (
  "id",
  "name",
  "nameFr",
  "capacity",
  "luggageCapacity",
  "available",
  "image",
  "description",
  "descriptionFr",
  "badge",
  "badgeFr",
  "features",
  "featuresFr",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'rav4-2010',
    'SUV RAV4 2010',
    'SUV RAV4 2010',
    4,
    4,
    true,
    '/images/fleet/suv.jpg',
    'Toyota RAV4 2010 SUV for efficient private cross-border rides at the special RAV4 2010 fare.',
    'Toyota RAV4 2010 pour trajets privés transfrontaliers efficaces au tarif spécial RAV4 2010.',
    'Value SUV',
    'SUV Économique',
    ARRAY['Air Conditioning','USB Charging','Comfort Seating','Border Protocol Included']::TEXT[],
    ARRAY['Climatisation','Chargeur USB','Sièges Confort','Protocole Frontalier Inclus']::TEXT[],
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'highlander',
    'SUV Highlander',
    'SUV Highlander',
    4,
    4,
    true,
    '/images/fleet/suv.jpg',
    'Toyota Highlander SUV for comfortable private cross-border travel with the standard SUV fare.',
    'Toyota Highlander pour trajets privés transfrontaliers confortables au tarif SUV standard.',
    'Comfort SUV',
    'SUV Confort',
    ARRAY['Dual-Zone AC','USB Charging','Spacious Cabin','Border Protocol Included']::TEXT[],
    ARRAY['Climatisation Bi-Zone','Chargeur USB','Cabine Spacieuse','Protocole Frontalier Inclus']::TEXT[],
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "nameFr" = EXCLUDED."nameFr",
  "capacity" = EXCLUDED."capacity",
  "luggageCapacity" = EXCLUDED."luggageCapacity",
  "available" = EXCLUDED."available",
  "image" = EXCLUDED."image",
  "description" = EXCLUDED."description",
  "descriptionFr" = EXCLUDED."descriptionFr",
  "badge" = EXCLUDED."badge",
  "badgeFr" = EXCLUDED."badgeFr",
  "features" = EXCLUDED."features",
  "featuresFr" = EXCLUDED."featuresFr",
  "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "FleetVehicle"
SET "vehicleId" = 'highlander', "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN (
  'fleet-highlander-2013-01',
  'fleet-highlander-2013-02',
  'fleet-highlander-2013-03',
  'fleet-highlander-2013-04'
);

UPDATE "FleetVehicle"
SET "vehicleId" = 'rav4-2010', "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'fleet-rav4-2010-01';
