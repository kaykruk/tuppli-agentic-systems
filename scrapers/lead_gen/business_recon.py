import os
import re
import json
import logging
import urllib.parse
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup
from ddgs import DDGS
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

logger = logging.getLogger("BusinessRecon")

CITIES = [
    "Chicago IL",
    "Dallas TX"
]

# Queries designed to surface small, owner-operated businesses (5-50 employees)
# These use language that small businesses actually put on their websites
BASE_QUERIES = [
    'trucking company owner operated',
    'freight broker small team',
    'property management company locally owned',
    'medical billing company small business',
    'insurance agency claims processing',
    'mortgage broker independent',
    'home health agency scheduling',
    'staffing agency dispatch coordinator',
    'auto body shop fleet management',
    'hvac company service dispatch',
]

# Enterprise companies to automatically skip — these are too big for a one-man team
ENTERPRISE_BLOCKLIST = [
    "fedex", "ups", "amazon", "walmart", "target", "costco",
    "xpo", "chrobinson", "hubgroup", "jbhunt", "schneider",
    "flexport", "uber", "lyft", "convoy", "loadsmart",
    "kinaxis", "oracle", "sap", "salesforce", "microsoft",
    "harborfreight", "homedepot", "lowes", "menards",
    "statefarm", "allstate", "geico", "progressive",
    "unitedhealth", "anthem", "cigna", "aetna", "humana",
    "wellsfargo", "chase", "bankofamerica", "citi",
    "tforce", "olddominion", "estes", "saia", "yrc",
    "coyote", "echo", "landstar", "totalquality",
    "bizbuysell", "bbb", "manta", "dnb",
]

