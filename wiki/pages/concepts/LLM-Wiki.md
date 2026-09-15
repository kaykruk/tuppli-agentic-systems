# Concept: LLM Wiki

The **LLM Wiki** is a persistent knowledge base where an LLM acts as the primary maintainer (the "programmer") and the wiki itself is the "codebase".

## Core Idea
Unlike standard RAG, which rediscovers knowledge on every query, the LLM Wiki *compiles* information into a structured markdown format. This allows for:
- **Compound Interest**: Knowledge gets richer over time.
- **Pre-linked Entities**: Cross-references are created during ingest, not just discovery.
- **Synthesis**: The LLM resolves contradictions between sources.

## Architecture
1. **Raw Sources**: Immutable files in `raw/`.
2. **The Wiki**: LLM-generated pages in `pages/`.
3. **The Schema**: A configuration file (like [[CLAUDE.md]]) that defines the agent's behavior.

## Related Concepts
- [[Incremental Compilation]]
- [[Synthesis over Retrieval]]

---
*References:*
- [[llm-wiki]]
