/**
 * VendorOnboardingPage.tsx
 *
 * Glue component that mounts the entire Vendor Onboarding app as a
 * self-contained island inside the unified portal.
 *
 * The VO app:
 *  - Has its own Zoho OAuth login gate (localStorage "loggedInUser")
 *  - Uses its own Supabase project (configurable via VITE_VO_SUPABASE_*)
 *  - Has its own CSS (App.css + index.css, imported by the app itself)
 *  - Has its own full-screen sidebar layout
 *
 * None of the above is changed — we simply route to this wrapper at
 * /vendor-onboarding and /vendor-onboarding/*.
 *
 * CSS note: The VO's App.css has global element selectors (html, body,
 * button, form, h1-h6, p, input, etc.).  Since we render the VO app at
 * /vendor-onboarding only when the user navigates there, and the PO Manager
 * uses MUI's Emotion CSS-in-JS (high specificity), the VO's lower-specificity
 * global rules do not override MUI components. The wrapper div gets
 * id="vo-root" so VO's "#root" CSS references (used for full-height layout)
 * resolve correctly.
 */
import { Layout } from '../shared/components/Layout'
import VendorOnboardingApp from '../modules/vendor-onboarding/App'

export default function VendorOnboardingPage() {
  return (
    <Layout maxWidth={false}>
      <div
        id="vo-root"
        style={{
          width: '100%',
          minHeight: 'calc(100vh - 80px)',
          position: 'relative',
        }}
      >
        <style>{`
          /* Hide VO's redundant inner mini-sidebar so the unified sidebar is used */
          #vo-root .dashboard-shell > .sidebar {
            display: none !important;
          }
          #vo-root .dashboard-shell {
            min-height: auto !important;
            background: transparent !important;
            display: block !important;
          }
          #vo-root .dashboard-main {
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          #vo-root .dashboard-main > .topbar .mobile-menu-btn {
            display: none !important;
          }
          #vo-root .container {
            max-width: 100% !important;
            padding: 0 !important;
          }
        `}</style>
        <VendorOnboardingApp />
      </div>
    </Layout>
  )
}