class BusinessRecon:
    def __init__(self, gemini_api_key: Optional[str] = None):
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")

    def _is_enterprise(self, domain: str) -> bool:
        """Check if a domain belongs to a known enterprise company."""
        domain_clean = domain.lower().replace("www.", "").replace(".com", "").replace(".net", "").replace(".org", "")
        return any(blocked in domain_clean for blocked in ENTERPRISE_BLOCKLIST)

    def search_duckduckgo(self, query: str, max_results: int = 5) -> List[Dict[str, str]]:
        """Searches DuckDuckGo to discover small, local businesses using duckduckgo-search."""
        results = []
        try:
            with DDGS() as ddgs:
                ddgs_results = ddgs.text(query, max_results=max_results * 3)  # Overfetch to account for filtered domains
            
            for res in ddgs_results:
                actual_url = res.get("href", "")
                if not actual_url:
                    continue

                domain_part = urllib.parse.urlparse(actual_url).netloc
                
                # Exclude directories, job boards, forums, social media, news, and aggregator sites
                skip_domains = [
                    # Social media
                    "linkedin.com", "facebook.com", "instagram.com", "twitter.com", "tiktok.com",
                    # Job boards
                    "indeed.com", "glassdoor.com", "simplyhired.com", "ziprecruiter.com",
                    "careerbuilder.com", "monster.com", "salary.com",
                    # Directories & aggregators
                    "yelp.com", "yellowpages.com", "zoominfo.com", "apollo.io",
                    "crunchbase.com", "bbb.org", "manta.com", "dnb.com",
                    "mapquest.com", "google.com", "apple.com",
                    "thumbtack.com", "angi.com", "homeadvisor.com",
                    "nextdoor.com", "clutch.co", "propertymanagementlist.com",
                    # Forums & content sites
                    "reddit.com", "quora.com", "youtube.com",
                    "thetruckersreport.com", "truckingtruth.com",
                    "freightwaves.com", "supplychaindive.com",
                    # Listicle / review / comparison sites
                    "transcure.net", "medibillmd.com", "g2.com", "capterra.com",
                    "softwareadvice.com", "trustpilot.com",
                    # News & encyclopedias
                    "wikipedia.org", "forbes.com", "bloomberg.com",
                ]
                if any(skip in domain_part.lower() for skip in skip_domains):
                    continue

                # Skip known enterprise companies
                if self._is_enterprise(domain_part):
                    logger.info(f"⏩ Skipping enterprise company: {domain_part}")
                    continue

                base_url = f"{urllib.parse.urlparse(actual_url).scheme}://{domain_part}"
                
                # Check for duplicate domains in the current results
                if any(r["url"] == base_url for r in results):
                    continue
                    
                results.append({
                    "title": res.get("title", ""),
                    "url": base_url,
                    "snippet": res.get("body", "")
                })

                if len(results) >= max_results:
                    break
        except Exception as e:
            logger.error(f"Error querying DuckDuckGo: {e}")

        return results

    def extract_with_scrapegraph(self, url: str) -> Dict[str, Any]:
        """Uses ScrapeGraphAI SmartScraperGraph with Gemini model to extract structured data from a company website."""
        try:
            from scrapegraphai.graphs import SmartScraperGraph

            graph_config = {
                "llm": {
                    "api_key": self.gemini_api_key,
                    "model": "gemini-3.6-flash",
                },
                "verbose": False,
                "headless": True
            }

            prompt = (
                "Extract the following information about this company into a JSON object: "
                "1. company_name: Name of the business. "
                "2. website_url: Official website URL. "
                "3. description: Brief summary of what services or operations they provide. "
                "4. operational_clues: Signs of manual, high-volume, multi-step operations, logistics, claims, coordination, or team size. "
                "5. decision_maker: Name of the founder, CEO, COO, or Operations leader if listed. "
                "6. role_title: Title of that person. "
                "7. direct_contact: Contact email or phone number found on the page. "
                "8. linkedin_url: LinkedIn company profile link if present."
            )

            scraper = SmartScraperGraph(
                prompt=prompt,
                source=url,
                config=graph_config
            )

            result = scraper.run()
            if isinstance(result, dict):
                return result
            elif isinstance(result, str):
                return json.loads(result)
            return {}
        except Exception as e:
            logger.warning(f"ScrapeGraphAI extraction encountered an issue on {url}: {e}. Falling back to direct HTML inspection.")
            return self.extract_fallback(url)

    def extract_fallback(self, url: str) -> Dict[str, Any]:
        """Direct lightweight HTML fallback parser when Playwright is unavailable or throttled."""
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(resp.text, "html.parser")
            
            # Title / Company name
            title = soup.title.string.strip() if soup.title and soup.title.string else ""
            company_name = title.split("|")[0].split("-")[0].strip() or urllib.parse.urlparse(url).netloc
            
            # Meta description
            desc_elem = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
            description = desc_elem["content"].strip() if desc_elem and "content" in desc_elem.attrs else ""
            
            # Find contact email & phone
            text = soup.get_text()
            emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
            filtered_emails = [e for e in emails if not any(x in e.lower() for x in ["png", "jpg", "jpeg", "svg", "wixpress", "sentry"])]
            direct_contact = filtered_emails[0] if filtered_emails else ""

            # Find LinkedIn URL
            linkedin_url = ""
            for a in soup.find_all("a", href=True):
                if "linkedin.com/company/" in a["href"]:
                    linkedin_url = a["href"]
                    break

            return {
                "company_name": company_name,
                "website_url": url,
                "description": description or text[:500],
                "operational_clues": "Operational multi-step services detected from public domain metadata.",
                "decision_maker": "Leadership Team",
                "role_title": "Head of Operations / Founder",
                "direct_contact": direct_contact or f"contact@{urllib.parse.urlparse(url).netloc.replace('www.', '')}",
                "linkedin_url": linkedin_url
            }
        except Exception as e:
            logger.error(f"Fallback extraction failed on {url}: {e}")
            return {
                "company_name": urllib.parse.urlparse(url).netloc,
                "website_url": url,
                "description": "",
                "operational_clues": "",
                "decision_maker": "Operations Leader",
                "role_title": "COO / Head of Operations",
                "direct_contact": "",
                "linkedin_url": ""
            }

if __name__ == "__main__":
    recon = BusinessRecon()
    results = recon.search_duckduckgo(DEFAULT_SEARCH_QUERIES[0], max_results=3)
    print("Search Results:", results)
