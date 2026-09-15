import os
import sys
import logging
import argparse
from datetime import datetime
from dotenv import load_dotenv

# Ensure local module imports work
sys.path.append(os.path.dirname(__file__))

from sheets_sync import SheetsSync
from operational_icp_evaluator import OperationalICPEvaluator
from business_recon import BusinessRecon, CITIES, BASE_QUERIES

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", force=True)
logger = logging.getLogger("PipelineRunner")

def run_lead_pipeline(max_leads: int = 5, query_limit: int = 2):
    logger.info("=" * 60)
    logger.info("🚀 STARTING TUPPLI AGENTIC LEAD GENERATION PIPELINE")
    logger.info("Target: Companies in need of Custom Agentic Systems & ARE")
    logger.info("=" * 60)

    # 1. Initialize Google Sheets Sync
    try:
        sheets = SheetsSync()
        existing = sheets.get_existing_urls_and_names()
        logger.info(f"Loaded {len(existing)} existing companies/URLs from Google Sheet to prevent duplicates.")
    except Exception as e:
        logger.error(f"Cannot proceed without Google Sheets connection: {e}")
        return

    # 2. Initialize Evaluator & Recon
    evaluator = OperationalICPEvaluator()
    recon = BusinessRecon()

    leads_added = 0

    # 3. Search and process targets
    queries_run = 0
    for base_query in BASE_QUERIES:
        for city in CITIES:
            if leads_added >= max_leads or queries_run >= query_limit:
                break

            query = f"{base_query} {city}"
            logger.info(f"\n🔍 Executing Recon Query: {query}")
            candidates = recon.search_duckduckgo(query, max_results=max_leads)
            queries_run += 1

            for candidate in candidates:
                if leads_added >= max_leads:
                    break

                url = candidate["url"]
                domain = url.replace("https://", "").replace("http://", "").replace("www.", "").rstrip("/").lower()
                
                # Deduplication check
                if domain in existing or any(c in domain for c in existing):
                    logger.info(f"⏩ Skipping {domain} (already present in Google Sheet)")
                    continue
    
                logger.info(f"\n⚡ Processing Candidate: {url}")
                
                # Extract structured company profile
                extracted = recon.extract_with_scrapegraph(url)
                company_name = extracted.get("company_name") or candidate.get("title") or domain
                
                # Skip garbage names (Cloudflare challenges, generic pages, forums)
                garbage_names = ["just a moment", "access denied", "403 forbidden", "404", 
                                 "page not found", "loading", "please wait", "verify",
                                 "trucking jobs", "cdl training", "job search", "careers"]
                if any(g in company_name.lower() for g in garbage_names):
                    logger.info(f"⏩ Skipping garbage page title: {company_name}")
                    continue

                if company_name.lower() in existing:
                    logger.info(f"⏩ Skipping {company_name} (name already in Google Sheet)")
                    continue
    
                # Evaluate with Operational ICP Evaluator
                eval_input = {
                    "company_name": company_name,
                    "website_url": url,
                    "description": extracted.get("description", candidate.get("snippet", "")),
                    "operational_clues": extracted.get("operational_clues", "")
                }
                logger.info(f"🧠 Evaluating ICP & Drafting Anti-Slop Icebreaker for {company_name}...")
                evaluation = evaluator.evaluate(eval_input)
    
                score = evaluation.get("icp_score", 0)
                logger.info(f"📊 ICP Fit Score: {score}/10 | Niche: {evaluation.get('niche_industry')}")
    
                # Filter out low-fit disqualified leads (score < 4)
                if score < 4:
                    logger.info(f"❌ Disqualified lead (Score {score} < 4). Skipping Google Sheet insertion.")
                    continue
    
                # Build enriched row
                lead_record = {
                    "company_name": company_name,
                    "website_url": url,
                    "city": city,
                    "niche_industry": evaluation.get("niche_industry", "Operations & Business Services"),
                    "icp_score": score,
                    "icp_reason": evaluation.get("icp_reason", ""),
                    "icebreaker": evaluation.get("icebreaker", ""),
                    "target_bottleneck_workflow": evaluation.get("target_bottleneck_workflow", ""),
                    "decision_maker": extracted.get("decision_maker", "Operations Leadership"),
                    "role_title": extracted.get("role_title", "COO / VP Operations"),
                    "direct_contact": extracted.get("direct_contact", ""),
                    "linkedin_url": extracted.get("linkedin_url", ""),
                    "date_added": datetime.now().strftime("%Y-%m-%d"),
                    "status": "New"
                }
    
                # Append to Google Sheet
                success = sheets.append_lead(lead_record)
                if success:
                    existing.add(domain)
                    existing.add(company_name.lower())
                    leads_added += 1
                    logger.info(f"✅ Lead Successfully Synced! Total added this run: {leads_added}/{max_leads}")

    logger.info("\n" + "=" * 60)
    logger.info(f"🏁 PIPELINE RUN COMPLETE. Total New Leads Synced to Sheet: {leads_added}")
    logger.info("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tuppli Agentic Lead Generation Runner")
    parser.add_argument("--max", type=int, default=5, help="Max leads to add in this run")
    parser.add_argument("--queries", type=int, default=3, help="Number of search queries to execute")
    args = parser.parse_args()

    run_lead_pipeline(max_leads=args.max, query_limit=args.queries)
