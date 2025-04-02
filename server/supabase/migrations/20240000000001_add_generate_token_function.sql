-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    new_token text;
BEGIN
    -- Generate a random UUID and remove hyphens
    new_token := replace(gen_random_uuid()::text, '-', '');
    
    RETURN jsonb_build_object('token', new_token);
END;
$$; 