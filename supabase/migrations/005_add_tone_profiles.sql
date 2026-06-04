ALTER TABLE sillytales_preferences
  ADD COLUMN IF NOT EXISTS tone_profiles text[] DEFAULT NULL;
