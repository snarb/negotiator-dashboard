# System Description: Negotiator Dashboard & Testing Suite

## Overview

The Negotiator Dashboard & Testing Suite is a unified web interface consisting of two main components: an interactive **Playground Testing Tool** for simulating and observing customer–AI dialogues, and a read-only **Analytics Dashboard** for monitoring system metrics, strategy performance, and emotional signals.

This toolset interacts with the Negotiator service via the public Inbound API, hosts a mock Outbound API for test interception, and directly queries the SQLite database in strict read-only mode to visualize states and histories.

------

## Part A: Playground Testing Tool

The Playground is an interactive, conversational testing UI built to mimic the fluid experience of the OpenAI Playground. It allows users to simulate customer interactions, inject context, and observe both the AI's text responses and its hidden internal reasoning (tool calls) in real-time.

### 1. Chat Interface & Response Visibility (Core Experience)

- **As a user,** I want a clean chat interface to type and send synthetic customer messages to the `POST /api/v1/inbound/messages` endpoint, initiating or continuing a negotiation episode.
- **As a user,** I want to instantly see the Negotiator's text responses appear in the chat stream, clearly distinguishing between my input (User) and the AI's replies (Assistant).
- **As a user,** I want the chat window to automatically poll the database (`outbound_messages` and `tickets.messages`) so I can see asynchronous responses and conversation updates without manually refreshing the page.

### 2. Context Injection & Data Management

- **As a user,** I want the interface to automatically attach a valid, default JSON object for `payment_data` (based on documentation standards) to my messages, so I don't have to write boilerplate JSON for every test.
- **As a user,** I want a dedicated panel to view and manually edit the `payment_data` JSON before sending a message, allowing me to simulate specific billing scenarios (e.g., active trials, past upsells, specific bundles).
- **As a user,** I want an input field to define the `ticket_id` for my session. This allows me to either start a fresh dialogue (new ID) or test the system's "Reopen Rules" by reusing the ID of a previously closed ticket.

### 3. Action, Tool Call & Outbound API Observability

- **As a user,** I want to see explicit visual indicators (e.g., inline badges or collapsible blocks) in the chat history whenever the LLM invokes a tool (e.g., `REFUND(50%)`, `GRANT_BUNDLE`, `HANDOFF_TO_NEGOTIATION_STAGE`), so I understand exactly how the AI is navigating the concession ladder.
- **As a user,** I want to be able to click on any tool call to inspect the exact JSON trace (arguments passed and results returned), helping me debug the model's decision-making process.
- **As a system component,** the Playground must provide/host a mock **Outbound API** endpoint. When the Negotiator service attempts to execute external actions (e.g., canceling a subscription, executing a refund) during a test, the Playground must intercept these webhook calls and display them in the UI, proving that the side effect was successfully triggered.
- **As a user,** I want to see the status of my inbound events (from the `inbound_events` table) to confirm whether my test message is `PENDING`, `PROCESSED`, or `FAILED`.

## Part B: Analytics & Monitoring Dashboard (Read-Only)

**Overview:** The Dashboard is a read-only reporting and audit interface connected to the SQLite database. It is designed for product managers, analysts, and support leads to evaluate the financial efficiency of the Negotiator service, monitor A/B test performance of different AI strategies, track customer sentiment, and deeply audit individual ticket histories.

### 1. Executive KPIs & Outcomes (The "Macro" View)

- **As a stakeholder,** I want to see the total volume of tickets processed and their current states (`OPEN`, `CLOSED`, `FINALIZED`), so I know the system's current load and throughput.
- **As a product manager,** I want to see the **Average Issued Refund Percentage** over time, so I can track if the AI is successfully minimizing cash loss.
- **As a product manager,** I want a breakdown of "Resolution Types" (Cash Refund vs. 3 Free Months vs. Bundles), so I can see how often the AI successfully persuades users to accept zero-cost alternative concessions.
- **As a support lead,** I want to clearly see the "Failure Metrics": the percentage of tickets that resulted in a `dispute_detected`, and the percentage that were escalated to a human (`was_escalated_to_human`), so I can monitor risk and system boundaries.
- **As a stakeholder,** I want to see the average CSAT score (`csat_score`) specifically for tickets closed by the negotiation tool, to ensure aggressive cost-saving isn't destroying customer satisfaction.

### 2. Strategy & Arm Performance (The "Optimization" View)

- **As an analyst,** I want a performance matrix comparing the different active arms (e.g., `persona_arm_id`, `j4_arm_id` concession ladders, and `j5_arm_id` delivery strategies), so I can see which combinations yield the lowest average refund and lowest dispute rates.
- **As an ML engineer,** I want to see a time-series graph of the **Average System Reward**, so I can verify that the contextual bandit model is actually learning and optimizing its selections over weeks and months.
- **As an analyst,** I want to see the win rate (successful closure without human intervention) sliced by the `available_bundle` context, to see if offering specific bundles (like B_1 vs B_2) changes the negotiation outcome.

### 3. Customer Emotion & Signal Analytics (The "Sentiment" View)

- **As a product manager,** I want to see the overall volume and percentage of tickets flagged with high-risk signals (e.g., `noticeable_anger`, `scam_framing`, `legal_or_threatening`), so I can gauge the baseline hostility of the user base.
- **As a product manager,** I want a "De-escalation Metric" that tracks the delta in `signal_history` from the first user message to the last. *Did the anger level drop or rise after the AI's interventions?*
- **As a support lead,** I want to easily filter and find tickets that reached a "Maximum Anger Level" or involved legal threats, so I can review them for potential PR or legal risks.

### 4. Ticket Drill-Down & Audit (The "Micro" View)

- **As a QA/Support agent,** I want a highly filterable list of tickets (filterable by Date, Status, Closure Reason, Finalization Reason, Persona Used, and specific Signals like "Scam Framing"), so I can quickly isolate interesting edge cases.
- **As an auditor,** when I click into a specific `ticket_id`, I want a unified, chronological timeline that interleaves:
  - The actual text conversation (`messages`).
  - The hidden AI tool calls (e.g., the AI deciding to `INCREMENT_STEP_INDEX`).
  - The snapshot of the `payment_data` at the time.
  - The evolution of the customer's emotional signals turn-by-turn.
  - The actual executed system actions from the `ticket_actions` table (to verify that an AI's intent to `REFUND` actually resulted in a `SUCCEEDED` API call).
