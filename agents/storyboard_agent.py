import os
import cv2
import math
import numpy as np
import asyncio
from typing import Dict

class StoryboardAgent:
    def __init__(self, job_id: str, file_path: str):
        self.job_id = job_id
        self.file_path = file_path
        self.output_path = f"outputs/{job_id}_storyboard.jpg"

    async def process(self) -> Dict:
        print(f"[StoryboardAgent] Generating storyboard from video: {self.file_path}")
        await asyncio.sleep(0.5)

        try:
            if not os.path.exists(self.file_path):
                return {"error": f"Video file not found: {self.file_path}"}

            cap = cv2.VideoCapture(self.file_path)
            if not cap.isOpened():
                return {"error": "Failed to open video file for storyboard generation."}

            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS) or 24
            duration = frame_count / fps
            step = max(1, frame_count // 12)  # extract 12 frames max

            thumbnails = []
            for i in range(0, frame_count, step):
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                success, frame = cap.read()
                if not success or frame is None:
                    continue
                thumbnail = cv2.resize(frame, (320, 180))  # consistent size
                thumbnails.append(thumbnail)
                if len(thumbnails) == 12:
                    break
            cap.release()

            if not thumbnails:
                return {"error": "No valid frames extracted from video."}

            # Build grid layout
            rows = 3
            cols = math.ceil(len(thumbnails) / rows)
            grid = []

            for r in range(rows):
                row = thumbnails[r * cols : (r + 1) * cols]
                while len(row) < cols:
                    blank = np.zeros_like(thumbnails[0])
                    row.append(blank)
                grid.append(np.hstack(row))

            final_image = np.vstack(grid)

            os.makedirs("outputs", exist_ok=True)
            success = cv2.imwrite(self.output_path, final_image)

            if not success or not os.path.exists(self.output_path):
                return {"error": "Failed to save storyboard image."}

            return {
                "storyboard_image": self.output_path,
                "frames_used": len(thumbnails),
                "duration_sec": round(duration, 2),
                "timeline_generated": True,
                "validation": "✅ Output verified"
            }

        except Exception as e:
            return {"error": f"StoryboardAgent exception: {str(e)}"}
