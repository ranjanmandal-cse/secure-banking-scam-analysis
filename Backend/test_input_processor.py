from app.services.input_processor import InputProcessor


processor = InputProcessor()


text = """
Your bank account will be blocked today.
Please verify your account immediately.
"""


result = processor.process_text(text)

print(result)