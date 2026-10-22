import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { hasPermission } from "../utils/permissionGuard";

interface Vendor {
  id: number;
  vendor_name?: string;
  mobile?: string;
  category?: string;
  status?: string | null;
  approval_level?: number;
}

interface ApproveTableProps {
  vendors: Vendor[];
  approvalLoadingId: number | null;
  updateVendorStatus: (
    vendorId: number,
    status: "accepted" | "rejected"
  ) => void;
  selectedVendorId: number | null;
  onViewVendor: (vendor: Vendor) => void;
}

function ApproveTable({
  vendors,
  approvalLoadingId,
  updateVendorStatus,
  onViewVendor,
}: ApproveTableProps) {
  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "{}"
  );

  const permissions = loggedInUser.permissions || [];

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        overflowX: "auto",
        overflowY: "hidden",
        boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        width: "100%",
      }}
    >
      <Table
        sx={{
          minWidth: 750,
          whiteSpace: "nowrap",
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              background: "#1565C0",
              "& th": {
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                borderBottom: "none",
              },
            }}
          >
            <TableCell>ID</TableCell>
            <TableCell>Vendor Name</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Approval Level</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {vendors.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                align="center"
                sx={{
                  py: 4,
                  color: "#6B7280",
                }}
              >
                No vendors found
              </TableCell>
            </TableRow>
          ) : (
            vendors.map((vendor) => {
              const isRejected =
                vendor.status === "rejected";

              const isLevel2Vendor =
                vendor.approval_level === 1 &&
                vendor.status === "accepted";

              const isLoading =
                approvalLoadingId === vendor.id;

              return (
                <TableRow
                  key={vendor.id}
                  hover
                  sx={{
                    backgroundColor: isRejected
                      ? "#FFEBEE"
                      : "inherit",

                    "&:nth-of-type(even)": {
                      backgroundColor: isRejected
                        ? "#FFEBEE"
                        : "#FAFAFA",
                    },

                    "&:hover": {
                      backgroundColor: isRejected
                        ? "#FFCDD2"
                        : "#E3F2FD",
                    },

                    "& td": {
                      py: 1.8,
                      fontSize: "14px",
                      borderBottom:
                        "1px solid #ECECEC",
                    },
                  }}
                >
                  <TableCell>
                    {vendor.id}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {vendor.vendor_name}
                  </TableCell>

                  <TableCell>
                    {vendor.mobile}
                  </TableCell>

                  <TableCell>
                    {vendor.category}
                  </TableCell>

                  <TableCell>
                    <span
                      style={{
                        background:
                          vendor.status === "accepted"
                            ? "#E8F5E9"
                            : isRejected
                            ? "#FDECEA"
                            : "#FFF8E1",

                        color:
                          vendor.status === "accepted"
                            ? "#2E7D32"
                            : isRejected
                            ? "#C62828"
                            : "#F57C00",

                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontWeight: 600,
                        fontSize: "12px",

                        border: isRejected
                          ? "1px solid #EF9A9A"
                          : "none",
                      }}
                    >
                      {(
                        vendor.status || "Pending"
                      ).toUpperCase()}
                    </span>
                  </TableCell>

                  <TableCell>
                    {vendor.approval_level ?? 0}
                  </TableCell>

                  <TableCell align="center">
                    {hasPermission(
                      permissions,
                      "vendor.read"
                    ) && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() =>
                          onViewVendor(vendor)
                        }
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          px: 2,
                          fontWeight: 600,

                          bgcolor: isRejected
                            ? "#D32F2F"
                            : isLevel2Vendor
                            ? "#7B1FA2"
                            : "#1976D2",

                          "&:hover": {
                            bgcolor: isRejected
                              ? "#C62828"
                              : isLevel2Vendor
                              ? "#6A1B9A"
                              : "#1565C0",
                          },
                        }}
                      >
                        View
                      </Button>
                    )}

                    {isLevel2Vendor && (
                      <Button
                        variant="contained"
                        size="small"
                        disabled={isLoading}
                        onClick={() =>
                          updateVendorStatus(
                            vendor.id,
                            "accepted"
                          )
                        }
                        sx={{
                          ml: 1,
                          borderRadius: 2,
                          textTransform: "none",
                          px: 2,
                          fontWeight: 600,
                          bgcolor: "#2E7D32",

                          "&:hover": {
                            bgcolor: "#1B5E20",
                          },
                        }}
                      >
                        {isLoading
                          ? "Approving..."
                          : "Final Approve"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ApproveTable;