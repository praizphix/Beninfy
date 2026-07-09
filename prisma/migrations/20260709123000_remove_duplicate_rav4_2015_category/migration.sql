DO $$
DECLARE
  target_vehicle_id TEXT;
  duplicate_vehicle_ids TEXT[];
BEGIN
  SELECT "id"
  INTO target_vehicle_id
  FROM "Vehicle"
  WHERE lower("id") = 'rav4'
  LIMIT 1;

  IF target_vehicle_id IS NULL THEN
    SELECT "id"
    INTO target_vehicle_id
    FROM "Vehicle"
    WHERE lower("id") = 'suv'
    LIMIT 1;
  END IF;

  IF target_vehicle_id IS NULL THEN
    RETURN;
  END IF;

  SELECT array_agg("id")
  INTO duplicate_vehicle_ids
  FROM "Vehicle"
  WHERE lower("id") IN ('rav4-2015', 'rav-4-2015', 'rav4_2015')
     OR lower("name") IN ('rav4 2015', 'rav 4 2015', 'suv rav4 2015', 'suv rav 4 2015');

  IF duplicate_vehicle_ids IS NULL THEN
    RETURN;
  END IF;

  duplicate_vehicle_ids := array_remove(duplicate_vehicle_ids, target_vehicle_id);

  IF array_length(duplicate_vehicle_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  UPDATE "Booking"
  SET "vehicleId" = target_vehicle_id
  WHERE "vehicleId" = ANY(duplicate_vehicle_ids);

  UPDATE "BookingLeg"
  SET "vehicleId" = target_vehicle_id
  WHERE "vehicleId" = ANY(duplicate_vehicle_ids);

  UPDATE "FleetVehicle"
  SET "vehicleId" = target_vehicle_id,
      "updatedAt" = CURRENT_TIMESTAMP
  WHERE "vehicleId" = ANY(duplicate_vehicle_ids);

  DELETE FROM "RoutePrice"
  WHERE "vehicleId" = ANY(duplicate_vehicle_ids);

  DELETE FROM "Vehicle"
  WHERE "id" = ANY(duplicate_vehicle_ids);
END $$;
