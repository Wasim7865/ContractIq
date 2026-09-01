import json
import pytest
from backend.services.ai_service import AIService, ContractAnalysisError


def test_extract_json_clean():
    service = AIService()
    payload = {"contract_type": "NDA", "overall_risk_score": 0.2}
    result = service._extract_json(json.dumps(payload))
    assert result["contract_type"] == "NDA"


def test_extract_json_fenced():
    service = AIService()
    fenced_text = '```json\n{"contract_type": "Service Agreement"}\n```'
    result = service._extract_json(fenced_text)
    assert result["contract_type"] == "Service Agreement"


def test_validate_analysis_defaults():
    service = AIService()
    raw = {"contract_type": "Employment"}
    validated = service._validate_analysis(raw)

    assert validated["contract_type"] == "Employment"
    assert validated["overall_risk_score"] == 0.5
    assert validated["overall_risk_level"] == "medium"
    assert validated["clauses"] == []
    assert validated["suggestions"] == []


def test_validate_analysis_clauses():
    service = AIService()
    raw = {
        "overall_risk_score": 0.85,
        "clauses": [
            {
                "clause_title": "Termination",
                "clause_text": "Immediate termination.",
                "risk_level": "critical",
                "risk_score": 0.9,
                "explanation": "High risk clause",
            }
        ],
    }
    validated = service._validate_analysis(raw)
    assert validated["overall_risk_level"] == "critical"
    assert len(validated["clauses"]) == 1
    assert validated["clauses"][0]["risk_level"] == "critical"
