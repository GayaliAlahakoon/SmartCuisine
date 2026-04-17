import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env
load_dotenv()

# Set API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# List available models
models = genai.list_models()
print("Available Gemini models:")
for m in models:
    # print the model name and any info you can find
    print(f"- {m.name}")
   
