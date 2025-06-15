-- AI Multimedia Production Suite Schema (PostgreSQL / Supabase Compatible)

-- Agents table
CREATE TABLE public.agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('video', 'audio', 'storyboard', 'metadata', 'orchestrator')) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('idle', 'processing', 'completed', 'error', 'offline')) DEFAULT 'idle',
    capabilities JSONB,
    last_heartbeat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Processing jobs table
CREATE TABLE public.processing_jobs (
    id VARCHAR(50) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_type VARCHAR(100),
    file_size BIGINT,
    status VARCHAR(50) CHECK (status IN ('queued', 'processing', 'completed', 'error', 'cancelled')) DEFAULT 'queued',
    progress NUMERIC(5,2) DEFAULT 0.00,
    priority VARCHAR(50) CHECK (priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

-- Agent job assignments
CREATE TABLE public.agent_job_assignments (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'completed', 'error', 'skipped')) DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    results JSONB,
    error_message TEXT,
    CONSTRAINT fk_job FOREIGN KEY (job_id) REFERENCES public.processing_jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE,
    CONSTRAINT unique_job_agent UNIQUE (job_id, agent_id)
);

-- A2A communication messages
CREATE TABLE public.a2a_messages (
    id VARCHAR(50) PRIMARY KEY,
    from_agent VARCHAR(50) NOT NULL,
    to_agent VARCHAR(50) NOT NULL,
    message_type VARCHAR(50) CHECK (message_type IN ('request', 'response', 'notification', 'ack', 'error')) NOT NULL,
    protocol_version VARCHAR(10) DEFAULT '2.0',
    priority VARCHAR(50) CHECK (priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
    requires_ack BOOLEAN DEFAULT FALSE,
    correlation_id VARCHAR(50),
    payload JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMPTZ
);

-- Indexes for A2A
CREATE INDEX idx_from_agent ON public.a2a_messages(from_agent);
CREATE INDEX idx_to_agent ON public.a2a_messages(to_agent);
CREATE INDEX idx_timestamp ON public.a2a_messages(timestamp);
CREATE INDEX idx_correlation ON public.a2a_messages(correlation_id);

-- Processing results table
CREATE TABLE public.processing_results (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    result_type VARCHAR(100) NOT NULL,
    result_data JSONB,
    file_outputs JSONB,
    metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES public.processing_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE
);

-- System configuration table
CREATE TABLE public.system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value JSONB,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Default agent inserts
INSERT INTO public.agents (id, name, type, capabilities) VALUES
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

-- Default system config
INSERT INTO public.system_config (config_key, config_value, description) VALUES
('max_concurrent_jobs', '5', 'Maximum number of jobs that can be processed simultaneously'),
('default_processing_timeout', '3600', 'Default timeout for processing jobs in seconds'),
('a2a_protocol_version', '"2.0"', 'Current A2A protocol version'),
('supported_file_types', 
 '["video/mp4", "video/avi", "video/mov", "audio/wav", "audio/mp3", "image/jpeg", "image/png"]',
 'Supported file types for processing'),
('agent_heartbeat_interval', '30', 'Agent heartbeat interval in seconds'),
('message_retention_days', '30', 'Number of days to retain A2A messages');

-- Additional indexes
CREATE INDEX idx_jobs_status ON public.processing_jobs(status);
CREATE INDEX idx_jobs_created ON public.processing_jobs(created_at);
CREATE INDEX idx_assignments_status ON public.agent_job_assignments(status);
CREATE INDEX idx_results_job ON public.processing_results(job_id);

-- Views
CREATE VIEW public.agent_status_summary AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.status,
    COUNT(aja.id) AS active_jobs,
    a.last_heartbeat
FROM public.agents a
LEFT JOIN public.agent_job_assignments aja ON a.id = aja.agent_id AND aja.status = 'processing'
GROUP BY a.id, a.name, a.type, a.status, a.last_heartbeat;

CREATE VIEW public.job_progress_summary AS
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
FROM public.processing_jobs pj
LEFT JOIN public.agent_job_assignments aja ON pj.id = aja.job_id
GROUP BY pj.id, pj.file_name, pj.status, pj.progress, pj.created_at, pj.started_at, pj.completed_at;
