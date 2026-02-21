---
title: Getting Started with OpenCrow
description: Setup, configuration, and integration guide for end users.
category: user
---

# Introduction to OpenCrow

OpenCrow is an open-source AI agent platform designed to embed intelligent assistants into web applications. It allows developers to create, manage, and deploy AI agents that can interact with both server-side APIs and client-side application logic.

## What OpenCrow Can Do

- **Embeddable Widget:** Provide a React-based chat widget to your users with a single line of code or custom component installation.
- **Split-View Dashboard:** Manage agents, sessions, and configurations easily from an admin dashboard.
- **Dual-Layer Tooling:** The agent can interact with your backend server through OpenAPI specifications AND manipulate the client's frontend (like navigating pages, opening sidebars).

## What OpenCrow Cannot Do (Yet)

- Vector Knowledge Base parsing is under development and not fully supported for all file types yet.
- Advanced custom authentication flows within the widget are partially supported and require custom implementations.

## Cloning and Setup

OpenCrow is designed as a monorepo. To get started locally:

```bash
# Clone the repository
git clone https://github.com/himasnhu-at/opencrow.git
cd opencrow

# Install dependencies (requires pnpm)
npm install -g pnpm
pnpm install
```

### Environment Configuration

You'll need to set up `.env` files in two locations. Check the `.env.example` files in each directory:

1.  **Dashboard:** `apps/app/.env`
2.  **Backend:** `apps/backend/.env` (Requires OpenAI/Gemini API keys, Database URLs, etc.)

## Running the Project

Start the required backend services (PostgreSQL, Redis, etc.) using Docker:

```bash
docker-compose up -d
```

Once the containers are running, start all development servers:

```bash
pnpm dev
```

### Access Points

- **Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001](http://localhost:3001)
- **Landing Page:** [http://localhost:4000](http://localhost:4000)
- **Sample Store (Demo):** [http://localhost:8000](http://localhost:8000)

## Integrating the Widget

To add the widget to your Next.js/React site, first install the package (assuming you're in the monorepo):

```tsx
import { OpenCrowWidget } from "@opencrow/widget";

export default function MyPage() {
  return (
    <>
      <h1>Welcome to My Site</h1>

      <OpenCrowWidget
        projectId="your-project-id"
        tools={{
          navigate_to_page: ({ page }) => {
            window.location.href = `/${page}`;
            return { success: true };
          },
          open_cart: () => {
            // your logic here
            return { success: true };
          },
        }}
      />
    </>
  );
}
```

Define any custom `tools` you want the AI to be able to execute directly on the frontend.
