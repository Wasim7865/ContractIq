import json
import logging
import re

import httpx

from backend.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a contract analysis AI. Analyze the provided contract text and return a structured JSON analysis.

You MUST respond with ONLY valid JSON (no markdown fences, no extra text). The JSON must have this exact structure:

{
  "contract_type": "string — e.g. NDA, Service Agreement, Employment Contract, Freelance Contract, Lease, SaaS Terms",
  "parties": ["Party A name", "Party B name"],
  "key_dates": {"effective_date": "...", "termination_date": "...", "renewal_date": "..."},
  "overall_risk_score": 0.0 to 1.0 (float, where 0 = safe, 1 = extremely risky),
  "overall_risk_level": "low" | "medium" | "high" | "critical",
  "summary": "2-3 sentence plain-English summary of what this contract does and its key implications",
  "clauses": [
    {
      "clause_title": "Short title, e.g. Termination Clause",
      "clause_text": "The key text from the contract for this clause",
      "risk_level": "low" | "medium" | "high" | "critical",
      "risk_score": 0.0 to 1.0,
      "explanation": "Plain-English explanation of what this clause means and why it has this risk level"
    }
  ],
  "suggestions": [
    "Actionable suggestion 1",
    "Actionable suggestion 2"
  ]
}

Guidelines:
- Identify ALL significant clauses (aim for 5-15 clauses depending on contract length).
- Focus on: termination, liability, indemnification, IP ownership, payment terms, confidentiality, non-compete, governing law, dispute resolution, data privacy, warranties, force majeure.
- Risk scoring: 0.0-0.25 = low, 0.26-0.5 = medium, 0.51-0.75 = high, 0.76-1.0 = critical.
- The overall_risk_score should reflect the weighted average of clause risks, with critical clauses weighing more.
- Suggestions should be specific and actionable, not generic advice.
- If information is missing or unclear, note that in the explanation.
- Always return valid JSON. No markdown code fences."""


class ContractAnalysisError(Exception):
    """Raised when AI analysis fails."""

    def __init__(self, message: str, recoverable: bool = False):
        self.message = message
        self.recoverable = recoverable
        super().__init__(message)


class AIService:
    """Provider-agnostic AI service for contract analysis."""

    def __init__(self):
        self.base_url = settings.AI_BASE_URL.rstrip("/")
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL

    def _get_headers(self) -> dict:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _extract_json(self, text: str) -> dict:
        """Extract JSON from AI response, handling markdown fences and extra text."""
        text = text.strip()

        # Try direct JSON parse first
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Strip markdown code fences
        fenced = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
        if fenced:
            try:
                return json.loads(fenced.group(1).strip())
            except json.JSONDecodeError:
                pass

        # Try to find JSON object in the text
        brace_start = text.find("{")
        if brace_start >= 0:
            depth = 0
            for i in range(brace_start, len(text)):
                if text[i] == "{":
                    depth += 1
                elif text[i] == "}":
                    depth -= 1
                    if depth == 0:
                        try:
                            return json.loads(text[brace_start : i + 1])
                        except json.JSONDecodeError:
                            break

        raise ContractAnalysisError(
            "AI returned a response that could not be parsed as JSON.",
            recoverable=True,
        )

    def _validate_analysis(self, data: dict) -> dict:
        """Validate and normalize the analysis response structure."""
        # Required top-level fields with defaults
        validated = {
            "contract_type": data.get("contract_type", "Unknown"),
            "parties": data.get("parties") or [],
            "key_dates": data.get("key_dates") or {},
            "summary": data.get("summary", "Analysis completed but no summary was generated."),
            "suggestions": data.get("suggestions") or [],
        }

        # Overall risk score
        try:
            score = float(data.get("overall_risk_score", 0.5))
            validated["overall_risk_score"] = max(0.0, min(1.0, score))
        except (TypeError, ValueError):
            validated["overall_risk_score"] = 0.5

        # Overall risk level — derive from score if missing or invalid
        level = data.get("overall_risk_level", "").lower()
        valid_levels = {"low", "medium", "high", "critical"}
        if level not in valid_levels:
            score = validated["overall_risk_score"]
            if score <= 0.25:
                level = "low"
            elif score <= 0.5:
                level = "medium"
            elif score <= 0.75:
                level = "high"
            else:
                level = "critical"
        validated["overall_risk_level"] = level

        # Clauses
        raw_clauses = data.get("clauses") or []
        clauses = []
        for c in raw_clauses:
            if not isinstance(c, dict):
                continue
            clause = {
                "clause_title": c.get("clause_title", "Untitled Clause"),
                "clause_text": c.get("clause_text", ""),
                "risk_level": c.get("risk_level", "medium"),
                "explanation": c.get("explanation", "No explanation provided."),
                "original_text": c.get("original_text", c.get("clause_text", "")),
            }
            try:
                clause["risk_score"] = max(0.0, min(1.0, float(c.get("risk_score", 0.5))))
            except (TypeError, ValueError):
                clause["risk_score"] = 0.5

            if clause["risk_level"] not in valid_levels:
                clause["risk_level"] = "medium"

            clauses.append(clause)

        validated["clauses"] = clauses

        # Ensure suggestions are strings
        validated["suggestions"] = [
            str(s) for s in validated["suggestions"] if s
        ]

        return validated

    def analyze_contract(self, contract_text: str) -> dict:
        """Analyze a contract and return structured results.

        Raises ContractAnalysisError on failure.
        """
        if not contract_text or not contract_text.strip():
            raise ContractAnalysisError("Contract text is empty.")

        # Truncate very long contracts to stay within token limits
        max_chars = 50_000
        truncated = False
        if len(contract_text) > max_chars:
            contract_text = contract_text[:max_chars]
            truncated = True

        user_message = f"Analyze the following contract:\n\n{contract_text}"
        if truncated:
            user_message += "\n\n[Note: Contract was truncated due to length. Analysis covers the first portion only.]"

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            "temperature": 0.1,
            "max_tokens": 4096,
        }

        try:
            with httpx.Client(timeout=120.0) as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self._get_headers(),
                    json=payload,
                )
        except httpx.TimeoutException:
            raise ContractAnalysisError(
                "AI service timed out. The contract may be too long or the AI service is under heavy load.",
                recoverable=True,
            )
        except httpx.ConnectError:
            raise ContractAnalysisError(
                f"Could not connect to AI service at {self.base_url}. Check AI_BASE_URL configuration.",
                recoverable=True,
            )
        except httpx.HTTPError as e:
            raise ContractAnalysisError(
                f"AI service request failed: {e}",
                recoverable=True,
            )

        if response.status_code == 429:
            raise ContractAnalysisError(
                "AI service rate limit reached. Please try again in a moment.",
                recoverable=True,
            )

        if response.status_code != 200:
            logger.error("AI service returned %d: %s", response.status_code, response.text[:500])
            raise ContractAnalysisError(
                f"AI service returned an error (HTTP {response.status_code}).",
                recoverable=response.status_code >= 500,
            )

        try:
            resp_data = response.json()
        except json.JSONDecodeError:
            raise ContractAnalysisError("AI service returned invalid JSON response.")

        # Extract the assistant's message content
        try:
            content = resp_data["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            raise ContractAnalysisError("AI response has unexpected structure.")

        raw_analysis = self._extract_json(content)
        validated = self._validate_analysis(raw_analysis)
        validated["_raw_response"] = content

        return validated

    def health_check(self) -> dict:
        """Check if the AI service is reachable."""
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(
                    f"{self.base_url}/models",
                    headers=self._get_headers(),
                )
            return {
                "status": "ok" if response.status_code == 200 else "degraded",
                "base_url": self.base_url,
                "model": self.model,
                "http_status": response.status_code,
            }
        except httpx.HTTPError as e:
            return {
                "status": "unreachable",
                "base_url": self.base_url,
                "model": self.model,
                "error": str(e),
            }


# Singleton instance
ai_service = AIService()
