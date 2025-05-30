\connect vehc;
DROP TABLE IF EXISTS vehicle CASCADE;
CREATE TABLE vehicle(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver UUID,
    data JSONB NOT NULL
);

CREATE UNIQUE INDEX unique_plate_state
  ON vehicle (
    LOWER(data->>'plate'),
    LOWER(data->>'state')
  );

DROP TABLE IF EXISTS defaultVehicle CASCADE;
CREATE TABLE defaultVehicle(
   driver UUID PRIMARY KEY,
   vehicle UUID REFERENCES vehicle(id) ON DELETE CASCADE
);

CREATE INDEX driver ON defaultVehicle(driver);