-- This file is not included in the submission archive, anything you do here is just for manual "testing" via the Swagger UI --

----- Your insert statements go below here -----
\connect vehc;
INSERT INTO vehicle (driver, data) VALUES
  (
    'e314f688-d150-411e-aa4f-4b0e6e56319d',
    jsonb_build_object(
      'plate', '7XYZ123',
      'country', 'United States',
      'state', 'California',
      'nickname', 'Work car'
    )
  );

INSERT INTO vehicle (id, driver, data) VALUES
(
  'f2d7800e-67ce-41aa-b1fe-38e679112e0e',
  '39f48f9f-2693-446b-ad98-8e0db1ef14bd',
  jsonb_build_object(
    'plate', '7RON123',
    'country', 'United States',
    'state', 'California',
    'nickname', 'School car'
  )
);

INSERT INTO vehicle (driver, data) VALUES
  (
    '4c0d7053-7bab-4494-8d42-d7384d983809',
    jsonb_build_object(
      'plate', '4BRY123',
      'country', 'United States',
      'state', 'California',
      'nickname', 'Motorbike'
    )
  );

INSERT INTO vehicle (driver, data) VALUES
  (
    'f26adf21-f967-4283-8417-f72298bc7bbe',
    jsonb_build_object(
      'plate', '8ABC456',
      'country', 'United States',
      'state', 'California',
      'nickname', 'Daily driver'
    )
  );

INSERT INTO vehicle (driver, data) VALUES
  (
    '307ae958-ac4b-4842-aece-4c81d80443dd',
    jsonb_build_object(
      'plate', '9LMN789',
      'country', 'United States',
      'state', 'Nevada',
      'nickname', 'Truck'
    )
  );

INSERT INTO vehicle (id, driver, data) VALUES
  (
    'b69c877b-cfde-430c-8856-a2354d2e0d06',
    '0f99f921-594e-4387-9d05-e6e80d8aa54a',
    jsonb_build_object(
      'plate', '7ABC123',
      'country', 'United States',
      'state', 'New York',
      'nickname', 'Flying car'
    )
  );

INSERT INTO vehicle (id, driver, data) VALUES
  (
    '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
    'b1eab387-1000-4ee3-a746-d59366e44f06',
    jsonb_build_object(
      'plate', 'JCDE544',
      'country', 'United States',
      'state', 'New York',
      'nickname', 'Hunka junk'
    )
  );

INSERT INTO defaultVehicle(driver, vehicle) VALUES
  (
    'b1eab387-1000-4ee3-a746-d59366e44f06',
    '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5'
  );