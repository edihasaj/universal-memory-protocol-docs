---
title: Quickstart
description: Install the reference SDK, run the cross-vendor round-trip, and wire the MCP binding.
---

The reference implementation (`@ump/core`) is a working **L3** server: did:key
signing, the six operations, bi-temporal revise, consent enforcement, and
injection-resistant rehydration - over MCP, HTTP, and file bindings.

## Use it now (any MCP host)

Add persistent, portable memory to Claude Code, Cursor, Codex, or any MCP host in
one line. Add to your MCP client config:

```jsonc
{
  "mcpServers": {
    "ump": { "command": "npx", "args": ["-y", "@ump/core", "ump-memory"] }
  }
}
```

The agent gets `ump.remember` / `ump.recall` (plus `get` / `revise` / `forget` /
`feedback`). Memory persists to `~/.ump/memory.ump.json` as a portable, signed
file with a stable operator identity. Point another tool at the same store - or
its export - and your agent keeps everything it learned. Set `UMP_HTTP=4000` to
also expose the HTTP binding; set `UMP_DIR` to change the data directory.

## Install & test

```bash
git clone https://github.com/edihasaj/universal-memory-protocol
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
import { UmpServer, InMemoryStore, generateKeyPair, rehydrate, file } from "@ump/core";

const owner = generateKeyPair();

// Agent A (e.g. Claude Code) writes a correction - signed, content-addressed.
const a = new UmpServer({ name: "claude-code", version: "1", store: new InMemoryStore(), key: owner });
const { id } = await a.remember({
  kind: "procedural",
  body: { text: "Always run `pnpm gate` before handoff in this repo." },
  scope: { owner: owner.did, project: "edihasaj/recall", agent: "claude-code", visibility: "private" },
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
