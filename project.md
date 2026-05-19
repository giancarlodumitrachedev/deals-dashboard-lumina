# Project Specification: Lumina Digital Internal CRM

## 1. Project Overview
This document outlines the complete architecture, feature set, and technical requirements for a custom, highly ergonomic internal CRM for "Lumina Digital," a web design and development agency. The primary goal is extreme operational efficiency, minimal cognitive load for employees, and maximum scalability. 

**Critical Directive for the AI:** 
- All underlying code, database schemas, and variables should be written in English.
- **All user-facing UI text, notifications, and labels MUST be in Italian.**
- Prioritize visual minimalism. Only display actionable items.

## 2. Tech Stack
- **Frontend/Framework:** Next.js (App Router, React 18+)
- **Styling:** Tailwind CSS (Focus on minimal, clean UI, white/gray spaces, red badges for alerts)
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **State Management & Data Fetching:** React Query (or SWR) + Supabase Client
- **Form Validation:** Zod + React Hook Form
- **Realtime:** Supabase Realtime (for notifications and state changes)
- **Automations:** Supabase Edge Functions / Database Triggers (PostgreSQL)

## 3. Security Requirements (Anti-Sabotage)
Security is paramount. The system must prevent unauthorized access, data leakage, and malicious alterations.
- **Row Level Security (RLS):** Must be strictly implemented in Supabase. Users can only `SELECT`, `UPDATE`, or `INSERT` rows where they have explicit permission based on their assigned role. 
- **Server-Side Validation:** Never trust client-side data. All API routes and Server Actions must validate inputs using `Zod`.
- **Role-Based Access Control (RBAC):** Permissions must be decoupled from user accounts. Maintain a strictly relational RBAC structure in the database.
- **Audit Logging:** Every state change in a deal must be recorded in an immutable `deal_events` table (cannot be deleted or modified by users).
- **Rate Limiting:** Protect edge functions and API routes against spam/brute force.

## 4. Database Schema (PostgreSQL)
Implement the following core tables with foreign key constraints.

*   `users`: Managed by Supabase Auth (links `auth.users.id` to public profile data).
*   `roles`: `id`, `name` (Admin, Manager, Developer, Sales).
*   `permissions`: `role_id`, `action` (e.g., `view_all_deals`, `upload_site`, `assign_deals`).
*   `deals`: 
    *   `id`, `client_name`, `phone_number`, `value` (numeric).
    *   `status`: enum (`New Lead`, `In Development`, `Ready to Pitch`, `Decision Pending`, `Payment Pending`, `Won`, `Cancelled`).
    *   `assigned_sales_id` (UUID -> users.id).
    *   `assigned_dev_id` (UUID -> users.id).
    *   `site_url` (nullable).
*   `follow_ups`: 
    *   `id`, `deal_id`, `step_number` (1, 2, or 3).
    *   `scheduled_date` (timestamp).
    *   `status` (enum: `pending`, `done`, `missed`).
*   `deal_events` (Audit Log): 
    *   `id`, `deal_id`, `user_id`, `action_description`, `created_at`.
*   `commissions`: 
    *   `id`, `deal_id`, `user_id`, `amount`, `status` (`pending`, `paid`).

## 5. Core Workflows & Automations

### A. The Handoff Automation (Dev -> Sales)
1.  **Trigger:** A Developer pastes the `site_url` into a deal and clicks the "Segna come Pronto" (Mark as Ready) button.
2.  **Action:** A PostgreSQL trigger automatically updates the deal `status` to `Ready to Pitch`.
3.  **Notification:** Supabase Realtime pushes a notification to the `assigned_sales_id`. The UI displays a red badge alerting the agent: "Sito pronto da inviare a [Client Name]". The payload includes a one-click copyable WhatsApp message template.

### B. The 3-Step Follow-Up Engine
1.  **Trigger:** Sales agent sends the link and moves the deal to `Decision Pending`.
2.  **Action:** System generates 3 rows in the `follow_ups` table (e.g., +2 days, +5 days, +7 days).
3.  **UI Representation:** Agent dashboard features an "Azioni Richieste Oggi" (Required Actions Today) section. Deals with pending follow-ups due today appear here. 
4.  **Progression:** Clicking "Fatto" (Done) marks step 1 as complete and queues step 2. 
5.  **Failure State (Edge Function):** A daily CRON job (Supabase Edge Function) checks for deals where step 3 is past due and unanswered. It automatically moves these deals to `Cancelled` and logs the event.

## 6. Frontend Architecture & Ergonomics (Role-Based UI)
The UI must dynamically render based on the user's `role`. Exclude unnecessary navigational elements.

### 6.1 View: Sales Agent (Agente)
- **Goal:** Zero distraction. Action-oriented.
- **Layout:** A smooth, drag-and-drop Kanban board (e.g., using `@hello-pangea/dnd`).
- **Columns:** `Pronti per il Pitch`, `In Attesa di Decisione`, `In Attesa di Pagamento`.
- **Widgets:** 
  - "Azioni Richieste Oggi" (Top of screen, prioritizing follow-ups).
  - Personal Stats: "Tasso di Conversione" (Conversion Rate) and "Commissioni da Ricevere" (Pending Commissions).

### 6.2 View: Developer (Sviluppatore)
- **Goal:** Clear queue of work. 
- **Layout:** A simple linear To-Do list.
- **Interaction:** Only shows deals `In Development`. Input field for `site_url` and a submit button. No financial data visible.

### 6.3 View: Manager/Dispatcher
- **Goal:** Fast sorting and assignment.
- **Layout:** An "Inbox" of `New Leads`.
- **Interaction:** Click a lead -> Assign to Dev -> Assign to Sales via simple dropdown menus. 

### 6.4 View: Admin (Amministratore)
- **Goal:** Full oversight and financial control.
- **Layout:** Tabbed dashboard.
  - **Tab 1: Operatività:** Global view of all Kanban boards across all users.
  - **Tab 2: Analitiche:** Charts (Recharts or Chart.js) showing agency win rates, individual employee performance, and pipeline bottlenecks.
  - **Tab 3: Commissioni:** A data table of all closed deals. Includes a toggle switch to mark commissions from "Da Pagare" to "Pagata".

## 7. Implementation Steps for the AI
1.  **Initialize Next.js & Supabase:** Set up the Next.js App Router environment and connect the Supabase client.
2.  **Apply Database Migrations:** Create the tables, foreign keys, and RLS policies exactly as outlined in Section 3 and 4.
3.  **Build Authentication & RBAC Middleware:** Ensure Next.js middleware protects routes and fetches user roles upon login to redirect them to their specific views.
4.  **Develop UI Components:** Build modular Tailwind components (Kanban columns, deal cards, input forms).
5.  **Implement State & Realtime:** Wire up React Query for data fetching and Supabase Realtime subscriptions for live notifications.
6.  **Deploy Automations:** Write the PostgreSQL triggers for state changes and the Edge Function CRON job for the follow-up logic.