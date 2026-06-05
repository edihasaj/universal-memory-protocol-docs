---
title: Ecosystem & positioning
description: How UMP relates to MCP, A2A, and the existing agent-memory and conversation-portability efforts.
---

UMP is designed to **compose with** the emerging agent stack, not compete with it.

## Complementary standards

| Standard | Layer | Relationship to UMP |
| --- | --- | --- |
| **MCP** (Model Context Protocol) | Tools | UMP's primary binding *is* an MCP profile. UMP rides MCP's transport. |
| **A2A** (Agent2Agent) | Coordination | A2A moves work between agents; UMP is the memory they share and carry. |
| **W3C PROV / DID** | Provenance & identity | Reused directly for UMP provenance and operator identity - not reinvented. |
| **OAuth 2.0** | Auth | Capability tokens can be carried over standard bearer auth. |

## Where UMP differs from existing memory work

The memory space already has **runtime tool-surfaces** (each with proprietary
verbs), **storage engines**, and **interchange formats** (static files). What it
lacks is a **negotiated, access-controlled runtime protocol with an MCP binding**.
That is UMP's lane.

| Approach | Examples | What it is | What UMP adds |
| --- | --- | --- | --- |
| Runtime tool-surfaces | Mem0/OpenMemory, Letta blocks, vendor memory tools | Useful CRUD+search, but proprietary verbs per product | One negotiated verb set any host speaks |
| Storage / retrieval engines | temporal KGs, tiered memory OSes | Great recall quality | A standard *interface* so engines compete underneath |
| Interchange formats | PAM, MIF, conversation-backup specs | Portable *files* - no runtime, negotiation, or access control | The runtime middle: capabilities, scoping, consent, signing |

### A note on "Open Memory Protocol"

There is a separate project named *Open Memory Protocol* focused on **AI
conversation backup and portability** - exporting and migrating raw chat
transcripts (`.zip` archives) between consumer products. That solves a real but
distinct problem: moving *transcripts*. UMP is about the **live memory runtime** -
the distilled, typed knowledge agents read and write *during* a task, with
bi-temporal validity, provenance, signing, and injection-resistant rehydration.
Different layer; the two could even interoperate (transcripts in, distilled
memory out).

## What UMP deliberately leaves to engines

UMP standardizes **structure, provenance, access, and trust**. It does **not**
standardize:

- extraction / salience (what's worth remembering),
- ranking algorithms (vector, BM25, graph, hybrid - all conform),
- decay curves or promotion logic,
- consolidation / "rethinking".

Encoding those into the wire format would make it brittle and slow to ratify.
They are where implementations compete - UMP only standardizes the *interface*
and the *ranking signals* they report.

## Implementation reach

The reference SDK is intentionally store-neutral. It ships dependency-light
adapters for the databases and engines teams already use, while keeping vendor
SDKs outside the core install.

| Implementation | Role |
| --- | --- |
| `JsonFileStore` | portable `*.ump.json` persistence |
| `MarkdownDirectoryStore` | human-editable `*.ump.md` records |
| `PostgresStore` | PostgreSQL persistence via an existing `pg`-style client |
| `SqliteStore` | local/embedded SQLite persistence via a compatible client |
| `RedisStore` | Redis hash-backed persistence |
| `VectorStore` | generic embedding-backed memory store |
| `QdrantStore` / `PineconeStore` / `WeaviateStore` | named vector database adapters over the vector client contract |
| `RecallStore` | Recall exposed as a UMP-speaking production memory engine |

This keeps UMP positioned as the common protocol: the database changes, the
agent-facing memory surface does not.
