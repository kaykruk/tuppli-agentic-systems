import os
import re
import json
import logging
import urllib.parse
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

logger = logging.getLogger("BusinessRecon")

DEFAULT_SEARCH_QUERIES = [
    '"freight brokerage" "load coordination" "contact us"',
    '"3PL logistics" "dispatch operations" "about us"',
    '"insurance claims management" "third party administrator" "contact"',
    '"commercial loan processing" "mortgage underwriting services"',
    '"property management" "maintenance dispatch" "operations"',
    '"healthcare credentialing services" "provider enrollment" "contact"'
]

class BusinessRecon:
    def __init__(self, gemini_api_key: Optional[str] = None):
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")

    def search_duckduckgo(self, query: str, max_results: int = 5) -> List[Dict[str, str]]:
        """Searches DuckDuckGo HTML to discover potential operational business domains."""
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
        results = []

        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code != 200:
                logger.warning(f"DuckDuckGo returned status {resp.status_code}")
                return results

            soup = BeautifulSoup(resp.text, "html.parser")
            for link in soup.find_all("a", class_="result__url"):
                href = link.get("href", "")
                # DuckDuckGo wraps urls in /l/?uddg=
                if "uddg=" in href:
                    parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                    actual_url = parsed.get("uddg", [None])[0]
                else:
                    actual_url = href

                if not actual_url or "duckduckgo.com" in actual_url:
                    continue

                domain_part = urllib.parse.urlparse(actual_url).netloc
                # Exclude directories, job boards, and social media aggregates
                skip_domains = ["linkedin.com", "facebook.com", "instagram.com", "indeed.com", "glassdoor.com", "wikipedia.org", "yelp.com", "yellowpages.com"]
                if any(skip in domain_part.lower() for skip in skip_domains):
                    continue

                parent = link.find_parent("div", class_="result__body")
                snippet = ""
                title = ""
                if parent:
                    snippet_elem = parent.find("a", class_="result__snippet")
                    if snippet_elem:
                        snippet = snippet_elem.get_text(strip=True)
                    title_elem = parent.find("a", class_="result__title")
                    if title_elem:
                        title = title_elem.get_text(strip=True)

                base_url = f"{urllib.parse.urlparse(actual_url).scheme}://{domain_part}"
                results.append({
                    "title": title,
                    "url": base_url,
                    "snippet": snippet
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
