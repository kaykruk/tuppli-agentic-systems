const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function convert() {
    const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  body {
    font-family: 'Inter', sans-serif;
    color: #111;
    font-size: 10px;
    line-height: 1.4;
    margin: 0;
    padding: 20px 40px;
  }
  .header {
    text-align: center;
    margin-bottom: 12px;
  }
  .name {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
  }
  .title {
    font-size: 14px;
    font-weight: 600;
    color: #444;
    margin: 4px 0;
  }
  .contact {
    font-size: 10px;
    color: #555;
  }
  .contact a {
    color: #555;
    text-decoration: none;
  }
  .section {
    margin-bottom: 12px;
  }
  .section-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 1px solid #000;
    padding-bottom: 2px;
    margin-bottom: 6px;
    margin-top: 0;
  }
  .summary {
    text-align: justify;
  }
  .job {
    margin-bottom: 10px;
  }
  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 2px;
  }
  .company {
    font-weight: 700;
    font-size: 11px;
  }
  .job-title {
    font-weight: 600;
    font-style: italic;
  }
  .date {
    font-size: 10px;
    color: #444;
    font-weight: 600;
  }
  .location {
    font-size: 9px;
    color: #666;
  }
  ul {
    margin: 0;
    padding-left: 18px;
  }
  li {
    margin-bottom: 3px;
    text-align: justify;
  }
  .skills-grid {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 4px;
    margin-bottom: 4px;
  }
  .skill-category {
    font-weight: 700;
  }
</style>
</head>
<body>

<div class="header">
  <h1 class="name">Kenechukwu Udeh</h1>
  <div class="title">AI Solution Architect</div>
  <div class="contact">
    Lagos, Nigeria | +2348069544328 | <a href="mailto:kenechukwuudeh.tech@gmail.com">kenechukwuudeh.tech@gmail.com</a> | <a href="https://www.linkedin.com/in/kenechukwu-udeh">linkedin.com/in/kenechukwu-udeh</a> | <a href="https://github.com/kay-kruk">github.com/kay-kruk</a>
  </div>
</div>

<div class="section">
  <h2 class="section-title">Professional Summary</h2>
  <div class="summary">
    AI Solution Architect with 5+ years of experience designing end-to-end GenAI/LLM-based architectures and deploying them across diverse use cases. Deep hands-on expertise with RAG pipelines, vector databases, agentic workflows, and Python-based AI stacks (LangChain, LangGraph). Proven ability to translate business requirements into scalable, modular solution patterns that can be reused across teams and industries. Experienced in guiding engineering teams from POC through MVP to production, balancing speed with architectural integrity. Comfortable operating across time zones and supporting multiple workstreams simultaneously.
  </div>
</div>

<div class="section">
  <h2 class="section-title">Technical Skills</h2>
  <div class="skills-grid">
    <div class="skill-category">LLM & GenAI:</div>
    <div>OpenAI, Anthropic, Gemini APIs, RAG (Retrieval-Augmented Generation), Prompt Engineering, Fine-tuning, Evaluation</div>
    <div class="skill-category">Agentic AI:</div>
    <div>LangChain, LangGraph, Multi-Agent Orchestration, Function Calling, MCP (Model Context Protocol), n8n</div>
    <div class="skill-category">Data & Vector DBs:</div>
    <div>Pinecone, ChromaDB, Supabase pgvector, ETL Pipelines, Data Ingestion, JSON/SQL Transformations</div>
    <div class="skill-category">Programming:</div>
    <div>Python (Async, FastAPI, Type Hinting), TypeScript/Node.js, REST/gRPC APIs, Webhooks</div>
    <div class="skill-category">Cloud & DevOps:</div>
    <div>GCP, AWS, Docker, Kubernetes, GitHub Actions, CI/CD, Terraform</div>
    <div class="skill-category">Architecture:</div>
    <div>Modular Solution Design, Multi-Component Validation, POC→MVP Planning, Scalable Reusable Patterns</div>
  </div>
</div>

