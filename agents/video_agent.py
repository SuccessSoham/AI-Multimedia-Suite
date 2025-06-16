import os
import asyncio
from typing import Dict
from moviepy.editor import VideoFileClip, vfx

class VideoAgent:
    def __init__(self, job_id: str, file_path: str):
        self.job_id = job_id
        self.file_path = file_path
        self.output_path = f"outputs/{job_id}_enhanced.mp4"

    async def process(self) -> Dict:
        print(f"[VideoAgent] Enhancing video: {self.file_path}")
        await asyncio.sleep(0.5)

        try:
            clip = VideoFileClip(self.file_path)

            enhanced = (
                clip.fx(vfx.colorx, 1.2)
                    .fx(vfx.lum_contrast, 0, 20, 128)
                    .resize(height=720)
            )

            os.makedirs("outputs", exist_ok=True)
            enhanced.write_videofile(
                self.output_path,
                codec="libx264",
                audio_codec="aac",
                preset="medium",
                threads=4,
                ffmpeg_params=["-movflags", "+faststart"],
                verbose=False,
                logger=None
            )

            if not os.path.exists(self.output_path) or os.path.getsize(self.output_path) < 1_000_000:
                return {"error": "Video output file not saved correctly."}

            return {
                "output_video": self.output_path,
                "duration": round(clip.duration, 2),
                "resolution": f"{clip.w}x{clip.h}",
                "fps": clip.fps
            }

        except Exception as e:
            return {"error": f"VideoAgent failed: {str(e)}"}
