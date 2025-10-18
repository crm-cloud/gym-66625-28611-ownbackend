-- Add unique constraint to user_roles and assign super-admin role
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role);

-- Now insert super-admin role
INSERT INTO user_roles (user_id, role)
VALUES ('b1d1329c-ee77-483f-9d0b-b48ec2c0e560', 'super-admin');