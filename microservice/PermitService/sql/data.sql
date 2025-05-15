-- This file is not included in the submission archive, anything you do here is just for manual "testing" via the Swagger UI --

----- Your insert statements go below here -----
\connect perm;
INSERT INTO "zone" (id, data) VALUES
  (
    'e314f688-d150-411e-aa4f-38e679112e0e',
    jsonb_build_object(
      'zone', '123',
      'weekday', jsonb_build_object(
        'hourly', 2.45,
        'openTime', '07:00',
        'closeTime', '20:00',
        'maxDuration', jsonb_build_object(
          'hours', 2,
          'minutes', 0
        )
      ),
      'weekend', jsonb_build_object(
        'daily', 7.95,
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
        'hourly', 3.00,
        'openTime', '07:00',
        'closeTime', '20:00',
        'maxDuration', jsonb_build_object(
          'hours', 2
        )
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
        'hourly', 2.02,
        'openTime', '07:00',
        'closeTime', '20:00'
      ),
      'weekend', jsonb_build_object()
    )
  );

INSERT INTO permit (vehicle, zone, data) VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  'e314f688-d150-411e-aa4f-38e679112e0e',
  jsonb_build_object(
    'permitType', 'day',
    'purchaseDate', to_char((now() - interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expiresDate', to_char((now() + interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'price', 2.45,
    'paymentMethod', 'credit'
  )
);