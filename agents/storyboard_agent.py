import os
import cv2
import math
import numpy as np
from typing import Dict
import asyncio

class StoryboardAgent:
    def __init__(self, job_id: str, file_path: str):
        self.job_id = job_id
        self.file_path = file_path
        self.output_path = f"outputs/{job_id}_storyboard.jpg"

    async def process(self) -> Dict:
        print(f"[StoryboardAgent] Generating storyboard: {self.file_path}")
        await asyncio.sleep(0.5)

        try:
            cap = cv2.VideoCapture(self.file_path)
            if not cap.isOpened():
                return {"error": "Failed to open video file."}

            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            duration = total_frames / fps
            interval = max(1, int(total_frames / 12))  # 12 thumbnails max

            thumbnails = []
            for i in range(0, total_frames, interval):
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                success, frame = cap.read()
                if success and frame is not None:
                    thumb = cv2.resize(frame, (320, 180))
                    thumbnails.append(thumb)
                if len(thumbnails) >= 12:
                    break

            cap.release()

            if not thumbnails:
                return {"error": "No frames extracted for storyboard."}

            # Arrange thumbnails in a grid
            rows = 3
            cols = math.ceil(len(thumbnails) / rows)
            grid = []

            for r in range(rows):
                row_imgs = thumbnails[r * cols:(r + 1) * cols]
                if len(row_imgs) < cols:
                    pad = [np.zeros_like(row_imgs[0])] * (cols - len(row_imgs))
                    row_imgs.extend(pad)
                grid.append(np.hstack(row_imgs))

            storyboard = np.vstack(grid)
            os.makedirs("outputs", exist_ok=True)
            cv2.imwrite(self.output_path, storyboard)

            return {
                "storyboard_image": self.output_path,
                "frames_used": len(thumbnails),
                "duration_sec": round(duration, 2)
            }

        except Exception as e:
            return {"error": f"Storyboard generation failed: {e}"}
