/*import { supabase } from "../../../supabase.js";

export interface ZohoVendor {
  id: number;
  vendor_name?: string;
  trade_name?: string;
  vendor_type?: string;
  category?: string;
  contact_person?: string;
  mobile?: string;
  email?: string;
  registered_address?: string;
  communication_address?: string;
  gst_no?: string;
  pan_no?: string;
  msme_status?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  ifsc_code?: string;
  credit_days?: string;
  tds_applicable?: string;
  requested_by?: string;
  zone?: string;
  date?: string;
  attachments?: string[] | string | null;
  status?: string | null;
}

export async function uploadVendorsToZoho(vendors: ZohoVendor[]) {
  if (!vendors || vendors.length === 0) {
    throw new Error("No vendors selected.");
  }

  const { data, error } = await supabase.functions.invoke(
    "upload-vendor-to-zoho",
    {
      body: {
        vendors,
      },
    }
  );

  if (error) {
    console.error("Zoho upload error:", error);
    throw error;
  }

  return data;
}
  */

import { supabase } from "../../../supabase.js";
import { createClient } from "@supabase/supabase-js";

export interface ZohoVendor {
  id: number;

  vendor_name?: string;
  trade_name?: string;
  vendor_type?: string;
  category?: string;
  contact_person?: string;
  mobile?: string;
  email?: string;
  registered_address?: string;
  communication_address?: string;
  gst_no?: string;
  pan_no?: string;
  msme_status?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  ifsc_code?: string;
  credit_days?: string;
  tds_applicable?: string;
  requested_by?: string;
  zone?: string;
  date?: string;
  attachments?: string[] | string | null;
  status?: string | null;
}

export async function uploadVendorsToZoho(
  vendors: ZohoVendor[]
) {
  if (!vendors || vendors.length === 0) {
    throw new Error("No vendors selected.");
  }

  // -------------------------------------------------------------
  // GET CURRENTLY LOGGED-IN USER (from app's own Zoho-based session)
  // -------------------------------------------------------------
  const stored = localStorage.getItem("loggedInUser");

  let userName = "Admin";
  let userEmail = "admin@mulyam.in";

  if (stored) {
    try {
      const loggedInUser = JSON.parse(stored);
      userName = loggedInUser.name || loggedInUser.email || userName;
      userEmail = loggedInUser.email || userEmail;
    } catch {}
  }

  console.log("Vendor uploaded by:", userName);

  // -------------------------------------------------------------
  // CALL SUPABASE EDGE FUNCTION
  // -------------------------------------------------------------
  let responseData: any = null;
  let lastError: any = null;

  try {
    const {
      data,
      error,
    } = await supabase.functions.invoke(
      "upload-vendor-to-zoho",
      {
        body: {
          vendors,
          uploaded_by: userName,
          uploaded_by_email: userEmail,
        },
      }
    );
    if (!error && data) {
      responseData = data;
    } else if (error) {
      lastError = error;
    }
  } catch (err) {
    lastError = err;
  }

  // If local/current project edge function fails (e.g. 404 or CORS unconfigured),
  // fallback to the verified deployed Zoho Books Edge Function
  if (!responseData) {
    try {
      console.log("Using primary verified Zoho Books edge function...");
      const zohoClient = createClient(
        "https://owlzfkqptquibqtvztqp.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bHpma3FwdHF1aWJxdHZ6dHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTQxMDYsImV4cCI6MjA5NjAzMDEwNn0.vhVZKWcc4HQC0BeNxxq6YkL7blSfwytVaCc_G4KKTTw"
      );

      const { data, error } = await zohoClient.functions.invoke(
        "upload-vendor-to-zoho",
        {
          body: {
            vendors,
            uploaded_by: userName,
            uploaded_by_email: userEmail,
          },
        }
      );

      if (error) throw error;
      responseData = data;
    } catch (fallbackErr) {
      console.error("Zoho upload fallback error:", fallbackErr);
      throw lastError || fallbackErr;
    }
  }

  // Update zoho upload status in database
  if (responseData && Array.isArray(responseData.results)) {
    for (const res of responseData.results) {
      if (res.success && res.vendor_id && res.zoho_contact_id) {
        try {
          await supabase
            .from("vendors")
            .update({
              zoho_contact_id: res.zoho_contact_id,
              zoho_upload_status: "uploaded",
            })
            .eq("id", res.vendor_id);
        } catch (dbErr) {
          console.warn("Could not update local vendor zoho status:", dbErr);
        }
      }
    }
  }

  return responseData;
}