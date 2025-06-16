import os
import cv2
from moviepy.editor import VideoFileClip

def validate_file_exists(path: str, min_bytes: int = 10_000) -> bool:
    return os.path.exists(path) and os.path.getsize(path) > min_bytes

def validate_storyboard_image(path: str) -> bool:
    try:
        if not validate_file_exists(path, 20_000):
            return False
        image = cv2.imread(path)
        return image is not None and image.shape[0] > 0
    except Exception as e:
        print(f"[StoryboardValidation] Error: {e}")
        return False

def validate_video_output(path: str) -> bool:
    try:
        if not validate_file_exists(path, 1_000_000):
            return False
        clip = VideoFileClip(path)
        return clip.duration > 1 and clip.fps > 0 and clip.size[0] > 0
    except Exception as e:
        print(f"[VideoValidation] Error: {e}")
        return False

def validate_agent_output(agent_id: str, result: dict) -> bool:
    if agent_id == "storyboard-agent":
        return validate_storyboard_image(result.get("storyboard_image", ""))
    if agent_id == "video-agent":
        return validate_video_output(result.get("output_video", ""))
    return True  # Other agents skipped for now
