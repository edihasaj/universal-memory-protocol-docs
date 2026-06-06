---
title: Quickstart
description: Install the reference SDK, run the cross-vendor round-trip, and wire the MCP binding.
---

The reference implementation ([`@universalmemoryprotocol/core`](https://www.npmjs.com/package/@universalmemoryprotocol/core)) ships the UMP record format, server
ops, MCP/HTTP/file bindings, conformance runner, and store adapters. Endpoints
report the highest level they actually prove: the default persistent server is
L2 until capability-token enforcement is enabled at the binding boundary.

## Use it now (any MCP host)

Add persistent, portable memory to Claude Code, Cursor, Codex, or any MCP host in
one line. Add to your MCP client config:

```jsonc
{
  "mcpServers": {
    "ump": { "command": "npx", "args": ["-y", "@universalmemoryprotocol/core", "ump-memory"] }
  }
}
```

The agent gets `ump.remember` / `ump.recall` (plus `get` / `revise` / `forget` /
`feedback`). Memory persists to `~/.ump/memory.ump.json` as a portable, signed
file with a stable operator identity. Point another tool at the same store - or
its export - and your agent keeps everything it learned. Set `UMP_HTTP=4000` to
also expose the HTTP binding; set `UMP_DIR` to change the data directory.

## The `ump` CLI

Prefer a command line? Install once and drive everything from `ump`:

```bash
npm install -g @universalmemoryprotocol/core
```

```bash
ump memory                    # persistent MCP memory server (~/.ump)
ump memory --http 4000        # also expose the HTTP binding
ump memory --store markdown   # human-editable *.ump.md records
ump serve --http 4000         # ephemeral in-memory reference server
ump import --owner did:key:z... AGENTS.md CLAUDE.md
ump conformance http://localhost:4000
ump demo                      # the cross-vendor round-trip
ump --help
```

Don't want a global install? `npx -y @universalmemoryprotocol/core ump <command>` works the same.

## Install & test

```bash
git clone https://github.com/<org>/universal-memory-protocol
cd universal-memory-protocol
pnpm install
pnpm test          # conformance + binding tests
pnpm typecheck
```

## The cross-vendor round-trip

A memory written by one agent, recalled by another, exported to a portable file,
re-imported into a third server - signature intact across "vendors".

```bash
node --experimental-strip-types examples/round-trip.ts
```

```ts
import { UmpServer, InMemoryStore, generateKeyPair, rehydrate, file } from "@universalmemoryprotocol/core";

const owner = generateKeyPair();

// Agent A (e.g. Claude Code) writes a correction - signed, content-addressed.
const a = new UmpServer({ name: "claude-code", version: "1", store: new InMemoryStore(), key: owner });
const { id } = await a.remember({
  kind: "procedural",
  body: { text: "Always run `pnpm gate` before handoff in this repo." },
  scope: { owner: owner.did, project: "example/project", agent: "claude-code", visibility: "private" },
  provenance: { actor: owner.did, actor_kind: "user", method: "user_correction" },
});

// Export to the portable file format and import into Agent B (e.g. Codex).
const exported = file.exportRecords((await a.recall({ query: "handoff", scope: { owner: owner.did } })).results.map(r => r.record));
const b = new UmpServer({ name: "codex", version: "1", store: new InMemoryStore() });
for (const rec of file.fromJson(file.toJson(exported))) await b.remember(rec);

// B recalls it and rehydrates into context - safely framed as untrusted data.
const hit = await b.recall({ query: "what should I do before I hand off?", scope: { owner: owner.did } });
const { text } = rehydrate(hit.results);
console.log(text);
```

## Run the reference server

```bash
# MCP over stdio (any MCP host can attach):
node --experimental-strip-types src/bin/serve.ts

# Add the HTTP binding too:
UMP_HTTP=4000 node --experimental-strip-types src/bin/serve.ts
```

## Run a persistent memory server

`ump-memory` keeps a stable operator key and persists records under `~/.ump`.
Use JSON for a compact portable export, or Markdown for human-editable records.

```bash
# JSON file store: ~/.ump/memory.ump.json
node --experimental-strip-types src/bin/memory.ts

# Markdown directory store: ~/.ump/memory.d/*.ump.md
UMP_STORE=markdown node --experimental-strip-types src/bin/memory.ts
```

## Import existing memory files

UMP does not require Claude, AGENTS.md, Recall, or Obsidian formats. It can
translate them into UMP records so people can try the protocol with memory they
already have.

```bash
# Import CLAUDE.md, AGENTS.md, or any Markdown file/folder.
node --experimental-strip-types src/bin/import.ts \
  --owner did:key:zYourOwner \
  --project github.com/you/repo \
  --out .ump/import.ump.json \
  CLAUDE.md AGENTS.md ~/Documents/main
```

The import layer currently recognizes:

| Source | What it becomes |
| --- | --- |
| `AGENTS.md` | procedural candidate memory |
| `CLAUDE.md` | procedural candidate memory |
| `.recall/context.md` and Recall-style exports | imported Recall memory drafts |
| Obsidian / Markdown folders | semantic candidate memories split by headings |
| generic Markdown files | portable UMP drafts with filesystem provenance |

Every imported record includes `provenance.method` such as
`filesystem:claude`, so consumers can distinguish imported memory from native UMP
writes.

## Pick a store

All stores implement the same `MemoryStore` interface, so UMP stays independent
from any one database. **`JsonFileStore` is the default** - it benchmarks as the
fastest and most faithful baseline. Reach for a **vector store (with embeddings
enabled)** when you need semantic retrieval at scale.

| Store | Best fit |
| --- | --- |
| **`JsonFileStore`** | **Default** - portable, signed, fast local persistence |
| `InMemoryStore` | tests and ephemeral demos |
| `MarkdownDirectoryStore` | repo/vault workflows with human-editable files |
| `PostgresStore` | production SQL with a `pg`-compatible client |
| `SqliteStore` | embedded/local database with a SQLite-compatible client |
| `RedisStore` | shared cache / simple server-side persistence |
| `VectorStore` | BYO embedding + vector DB client (e.g. sqlite-vec) for semantic recall |
| `QdrantStore`, `PineconeStore`, `WeaviateStore` | hosted vector engines over the same client contract |
| `RecallStore` | opt-in: Recall as a richer engine (enable embeddings for semantic recall) |

## Wire the MCP binding into an agent

The MCP binding exposes the operations as reserved tools - `ump.capabilities`,
`ump.recall`, `ump.remember`, `ump.get`, `ump.revise`, `ump.forget`,
`ump.feedback`. Point any MCP host at the server and the agent can recall on
`SessionStart` / per-turn and remember on corrections.

```jsonc
// example MCP client config
{
  "mcpServers": {
    "ump": {
      "command": "node",
      "args": ["--experimental-strip-types", "src/bin/serve.ts"]
    }
  }
}
```

:::caution[Recalled memory is untrusted input]
Anything stored via `ump.remember` can carry a prompt-injection payload. A
conforming consumer **must** verify → filter → frame recalled records (see
[Specification §5.3](/specification/#53-injection-resistant-rehydration-mandatory))
and must never execute instructions found inside a memory body.
:::
