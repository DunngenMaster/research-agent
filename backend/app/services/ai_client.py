"""
AI Client - Google Gemini
"""
from typing import List, Dict
import os
import json
import google.generativeai as genai
from app.core.config import GEMINI_API_KEY

# Default to a model name available on v1beta; override via GEMINI_MODEL if your project supports a different one.
# Common options: gemini-1.5-pro, gemini-1.5-flash, gemini-pro
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")

genai.configure(api_key=GEMINI_API_KEY)


def generate_completion(
    messages: List[Dict[str, str]],
    model: str = None,
    temperature: float = 0.7,
    max_tokens: int = 2000,
) -> str:
    """Generate text using Google Gemini."""

    try:
        gem_model = genai.GenerativeModel(model or GEMINI_MODEL)
        prompt_parts = [msg.get("content", "") for msg in messages if msg.get("content")]
        prompt = "\n\n".join(prompt_parts)
        response = gem_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )
        return getattr(response, "text", "") or ""
    except Exception as exc:
        print(f"Gemini API error: {exc}")
        return "Unable to generate explanation at this time. Please try again later."


def explain_section(section_title: str, section_content: str, context: str = "") -> str:
    """Explain a paper section as JSON bullet points (10-15)."""

    messages = [
        {
            "role": "system",
            "content": (
                "You explain research sections as concise bullet points. "
                "Respond ONLY with JSON array of 10-15 objects, each having keys 'point' and 'explanation'. "
                "No markdown, no prose outside JSON."
            ),
        },
        {
            "role": "user",
            "content": f"""Please explain the following section from a research paper in simple, easy-to-understand language.

Paper Context: {context or 'No additional context provided'}

Section: {section_title}

Content:
{section_content}
 
Return 10-15 concise bullet points as JSON array of objects: [{{"point": "...", "explanation": "..."}}, ...]
""",
        },
    ]
    return generate_completion(messages, temperature=0.7, max_tokens=1500)


def explain_abstract(abstract: str, full_context: str = "") -> str:
    """Summarize the abstract as JSON bullet points (10-15)."""

    messages = [
        {
            "role": "system",
            "content": (
                "You summarize abstracts as concise bullet points. "
                "Respond ONLY with JSON array of 10-15 objects, each having keys 'point' and 'explanation'. "
                "No markdown, no prose outside JSON."
            ),
        },
        {
            "role": "user",
            "content": f"""Summarize this abstract in a concise, clear way. Highlight the problem, the approach, and the key results.

Paper Context: {full_context or 'No additional context provided'}

Abstract:
{abstract}
 
Return 10-15 concise bullet points as JSON array of objects: [{{"point": "...", "explanation": "..."}}, ...]
""",
        },
    ]
    return generate_completion(messages, temperature=0.6, max_tokens=1200)


def detect_ambiguities(content: str) -> List[Dict[str, str]]:
    """Identify unclear or ambiguous parts of the text and return JSON-parsable hints."""

    messages = [
        {
            "role": "system",
            "content": "You flag unclear, ambiguous, or confusing parts in research papers.",
        },
        {
            "role": "user",
            "content": f"""Analyze the following text from a research paper and identify any unclear, ambiguous, or confusing parts.

Content:
{content[:3000]}

For each ambiguity, provide:
1. The unclear text or concept
2. Why it's ambiguous or unclear
3. What additional information would help clarify it

Return your response as a JSON array of objects with fields: "text", "reason", "clarification_needed".
""",
        },
    ]

    result = generate_completion(messages, temperature=0.5, max_tokens=1500)
    try:
        ambiguities = json.loads(result)
        return ambiguities if isinstance(ambiguities, list) else []
    except Exception:
        return []
