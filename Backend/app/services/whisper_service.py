import os
import whisper


FFMPEG_PATH = r"C:\Users\HP\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin"

os.environ["PATH"] += os.pathsep + FFMPEG_PATH


class WhisperService:

    def __init__(self, model_name="base"):
        self.model = whisper.load_model(model_name)

    def transcribe(self, file_path: str) -> str:

        result = self.model.transcribe(
            file_path,
            fp16=False
        )

        return result["text"].strip()