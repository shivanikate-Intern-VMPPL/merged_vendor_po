import React from "react";
import { Box, Button, Drawer } from "@mui/material";
import VendorDetails from "./VendorDetails.js";

interface PanelProps {
  selectedFile: string | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<string | null>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;

  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedVendor: any;
  getAttachmentList: (attachments: any) => string[];
  openAttachment: (file: string) => void;
  updateVendorStatus: (
    vendorId: number,
    status: "accepted" | "rejected"
  ) => void;
}

const Panel: React.FC<PanelProps> = ({
  selectedFile,
  setSelectedFile,
  zoom,
  setZoom,
  drawerOpen,
  setDrawerOpen,
  selectedVendor,
  getAttachmentList,
  openAttachment,
  updateVendorStatus,
}) => {
  const approvalLevel = selectedVendor?.approval_level ?? 0;

  const isFirstLevelApproval = approvalLevel === 0;
  const isSecondLevelApproval = approvalLevel === 1;

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => {
        setDrawerOpen(false);
        setSelectedFile(null);
      }}
    >
      <Box
        sx={{
          width: selectedFile
            ? { xs: "100%", md: "85vw", lg: "1200px", xl: "1400px" }
            : { xs: "100%", sm: 450, md: 620 },
          height: "100%",
          display: "flex",
          flexDirection: {
            xs: "column",
            md: selectedFile ? "row" : "column",
          },
          bgcolor: "#F8FAFC",
          color: "#1F2937",
          transition: "width 0.3s ease-in-out",
          overflow: "hidden",
        }}
      >
        {/* DOCUMENT PREVIEW */}
        {selectedFile && (
          <Box
            sx={{
              flex: 1,
              height: { xs: "50vh", md: "100%" },
              display: "flex",
              flexDirection: "column",
              bgcolor: "#ffffff",
              borderRight: "1px solid #E5E7EB",
              p: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                pb: 1.5,
                borderBottom: "1px solid #F1F5F9",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#1E293B",
                }}
              >
                Document Preview
              </h3>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setZoom((z) => z + 0.2)}
                  sx={{
                    minWidth: "36px",
                    px: 1,
                    borderRadius: "6px",
                  }}
                >
                  +
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setZoom((z) => Math.max(0.2, z - 0.2))
                  }
                  sx={{
                    minWidth: "36px",
                    px: 1,
                    borderRadius: "6px",
                  }}
                >
                  -
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setZoom(1)}
                  sx={{
                    textTransform: "none",
                    borderRadius: "6px",
                  }}
                >
                  Reset
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setSelectedFile(null)}
                  sx={{
                    ml: 1,
                    textTransform: "none",
                    borderRadius: "6px",
                    bgcolor: "#F1F5F9",
                    color: "#475569",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#E2E8F0",
                      boxShadow: "none",
                    },
                  }}
                >
                  Close Preview
                </Button>
              </Box>
            </Box>

            {/* PDF PREVIEW */}
            {selectedFile.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={selectedFile}
                title="PDF Preview"
                style={{
                  width: "100%",
                  flex: 1,
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                }}
              />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  p: 2,
                  bgcolor: "#F8FAFC",
                }}
              >
                <img
                  src={selectedFile}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                    transition: "transform 0.2s ease",
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* VENDOR DETAILS */}
        <Box
          sx={{
            width: selectedFile
              ? { xs: "100%", md: "500px", lg: "580px" }
              : "100%",
            height: {
              xs: selectedFile ? "50vh" : "100%",
              md: "100%",
            },
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            bgcolor: "#F8FAFC",
            transition: "width 0.3s ease-in-out",
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              bgcolor: "#1565C0",
              color: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                color: "#FFFFFF",
                fontWeight: 700,
              }}
            >
              Vendor Details
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "13px",
              }}
            >
              Review vendor information before approval
            </p>
          </Box>

          {/* DETAILS */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 3,
              color: "#1F2937",
            }}
          >
            {selectedVendor && (
              <VendorDetails
                vendor={selectedVendor}
                attachments={getAttachmentList(
                  selectedVendor.attachments
                )}
                onAttachmentClick={openAttachment}
              />
            )}
          </Box>

          {/* APPROVAL ACTIONS */}
          {selectedVendor && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                p: 2.5,
                bgcolor: "#fff",
                borderTop: "1px solid #E5E7EB",
                flexShrink: 0,
              }}
            >
              <Button
                variant="contained"
                color="success"
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "14px",
                  boxShadow:
                    "0 4px 10px rgba(22, 163, 74, 0.2)",
                }}
                onClick={() =>
                  updateVendorStatus(
                    selectedVendor.id,
                    "accepted"
                  )
                }
              >
                {isFirstLevelApproval
                  ? "Approve Level 1"
                  : isSecondLevelApproval
                  ? "Final Approve"
                  : "Approved"}
              </Button>

              <Button
                variant="outlined"
                color="error"
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
                onClick={() =>
                  updateVendorStatus(
                    selectedVendor.id,
                    "rejected"
                  )
                }
              >
                Reject Vendor
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Panel;