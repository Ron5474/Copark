\connect perm;
DROP TABLE IF EXISTS permit CASCADE;
CREATE TABLE permit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle UUID NOT NULL,
    data JSONB NOT NULL
);