-- Seed the real physical fleet inventory used for booking availability.
-- Placeholder plate numbers can be edited later in the admin Fleet units page.

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
  ('saloon', 'Saloon Car', 'Berline', 3, 2, true, '/images/fleet/saloon.jpg', 'Executive saloon perfect for solo travellers or couples seeking privacy and efficiency on cross-border trips.', 'Berline executive idéale pour les voyageurs seuls ou les couples recherchant confidentialité et efficacité.', 'Premium Class', 'Classe Premium', ARRAY['Air Conditioning','USB Charging','Professional Chauffeur','Border Protocol Included']::TEXT[], ARRAY['Climatisation','Chargeur USB','Chauffeur Professionnel','Protocole Frontalier Inclus']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('suv', 'SUV', 'SUV', 4, 4, true, '/images/fleet/suv.jpg', 'Superior comfort SUV for long-distance travel and VIP escort services. Toyota RAV4 or equivalent.', 'SUV de confort supérieur pour les longs trajets et les services d’escorte VIP.', 'Business Elite', 'Élite Affaires', ARRAY['Dual-Zone AC','WiFi Hotspot','USB Charging','Luggage Space','Border Protocol Included']::TEXT[], ARRAY['Climatisation Bi-Zone','WiFi Hotspot','Chargeur USB','Espace Bagages','Protocole Frontalier Inclus']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sienna', 'Sienna', 'Sienna', 6, 6, true, '/images/fleet/sienna.jpg', 'Toyota Sienna minivan. The gold standard for family cross-border trips with flexible seating and generous luggage space.', 'Toyota Sienna. La référence pour les voyages transfrontaliers familiaux avec sièges flexibles et espace bagages généreux.', 'Family Travel', 'Voyage Famille', ARRAY['Rear-Cabin AC','USB Charging','Flexible Seating','Large Boot','Border Protocol Included']::TEXT[], ARRAY['Climatisation Arrière','Chargeur USB','Sièges Flexibles','Grand Coffre','Protocole Frontalier Inclus']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('prado', 'Prado', 'Prado', 4, 4, true, '/images/fleet/prado.jpg', 'Toyota Prado. The benchmark for diplomatic and executive travel across West African borders. Enhanced security features available.', 'Toyota Prado. La référence pour les voyages diplomatiques et exécutifs. Options de sécurité avancées disponibles.', 'VIP Security', 'Sécurité VIP', ARRAY['Full AC','Security Options','High Clearance','Premium Interior','Border Protocol Included']::TEXT[], ARRAY['Climatisation Complète','Options de Sécurité','Garde au Sol Élevé','Intérieur Premium','Protocole Frontalier Inclus']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sprinter', 'Sprinter Bus', 'Bus Sprinter', 14, 14, true, '/images/fleet/sprinter.jpg', 'Mercedes Sprinter with custom interior. First-class group travel with reclining leather seats and onboard entertainment.', 'Mercedes Sprinter avec intérieur personnalisé. Voyage de groupe première classe avec sièges en cuir inclinables.', 'Executive Coach', 'Coach Exécutif', ARRAY['Industrial AC','Reclining Leather Seats','WiFi Hotspot','TV & Entertainment','Large Cargo Space']::TEXT[], ARRAY['Climatisation Industrielle','Sièges Cuir Inclinables','WiFi Hotspot','TV & Divertissement','Grand Espace Cargo']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FleetVehicle" (
  "id",
  "vehicleId",
  "label",
  "plateNumber",
  "status",
  "currentCity",
  "notes",
  "createdAt",
  "updatedAt"
)
VALUES
  ('fleet-highlander-2013-01', 'suv', '2013 Highlander 01', 'BENINFY-HIGHLANDER-2013-01', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-highlander-2013-02', 'suv', '2013 Highlander 02', 'BENINFY-HIGHLANDER-2013-02', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-highlander-2013-03', 'suv', '2013 Highlander 03', 'BENINFY-HIGHLANDER-2013-03', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-highlander-2013-04', 'suv', '2013 Highlander 04', 'BENINFY-HIGHLANDER-2013-04', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-rav4-2015-01', 'suv', 'RAV4 2015 01', 'BENINFY-RAV4-2015-01', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-rav4-2010-01', 'suv', 'RAV4 2010 01', 'BENINFY-RAV4-2010-01', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-gx460-2020-01', 'prado', 'GX460 2020 01', 'BENINFY-GX460-2020-01', 'available', NULL, 'Inventory seed. GX460 uses the Prado/VIP SUV booking and pricing bucket.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-sienna-2005-01', 'sienna', 'Sienna 2005 01', 'BENINFY-SIENNA-2005-01', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-sienna-2009-01', 'sienna', 'Sienna 2009 01', 'BENINFY-SIENNA-2009-01', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-sprinter-01', 'sprinter', 'Mercedes Sprinter Bus 01', 'BENINFY-SPRINTER-01', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-camry-2015-01', 'saloon', 'Camry 2015 01', 'BENINFY-CAMRY-2015-01', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-camry-2008-01', 'saloon', 'Camry 2008 01', 'BENINFY-CAMRY-2008-01', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fleet-camry-2010-01', 'saloon', 'Camry 2010 01', 'BENINFY-CAMRY-2010-01', 'available', NULL, 'Inventory seed. Replace placeholder plate number with the real plate when available.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
