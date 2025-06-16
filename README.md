# 🎬 AI Multimedia Production Suite

A modular, multi-agent orchestration system for intelligent video, audio, and metadata processing — powered by open-source LLMs and SQL Server.

---

## 🚀 Features

- 🎞️ Video enhancement (upscaling, color correction, scene detection)
- 🎧 Audio optimization (noise reduction, speech-to-text, music generation)
- 🧠 Metadata extraction using open-source LLMs (tags, sentiment, OCR)
- 🎬 Storyboard generation (keyframes, transitions, timeline)
- 🤖 Agent-to-agent (A2A) messaging protocol
- 🗃️ SQL Server backend with schema + seed scripts
- 🧪 Pytest-based test suite
- 🧱 Modular architecture for easy extension

---


---

## ⚙️ Setup

### 1. Clone the repo
\`\`\`bash
git clone https://github.com/SuccessSoham/AI-Multimedia-Suite.git
cd AI-Multimedia-Suite

2. Install dependencies
pip install -r requirements.txt

3. Configure environment
Create a .env file:

SQL_SERVER=localhost\SQLEXPRESS
SQL_DATABASE=ai_multimedia_suite
SQL_DRIVER=ODBC Driver 17 for SQL Server
LLM_MODEL=mistralai/Mistral-7B-Instruct-v0.2

4. Initialize the database

python scripts/initialize_db.py
python scripts/seed_demo.py

🧠 LLM Integration
The metadata_agent.py uses a HuggingFace-compatible model (e.g. Mistral, Phi-2) to extract intelligent metadata from files. You can swap models via .env.

🧪 Run Tests
pytest test/

📜 License
MIT License © 2025 Soham
