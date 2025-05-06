-- This file is not included in the submission archive, anything you do here is just for manual "testing" via the Swagger UI --

----- Your insert statements go below here -----
\connect vehc
INSERT INTO vehicle (driver, data) VALUES
  (
    'e314f688-d150-411e-aa4f-4b0e6e56319d',
    jsonb_build_object(
      'plate', '7XYZ123',
      'country', 'US',
      'state', 'CA',
      'nickname', 'Work car'
    )
  );

INSERT INTO vehicle (driver, data) VALUES
  (
    'f26adf21-f967-4283-8417-f72298bc7bbe',
    jsonb_build_object(
      'plate', '8ABC456',
      'country', 'US',
      'state', 'CA',
      'nickname', 'Daily driver'
    )
  );

INSERT INTO vehicle (driver, data) VALUES
  (
    '307ae958-ac4b-4842-aece-4c81d80443dd',
    jsonb_build_object(
      'plate', '9LMN789',
      'country', 'US',
      'state', 'NV',
      'nickname', 'Truck'
    )
  );