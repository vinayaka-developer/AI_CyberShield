from gemini_client import ask_gemini

question = "What is cybersecurity? Explain in simple words."

answer = ask_gemini(question)

print("\nGemini Response:")
print(answer)
