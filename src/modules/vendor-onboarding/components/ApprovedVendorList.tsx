import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import { useState, useMemo } from "react";
import Papa from "papaparse";
import { ZOHO_HEADERS } from "../constants/zohoHeaders";
import { uploadVendorsToZoho } from "../rbac/components/services/zohoService";

interface Vendor {
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
  approval_level?: number;

  // Time when the vendor was uploaded to Zoho
  zoho_uploaded_at?: string | null;
  zoho_contact_id?: string | null;
  zoho_upload_status?: string | null;
}

interface ApprovedVendorListProps {
  vendors: Vendor[];
  selectedVendorIds: number[];
  setSelectedVendorIds: React.Dispatch<
    React.SetStateAction<number[]>
  >;
  onRefresh?: () => Promise<void> | void;
}

function ApprovedVendorList({
  vendors,
  selectedVendorIds,
  setSelectedVendorIds,
  onRefresh,
}: ApprovedVendorListProps) {
  const [search, setSearch] = useState("");

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [uploadError, setUploadError] =
    useState("");

  // -------------------------------------------------------------
  // FORMAT ZOHO UPLOAD TIMING
  // -------------------------------------------------------------
  const formatTiming = (
    zohoUploadedAt?: string | null
  ) => {
    if (!zohoUploadedAt) {
      return "-";
    }

    const date = new Date(zohoUploadedAt);

    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // -------------------------------------------------------------
  // FILTER VENDORS
  // -------------------------------------------------------------
  const filteredVendors = useMemo(() => {
    return vendors
      .filter(
        (v) =>
          v.status === "accepted" &&
          v.approval_level === 2
      )
      .filter((v) => {
        const term = search.toLowerCase();

        const name =
          (v.vendor_name || "").toLowerCase();

        const trade =
          (v.trade_name || "").toLowerCase();

        const cat =
          (v.category || "").toLowerCase();

        return (
          name.includes(term) ||
          trade.includes(term) ||
          cat.includes(term)
        );
      });
  }, [vendors, search]);

  // -------------------------------------------------------------
  // VENDORS ELIGIBLE FOR UPLOAD (NOT ALREADY UPLOADED TO ZOHO)
  // -------------------------------------------------------------
  const uploadableVendors = useMemo(
    () =>
      filteredVendors.filter(
        (v) =>
          !v.zoho_uploaded_at &&
          v.zoho_upload_status !== "uploaded" &&
          !v.zoho_contact_id
      ),
    [filteredVendors]
  );

  // -------------------------------------------------------------
  // CHECKBOX CHANGE
  // -------------------------------------------------------------
  const handleCheckboxChange = (
    vendorId: number
  ) => {
    if (selectedVendorIds.includes(vendorId)) {
      setSelectedVendorIds(
        selectedVendorIds.filter(
          (id) => id !== vendorId
        )
      );
    } else {
      setSelectedVendorIds([
        ...selectedVendorIds,
        vendorId,
      ]);
    }
  };

  // -------------------------------------------------------------
  // SELECT ALL (ONLY VENDORS NOT ALREADY UPLOADED)
  // -------------------------------------------------------------
  const handleSelectAll = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setSelectedVendorIds(
        uploadableVendors.map(
          (vendor) => vendor.id
        )
      );
    } else {
      setSelectedVendorIds([]);
    }
  };

  // -------------------------------------------------------------
  // UPLOAD TO ZOHO
  // -------------------------------------------------------------
  const handleZohoUpload = async () => {
    console.log(
      "UPLOAD BUTTON CLICKED"
    );

    setUploadMessage("");
    setUploadError("");

    if (
      selectedVendorIds.length === 0
    ) {
      setUploadError(
        "Please select at least one vendor to upload to Zoho."
      );

      return;
    }

    const vendorsToUpload =
      vendors.filter((vendor) =>
        selectedVendorIds.includes(
          vendor.id
        )
      );

    console.log(
      "VENDORS TO UPLOAD:",
      vendorsToUpload
    );

    if (
      vendorsToUpload.length === 0
    ) {
      setUploadError(
        "No valid vendors found for upload."
      );

      return;
    }

    try {
      setIsUploading(true);

      console.log(
        "Calling Supabase Edge Function..."
      );

      const result =
        await uploadVendorsToZoho(
          vendorsToUpload
        );

      console.log(
        "ZOHO UPLOAD SUCCESS:",
        JSON.stringify(
          result,
          null,
          2
        )
      );

      setUploadMessage(
        "✓ Vendor successfully uploaded to Zoho!"
      );

      setSelectedVendorIds([]);

      if (onRefresh) {
        await onRefresh();
      }

    } catch (error) {
      console.error(
        "ZOHO UPLOAD FAILED:",
        error
      );

      setUploadError(
        error instanceof Error
          ? error.message
          : "Zoho upload failed."
      );

    } finally {
      setIsUploading(false);
    }
  };

  // -------------------------------------------------------------
  // DOWNLOAD CSV
  // -------------------------------------------------------------
  const downloadSelectedVendors =
    () => {
      const selectedVendors =
        vendors.filter((vendor) =>
          selectedVendorIds.includes(
            vendor.id
          )
        );

      if (
        selectedVendors.length === 0
      ) {
        alert(
          "Please select at least one vendor."
        );

        return;
      }

      const csvData =
        selectedVendors.map(
          (vendor) => {
            const row: Record<
              string,
              string
            > = {};

            ZOHO_HEADERS.forEach(
              (header) => {
                row[header] = "";
              }
            );

            row["Display Name"] =
              vendor.vendor_name ??
              "";

            row["Company Name"] =
              vendor.trade_name ??
              "";

            row["First Name"] =
              vendor.contact_person ??
              "";

            row["EmailID"] =
              vendor.email ?? "";

            row["Phone"] =
              vendor.mobile ?? "";

            row["MobilePhone"] =
              vendor.mobile ?? "";

            row[
              "GST Identification Number (GSTIN)"
            ] =
              vendor.gst_no ?? "";

            row["PAN Number"] =
              vendor.pan_no ?? "";

            row["Billing Address"] =
              vendor.registered_address ??
              "";

            row["Shipping Address"] =
              vendor.communication_address ??
              "";

            row["Bank Name"] =
              vendor.bank_name ?? "";

            row[
              "Bank Account Number"
            ] =
              vendor.account_number ??
              "";

            row["Beneficiary"] =
              vendor.account_name ??
              "";

            row["Routing Number"] =
              vendor.ifsc_code ?? "";

            row["Owner Name"] =
              vendor.requested_by ??
              "";

            row["Status"] =
              vendor.status ?? "";

            row["Currency Code"] =
              "INR";

            row["Billing Country"] =
              "India";

            row["Shipping Country"] =
              "India";

            row[
              "CustomField Value1"
            ] =
              vendor.vendor_type ??
              "";

            row[
              "CustomField Value2"
            ] =
              vendor.category ?? "";

            row[
              "CustomField Value3"
            ] =
              vendor.msme_status ??
              "";

            row[
              "CustomField Value4"
            ] =
              vendor.credit_days ??
              "";

            row[
              "CustomField Value5"
            ] =
              vendor.tds_applicable ??
              "";

            row[
              "CustomField Value6"
            ] =
              vendor.zone ?? "";

            row[
              "CustomField Value7"
            ] =
              vendor.date ?? "";

            row[
              "CustomField Value8"
            ] = Array.isArray(
              vendor.attachments
            )
              ? vendor.attachments.join(
                  ", "
                )
              : vendor.attachments ??
                "";

            return row;
          }
        );

      const csv =
        Papa.unparse(csvData);

      const blob =
        new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        });

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "Approved_Vendors.csv";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(url);
    };

  // -------------------------------------------------------------
  // UI
  // -------------------------------------------------------------
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        minWidth: 0,
        background: "#ffffff",
        borderRadius: "16px",
        p: 3,
        border: "1px solid #E5E7EB",
        boxShadow:
          "0 4px 12px rgba(0, 0, 0, 0.03)",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "16px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            color: "#1F2937",
          }}
        >
          Approved Vendors (
          {vendors.length})
        </h3>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {/* UPLOAD BUTTON */}
          <Button
            variant="contained"
            onClick={
              handleZohoUpload
            }
            disabled={
              selectedVendorIds.length ===
                0 ||
              isUploading
            }
            sx={{
              borderRadius: "8px",
              px: 2.5,
              py: 0.85,
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "none",
              bgcolor: "#0284C7",
              color: "#ffffff",
              boxShadow:
                "0 4px 10px rgba(2, 132, 199, 0.25)",
              "&:hover": {
                bgcolor: "#0369A1",
              },
            }}
          >
            {isUploading
              ? "Uploading..."
              : `Upload to Zoho${
                  selectedVendorIds.length >
                  0
                    ? ` (${selectedVendorIds.length})`
                    : ""
                }`}
          </Button>

          {/* DOWNLOAD BUTTON */}
          <Button
            variant="contained"
            onClick={
              downloadSelectedVendors
            }
            disabled={
              selectedVendorIds.length ===
              0
            }
            sx={{
              borderRadius: "8px",
              px: 2.5,
              py: 0.85,
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "none",
              bgcolor: "#16A34A",
              color: "#ffffff",
              boxShadow:
                "0 4px 10px rgba(22, 163, 74, 0.25)",
              "&:hover": {
                bgcolor: "#15803D",
              },
            }}
          >
            Download CSV
            {selectedVendorIds.length >
            0
              ? ` (${selectedVendorIds.length})`
              : ""}
          </Button>
        </Box>
      </div>

      {/* SUCCESS MESSAGE */}
      {uploadMessage && (
        <Typography
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: "8px",
            backgroundColor:
              "#DCFCE7",
            color: "#166534",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {uploadMessage}
        </Typography>
      )}

      {/* ERROR MESSAGE */}
      {uploadError && (
        <Typography
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: "8px",
            backgroundColor:
              "#FEE2E2",
            color: "#991B1B",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {uploadError}
        </Typography>
      )}

      {/* SEARCH */}
      <TextField
        size="small"
        fullWidth
        placeholder="Search approved vendor by name, trade name, or category..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        sx={{
          mb: 2.5,
          "& .MuiOutlinedInput-root":
            {
              borderRadius: 2,
              backgroundColor:
                "#F9FAFB",
              "& fieldset": {
                borderColor:
                  "#E5E7EB",
              },
              "&:hover fieldset":
                {
                  borderColor:
                    "#D1D5DB",
                },
              "&.Mui-focused fieldset":
                {
                  borderColor:
                    "#1565C0",
                },
            },
        }}
      />

      {/* TABLE */}
      <TableContainer
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: "600px",
          pr: 0.5,

          "&::-webkit-scrollbar":
            {
              width: "6px",
              height: "6px",
            },

          "&::-webkit-scrollbar-track":
            {
              background:
                "transparent",
            },

          "&::-webkit-scrollbar-thumb":
            {
              background:
                "#E5E7EB",
              borderRadius:
                "10px",
            },

          "&::-webkit-scrollbar-thumb:hover":
            {
              background:
                "#D1D5DB",
            },
        }}
      >
        <Table
          stickyHeader
          sx={{
            minWidth: 600,
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  borderBottom:
                    "2px solid #F3F4F6",
                  py: 1.5,
                  px: 1.5,
                  bgcolor:
                    "#ffffff",
                },
              }}
            >
              {/* CHECKBOX */}
              <TableCell
                width={40}
                sx={{
                  pl: 1,
                  bgcolor:
                    "#ffffff",
                }}
              >
                <Checkbox
                  checked={
                    uploadableVendors.length >
                      0 &&
                    selectedVendorIds.length ===
                      uploadableVendors.length
                  }
                  indeterminate={
                    selectedVendorIds.length >
                      0 &&
                    selectedVendorIds.length <
                      uploadableVendors.length
                  }
                  onChange={
                    handleSelectAll
                  }
                  disabled={
                    uploadableVendors.length ===
                    0
                  }
                  size="small"
                />
              </TableCell>

              {/* VENDOR NAME */}
              <TableCell>
                <b>Vendor Name</b>
              </TableCell>

              {/* TRADE NAME */}
              <TableCell>
                <b>Trade Name</b>
              </TableCell>

              {/* VENDOR TYPE */}
              <TableCell>
                <b>Vendor Type</b>
              </TableCell>

              {/* CATEGORY */}
              <TableCell>
                <b>Category</b>
              </TableCell>

              {/* MOBILE */}
              <TableCell>
                <b>Mobile</b>
              </TableCell>

              {/* STATUS */}
              <TableCell>
                <b>Status</b>
              </TableCell>

              {/* ZOHO UPLOAD TIMING */}
              <TableCell>
                <b>Timing</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredVendors.length ===
            0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{
                    py: 4,
                  }}
                >
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize:
                        "14px",
                    }}
                  >
                    No matching approved
                    vendors found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map(
                (vendor) => {
                  const alreadyUploaded =
                    !!vendor.zoho_uploaded_at ||
                    vendor.zoho_upload_status === "uploaded" ||
                    !!vendor.zoho_contact_id;

                  const checkbox = (
                    <Checkbox
                      checked={
                        alreadyUploaded ||
                        selectedVendorIds.includes(
                          vendor.id
                        )
                      }
                      onChange={() =>
                        handleCheckboxChange(
                          vendor.id
                        )
                      }
                      disabled={
                        alreadyUploaded
                      }
                      size="small"
                      sx={{
                        ...(alreadyUploaded && {
                          color: "#16A34A !important",
                          "&.Mui-disabled": {
                            color: "#16A34A !important",
                          },
                        }),
                      }}
                    />
                  );

                  return (
                    <TableRow
                      key={
                        vendor.id
                      }
                      hover
                      sx={{
                        "& td": {
                          borderBottom:
                            "1px solid #F3F4F6",
                          py: 1.5,
                          px: 1.5,
                          fontSize:
                            "14px",
                          color:
                            "#374151",
                        },
                      }}
                    >
                      {/* CHECKBOX */}
                      <TableCell
                        sx={{
                          pl: 1,
                        }}
                      >
                        {alreadyUploaded ? (
                          <Tooltip title="Already uploaded to Zoho">
                            <span>
                              {checkbox}
                            </span>
                          </Tooltip>
                        ) : (
                          checkbox
                        )}
                      </TableCell>

                      {/* VENDOR NAME */}
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color:
                            "#111827",
                        }}
                      >
                        {
                          vendor.vendor_name
                        }
                      </TableCell>

                      {/* TRADE NAME */}
                      <TableCell>
                        {
                          vendor.trade_name
                        }
                      </TableCell>

                      {/* VENDOR TYPE */}
                      <TableCell>
                        {
                          vendor.vendor_type
                        }
                      </TableCell>

                      {/* CATEGORY */}
                      <TableCell>
                        {
                          vendor.category
                        }
                      </TableCell>

                      {/* MOBILE */}
                      <TableCell>
                        {vendor.mobile}
                      </TableCell>

                      {/* STATUS */}
                      <TableCell>
                        {vendor.status && (
                          <Box
                            component="span"
                            sx={{
                              backgroundColor:
                                "#E8F5E9",
                              color:
                                "#2E7D32",
                              px: 1.5,
                              py: 0.5,
                              borderRadius:
                                "12px",
                              fontSize:
                                "12px",
                              fontWeight:
                                600,
                              display:
                                "inline-block",
                              textTransform:
                                "capitalize",
                            }}
                          >
                            {
                              vendor.status
                            }
                          </Box>
                        )}
                      </TableCell>

                      {/* ZOHO UPLOAD TIMING */}
                      <TableCell>
                        {formatTiming(
                          vendor.zoho_uploaded_at
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ApprovedVendorList;