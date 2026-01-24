"""
Code Generation Service - Multi-Agent Flow (Gemini)
Agent 1: Analyze requirements and formulas from paper
Agent 2: Generate implementation code
Agent 3: Generate tests and synthetic data
"""
from typing import Dict
import os
import google.generativeai as genai
from app.core.config import GEMINI_API_KEY

# Default to a model name available on v1beta; override via GEMINI_MODEL if your project supports a different one.
# Common options: gemini-1.5-pro, gemini-1.5-flash, gemini-pro
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
genai.configure(api_key=GEMINI_API_KEY)


def _chat(prompt: str, model: str = None, temperature: float = 0.3, max_tokens: int = 4000) -> str:
    gem_model = genai.GenerativeModel(model or GEMINI_MODEL)
    response = gem_model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        ),
    )
    return getattr(response, "text", "") or ""


def agent_1_analyze_requirements(paper_content: str) -> Dict:
    """
    Agent 1: Analyze paper to extract code requirements, formulas, and algorithms
    """
    prompt = f"""You are a research paper analyzer. Read the paper content and return a concise JSON object with:

{
  "requirements": ["bullet list of 8-15 programming requirements"],
  "algorithms": ["key algorithms or pseudo-steps"],
  "formulas": ["LaTeX formulas if any"],
  "data_needs": ["data requirements or datasets"],
  "expected_outputs": ["what the code should produce"],
  "notes": ["any constraints or edge cases"]
}

Paper Content:
{paper_content}

Return ONLY valid JSON (no markdown). Keep bullets short and specific so downstream code generation stays concise.
"""

    analysis = _chat(prompt, temperature=0.3, max_tokens=2000)
    return {
        "analysis": analysis,
        "agent": "Agent 1: Requirements Analyzer"
    }


def agent_2_generate_code(requirements_analysis: str, paper_title: str) -> Dict:
    """
    Agent 2: Generate Python implementation based on Agent 1's analysis
    """
    prompt = f"""You are an expert Python developer. Based on the following requirements analysis, generate clean, well-documented Python code.

Paper Title: {paper_title}

Requirements Analysis:
{requirements_analysis}

Generate production-ready Python code with:
- Clear function/class structure
- Type hints
- Comprehensive docstrings
- Comments explaining formulas and algorithms
- Error handling
- Example usage at the bottom

Provide ONLY the Python code, no explanations outside the code.
"""

    code = _chat(prompt, temperature=0.5, max_tokens=4000)
    if "```python" in code:
        code = code.split("```python")[1].split("```")[0].strip()
    elif "```" in code:
        code = code.split("```")[1].split("```")[0].strip()
    
    return {
        "code": code,
        "agent": "Agent 2: Code Generator"
    }


def agent_3_generate_tests_and_data(requirements_analysis: str, code: str) -> Dict:
    """
    Agent 3: Generate unit tests and any needed synthetic data helpers.
    """
    prompt = f"""You are a test engineer. Based on the requirements analysis and the generated code, create:

1) Python unit tests (pytest style) covering main behaviors, edge cases, and error handling.
2) If the model needs sample data (e.g., CSV/JSON), include helper code to generate those files.
3) Keep everything in one Python file; include fixtures or temp-file utilities.

Requirements Analysis:
{requirements_analysis}

Generated Code:
{code}

Provide ONLY the Python code (tests + data helpers) with no explanations outside the code.
"""

    test_code = _chat(prompt, temperature=0.55, max_tokens=3000)
    if "```python" in test_code:
        test_code = test_code.split("```python")[1].split("```" )[0].strip()
    elif "```" in test_code:
        test_code = test_code.split("```" )[1].split("```" )[0].strip()

    return {
        "test_code": test_code,
        "agent": "Agent 3: Tests and Data Generator"
    }


def generate_code_pipeline(paper_content: str, paper_title: str) -> Dict:
    """Execute the 3-agent pipeline for code + tests generation."""
    try:
        # Agent 1: Analyze requirements
        print("Agent 1: Analyzing requirements...")
        agent_1_result = agent_1_analyze_requirements(paper_content)

        # Agent 2: Generate code
        print("Agent 2: Generating implementation code...")
        agent_2_result = agent_2_generate_code(
            agent_1_result["analysis"],
            paper_title
        )

        # Agent 3: Generate tests and data helpers
        print("Agent 3: Generating tests and data helpers...")
        agent_3_result = agent_3_generate_tests_and_data(
            agent_1_result["analysis"],
            agent_2_result["code"]
        )

        return {
            "success": True,
            "requirements": agent_1_result["analysis"],
            "code": agent_2_result["code"],
            "tests": agent_3_result["test_code"],
            "agents_executed": [
                agent_1_result["agent"],
                agent_2_result["agent"],
                agent_3_result["agent"]
            ]
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
