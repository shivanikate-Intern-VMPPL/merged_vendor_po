import {
  Typography,
  Box,
  Chip,
  TextField,
  Paper,
} from "@mui/material";
import { useMemo, useState } from "react";

interface Vendor {
  id: number;
  vendor_name?: string;
  category?: string;
  mobile?: string;
  status?: string | null;
}

interface PendingVendorListProps {
  vendors: Vendor[];
  onVendorClick?: (vendor: Vendor) => void;
}

export default function PendingVendorList({
  vendors,
  onVendorClick,
}: PendingVendorListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return vendors.filter((v) =>
      (v.vendor_name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [vendors, search]);

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
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "18px",
            color: "#ED6C02",
            mb: 2.5,
          }}
        >
          Pending Vendors ({vendors.length})
        </Typography>

        <TextField
          size="small"
          fullWidth
          placeholder="Search vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2.5,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#F9FAFB",
              "& fieldset": {
                borderColor: "#E5E7EB",
              },
              "&:hover fieldset": {
                borderColor: "#D1D5DB",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ED6C02",
              },
            },
          }}
        />

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            maxHeight: "600px",
            pr: 0.5,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#E5E7EB",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#D1D5DB",
            },
          }}
        >
          {filtered.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: "center", fontSize: "14px" }}>
              No pending vendors found
            </Typography>
          ) : (
            filtered.map((vendor) => {
              /* -------------------------------------------------------------
               * STATUS CHECK: Highlights the entire card in red if rejected
               * ------------------------------------------------------------- */
              const isRejected = vendor.status?.toLowerCase() === "rejected";

              return (
                <Box
                  key={vendor.id}
                  onClick={() => onVendorClick?.(vendor)}
                  sx={{
                    // Light red background & border for rejected, white for pending
                    backgroundColor: isRejected ? "#FFEBEE" : "#ffffff",
                    border: isRejected ? "1px solid #EF9A9A" : "1px solid #F3F4F6",
                    borderRadius: "12px",
                    p: 2,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",

                    "&:hover": {
                      // Darker red hover state for rejected items
                      bgcolor: isRejected ? "#FFCDD2" : "#FFFBF5",
                      borderColor: isRejected ? "#E57373" : "#FFE0B2",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: isRejected ? "#991B1B" : "#111827",
                      mb: 0.5,
                    }}
                  >
                    {vendor.vendor_name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ 
                      fontSize: "13px", 
                      color: isRejected ? "#B91C1C" : "#6B7280" 
                    }}
                  >
                    {vendor.category}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ 
                      fontSize: "12px", 
                      color: isRejected ? "#DC2626" : "#9CA3AF", 
                      mt: 0.2 
                    }}
                  >
                    {vendor.mobile}
                  </Typography>

                  <Chip
                    label={isRejected ? "Rejected" : "Pending"}
                    size="small"
                    sx={{
                      mt: 1.5,
                      bgcolor: isRejected ? "#FEE2E2" : "#FFF4E5",
                      color: isRejected ? "#DC2626" : "#ED6C02",
                      fontWeight: 700,
                      fontSize: "11px",
                      height: "22px",
                      border: isRejected ? "1px solid #FCA5A5" : "none",
                    }}
                  />
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    </Paper>
  );
}