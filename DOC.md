# Client-Side Tools Integration

OpenCrow supports two types of tools that the AI agent can use:

1.  **Server-Side Tools**: Defined via OpenAPI specification. These are API endpoints executed by the backend proxy.
2.  **Client-Side Tools**: Defined manually in the Dashboard. These are JavaScript functions executed by the `OpenCrowWidget` on the user's website.

## How Tool Merging Works

The backend (`ChatService`) dynamically merges these two sources of tools for every chat request:

1.  **Fetch**: It retrieves the OpenAPI spec URL and the stored Client-Side Tools JSON from the Product configuration.
2.  **Parse & Convert**: It converts the OpenAPI endpoints into LLM-compatible tool definitions. It also formats the Client-Side Tools (already in JSON format) to match.
3.  **Merge**: It combines both lists into a single `tools` array passed to the LLM (e.g., Gemini/GPT).

When the LLM calls a tool:

- If it matches a **Server-Side Tool**, the backend proxies the request to your API.
- If it matches a **Client-Side Tool**, the backend sends a special response to the frontend widget, instructing it to execute the function locally.

## Defining Client-Side Tools

You can define tools in the **Dashboard** -> **Integrations** -> **Client-Side Tools**.

### Schema Format

Tools are defined using a JSON schema similar to OpenAI Function Calling:

```json
{
  "name": "navigate_to_page",
  "description": "Navigate to a specific page on the website",
  "parameters": {
    "type": "object",
    "properties": {
      "page": {
        "type": "string",
        "description": "The destination page (e.g., 'home', 'cart', 'orders')"
      }
    },
    "required": ["page"]
  }
}
```

```json
{
  "name": "open_cart",
  "description": "Open the shopping cart sidebar",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

## Implementing the Widget

On your frontend, pass the actual JavaScript functions to the `OpenCrowWidget`:

```tsx
<OpenCrowWidget
  projectId="..."
  tools={{
    navigate_to_page: ({ page }) => {
      window.location.href = `/${page}`;
      return { success: true };
    },
    open_cart: () => {
      setIsCartOpen(true);
      return { success: true };
    },
  }}
/>
```

### queries:

```md
use tool queryknowledgebase to fetch results related to Show recent orders
```
