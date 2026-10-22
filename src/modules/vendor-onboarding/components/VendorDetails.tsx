import { Divider, Typography } from "@mui/material";

function VendorDetails({
  vendor,
  attachments,
  onAttachmentClick,
}: {
  vendor: any;
  attachments: string[];
  onAttachmentClick: (file: string) => void;
}) {
  return (
    <>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#1565C0",
          mb: 2,
        }}
      >
        Vendor Details
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <div className="vendor-details-grid">

        <div className="details-card">
          <h3 className="section-title">Basic Information</h3>

          <p><strong>Vendor Name:</strong> {vendor.vendor_name}</p>
          <p><strong>Trade Name:</strong> {vendor.trade_name}</p>
          <p><strong>Vendor Type:</strong> {vendor.vendor_type}</p>
          <p><strong>Category:</strong> {vendor.category}</p>
        </div>

        <div className="details-card">
          <h3 className="section-title">Contact Information</h3>

          <p><strong>Contact Person:</strong> {vendor.contact_person}</p>
          <p><strong>Mobile:</strong> {vendor.mobile}</p>
          <p><strong>Email:</strong> {vendor.email}</p>
        </div>

      </div>

      <div className="vendor-details-grid">

        <div className="details-card">
          <h3 className="section-title">Registered Address</h3>

          <p><strong>Attention:</strong> {vendor.registered_attention}</p>
          <p><strong>Country:</strong> {vendor.registered_country}</p>
          <p><strong>Address Line 1:</strong> {vendor.registered_address_line1}</p>
          <p><strong>Address Line 2:</strong> {vendor.registered_address_line2}</p>
          <p><strong>City:</strong> {vendor.registered_city}</p>
          <p><strong>State:</strong> {vendor.registered_state}</p>
          <p><strong>PIN Code:</strong> {vendor.registered_pin_code}</p>
        </div>

        <div className="details-card">
          <h3 className="section-title">Communication Address</h3>

          <p><strong>Attention:</strong> {vendor.communication_attention}</p>
          <p><strong>Country:</strong> {vendor.communication_country}</p>
          <p><strong>Address Line 1:</strong> {vendor.communication_address_line1}</p>
          <p><strong>Address Line 2:</strong> {vendor.communication_address_line2}</p>
          <p><strong>City:</strong> {vendor.communication_city}</p>
          <p><strong>State:</strong> {vendor.communication_state}</p>
          <p><strong>PIN Code:</strong> {vendor.communication_pin_code}</p>
        </div>

      </div>

      <div className="vendor-details-grid">

        <div className="details-card">
          <h3 className="section-title">Tax Information</h3>

          <p><strong>GST Number:</strong> {vendor.gst_no}</p>
          <p><strong>PAN Number:</strong> {vendor.pan_no}</p>
          <p><strong>MSME Status:</strong> {vendor.msme_status}</p>
        </div>

        <div className="details-card">
          <h3 className="section-title">Bank Information</h3>

          <p><strong>Bank Name:</strong> {vendor.bank_name}</p>
          <p><strong>Account Name:</strong> {vendor.account_name}</p>
          <p><strong>Account Number:</strong> {vendor.account_number}</p>
          <p><strong>IFSC Code:</strong> {vendor.ifsc_code}</p>
        </div>

      </div>

      <div className="vendor-details-grid">

        <div className="details-card">
          <h3 className="section-title">Other Information</h3>

          <p><strong>Credit Days:</strong> {vendor.credit_days}</p>
          <p><strong>TDS Applicable:</strong> {vendor.tds_applicable}</p>
          <p><strong>Status:</strong> {vendor.status || "Pending"}</p>
        </div>

        <div className="details-card">
          <h3 className="section-title">Request Details</h3>

          <p>
            <strong>Requested By:</strong>{" "}
            {vendor.created_by_name ||
             vendor.operator_name ||
             vendor.user_name ||
             vendor.requested_by ||
             "N/A"}
          </p>
          <p><strong>Zone:</strong> {vendor.zone}</p>
          <p><strong>Date:</strong> {vendor.date}</p>
        </div>

      </div>

      <div className="details-card">

        <h3 className="section-title">Attachments</h3>

        {attachments.length === 0 ? (
          <p>No attachments uploaded.</p>
        ) : (
          <div className="attachment-grid">
            {attachments.map((file, index) => (
              <button
                key={`${file}-${index}`}
                type="button"
                title={file.split("/").pop()}
                onClick={() => onAttachmentClick(file)}
                className="attachment-tile"
              >
                {file.toLowerCase().endsWith(".pdf") ? (
                  <span className="pdf-tile">PDF</span>
                ) : (
                  <img src={file} alt="attachment" />
                )}

                <span>{file.split("/").pop()}</span>
              </button>
            ))}
          </div>
        )}

      </div>
    </>
  );
}

export default VendorDetails;