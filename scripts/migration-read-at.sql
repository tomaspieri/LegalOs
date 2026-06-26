-- Add read_at column to calls and messages for notification tracking
ALTER TABLE calls ADD COLUMN IF NOT EXISTS read_at timestamptz;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at timestamptz;
