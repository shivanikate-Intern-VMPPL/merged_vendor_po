# Merge Report: Mulyam Unified Portal

## 1. What Moved Where

| Original File / Path | New Location in Unified Portal | Notes |
| :--- | :--- | :--- |
| `purchase-orders-manager/src/*` | `src/*` | Main application shell and PO features |
| `vendor-onboarding/src/*` | `src/modules/vendor-onboarding/*` | Moved intact into isolated module directory |
| `vendor-onboarding/public/logo.jpeg` | `public/logo.jpeg` | Preserved for VO login screen |
| `vendor-onboarding/public/logo.svg` | `public/logo.svg` | Preserved for VO sidebar |
| `vendor-onboarding/supabase/functions/upload-vendor-to-zoho` | `supabase/functions/upload-vendor-to-zoho` | Deno edge function migrated intact |
| New glue route | `src/pages/VendorOnboardingPage.tsx` | Hosts the VO module with query param deep-linking |
| Consolidating schema | `supabase/migrations/20261018120000_merged_schema.sql` | Consolidated PostgreSQL DDL for both apps |
| Data migration script | `scripts/migrate-vo-data.js` | Idempotent migration tool with dry-run support |

---

## 2. Modified Files & Rationale

1. **`package.json`**:
   - Merged dependencies: Added `papaparse` (^5.5.4), `@types/papaparse` (^5.5.2), and `hoist-non-react-statics` (^3.3.2) to PO Manager's `package.json`. Standardized on React 19.2.7 and MUI 6.4.5.
2. **`tsconfig.app.json`**:
   - Set `"noUnusedLocals": false` and `"noUnusedParameters": false` so unmodified legacy VO code compiles cleanly without modifying existing logic.
3. **`src/app/router.tsx`**:
   - Added routes for `/vendor-onboarding` and `/vendor-onboarding/*` pointing to `VendorOnboardingPage.tsx`.
4. **`src/shared/auth/AppNavigation.tsx`**:
   - Added collapsible sidebar navigation grouping:
     - **Purchase Orders** section (collapsible)
     - **Vendor Onboarding** section (collapsible)
     - **Admin** section
5. **`src/modules/vendor-onboarding/App.tsx`**:
   - Updated Zoho OAuth callback clean-up to preserve pathname (`window.location.pathname || '/vendor-onboarding'`).
   - Added `?tab=` query parameter listener to support direct navigation from sidebar links.
6. **`src/modules/vendor-onboarding/supabase.ts`**:
   - Made client configurable via environment variables (`VITE_VO_SUPABASE_URL` / `VITE_VO_SUPABASE_ANON_KEY`) with graceful fallback to original project credentials.

---

## 3. Database Mapping (Old vs New)

| Original VO Table | Merged Supabase Table | Strategy |
| :--- | :--- | :--- |
| `vendors` | `public.vendors` | Direct 1:1 table |
| `vendor_approval_history` | `public.vendor_approval_history` | Direct 1:1 table |
| `Users` | `public."Users"` | Direct 1:1 table |
| `roles` | `public.roles` | Column `role_name` generated from `name` |
| `permissions` | `public.permissions` | Column `permission_name` generated from `name` |
| `role_permissions` | `public.role_permissions` | Direct 1:1 relationship |
| `user_roles` | `public.vo_user_roles` | Dedicated integer-keyed user role assignment |
| `vendor-documents` (Bucket) | `storage.buckets/vendor-documents` | Coexists alongside `po-attachments` |

---

## 4. Environment Variables Checklist

```env
# Shared Supabase project credentials
VITE_SUPABASE_URL=https://<your-supabase-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Dedicated VO Supabase credentials (fallback or transition)
VITE_VO_SUPABASE_URL=https://<your-supabase-project>.supabase.co
VITE_VO_SUPABASE_ANON_KEY=<your-anon-key>

# Zoho OAuth Credentials (shared across both applications)
VITE_ZOHO_CLIENT_ID=<your-zoho-client-id>
VITE_ZOHO_REDIRECT_URI=https://<your-deployed-domain>
```

---

## 5. Data Migration Execution Steps

1. Run the database migration in the target Supabase SQL Editor:
   ```bash
   supabase db push
   # or execute supabase/migrations/20261018120000_merged_schema.sql directly in Supabase SQL editor
   ```
2. Test data migration in dry-run mode:
   ```bash
   node scripts/migrate-vo-data.js --dry-run
   ```
3. Execute live data migration:
   ```bash
   NEW_SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" node scripts/migrate-vo-data.js
   ```
4. Verify row counts in the verification summary output.

---

## 6. Rollback Plan

- **Frontend:** Revert git branch back to `purchase-orders-manager/main`.
- **Database:** All newly created tables for VO (`vendors`, `vendor_approval_history`, `Users`, `vo_user_roles`) do not touch existing PO Manager tables (`farmers`, `purchase_orders`, `purchase_order_items`, `zoho_cache`). Dropping the VO tables or pointing `VITE_VO_SUPABASE_URL` back to the standalone VO Supabase project completely decouples the data.
