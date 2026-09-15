import os
import json
import re
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load env variables from root .env
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

logger = logging.getLogger("ICPEvaluator")

BANNED_PHRASES = [
    "game-changer", "game changer", "revolutionary", "seamless", "seamlessly",
    "delve", "streamline", "streamlining", "leverage", "leveraging",
    "in today's fast-paced", "fast-paced world", "unlock your potential",
    "take your business to the next level", "at the end of the day",
    "hope this finds you well", "i came across your profile",
    "reaching out because", "synergy", "paradigm shift", "cutting-edge"
]

EVALUATION_PROMPT_TEMPLATE = """
You are the Head of Systems & Agent Reliability Engineering at Tuppli (www.tuppli.com).
Tuppli builds custom production-grade Agentic AI Systems (multi-agent orchestration, tool-use pipelines, autonomous workflows) with built-in Agent Reliability Engineering (ARE: observability, guardrails, circuit breakers, and zero hallucination guarantees).

You are evaluating a prospective business lead for Tuppli's services.
IMPORTANT: We are NOT looking for companies that are already building AI agents. 
We are looking for companies that NEED (or might need, even if they don't realize it yet) a custom autonomous agentic system to eliminate expensive, repetitive, high-friction manual operational bottlenecks.

TARGET PROFILES:
- High-volume logistics, freight brokers, 3PL dispatch, fleet operations (manual load booking, carrier checks, tracking updates).
- Insurance claims, loan processing, mortgage underwriting, compliance audits (manual document extraction, policy matching, verification).
- High-ticket real estate, property management (tenant ticket triage, maintenance dispatch, lease processing).
- Healthcare staffing intake, medical billing/credentialing (document parsing, license verification, coordination).
- Complex customer operations, financial reconciliation, or back-office heavy B2B services.

BUSINESS DETAILS:
- Company Name: {company_name}
- Website: {website_url}
- Description & Services: {description}
- Operational Clues (Team, Open Jobs, Process): {operational_clues}

TASK:
1. Determine their specific Niche / Industry.
2. Score their ICP Fit from 1 to 10:
   - 9-10: Huge manual operations bottleneck, high headcount doing repetitive multi-step coordination, clear multi-agent ROI.
   - 7-8: Growing operational friction, multi-portal workflows, clear need for custom automation.
   - 4-6: Moderate volume or partially manual, but lower immediate ROI.
   - 1-3: Pure physical/local trade with no digital workflow, or zero operational leverage.
3. Identify the "Target Bottleneck Workflow" (the exact repetitive workflow they are stuck on).
4. Provide the "ICP Fit Reason": A direct, technical explanation of why they scored X, detailing the exact manual pain and the specific multi-agent system architecture Tuppli would build to solve it.
5. Draft a "Personalized Icebreaker" for their executive/operations leader:
   - STRICT RULES: NO AI FLUFF. NO BUZZWORDS.
   - NEVER use: "game-changer", "revolutionary", "seamless", "delve", "streamline", "leverage", "in today's landscape", "hope this finds you well".
   - NO em-dashes (—). Active voice only. One idea per sentence.
   - Acknowledge their specific operational scale or workflow challenge.
   - Propose a 1-page architecture teardown of how an autonomous multi-agent pipeline can handle this end-to-end with reliability safeguards.
   - Under 65 words. Punchy and authentic.

Output ONLY a valid JSON object matching this schema:
{{
  "niche_industry": "...",
  "icp_score": 8,
  "target_bottleneck_workflow": "...",
  "icp_reason": "...",
  "icebreaker": "..."
}}
"""

class OperationalICPEvaluator:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment or .env file.")
        else:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info("OperationalICPEvaluator initialized with Gemini 3.6 Flash.")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini model: {e}")
                self.model = None

    def evaluate(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates a company and generates ICP score, reason, bottleneck, and icebreaker."""
        if not hasattr(self, 'client'):
            logger.warning("Gemini model not active. Using heuristic fallback.")
            return self._heuristic_fallback(company_data)

        prompt = EVALUATION_PROMPT_TEMPLATE.format(
            company_name=company_data.get("company_name", "Unknown"),
            website_url=company_data.get("website_url", ""),
            description=company_data.get("description", "")[:1500],
            operational_clues=company_data.get("operational_clues", "")[:1000]
        )

        import time
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model='gemini-3.6-flash',
                    contents=prompt,
                    config={"response_mime_type": "application/json", "temperature": 0.3}
                )
                data = json.loads(response.text.strip())
                
                # Anti-slop sanity filter
                icebreaker = data.get("icebreaker", "")
                cleaned_icebreaker = self._sanitize_icebreaker(icebreaker)
                data["icebreaker"] = cleaned_icebreaker

                return data
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    wait_time = 35 * (attempt + 1)  # 35s, 70s, 105s
                    logger.warning(f"⏳ Rate limited. Waiting {wait_time}s before retry {attempt + 1}/{max_retries}...")
                    time.sleep(wait_time)
                    continue
                logger.error(f"Error evaluating company {company_data.get('company_name')}: {e}")
                return self._heuristic_fallback(company_data)
        
        logger.warning(f"Exhausted retries for {company_data.get('company_name')}. Using heuristic fallback.")
        return self._heuristic_fallback(company_data)

    def _sanitize_icebreaker(self, text: str) -> str:
        """Removes em-dashes and any accidental banned phrases."""
        # Replace em-dashes
        text = text.replace("—", " - ").replace("–", " - ")
        for phrase in BANNED_PHRASES:
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)
            text = pattern.sub("", text)
        # Clean double spaces
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def _heuristic_fallback(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        name = company_data.get("company_name", "your team")
        return {
            "niche_industry": "Operations & Logistics / Business Services",
            "icp_score": 7,
            "target_bottleneck_workflow": "Multi-step manual coordination and portal data entry",
            "icp_reason": f"High operational coordination required for {name}. A multi-agent intake and dispatch system reduces manual data entry by 80% while preventing workflow errors with circuit breakers.",
            "icebreaker": f"Saw your team manages multi-step operational coordination at {name}. Most teams throw more coordinators at this, but a reliable multi-agent system handles the intake and portal updates autonomously. We built a 1-page architecture teardown showing how this runs in production. Worth sending over?"
        }

if __name__ == "__main__":
    evaluator = OperationalICPEvaluator()
    sample = {
        "company_name": "Apex Freight Logistics",
        "website_url": "https://apexfreight.example.com",
        "description": "Mid-sized 3PL freight broker managing over 400 dry van and reefer loads daily across North America.",
        "operational_clues": "Currently hiring 5 load coordinators and 2 dispatchers to handle driver check calls and carrier packet verification."
    }
    result = evaluator.evaluate(sample)
    print(json.dumps(result, indent=2))
