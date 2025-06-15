-- AI Multimedia Production Suite Database Schema (SQL Server Compatible)

-- Create the database
CREATE DATABASE ai_multimedia_suite;
GO

USE ai_multimedia_suite;
GO

-- Agents table
CREATE TABLE agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('video', 'audio', 'storyboard', 'metadata', 'orchestrator')) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('idle', 'processing', 'completed', 'error', 'offline')) DEFAULT 'idle',
    capabilities NVARCHAR(MAX),
    last_heartbeat DATETIME DEFAULT GETDATE(),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Processing jobs table
CREATE TABLE processing_jobs (
    id VARCHAR(50) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_type VARCHAR(100),
    file_size BIGINT,
    status VARCHAR(50) CHECK (status IN ('queued', 'processing', 'completed', 'error', 'cancelled')) DEFAULT 'queued',
    progress DECIMAL(5,2) DEFAULT 0.00,
    priority VARCHAR(50) CHECK (priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
    created_at DATETIME DEFAULT GETDATE(),
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    error_message NVARCHAR(MAX) NULL
);
GO

-- Agent job assignments
CREATE TABLE agent_job_assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'completed', 'error', 'skipped')) DEFAULT 'pending',
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    results NVARCHAR(MAX),
    error_message NVARCHAR(MAX),
    CONSTRAINT FK_job FOREIGN KEY (job_id) REFERENCES processing_jobs(id) ON DELETE CASCADE,
    CONSTRAINT FK_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    CONSTRAINT unique_job_agent UNIQUE (job_id, agent_id)
);
GO

-- A2A communication messages
CREATE TABLE a2a_messages (
    id VARCHAR(50) PRIMARY KEY,
    from_agent VARCHAR(50) NOT NULL,
    to_agent VARCHAR(50) NOT NULL,
    message_type VARCHAR(50) CHECK (message_type IN ('request', 'response', 'notification', 'ack', 'error')) NOT NULL,
    protocol_version VARCHAR(10) DEFAULT '2.0',
    priority VARCHAR(50) CHECK (priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
    requires_ack BIT DEFAULT 0,
    correlation_id VARCHAR(50) NULL,
    payload NVARCHAR(MAX),
    timestamp DATETIME DEFAULT GETDATE(),
    acknowledged_at DATETIME NULL
);
GO

-- Indexes for A2A
CREATE INDEX idx_from_agent ON a2a_messages(from_agent);
CREATE INDEX idx_to_agent ON a2a_messages(to_agent);
CREATE INDEX idx_timestamp ON a2a_messages(timestamp);
CREATE INDEX idx_correlation ON a2a_messages(correlation_id);
GO

-- Processing results table
CREATE TABLE processing_results (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    result_type VARCHAR(100) NOT NULL,
    result_data NVARCHAR(MAX),
    file_outputs NVARCHAR(MAX),
    metrics NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (job_id) REFERENCES processing_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);
GO

-- System configuration table
CREATE TABLE system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value NVARCHAR(MAX),
    description NVARCHAR(MAX),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Insert default agent definitions
INSERT INTO agents (id, name, type, capabilities) VALUES
('video-agent', 'Video Enhancement Agent', 'video', 
 N'["noise_reduction", "upscaling", "color_correction", "scene_detection", "frame_interpolation"]'),
('audio-agent', 'Audio Optimization Agent', 'audio', 
 N'["noise_reduction", "enhancement", "music_generation", "speech_to_text", "audio_separation"]'),
('storyboard-agent', 'Storyboard Generation Agent', 'storyboard', 
 N'["scene_analysis", "key_frame_extraction", "visual_composition", "timeline_generation", "shot_classification"]'),
('metadata-agent', 'Metadata Extraction Agent', 'metadata', 
 N'["ocr", "object_detection", "tag_generation", "content_analysis", "sentiment_analysis"]'),
('orchestrator', 'Orchestrator Agent', 'orchestrator', 
 N'["job_scheduling", "agent_coordination", "pipeline_management", "resource_allocation"]');
GO

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('max_concurrent_jobs', '5', 'Maximum number of jobs that can be processed simultaneously'),
('default_processing_timeout', '3600', 'Default timeout for processing jobs in seconds'),
('a2a_protocol_version', '"2.0"', 'Current A2A protocol version'),
('supported_file_types', 
 N'["video/mp4", "video/avi", "video/mov", "audio/wav", "audio/mp3", "image/jpeg", "image/png"]', 
 'Supported file types for processing'),
('agent_heartbeat_interval', '30', 'Agent heartbeat interval in seconds'),
('message_retention_days', '30', 'Number of days to retain A2A messages');
GO

-- Additional indexes
CREATE INDEX idx_jobs_status ON processing_jobs(status);
CREATE INDEX idx_jobs_created ON processing_jobs(created_at);
CREATE INDEX idx_assignments_status ON agent_job_assignments(status);
CREATE INDEX idx_results_job ON processing_results(job_id);
GO

-- Views
CREATE VIEW agent_status_summary AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.status,
    COUNT(aja.id) AS active_jobs,
    a.last_heartbeat
FROM agents a
LEFT JOIN agent_job_assignments aja ON a.id = aja.agent_id AND aja.status = 'processing'
GROUP BY a.id, a.name, a.type, a.status, a.last_heartbeat;
GO

CREATE VIEW job_progress_summary AS
SELECT 
    pj.id,
    pj.file_name,
    pj.status AS job_status,
    pj.progress,
    COUNT(aja.id) AS total_agents,
    SUM(CASE WHEN aja.status = 'completed' THEN 1 ELSE 0 END) AS completed_agents,
    SUM(CASE WHEN aja.status = 'processing' THEN 1 ELSE 0 END) AS processing_agents,
    SUM(CASE WHEN aja.status = 'error' THEN 1 ELSE 0 END) AS error_agents,
    pj.created_at,
    pj.started_at,
    pj.completed_at
FROM processing_jobs pj
LEFT JOIN agent_job_assignments aja ON pj.id = aja.job_id
GROUP BY pj.id, pj.file_name, pj.status, pj.progress, pj.created_at, pj.started_at, pj.completed_at;
GO
