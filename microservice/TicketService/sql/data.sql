-- This file is not included in the submission archive, anything you do here is just for manual "testing" via the Swagger UI --

----- Your insert statements go below here -----
\connect ticket;
INSERT INTO ticket (vehicle, issued_by, data)
VALUES (
  'e314f688-d150-411e-aa4f-4b0e6e56319d',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '1 minute',
    'violation', 'speeding',
    'fine', 100,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);

INSERT INTO ticket (vehicle, issued_by, data)
VALUES (
  'f26adf21-f967-4283-8417-f72298bc7bbe',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW(),
    'violation', 'parking',
    'fine', 50,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);