"""
Explanation API endpoints for Module 2 - Understanding Layer
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
import os
from app.core.config import DATA_DIR
from app.services.ai_client import explain_section, explain_abstract, detect_ambiguities

router = APIRouter()


class ExplainRequest(BaseModel):
    paper_id: str
    section: Optional[str] = "abstract"  # abstract, introduction, methodology, etc.


class ExplainResponse(BaseModel):
    explanation: str
    summary_points: list = []
    section: str
    ambiguities: list = []


@router.post("/papers/{paper_id}/explain", response_model=ExplainResponse)
async def explain_paper_section(paper_id: str, request: ExplainRequest):
    """
    Generate an easy-to-understand explanation of a paper section
    """
    # Load paper data
    paper_dir = os.path.join(DATA_DIR, "papers", paper_id)
    paper_json_path = os.path.join(paper_dir, "paper.json")
    
    if not os.path.exists(paper_json_path):
        raise HTTPException(status_code=404, detail="Paper not found")
    
    with open(paper_json_path, 'r', encoding='utf-8') as f:
        paper = json.load(f)
    
    section_name = request.section.lower()
    
    # Get the requested section
    if section_name == "abstract":
        if not paper.get("abstract"):
            raise HTTPException(status_code=404, detail="Abstract not found")

        explanation = explain_abstract(
            paper["abstract"],
            paper.get("title", "Unknown Title")
        )
        content = paper["abstract"]

    else:
        # Find the section in the parsed sections
        sections = paper.get("sections", [])
        section_data = None
        
        for sec in sections:
            if section_name in sec.get("title", "").lower():
                section_data = sec
                break
        
        if not section_data:
            raise HTTPException(
                status_code=404, 
                detail=f"Section '{section_name}' not found"
            )
        
        # Generate explanation for the section
        context = f"Paper: {paper.get('title', 'Unknown')}\nAbstract: {paper.get('abstract', '')[:300]}"
        explanation = explain_section(
            section_data["title"],
            section_data["content"],
            context
        )
        content = section_data["content"]
    
    # Detect ambiguities
    ambiguities = detect_ambiguities(content)

    # Parse JSON bullet list if possible
    summary_points = []
    try:
        summary_points = json.loads(explanation)
        if not isinstance(summary_points, list):
            summary_points = []
    except Exception:
        summary_points = []
    
    return ExplainResponse(
        explanation=explanation,
        summary_points=summary_points,
        section=section_name,
        ambiguities=ambiguities
    )


@router.get("/papers/{paper_id}/sections")
async def get_paper_sections(paper_id: str):
    """
    Get list of available sections in a paper
    """
    paper_dir = os.path.join(DATA_DIR, "papers", paper_id)
    paper_json_path = os.path.join(paper_dir, "paper.json")
    
    if not os.path.exists(paper_json_path):
        raise HTTPException(status_code=404, detail="Paper not found")
    
    with open(paper_json_path, 'r', encoding='utf-8') as f:
        paper = json.load(f)
    
    sections = ["abstract"]
    if paper.get("sections"):
        sections.extend([sec["title"] for sec in paper["sections"]])
    
    return {"sections": sections}
