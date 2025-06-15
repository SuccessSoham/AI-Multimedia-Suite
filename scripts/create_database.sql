-- Create the AI Multimedia Suite database
IF NOT EXISTS (
    SELECT name FROM sys.databases WHERE name = N'ai_multimedia_suite'
)
BEGIN
    CREATE DATABASE ai_multimedia_suite;
END
GO

USE ai_multimedia_suite;
GO

-- Example: Create a minimal table to verify setup
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value NVARCHAR(MAX),
    description NVARCHAR(MAX),
    updated_at DATETIME DEFAULT GETDATE()
);
GO