<div class="section">
  <h2 class="section-title">Professional Experience</h2>

  <div class="job">
    <div class="job-header">
      <div><span class="company">Tuppli</span> | <span class="job-title">AI Solution Architect</span></div>
      <div class="date">Oct 2024 – Present <span class="location">(Remote)</span></div>
    </div>
    <ul>
      <li><strong>Designed end-to-end GenAI architecture:</strong> Architected a modular, multi-component forensic intelligence platform comprising RAG pipelines, vector search (pgvector), LLM-driven analysis agents, and a FastAPI verification layer — all designed as reusable, composable patterns.</li>
      <li><strong>Built agentic AI workflows:</strong> Engineered multi-agent orchestration using LangChain and n8n-MCP, where specialized agents (reconnaissance, forensic verification, legal enforcement) operate autonomously across parallel workstreams with function calling and shared context.</li>
      <li><strong>Implemented RAG with hallucination controls:</strong> Designed retrieval-augmented generation pipelines grounded in verified data from Supabase pgvector, preventing LLM confabulation on critical outputs like pricing, evidence chains, and legal documents.</li>
      <li><strong>Led POC→MVP delivery:</strong> Drove feasibility assessments and iteratively shipped working components every 2 weeks, balancing speed over formality to rapidly validate architectural decisions before standardizing.</li>
      <li><strong>Multi-component solution validation:</strong> Reviewed and validated the full stack across data ingestion (web scrapers, ETL), AI layer (LLM agents, perceptual hashing), and UI/UX (Next.js dashboard), ensuring alignment between business requirements and technical execution.</li>
    </ul>
  </div>

  <div class="job">
    <div class="job-header">
      <div><span class="company">Relsify</span> | <span class="job-title">Automation Architect & TechOps Lead</span></div>
      <div class="date">April 2024 – Oct 2024 <span class="location">(Remote)</span></div>
    </div>
    <ul>
      <li><strong>Designed scalable integration architectures:</strong> Architected 15+ automated multi-component pipelines (data ingestion → AI classification → CRM routing) using n8n, Python, and REST APIs, reducing manual business process cycles by 80%.</li>
      <li><strong>Engineered resilient solution patterns:</strong> Built reusable error-handling and fallback logic across webhook architectures, ensuring 99.99% uptime and creating repeatable patterns adopted across multiple internal teams.</li>
      <li><strong>Translated business requirements into solutions:</strong> Worked directly with business stakeholders to interpret complex B2B workflows (prospect → PO → invoice) and designed modular automation architectures that eliminated operational bottlenecks.</li>
      <li><strong>AI-powered data enrichment:</strong> Integrated LLM-based classification nodes into CRM pipelines (HubSpot Custom Objects) to automatically enrich and score incoming data, enabling faster sales decisions.</li>
    </ul>
  </div>

  <div class="job">
    <div class="job-header">
      <div><span class="company">Olotu Square</span> | <span class="job-title">Integration DevOps Engineer</span></div>
      <div class="date">Aug 2022 – Nov 2023 <span class="location">(Port Harcourt, Nigeria)</span></div>
    </div>
    <ul>
      <li><strong>Architected CI/CD pipelines:</strong> Designed and implemented automated deployment architectures using Jenkins and GitHub Actions, reducing delivery time by 22% and establishing repeatable deployment patterns across teams.</li>
      <li><strong>Infrastructure orchestration:</strong> Managed Kubernetes environments, restructuring container configuration logic to increase workflow execution efficiency by 10% and scale throughput capacity by 39%.</li>
      <li><strong>Monitoring & observability:</strong> Configured Prometheus-based monitoring dashboards for real-time system health visibility, improving incident response times by 15% through automated alerting rules.</li>
      <li><strong>Cross-team technical guidance:</strong> Acted as the technical bridge between operations and engineering, reviewing solution designs and translating business requirements into validated system architectures.</li>
    </ul>
  </div>

  <div class="job">
    <div class="job-header">
      <div><span class="company">HK Security</span> | <span class="job-title">Systems Automation Administrator</span></div>
      <div class="date">Feb 2021 – Jun 2022 <span class="location">(Port Harcourt, Nigeria)</span></div>
    </div>
    <ul>
      <li><strong>Automated infrastructure operations:</strong> Developed Ansible playbooks and bash scripts to eliminate 40% of manual configuration workloads, ensuring strict data consistency across distributed environments.</li>
      <li><strong>Designed alerting architectures:</strong> Built cross-system alert integrations via Nagios, establishing proactive monitoring baselines and rapid incident detection for a fleet of Linux servers.</li>
    </ul>
  </div>

  <div class="job">
    <div class="job-header">
      <div><span class="company">3WForex</span> | <span class="job-title">Technical Support Specialist</span></div>
      <div class="date">Sept 2019 – Dec 2020 <span class="location">(Port Harcourt, Nigeria)</span></div>
    </div>
    <ul>
      <li><strong>Resolved 500+ complex technical integration issues</strong>, maintaining a 95%+ client satisfaction rate by explaining API logic and multi-component system behavior to non-technical stakeholders.</li>
      <li><strong>Automated troubleshooting workflows:</strong> Collaborated with engineering to document and automate repetitive diagnostic steps, improving system stability by 12%.</li>
    </ul>
  </div>

</div>

</body>
</html>
    `;
    const tmpHtml = path.join(__dirname, 'resume_tmp.html');
    fs.writeFileSync(tmpHtml, html);
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('file://' + tmpHtml, { waitUntil: 'networkidle0' });
    
    const outputPath = path.join(process.cwd(), 'Kenechukwu_Udeh_AI_Solution_Architect_Resume.pdf');
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '30px', bottom: '30px', left: '30px', right: '30px' }
    });
    
    await browser.close();
    fs.unlinkSync(tmpHtml);
    console.log('PDF generated successfully at ' + outputPath);
}
convert().catch(console.error);
