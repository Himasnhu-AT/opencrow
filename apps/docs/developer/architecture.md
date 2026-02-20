---
title: OpenCrow Architecture
description: A deep dive into the monorepo structure, modules, and internal flow.
category: developer
---

# Architecture Overview

OpenCrow is a monorepo built using **Turbo**, consisting of multiple applications and packages. This guide covers how the components interact and the core logic behind the agent execution engine.

## Monorepo Structure

- **`apps/app`**: The Next.js dashboard used by administrators to configure agents, define client-side tools, and view chat histories.
- **`apps/backend`**: The Node.js (Express) backend server. This is the "brain" of OpenCrow, handling vector embeddings, database interactions, LLM orchestration, and Tool merging.
- **`apps/website`**: The public-facing landing page and documentation site.
- **`packages/widget`**: The React widget package that end-users embed into their applications to provide the chat interface.
- **`sample-website`**: A Next.js demo application demonstrating how the widget functions in a real-world scenario (an e-commerce store).

## The Tooling Engine

The core innovation in OpenCrow is its dual-layer tool execution capability.

### Server-Side Tools

These are defined by providing a URL to an OpenAPI (Swagger) specification in the dashboard.

1.  The backend downloads and parses the OpenAPI JSON/YAML.
2.  It converts these API definitions into a format Native to the LLM (e.g., Gemini function declarations).
3.  When the LLM decides to use one of these tools, it makes a request to the _Backend_.
4.  The Backend then acts as a proxy, securely forwarding the request to the target server defined in the OpenAPI spec.

### Client-Side Tools

These are custom tools defined directly in the OpenCrow Dashboard using a JSON schema. They are intended to manipulate the UI or state of the user's application.

1.  The backend loads the JSON definitions of these client-side tools and merges them with the server-side tools.
2.  Both sets of tools are passed simultaneously to the LLM context.
3.  If the LLM triggers a _Client-Side Tool_, the backend recognizes it.
4.  Instead of executing it (because the backend has no access to the browser window), the backend returns a specific payload back to the **Widget**.
5.  The Widget then matches the tool name to the JavaScript function passed into its props and executes it locally in the user's browser.

## Tech Stack Summary

- **Database:** PostgreSQL with Prisma ORM.
- **Generative AI:** Google Generative AI (`@google/generative-ai`) is the primary LLM engine.
- **Vector Database:** LanceDB is used for document ingestion and retrieval (Knowledge Base).
- **Caching/State:** Redis (via `ioredis`) handles rate limiting and potentially session states.
- **Validation:** Zod is used for runtime payload validation across the stack.
