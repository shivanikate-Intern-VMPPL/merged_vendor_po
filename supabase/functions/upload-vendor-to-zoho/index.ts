import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Vendor {
  id?: number;
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
  zoho_contact_id?: string | null;
  zoho_upload_status?: string | null;
}

interface ZohoTokenResponse {
  access_token?: string;
  error?: string;
}

interface ZohoUploadResult {
  vendor_id: number | undefined;
  vendor_name: string | undefined;
  success: boolean;
  status?: string;
  zoho_contact_id?: string;
  zoho_data?: unknown;
  error?: unknown;
}

/**
 * Upload one Supabase Storage file to a Zoho Books vendor.
 */
async function uploadFileToZohoVendor(
  accessToken: string,
  organizationId: string,
  vendorId: string,
  fileUrl: string
): Promise<unknown> {
  const fileResponse = await fetch(fileUrl);

  if (!fileResponse.ok) {
    throw new Error(
      `Failed to download file from Supabase: ${fileResponse.statusText}`
    );
  }

  const fileBlob = await fileResponse.blob();

  const fileName = decodeURIComponent(
    fileUrl.split("/").pop() || "attachment"
  );

  const formData = new FormData();

  formData.append(
    "attachment",
    fileBlob,
    fileName
  );

  const zohoAttachmentResponse = await fetch(
    `https://www.zohoapis.in/books/v3/contacts/${vendorId}/attachment?organization_id=${organizationId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
      body: formData,
    }
  );

  const zohoAttachmentData =
    await zohoAttachmentResponse.json();

  if (!zohoAttachmentResponse.ok) {
    throw new Error(
      JSON.stringify(zohoAttachmentData)
    );
  }

  return zohoAttachmentData;
}

Deno.serve(
  async (req: Request): Promise<Response> => {

    // -------------------------------------------------------------
    // CORS PREFLIGHT
    // -------------------------------------------------------------

    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    try {

      // -------------------------------------------------------------
      // READ REQUEST BODY
      // -------------------------------------------------------------

      const body: {
        vendors?: Vendor[];
        uploaded_by?: string;
        uploaded_by_email?: string;
      } = await req.json();

      const vendors = body.vendors;

      const uploadedBy =
        body.uploaded_by ||
        body.uploaded_by_email ||
        "Unknown User";

      const uploadedByEmail =
        body.uploaded_by_email || "";

      console.log(
        "Vendor uploaded by:",
        uploadedBy
      );

      console.log(
        "Uploader email:",
        uploadedByEmail
      );

      // -------------------------------------------------------------
      // VALIDATE VENDORS
      // -------------------------------------------------------------

      if (
        !vendors ||
        !Array.isArray(vendors) ||
        vendors.length === 0
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "No vendors provided",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // -------------------------------------------------------------
      // READ ZOHO SECRETS
      // -------------------------------------------------------------

      const clientId =
        Deno.env.get("ZOHO_CLIENT_ID");

      const clientSecret =
        Deno.env.get("ZOHO_CLIENT_SECRET");

      const refreshToken =
        Deno.env.get("ZOHO_REFRESH_TOKEN");

      const organizationId =
        Deno.env.get("ZOHO_ORGANIZATION_ID");

      if (
        !clientId ||
        !clientSecret ||
        !refreshToken
      ) {
        throw new Error(
          "Zoho OAuth secrets are not configured"
        );
      }

      if (!organizationId) {
        throw new Error(
          "ZOHO_ORGANIZATION_ID is not configured"
        );
      }

      // -------------------------------------------------------------
      // GENERATE ZOHO ACCESS TOKEN
      // -------------------------------------------------------------

      const tokenResponse = await fetch(
        "https://accounts.zoho.in/oauth/v2/token",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: new URLSearchParams({
            refresh_token:
              refreshToken,

            client_id:
              clientId,

            client_secret:
              clientSecret,

            grant_type:
              "refresh_token",
          }),
        }
      );

      const tokenData: ZohoTokenResponse =
        await tokenResponse.json();

      if (
        !tokenResponse.ok ||
        !tokenData.access_token
      ) {
        console.error(
          "Zoho token error:",
          tokenData
        );

        throw new Error(
          tokenData.error ||
          "Failed to generate Zoho access token"
        );
      }

      const accessToken =
        tokenData.access_token;

      const results: ZohoUploadResult[] = [];

      // -------------------------------------------------------------
      // PROCESS EVERY VENDOR
      // -------------------------------------------------------------

      for (const vendor of vendors) {

        try {

          // ---------------------------------------------------------
          // VALIDATE VENDOR NAME
          // ---------------------------------------------------------

          if (!vendor.vendor_name) {

            results.push({
              vendor_id:
                vendor.id,

              vendor_name:
                vendor.vendor_name ??
                undefined,

              success:
                false,

              status:
                "failed",

              error:
                "Vendor name is required",
            });

            continue;
          }

          // ---------------------------------------------------------
          // DUPLICATE PROTECTION
          // ---------------------------------------------------------

          if (
            vendor.zoho_contact_id &&
            vendor.zoho_contact_id.trim() !== ""
          ) {

            console.log(
              "Vendor already uploaded to Zoho:",
              vendor.vendor_name,
              vendor.zoho_contact_id
            );

            results.push({
              vendor_id:
                vendor.id,

              vendor_name:
                vendor.vendor_name,

              success:
                true,

              status:
                "already_uploaded",

              zoho_contact_id:
                vendor.zoho_contact_id,
            });

            continue;
          }

          // ---------------------------------------------------------
          // MARK UPLOAD AS PENDING
          // ---------------------------------------------------------

          if (vendor.id) {

            const {
              error: pendingError,
            } = await supabase
              .from("vendors")
              .update({
                zoho_upload_status:
                  "pending",

                zoho_upload_error:
                  null,
              })
              .eq(
                "id",
                vendor.id
              );

            if (pendingError) {

              console.error(
                "Failed to set pending status:",
                pendingError
              );
            }
          }

          // ---------------------------------------------------------
          // PREPARE ZOHO VENDOR DATA
          // ---------------------------------------------------------

          const zohoVendor = {

            contact_name:
              vendor.vendor_name,

            company_name:
              vendor.trade_name ||
              vendor.vendor_name,

            contact_type:
              "vendor",

            contact_persons:
              vendor.contact_person
                ? [
                    {
                      first_name:
                        vendor.contact_person,
                    },
                  ]
                : [],

            email:
              vendor.email || "",

            phone:
              vendor.mobile || "",

            gst_no:
              vendor.gst_no || "",

            // -------------------------------------------------------
            // PAN
            // -------------------------------------------------------

            ...(vendor.pan_no &&
            /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
              vendor.pan_no
                .trim()
                .toUpperCase()
            )
              ? {
                  pan_no:
                    vendor.pan_no
                      .trim()
                      .toUpperCase(),
                }
              : {}),

            // -------------------------------------------------------
            // BILLING ADDRESS
            // -------------------------------------------------------

            billing_address: {

              address:
                vendor.registered_address ||
                "",

              country:
                "India",
            },

            // -------------------------------------------------------
            // SHIPPING ADDRESS
            // -------------------------------------------------------

            shipping_address: {

              address:
                vendor.communication_address ||
                "",

              country:
                "India",
            },

            // -------------------------------------------------------
            // NOTES
            // -------------------------------------------------------

            notes: [

              `Uploaded By: ${uploadedBy}`,

              `Uploaded By Email: ${uploadedByEmail}`,

              `Vendor Type: ${
                vendor.vendor_type || ""
              }`,

              `Category: ${
                vendor.category || ""
              }`,

              `MSME Status: ${
                vendor.msme_status || ""
              }`,

              `Credit Days: ${
                vendor.credit_days || ""
              }`,

              `TDS Applicable: ${
                vendor.tds_applicable || ""
              }`,

              `Requested By: ${
                vendor.requested_by || ""
              }`,

              `Zone: ${
                vendor.zone || ""
              }`,
            ].join("\n"),
          };

          console.log(
            "Creating Zoho vendor:",
            vendor.vendor_name
          );

          // ---------------------------------------------------------
          // STEP 1: CREATE VENDOR IN ZOHO
          // ---------------------------------------------------------

          const zohoResponse =
            await fetch(
              `https://www.zohoapis.in/books/v3/contacts?organization_id=${organizationId}`,
              {
                method: "POST",

                headers: {

                  Authorization:
                    `Zoho-oauthtoken ${accessToken}`,

                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    zohoVendor
                  ),
              }
            );

          // ---------------------------------------------------------
          // STEP 2: READ ZOHO RESPONSE
          // ---------------------------------------------------------

          const zohoData: unknown =
            await zohoResponse.json();

          // ---------------------------------------------------------
          // STEP 3: CHECK ZOHO RESPONSE
          // ---------------------------------------------------------

          if (!zohoResponse.ok) {

            console.error(
              "Zoho API error:",
              zohoData
            );

            const errorMessage =
              JSON.stringify(
                zohoData
              );

            // Save failure in Supabase
            if (vendor.id) {

              await supabase
                .from("vendors")
                .update({

                  zoho_upload_status:
                    "failed",

                  zoho_upload_error:
                    errorMessage,
                })
                .eq(
                  "id",
                  vendor.id
                );
            }

            results.push({

              vendor_id:
                vendor.id,

              vendor_name:
                vendor.vendor_name,

              success:
                false,

              status:
                "failed",

              error:
                zohoData,
            });

            continue;
          }

          // ---------------------------------------------------------
          // STEP 4: EXTRACT ZOHO CONTACT ID
          // ---------------------------------------------------------

          const zohoContactId =
            typeof zohoData === "object" &&
            zohoData !== null &&
            "contact" in zohoData &&
            typeof (
              zohoData as {
                contact?: unknown;
              }
            ).contact === "object" &&
            (
              zohoData as {
                contact?: unknown;
              }
            ).contact !== null &&
            "contact_id" in
              (
                (
                  zohoData as {
                    contact:
                      Record<
                        string,
                        unknown
                      >;
                  }
                ).contact
              )
              ? String(
                  (
                    zohoData as {
                      contact: {
                        contact_id:
                          string |
                          number;
                      };
                    }
                  ).contact
                    .contact_id
                )
              : null;

          if (!zohoContactId) {

            throw new Error(
              "Zoho vendor ID was not returned"
            );
          }

          console.log(
            "Zoho vendor created:",
            zohoContactId
          );

          // ---------------------------------------------------------
          // STEP 5: SAVE ZOHO CONTACT ID IMMEDIATELY
          // ---------------------------------------------------------

          if (vendor.id) {

            const {
              error: saveZohoIdError,
            } = await supabase
              .from("vendors")
              .update({

                zoho_contact_id:
                  zohoContactId,

                zoho_upload_status:
                  "vendor_created",

                zoho_upload_error:
                  null,

                zoho_uploaded_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                vendor.id
              );

            if (saveZohoIdError) {

              console.error(
                "Failed to save Zoho contact ID:",
                saveZohoIdError
              );
            }
          }

          // ---------------------------------------------------------
          // STEP 6: UPLOAD ATTACHMENTS
          // ---------------------------------------------------------

          if (vendor.attachments) {

            let attachmentUrls: string[] =
              [];

            // -------------------------------------------------------
            // ATTACHMENTS AS ARRAY
            // -------------------------------------------------------

            if (
              Array.isArray(
                vendor.attachments
              )
            ) {

              attachmentUrls =
                vendor.attachments;
            }

            // -------------------------------------------------------
            // ATTACHMENTS AS STRING
            // -------------------------------------------------------

            else if (
              typeof vendor.attachments ===
              "string"
            ) {

              try {

                const parsed =
                  JSON.parse(
                    vendor.attachments
                  );

                if (
                  Array.isArray(
                    parsed
                  )
                ) {

                  attachmentUrls =
                    parsed.filter(
                      (
                        item
                      ): item is string =>
                        typeof item ===
                        "string"
                    );

                } else if (
                  typeof parsed ===
                  "string"
                ) {

                  attachmentUrls = [
                    parsed,
                  ];
                }

              } catch {

                attachmentUrls = [
                  vendor.attachments,
                ];
              }
            }

            // -------------------------------------------------------
            // UPLOAD EACH ATTACHMENT
            // -------------------------------------------------------

            for (
              const fileUrl of
                attachmentUrls
            ) {

              if (
                !fileUrl ||
                !fileUrl.startsWith(
                  "http"
                )
              ) {

                console.error(
                  "Invalid attachment URL:",
                  fileUrl
                );

                continue;
              }

              console.log(
                "Uploading attachment:",
                fileUrl
              );

              await uploadFileToZohoVendor(
                accessToken,
                organizationId,
                zohoContactId,
                fileUrl
              );
            }
          }

          // ---------------------------------------------------------
          // STEP 7: MARK COMPLETE SUCCESS
          // ---------------------------------------------------------

          if (vendor.id) {

            const {
              error: successUpdateError,
            } = await supabase
              .from("vendors")
              .update({

                zoho_contact_id:
                  zohoContactId,

                zoho_upload_status:
                  "success",

                zoho_upload_error:
                  null,

                zoho_uploaded_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                vendor.id
              );

            if (successUpdateError) {

              console.error(
                "Failed to save final Zoho status:",
                successUpdateError
              );
            }
          }

          // ---------------------------------------------------------
          // STEP 8: SUCCESS RESULT
          // ---------------------------------------------------------

          results.push({

            vendor_id:
              vendor.id,

            vendor_name:
              vendor.vendor_name,

            success:
              true,

            status:
              "success",

            zoho_contact_id:
              zohoContactId,

            zoho_data:
              zohoData,
          });

        } catch (
          vendorError: unknown
        ) {

          // ---------------------------------------------------------
          // VENDOR-SPECIFIC ERROR
          // ---------------------------------------------------------

          console.error(
            "Vendor upload failed:",
            vendorError
          );

          const errorMessage =
            vendorError instanceof Error
              ? vendorError.message
              : "Unknown vendor upload error";

          // Save failure
          if (vendor.id) {

            const {
              error: saveError,
            } = await supabase
              .from("vendors")
              .update({

                zoho_upload_status:
                  "failed",

                zoho_upload_error:
                  errorMessage,
              })
              .eq(
                "id",
                vendor.id
              );

            if (saveError) {

              console.error(
                "Failed to save error status:",
                saveError
              );
            }
          }

          results.push({

            vendor_id:
              vendor.id,

            vendor_name:
              vendor.vendor_name,

            success:
              false,

            status:
              "failed",

            error:
              errorMessage,
          });
        }
      }

      // -------------------------------------------------------------
      // COUNT RESULTS
      // -------------------------------------------------------------

      const successfulUploads =
        results.filter(
          (result) =>
            result.success
        );

      const failedUploads =
        results.filter(
          (result) =>
            !result.success
        );

      // -------------------------------------------------------------
      // RETURN RESPONSE
      // -------------------------------------------------------------

      return new Response(

        JSON.stringify({

          success:
            successfulUploads.length >
            0,

          message:
            `${successfulUploads.length} vendor(s) uploaded successfully, ` +
            `${failedUploads.length} vendor(s) failed.`,

          total:
            vendors.length,

          successful:
            successfulUploads.length,

          failed:
            failedUploads.length,

          results,
        }),

        {
          status: 200,

          headers: {

            ...corsHeaders,

            "Content-Type":
              "application/json",
          },
        }
      );

    } catch (
      error: unknown
    ) {

      // -------------------------------------------------------------
      // GENERAL ERROR
      // -------------------------------------------------------------

      console.error(
        "Function error:",
        error
      );

      return new Response(

        JSON.stringify({

          success:
            false,

          error:
            error instanceof Error
              ? error.message
              : "Unknown server error",
        }),

        {
          status: 500,

          headers: {

            ...corsHeaders,

            "Content-Type":
              "application/json",
          },
        }
      );
    }
  }
);