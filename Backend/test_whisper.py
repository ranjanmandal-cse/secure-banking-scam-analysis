from app.services.whisper_service import WhisperService


audio_file = "test_audio.mp4"

service = WhisperService()

text = service.transcribe(audio_file)

print("\nTranscribed Text")
print("----------------")
print(text)