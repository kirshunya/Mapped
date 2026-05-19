-- Add location fields to chat_messages table
-- Migration: 005_add_location_to_chat_messages.sql

BEGIN;

-- Check if columns already exist before adding them
DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='chat_messages' AND column_name='location_name'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN location_name VARCHAR(200) DEFAULT '';
    END IF;
    
    IF NOT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='chat_messages' AND column_name='location_lat'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN location_lat FLOAT DEFAULT 0;
    END IF;
    
    IF NOT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='chat_messages' AND column_name='location_lng'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN location_lng FLOAT DEFAULT 0;
    END IF;
END $$;

-- Create index on location fields for faster queries (optional)
-- CREATE INDEX IF NOT EXISTS idx_chat_messages_location ON chat_messages(location_lat, location_lng);

COMMIT;
