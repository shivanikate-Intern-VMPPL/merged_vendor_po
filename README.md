# Mulyam Agronomics - Unified Vendor & Purchase Orders Portal

This repository merges **`vendor-onboarding`** and **`purchase-orders-manager`** into a single cohesive enterprise web application.

---

## 🌟 Merged Features

### 1. Vendor Onboarding & KYC Module (`/vendors`, `/vendors/onboard`)
- **Multi-section KYC Form**: Farmer / entity details, contact information, state/city, GSTIN, PAN, and bank account verification.
- **Bulk CSV Import (PapaParse)**: Upload vendor lists in bulk with auto-validation and template download.
- **Verification & Approval Directory**: View pending vs. approved vendors with one-click verification and direct transition to issuing purchase orders.

### 2. Purchase Orders Module (`/purchase-orders`, `/purchase-orders/new`, `/purchase-orders/:id`)
- **Direct Vendor Binding**: PO creation directly pulls from verified/approved vendors in the unified database.
- **Dynamic Line Items**: Add multiple crop items (Soybean, Wheat, Maize, etc.), units (Kg, Quintal, MT), unit prices, GST rates with automatic calculation.
- **Printable PO Invoice**: Formatted purchase order view ready for print or PDF download.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
cd C:\Users\USER\.gemini\antigravity\scratch\mulyam-unified-portal
npm install
```

### 2. Configure Unified Supabase (Optional for Local Preview)
The application works immediately out-of-the-box with built-in mock/local storage.

To connect your live Supabase database:
1. Open your Supabase SQL editor and run:
   ```sql
   -- Run the script in:
   supabase/migrations/20261015_unified_schema.sql
   ```
2. Update `.env` with your project keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.
