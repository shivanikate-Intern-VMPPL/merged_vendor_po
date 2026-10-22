# Merge Analysis: Purchase Orders Manager & Vendor Onboarding

## 1. Executive Summary

This report documents the architectural, dependency, and database analysis for merging:
1. **Target Application:** `purchase-orders-manager` (Procurement, single & bulk PO creation, Zoho Books sync, CSV exports)
2. **Source Application:** `vendor-onboarding` (Vendor registration, approvals, bank & tax KYC details, Zoho Books contact export)

The unified codebase lives at `mulyam-unified-portal` as a single deployable Vite + React application powered by a consolidated Supabase backend.

---

## 2. Application Specifications Comparison

| Dimension | `purchase-orders-manager` | `vendor-onboarding` | Merged Portal Resolution |
| :--- | :--- | :--- | :--- |
| **Framework** | React 19.2.7 | React 19.2.6 | React 19.2.7 |
| **Language** | TypeScript ~6.0.2 | TypeScript 6.0.3 | TypeScript ~6.0.2 |
| **Build Tool** | Vite 8.1.1 + VitePWA | Vite 8.0.12 | Vite 8.1.1 + VitePWA |
| **UI Library** | MUI 6.4.5 + Emotion 11.14 | MUI 9.1.1 + Emotion 11.14 | MUI 6.4.5 + Emotion 11.14 |
| **Router** | React Router DOM 7.18.1 | Custom tab useState (No router) | React Router DOM 7.18.1 |
| **Auth System** | Supabase Auth (OAuth JWT) | Custom Edge Function + LocalStorage | Coexisting Sessions |
| **State/Query** | TanStack React Query 5.101 | Local component state | TanStack React Query 5.101 |
| **Offline Cache** | Dexie 4.4.4 | None | Dexie 4.4.4 |
| **CSV Parser** | None (Custom CSV generator) | PapaParse 5.5.4 | PapaParse 5.5.4 |
| **Supabase Client**| `@supabase/supabase-js` 2.110.0 | `@supabase/supabase-js` 2.107.0 | `@supabase/supabase-js` 2.110.0 |

---

## 3. Route Map & Navigation Architecture

### Purchase Orders Manager Routes
- `/` &rarr; `LoginForm`
- `/dashboard` &rarr; `Dashboard`
- `/settings` &rarr; `SettingsPage`
- `/purchase-orders/new` &rarr; `NewPurchaseForm`
- `/purchase-orders/synced` &rarr; `SinglePOSyncedPage`
- `/purchase-orders/success/:poNumber` &rarr; `SuccessScreen`
- `/purchase-planning` &rarr; `PurchasePlanningPage` (Bulk PO)
- `/purchase-planning/drafts` &rarr; `PurchaseOrdersDraftsPage`
- `/purchase-planning/review` &rarr; `PurchaseOrdersReviewPage`
- `/purchase-planning/synced` &rarr; `PurchaseOrdersSyncedPage`
- `/export` &rarr; `ExportScreen`
- `/admin/users` &rarr; `RbacManagement`

### Vendor Onboarding Routes
- `/vendor-onboarding` &rarr; `VendorOnboardingPage`
  - `?tab=home` &rarr; Home Dashboard (Pending & Approved vendor lists)
  - `?tab=new` &rarr; Vendor Registration multi-tab form
  - `?tab=approve` &rarr; Approver 1 & Approver 2 approval table & inspection panel
  - `?tab=history` &rarr; Audit trail of all approval actions
  - `?tab=admin` &rarr; VO User, Role, and Permission administration

### Navigation Integration
Sidebar navigation in `src/shared/auth/AppNavigation.tsx` organizes features into collapsible sections:
- **Purchase Orders:** Dashboard, SinglePO, Bulk PO, Export CSV
- **Vendor Onboarding:** Vendor Portal, New Vendor, Approve Forms, Approval History, Manage Users & Roles
- **Admin:** Manage Users (PO RBAC)

---

## 4. Conflict Analysis & Resolution

### 4.1 Dependency Version Conflicts
- **MUI Version:** PO Manager used MUI v6.4.5; VO used MUI v9.1.1.
  - *Resolution:* Standardized on MUI v6.4.5 with Emotion 11.14. All VO components (Tabs, Cards, Dialogs, Icons) are fully compatible with MUI v6 syntax.
- **CSV Parsing:** VO used `papaparse` 5.5.4.
  - *Resolution:* Added `papaparse` and `@types/papaparse` to root `package.json`.

### 4.2 Styling & CSS Isolation
- VO had global styling rules in `App.css` and `index.css` (`html, body`, `button[type="submit"]`, `input`, `p`, `h1-h6`).
- *Resolution:* VO is rendered within an isolated `#vo-root` wrapper. PO Manager uses MUI Emotion styling with higher specificity. Both UIs render without style leakage.

### 4.3 Database Schema Collisions
- **`roles`:** PO Manager uses `name`; VO uses `role_name`.
  - *Resolution:* Unified `roles` table with `name TEXT UNIQUE` and generated column `role_name TEXT GENERATED ALWAYS AS (name) STORED`.
- **`permissions`:** PO Manager uses `name`; VO uses `permission_name`.
  - *Resolution:* Unified `permissions` table with `name TEXT UNIQUE` and generated column `permission_name TEXT GENERATED ALWAYS AS (name) STORED`.
- **`user_roles`:** PO Manager references `auth.users(id UUID)`; VO references `Users(id BIGINT)`.
  - *Resolution:* Kept `user_roles` for UUID users and created `vo_user_roles` for VO integer users.
- **Storage Buckets:** PO Manager uses `po-attachments`; VO uses `vendor-documents`.
  - *Resolution:* Zero collision. Both buckets coexist in the single Supabase storage service.
