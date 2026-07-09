UPDATE "FleetVehicle"
SET "label" = regexp_replace("label", '\s+0?[0-9]{1,2}$', '')
WHERE "label" ~ '\s+0?[0-9]{1,2}$';
