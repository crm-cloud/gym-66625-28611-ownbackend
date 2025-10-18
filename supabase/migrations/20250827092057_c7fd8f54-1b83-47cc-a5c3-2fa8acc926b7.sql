-- Add unique constraint to trainer_profiles.user_id
ALTER TABLE trainer_profiles ADD CONSTRAINT trainer_profiles_user_id_unique UNIQUE (user_id);