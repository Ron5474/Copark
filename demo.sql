\connect auth;
INSERT INTO account(id, data) VALUES (
  'd49e13bf-0796-42c5-b45d-be6633f9d7e2',
  jsonb_build_object(
    'sub', '108502935711848983189',
    'name', 'Swayam Shah',
    'role', jsonb_build_array('driver'),
    'email', 'helloswayamshah@gmail.com',
    'picture', 'https://lh3.googleusercontent.com/a/ACg8ocL6Tq9_cPiIsw_-GHkIThjzaHUxCU1jcKsIAZ7G5Z0OI3j8UcoAgQ=s96-c',
    'created_at', '2025-06-03T00:23:48.560133+00:00',
    'onboardingStatus', 'complete'
  )
);

INSERT INTO account(id, data) VALUES (
  '07a30268-d2cf-4220-b036-0c0eaaf50a75',
  jsonb_build_object(
    'sub', '105877725907953606418',
    'name', 'Swayam Shah',
    'role', jsonb_build_array('driver'),
    'email', 'talk2swayamshah@gmail.com',
    'picture', 'https://lh3.googleusercontent.com/a/ACg8ocK_fn50N4mbjLL6xPRWfcML_QlUUJSVeaLWEaCtjdAJBDXR7qk=s96-c',
    'created_at', '2025-06-03T00:23:48.560133+00:00',
    'onboardingStatus', 'complete'
  )
);

\connect vehc;

INSERT INTO vehicle(id, driver, data) VALUES (
  '8aa5358c-5081-40c8-8e8d-5d66e39ebd03',
  'd49e13bf-0796-42c5-b45d-be6633f9d7e2',
  jsonb_build_object(
    'plate', 'HASPERMIT',
    'country', 'US',
    'state', 'CA',
    'nickname', 'Permit Vehicle'
  )
);

INSERT INTO defaultVehicle(driver, vehicle) VALUES (
  'd49e13bf-0796-42c5-b45d-be6633f9d7e2',
  '8aa5358c-5081-40c8-8e8d-5d66e39ebd03'
);

INSERT INTO vehicle(id, driver, data) VALUES (
  'd628370a-7a95-42ca-97d2-985ac1ce1bb5',
  '07a30268-d2cf-4220-b036-0c0eaaf50a75',
  jsonb_build_object(
    'plate', 'NOPERMIT',
    'country', 'US',
    'state', 'CA',
    'nickname', 'No Permit Vehicle'
  )
);

INSERT INTO defaultVehicle(driver, vehicle) VALUES (
  '07a30268-d2cf-4220-b036-0c0eaaf50a75',
  'd628370a-7a95-42ca-97d2-985ac1ce1bb5'
);

