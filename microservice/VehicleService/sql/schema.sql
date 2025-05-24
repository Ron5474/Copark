\connect vehc;
DROP TABLE IF EXISTS vehicle CASCADE;
CREATE TABLE vehicle(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver UUID,
    data JSONB NOT NULL
);

DROP TABLE IF EXISTS default CASCADE;
CREATE TABLE default(
   driver UUID PRIMARY KEY,
   vehicle UUID REFERENCES vehicle(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX unique_plate ON vehicle (LOWER(data->>'plate'));
