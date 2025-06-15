-- AI Multimedia Production Suite Database Schema
-- This script creates the database structure for storing jobs, agents, and communication logs

-- Create database (uncomment if needed)
-- CREATE DATABASE ai_multimedia_suite;
-- USE ai_multimedia_suite;

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('video', 'audio', 'storyboard', 'metadata', 'orchestrator') NOT NULL,
    status ENUM('idle', 'processing', 'completed', 'error', 'offline') DEFAULT 'idle',
    capabilities JSON,
    last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Processing jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
    id VARCHAR(50) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_type VARCHAR(100),
    file_size BIGINT,
    status ENUM('queued', 'processing', 'completed', 'error', 'cancelled') DEFAULT 'queued',
    progress DECIMAL(5,2) DEFAULT 0.00,
    priority ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    error_message TEXT NULL
);

-- Agent job assignments
CREATE TABLE IF NOT EXISTS agent_job_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'error', 'skipped') DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    results JSON,
    error_message TEXT NULL,
    FOREIGN KEY (job_id) REFERENCES processing_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_agent (job_id, agent_id)
);

-- A2A communication messages
CREATE TABLE IF NOT EXISTS a2a_messages (
    id VARCHAR(50) PRIMARY KEY,
    from_agent VARCHAR(50) NOT NULL,
    to_agent VARCHAR(50) NOT NULL,
    message_type ENUM('request', 'response', 'notification', 'ack', 'error') NOT NULL,
    protocol_version VARCHAR(10) DEFAULT '2.0',
    priority ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal',
    requires_ack BOOLEAN DEFAULT FALSE,
    correlation_id VARCHAR(50) NULL,
    payload JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP NULL,
    INDEX idx_from_agent (from_agent),
    INDEX idx_to_agent (to_agent),
    INDEX idx_timestamp (timestamp),
    INDEX idx_correlation (correlation_id)
);

-- Processing results table
CREATE TABLE IF NOT EXISTS processing_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    result_type VARCHAR(100) NOT NULL,
    result_data JSON,
    file_outputs JSON, -- Store paths to generated files
    metrics JSON, -- Performance and quality metrics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES processing_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- System configuration
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value JSON,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default agents
INSERT INTO agents (id, name, type, capabilities) VALUES
('video-agent', 'Video Enhancement Agent', 'video', 
 '["noise_reduction", "upscaling", "color_correction", "scene_detection", "frame_interpolation"]'),
('audio-agent', 'Audio Optimization Agent', 'audio', 
 '["noise_reduction", "enhancement", "music_generation", "speech_to_text", "audio_separation"]'),
('storyboard-agent', 'Storyboard Generation Agent', 'storyboard', 
 '["scene_analysis", "key_frame_extraction", "visual_composition", "timeline_generation", "shot_classification"]'),
('metadata-agent', 'Metadata Extraction Agent', 'metadata', 
 '["ocr", "object_detection", "tag_generation", "content_analysis", "sentiment_analysis"]'),
('orchestrator', 'Orchestrator Agent', 'orchestrator', 
 '["job_scheduling", "agent_coordination", "pipeline_management", "resource_allocation"]');

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('max_concurrent_jobs', '5', 'Maximum number of jobs that can be processed simultaneously'),
('default_processing_timeout', '3600', 'Default timeout for processing jobs in seconds'),
('a2a_protocol_version', '"2.0"', 'Current A2A protocol version'),
('supported_file_types', '["video/mp4", "video/avi", "video/mov", "audio/wav", "audio/mp3", "image/jpeg", "image/png"]', 'Supported file types for processing'),
('agent_heartbeat_interval', '30', 'Agent heartbeat interval in seconds'),
('message_retention_days', '30', 'Number of days to retain A2A messages');

-- Create indexes for better performance
CREATE INDEX idx_jobs_status ON processing_jobs(status);
CREATE INDEX idx_jobs_created ON processing_jobs(created_at);
CREATE INDEX idx_assignments_status ON agent_job_assignments(status);
CREATE INDEX idx_results_job ON processing_results(job_id);

-- Create views for common queries
CREATE VIEW agent_status_summary AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.status,
    COUNT(aja.id) as active_jobs,
    a.last_heartbeat
FROM agents a
LEFT JOIN agent_job_assignments aja ON a.id = aja.agent_id AND aja.status = 'processing'
GROUP BY a.id, a.name, a.type, a.status, a.last_heartbeat;

CREATE VIEW job_progress_summary AS
SELECT 
    pj.id,
    pj.file_name,
    pj.status as job_status,
    pj.progress,
    COUNT(aja.id) as total_agents,
    SUM(CASE WHEN aja.status = 'completed' THEN 1 ELSE 0 END) as completed_agents,
    SUM(CASE WHEN aja.status = 'processing' THEN 1 ELSE 0 END) as processing_agents,
    SUM(CASE WHEN aja.status = 'error' THEN 1 ELSE 0 END) as error_agents,
    pj.created_at,
    pj.started_at,
    pj.completed_at
FROM processing_jobs pj
LEFT JOIN agent_job_assignments aja ON pj.id = aja.job_id
GROUP BY pj.id, pj.file_name, pj.status, pj.progress, pj.created_at, pj.started_at, pj.completed_at;

COMMIT;
