-- src/db/schema.sql

-- 1. Create the Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Clerk User ID
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the Images Table
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size_bytes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create the AI Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    confidence_score FLOAT,
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
);

-- Add indexes for faster fetching in the dashboard
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_tags_image_id ON tags(image_id);