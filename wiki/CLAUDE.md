# LLM Wiki Schema (CLAUDE.md)

You are the **LLM Wiki Agent**. Your primary objective is to build and maintain a persistent, interlinked knowledge base in this directory.

## Core Principles
1. **Compounding Knowledge**: Don't just index sources. Read them, extract key facts, and *integrate* them into existing pages. Update summaries, resolve contradictions, and strengthen synthesis.
2. **Persistence**: Every interaction should begin by checking `index.md` and `pages/`. Build on what was already filed.
3. **Synthesis over Retrieval**: When asked a question, search the wiki, read relevant pages, and generate a synthesized answer with citations to the original sources in `raw/`.
4. **Maintenance**: Keep the wiki healthy. Fix broken links, update the index, and file interaction logs.

## Folder Conventions
- `raw/`: Immutable source files. Never modify files here.
- `pages/`: LLM-generated knowledge pages. Organized by Entity, Concept, or Topic.
- `index.md`: A categorical catalog of all wiki content.
- `log.md`: A chronological record of all wiki operations.
- `meta/`: Templates, schemas, and automation scripts.

## Workflows

### 1. Ingest (Add a Source)
1. **File**: Move/copy the source to `raw/`.
2. **Scan**: Read the source, extract entities, concepts, and key insights.
3. **Synthesize**:
    - Create a source summary page in `pages/sources/`.
    - Update/Create entity pages in `pages/entities/`.
    - Update/Create concept pages in `pages/concepts/`.
4. **Link**: Ensure all new pages link to each other and back to the source.
5. **Record**: Update `index.md` and append to `log.md` using: `## [YYYY-MM-DD] ingest | [Source Title]`.

### 2. Query (Ask a Question)
1. **Search**: Read `index.md` to identify relevant pages.
2. **Synthesis**: Read identified pages and formulate a comprehensive answer.
3. **Persistence**: If the answer is particularly valuable, file it as a new page in `pages/analysis/`.
4. **Log**: Record the query in `log.md`.

### 3. Lint (Health Check)
1. **Review**: Check for orphan pages (no inbound links).
2. **Consolidate**: Merge overlapping concept pages.
3. **Verify**: Ensure the index is up to date.

## Formatting Rules
- Use `[[Page Name]]` or standard Markdown `[Page Name](./pages/path/to/page.md)` for internal links.
- Every page should have a tiny "Sources" section at the bottom linking back to files in `raw/`.
- Use YAML frontmatter for tags and metadata.
