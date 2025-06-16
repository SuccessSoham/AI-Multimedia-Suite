"""
AI Multimedia Production Suite - Download Service
Handles file generation and download management for processed results
"""

import asyncio
import json
import csv
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from pathlib import Path
import zipfile
import io
import tempfile
from typing import Dict, List, Any, Optional
import uuid
import os

class DownloadFormat:
    JSON = "json"
    CSV = "csv"
    XML = "xml"
    PDF = "pdf"
    ZIP = "zip"

class DownloadStatus:
    PREPARING = "preparing"
    READY = "ready"
    DOWNLOADING = "downloading"
    COMPLETED = "completed"
    ERROR = "error"
    EXPIRED = "expired"

class DownloadItem:
    def __init__(self, job_data: Dict[str, Any], format_type: str):
        self.id = str(uuid.uuid4())
        self.job_id = job_data["id"]
        self.file_name = f"{job_data['fileName'].split('.')[0]}_results.{format_type}"
        self.format = format_type
        self.status = DownloadStatus.PREPARING
        self.progress = 0
        self.created_at = datetime.now()
        self.expires_at = datetime.now() + timedelta(hours=24)
        self.file_path: Optional[str] = None
        self.file_size: int = 0
        self.download_count = 0
        self.job_data = job_data

class DownloadService:
    def __init__(self, storage_path: str = "./downloads"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True)
        self.active_downloads: Dict[str, DownloadItem] = {}
        self.cleanup_interval = 3600  # 1 hour
        
    async def generate_download(self, job_data: Dict[str, Any], format_type: str, 
                              include_metadata: bool = True, 
                              selected_agents: Optional[List[str]] = None) -> DownloadItem:
        """Generate a download file for the given job data"""
        
        download_item = DownloadItem(job_data, format_type)
        self.active_downloads[download_item.id] = download_item
        
        try:
            # Update progress
            await self._update_progress(download_item.id, 10, "Preparing data...")
            
            # Filter results by selected agents if specified
            results = job_data.get("results", {})
            if selected_agents:
                results = {k: v for k, v in results.items() if k in selected_agents}
            
            # Generate file content based on format
            await self._update_progress(download_item.id, 30, "Generating content...")
            
            if format_type == DownloadFormat.JSON:
                content = await self._generate_json(job_data, results, include_metadata)
            elif format_type == DownloadFormat.CSV:
                content = await self._generate_csv(job_data, results, include_metadata)
            elif format_type == DownloadFormat.XML:
                content = await self._generate_xml(job_data, results, include_metadata)
            elif format_type == DownloadFormat.PDF:
                content = await self._generate_pdf(job_data, results, include_metadata)
            elif format_type == DownloadFormat.ZIP:
                content = await self._generate_zip(job_data, results, include_metadata)
            else:
                raise ValueError(f"Unsupported format: {format_type}")
            
            # Save file to storage
            await self._update_progress(download_item.id, 70, "Saving file...")
            
            file_path = self.storage_path / f"{download_item.id}.{format_type}"
            
            if format_type == DownloadFormat.ZIP:
                with open(file_path, 'wb') as f:
                    f.write(content)
            else:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
            
            # Update download item
            download_item.file_path = str(file_path)
            download_item.file_size = file_path.stat().st_size
            download_item.status = DownloadStatus.READY
            download_item.progress = 100
            
            await self._update_progress(download_item.id, 100, "Ready for download")
            
            print(f"✅ Generated {format_type.upper()} download: {download_item.file_name}")
            print(f"   File size: {self._format_file_size(download_item.file_size)}")
            print(f"   Expires: {download_item.expires_at}")
            
            return download_item
            
        except Exception as e:
            download_item.status = DownloadStatus.ERROR
            print(f"❌ Error generating download: {e}")
            raise
    
    async def _update_progress(self, download_id: str, progress: int, message: str):
        """Update download progress"""
        if download_id in self.active_downloads:
            self.active_downloads[download_id].progress = progress
            print(f"📊 Download {download_id}: {progress}% - {message}")
        await asyncio.sleep(0.1)  # Simulate processing time
    
    async def _generate_json(self, job_data: Dict[str, Any], results: Dict[str, Any], 
                           include_metadata: bool) -> str:
        """Generate JSON format download"""
        
        output = {
            "job": {
                "id": job_data["id"],
                "fileName": job_data["fileName"],
                "status": job_data["status"],
                "progress": job_data.get("progress", 0)
            },
            "results": results
        }
        
        if include_metadata:
            output["metadata"] = {
                "downloadedAt": datetime.now().isoformat(),
                "format": "JSON",
                "totalAgents": len(results),
                "generatedBy": "AI Multimedia Production Suite"
            }
        
        return json.dumps(output, indent=2, ensure_ascii=False)
    
    async def _generate_csv(self, job_data: Dict[str, Any], results: Dict[str, Any], 
                          include_metadata: bool) -> str:
        """Generate CSV format download"""
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(["Agent", "Metric", "Value"])
        
        # Write metadata if requested
        if include_metadata:
            writer.writerow(["Metadata", "Job ID", job_data["id"]])
            writer.writerow(["Metadata", "File Name", job_data["fileName"]])
            writer.writerow(["Metadata", "Status", job_data["status"]])
            writer.writerow(["Metadata", "Progress", f"{job_data.get('progress', 0)}%"])
            writer.writerow(["Metadata", "Downloaded At", datetime.now().isoformat()])
        
        # Write results
        for agent_id, agent_results in results.items():
            agent_name = self._get_agent_name(agent_id)
            for metric, value in agent_results.items():
                writer.writerow([agent_name, metric, str(value)])
        
        return output.getvalue()
    
    async def _generate_xml(self, job_data: Dict[str, Any], results: Dict[str, Any], 
                          include_metadata: bool) -> str:
        """Generate XML format download"""
        
        root = ET.Element("ProcessingResults")
        
        # Add metadata if requested
        if include_metadata:
            metadata = ET.SubElement(root, "Metadata")
            ET.SubElement(metadata, "JobId").text = job_data["id"]
            ET.SubElement(metadata, "FileName").text = job_data["fileName"]
            ET.SubElement(metadata, "Status").text = job_data["status"]
            ET.SubElement(metadata, "Progress").text = str(job_data.get("progress", 0))
            ET.SubElement(metadata, "DownloadedAt").text = datetime.now().isoformat()
        
        # Add results
        results_elem = ET.SubElement(root, "Results")
        for agent_id, agent_results in results.items():
            agent_elem = ET.SubElement(results_elem, "Agent")
            agent_elem.set("id", agent_id)
            agent_elem.set("name", self._get_agent_name(agent_id))
            
            for metric, value in agent_results.items():
                metric_elem = ET.SubElement(agent_elem, metric.replace(" ", "_"))
                metric_elem.text = str(value)
        
        # Format XML with proper indentation
        self._indent_xml(root)
        return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding='unicode')
    
    async def _generate_pdf(self, job_data: Dict[str, Any], results: Dict[str, Any], 
                          include_metadata: bool) -> str:
        """Generate PDF format download (text-based for demo)"""
        
        content = "AI MULTIMEDIA PRODUCTION SUITE - PROCESSING REPORT\n"
        content += "=" * 60 + "\n\n"
        
        if include_metadata:
            content += "JOB INFORMATION:\n"
            content += f"• Job ID: {job_data['id']}\n"
            content += f"• File Name: {job_data['fileName']}\n"
            content += f"• Status: {job_data['status']}\n"
            content += f"• Progress: {job_data.get('progress', 0)}%\n"
            content += f"• Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        content += "PROCESSING RESULTS:\n"
        content += "-" * 30 + "\n\n"
        
        for agent_id, agent_results in results.items():
            agent_name = self._get_agent_name(agent_id)
            content += f"{agent_name.upper()}:\n"
            
            for metric, value in agent_results.items():
                content += f"  • {metric.replace('_', ' ').title()}: {value}\n"
            content += "\n"
        
        content += "\n" + "=" * 60 + "\n"
        content += "Generated by AI Multimedia Production Suite\n"
        content += f"Report generated on {datetime.now().strftime('%Y-%m-%d at %H:%M:%S')}\n"
        
        return content
    
    async def _generate_zip(self, job_data: Dict[str, Any], results: Dict[str, Any], 
                          include_metadata: bool) -> bytes:
        """Generate ZIP format download containing multiple formats"""
        
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add JSON file
            json_content = await self._generate_json(job_data, results, include_metadata)
            zip_file.writestr("results.json", json_content)
            
            # Add CSV file
            csv_content = await self._generate_csv(job_data, results, include_metadata)
            zip_file.writestr("results.csv", csv_content)
            
            # Add XML file
            xml_content = await self._generate_xml(job_data, results, include_metadata)
            zip_file.writestr("results.xml", xml_content)
            
            # Add PDF report
            pdf_content = await self._generate_pdf(job_data, results, include_metadata)
            zip_file.writestr("report.txt", pdf_content)  # Using .txt for demo
            
            # Add README
            readme_content = self._generate_readme(job_data)
            zip_file.writestr("README.txt", readme_content)
        
        return zip_buffer.getvalue()
    
    def _generate_readme(self, job_data: Dict[str, Any]) -> str:
        """Generate README file for ZIP downloads"""
        
        return f"""AI MULTIMEDIA PRODUCTION SUITE - DOWNLOAD PACKAGE
================================================

This package contains the processing results for:
File: {job_data['fileName']}
Job ID: {job_data['id']}

CONTENTS:
---------
• results.json - Complete results in JSON format
• results.csv  - Results in CSV format for spreadsheet applications
• results.xml  - Results in XML format for structured data processing
• report.txt   - Human-readable processing report
• README.txt   - This file

USAGE:
------
1. Extract all files to a folder
2. Open the format that best suits your needs
3. The JSON format contains the most complete data structure
4. The CSV format is ideal for analysis in Excel or similar tools
5. The XML format is suitable for automated processing
6. The report provides a summary in human-readable format

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
System: AI Multimedia Production Suite v2.0
"""
    
    def _get_agent_name(self, agent_id: str) -> str:
        """Get human-readable agent name"""
        names = {
            "video-agent": "Video Enhancement Agent",
            "audio-agent": "Audio Optimization Agent",
            "storyboard-agent": "Storyboard Generation Agent",
            "metadata-agent": "Metadata Extraction Agent"
        }
        return names.get(agent_id, agent_id.replace("-", " ").title())
    
    def _indent_xml(self, elem, level=0):
        """Add proper indentation to XML elements"""
        i = "\n" + level * "  "
        if len(elem):
            if not elem.text or not elem.text.strip():
                elem.text = i + "  "
            if not elem.tail or not elem.tail.strip():
                elem.tail = i
            for elem in elem:
                self._indent_xml(elem, level + 1)
            if not elem.tail or not elem.tail.strip():
                elem.tail = i
        else:
            if level and (not elem.tail or not elem.tail.strip()):
                elem.tail = i
    
    def _format_file_size(self, size_bytes: int) -> str:
        """Format file size in human-readable format"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.1f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"
    
    async def get_download_info(self, download_id: str) -> Optional[DownloadItem]:
        """Get information about a download"""
        return self.active_downloads.get(download_id)
    
    async def mark_downloaded(self, download_id: str):
        """Mark a download as completed"""
        if download_id in self.active_downloads:
            item = self.active_downloads[download_id]
            item.status = DownloadStatus.COMPLETED
            item.download_count += 1
            print(f"📥 Download completed: {item.file_name} (#{item.download_count})")
    
    async def cleanup_expired(self):
        """Clean up expired downloads"""
        now = datetime.now()
        expired_ids = []
        
        for download_id, item in self.active_downloads.items():
            if now > item.expires_at:
                expired_ids.append(download_id)
                
                # Delete file if it exists
                if item.file_path and Path(item.file_path).exists():
                    Path(item.file_path).unlink()
                    print(f"🗑️  Deleted expired file: {item.file_name}")
        
        # Remove from active downloads
        for download_id in expired_ids:
            del self.active_downloads[download_id]
        
        if expired_ids:
            print(f"🧹 Cleaned up {len(expired_ids)} expired downloads")
    
    async def list_downloads(self) -> List[Dict[str, Any]]:
        """List all active downloads"""
        downloads = []
        for item in self.active_downloads.values():
            downloads.append({
                "id": item.id,
                "jobId": item.job_id,
                "fileName": item.file_name,
                "format": item.format,
                "status": item.status,
                "progress": item.progress,
                "fileSize": self._format_file_size(item.file_size),
                "createdAt": item.created_at.isoformat(),
                "expiresAt": item.expires_at.isoformat(),
                "downloadCount": item.download_count
            })
        return downloads

async def demonstrate_download_service():
    """Demonstrate the download service functionality"""
    
    print("📦 AI Multimedia Production Suite - Download Service Demo")
    print("=" * 60)
    
    # Initialize download service
    download_service = DownloadService("./demo_downloads")
    
    # Sample job data
    sample_job = {
        "id": "job-123",
        "fileName": "sample_video.mp4",
        "status": "completed",
        "progress": 100,
        "results": {
            "video-agent": {
                "resolution": "4K Enhanced",
                "noise_reduction": "85% improvement",
                "color_correction": "Applied",
                "scenes": 12,
                "enhanced_frames": 1440
            },
            "audio-agent": {
                "noise_reduction": "92% improvement",
                "audio_quality": "Enhanced to 48kHz",
                "speech_to_text": "Transcription complete",
                "background_music": "Generated"
            },
            "metadata-agent": {
                "tags": ["action", "outdoor", "daylight", "people"],
                "objects": 15,
                "text_extracted": "OCR complete",
                "sentiment": "Positive",
                "duration": "2:34"
            }
        }
    }
    
    # Generate downloads in different formats
    formats = [DownloadFormat.JSON, DownloadFormat.CSV, DownloadFormat.XML, 
               DownloadFormat.PDF, DownloadFormat.ZIP]
    
    downloads = []
    for format_type in formats:
        print(f"\n🔄 Generating {format_type.upper()} download...")
        download_item = await download_service.generate_download(
            sample_job, format_type, include_metadata=True
        )
        downloads.append(download_item)
    
    # List all downloads
    print(f"\n📋 Generated Downloads:")
    download_list = await download_service.list_downloads()
    for download in download_list:
        print(f"  • {download['fileName']} ({download['format'].upper()}) - {download['fileSize']}")
    
    # Simulate some downloads
    for download_item in downloads  - {download['fileSize']}")
    
    # Simulate some downloads
    for download_item in downloads[:2]:  # Download first 2 files
        print(f"\n📥 Simulating download: {download_item.file_name}")
        await download_service.mark_downloaded(download_item.id)
    
    # Show final statistics
    print(f"\n📊 Download Service Statistics:")
    print(f"  Active downloads: {len(download_service.active_downloads)}")
    print(f"  Storage path: {download_service.storage_path}")
    
    # Cleanup demo
    print(f"\n🧹 Cleaning up demo files...")
    await download_service.cleanup_expired()

if __name__ == "__main__":
    asyncio.run(demonstrate_download_service())
