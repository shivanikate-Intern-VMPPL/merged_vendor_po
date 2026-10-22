
import { Routes, Route } from 'react-router-dom'
import { LoginForm } from '../features/auth/components/LoginForm'
import { ProtectedRoute } from '../shared/components/ProtectedRoute'
import { Dashboard } from '../features/dashboard/components/Dashboard'
import { NewPurchaseForm } from '../features/purchase-orders/components/NewPurchaseForm'
import { SuccessScreen } from '../features/purchase-orders/components/SuccessScreen'
import SinglePOSyncedPage from '../features/purchase-orders/components/SinglePOSyncedPage'
import { ExportScreen } from '../features/export/components/ExportScreen'
import { SettingsPage } from '../features/settings/components/SettingsPage'
import { RbacManagement } from '../rbac/components/RbacManagement'
import { ROUTES } from './config/constants'
import { ZohoLogoutRedirect } from '../features/auth/components/ZohoLogoutRedirect'

// Loaded together with the app (not lazy), so opening Bulk Purchase Order
// never shows a full-screen loading spinner on the first click.
import PurchasePlanningPage from '../features/purchase-planning'
import PurchaseOrdersReviewPage from '../features/purchase-planning/PurchaseOrdersReviewPage'
import PurchaseOrdersDraftsPage from '../features/purchase-planning/PurchaseOrdersDraftsPage'
import PurchaseOrdersSyncedPage from '../features/purchase-planning/PurchaseOrdersSyncedPage'

// ── Vendor Onboarding (merged module) ──────────────────────────────────────
// The entire Vendor Onboarding app is mounted at /vendor-onboarding/*.
// It has its own auth, sidebar, and CSS — none of that is changed.
// No ProtectedRoute wrapper: VO manages its own Zoho-OAuth login gate.
import VendorOnboardingPage from '../pages/VendorOnboardingPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route
        path="/purchase-orders/new"
        element={<ProtectedRoute permission="purchase_orders:create"><NewPurchaseForm /></ProtectedRoute>}
      />
      <Route
        path="/purchase-orders/synced"
        element={<ProtectedRoute permission="purchase_orders:create"><SinglePOSyncedPage /></ProtectedRoute>}
      />
      <Route
        path="/purchase-orders/success/:poNumber"
        element={<ProtectedRoute permission="purchase_orders:create"><SuccessScreen /></ProtectedRoute>}
      />

      {/* ── Bulk Purchase Order (Purchase Planning) ── */}
      <Route
        path={ROUTES.PURCHASE_PLANNING}
        element={
          <ProtectedRoute permission="purchase_orders:create">
            <PurchasePlanningPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PURCHASE_ORDERS_REVIEW}
        element={
          <ProtectedRoute permission="purchase_orders:create">
            <PurchaseOrdersReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PURCHASE_ORDERS_DRAFTS}
        element={
          <ProtectedRoute permission="purchase_orders:create">
            <PurchaseOrdersDraftsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PURCHASE_ORDERS_SYNCED}
        element={
          <ProtectedRoute permission="purchase_orders:create">
            <PurchaseOrdersSyncedPage />
          </ProtectedRoute>
        }
      />
      <Route path="/auth/zoho-logout" element={<ZohoLogoutRedirect />} />

      <Route
        path="/export"
        element={<ProtectedRoute permission="export:csv" allowedRoles={['office', 'admin']}><ExportScreen /></ProtectedRoute>}
      />
      <Route
        path="/admin/users"
        element={<ProtectedRoute permission="admin:panel" allowedRoles={['admin']}><RbacManagement /></ProtectedRoute>}
      />

      {/* ── Vendor Onboarding module ── */}
      {/* Catches /vendor-onboarding and any path below it. The VO app         */}
      {/* manages its own internal navigation via React state (no sub-routes). */}
      <Route path="/vendor-onboarding" element={<VendorOnboardingPage />} />
      <Route path="/vendor-onboarding/*" element={<VendorOnboardingPage />} />
    </Routes>
  )
}