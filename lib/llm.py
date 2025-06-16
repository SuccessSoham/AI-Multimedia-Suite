from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import os

# Load model name from environment or fallback
MODEL_NAME = os.getenv("LLM_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto"
)

def run_llm(prompt: str, max_tokens: int = 256) -> str:
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=max_tokens,
        temperature=0.7,
        do_sample=True
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)
