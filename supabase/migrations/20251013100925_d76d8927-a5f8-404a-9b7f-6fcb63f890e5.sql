-- Assign admin and super-admin roles to the specified user
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('b1d1329c-ee77-483f-9d0b-b48ec2c0e560', 'admin'),
  ('b1d1329c-ee77-483f-9d0b-b48ec2c0e560', 'super-admin')
ON CONFLICT (user_id, role) DO NOTHING;