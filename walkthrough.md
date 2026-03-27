# Negotiator Dashboard Part A: Playground Implementation Walkthrough

I've successfully set up the foundation for the Negotiator Dashboard (Part A) focusing on a clean, dynamic, and fast architecture using **Next.js**, **React**, and **Vanilla CSS**.

Here is a summary of the implemented features:

## Architecture & Configuration
- **Next.js App Router**: Serving both the frontend UI and the backend API proxy seamlessly from a single application.
- **Environment Driven**: We respect the `NEXT_PUBLIC_POLLING_INTERVAL_MS` for tuning the dashboard refresh rate (defaults to 3 minutes, or 180,000ms), and `DB_PATH` to dynamically point to the Negotiator's SQLite Database file.
- **SQLite Integration**: Integrated `better-sqlite3` operating strictly in `readonly: true` to adhere to data safety constraints.

## Frontend UI Components
- **Dynamic Vanilla CSS**: Built a completely distinct `"glassmorphic"` layout (dark slate palette, frosted glass panels) tailored specifically to feel premium without relying on TailwindCSS or other bulk UI frameworks.
- **`ContextPanel`**: A smart left-panel that allows the user to define exactly which `ticket_id` to spoof or resume, and edit raw `payment_data` JSON for context injection.
- **`ChatInterface`**: The center stage. It continuously renders the text strings of the conversation and natively intercepts any embedded `function_call` representations from `tickets.messages`, converting them into beautifully styled, expandable UI tool banners (e.g. `REFUND(args)`). 
- **`ActionLogMonitor`**: A dedicated right-pane for system-level observability, directly connected to the database to track real-time changes in inbound queues, as well as tracking mock Outbound API Webhooks intercept.

## API Proxies & Mock Webhooks
- **`POST /api/proxy/inbound`**: The main interface for the Next.js UI to transparently forward requests to the core Negotiator service via your base URL environment variables.
- **`POST /api/webhooks/outbound`**: Simulated catching of Negotiator outbound hooks using an in-memory queue. We render these directly in the UI to prove side-effects were requested.

> [!TIP]
> **To start using the UI**:
> Run \`npm run dev\` and open \`http://localhost:3000\`.
> Be sure to pass the \`DB_PATH\` to point to the actual SQLite `.db` file path, and \`NEGOTIATOR_API_URL\` pointing to the inbound webhook receiver.
