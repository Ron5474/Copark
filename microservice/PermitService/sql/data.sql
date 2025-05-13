-- This file is not included in the submission archive, anything you do here is just for manual "testing" via the Swagger UI --

----- Your insert statements go below here -----
\connect perm;
INSERT INTO "zone" (id, data) VALUES
  (
    'e314f688-d150-411e-aa4f-38e679112e0e',
    jsonb_build_object(
      'zone', '123',
      'weekday', jsonb_build_object(
        'hourly', '2.45',
        'openTime', '07:00',
        'closeTime', '20:00',
        'maxDuration', '2:00'
      ),
      'weekend', jsonb_build_object(
        'daily', '7.95',
        'openTime', '7:00',
        'closeTime', '20:00'
      )
    )
  );

INSERT INTO "zone" (id, data) VALUES
  (
    '39f48f9f-2693-446b-ad98-f72298bc7bbe',
    jsonb_build_object(
      'zone', '111',
      'weekday', jsonb_build_object(
        'hourly', '3.00',
        'openTime', '07:00',
        'closeTime', '20:00',
        'maxDuration', '2:00'
      ),
      'weekend', jsonb_build_object()
    )
  );

INSERT INTO "zone" (id, data) VALUES
  (
    'f26adf21-f967-4283-8417-8e0db1ef14bd',
    jsonb_build_object(
      'zone', '27',
      'weekday', jsonb_build_object(
        'hourly', '2.02',
        'openTime', '07:00',
        'closeTime', '20:00'
      ),
      'weekend', jsonb_build_object()
    )
  );