import React, { useRef } from "react";
import type { FormData } from "../constants/formData";

/**
 * File: BankDetails.tsx
 * Description:
 * This component captures vendor banking and additional information
 * required for registration and payment processing. It includes
 * bank account details, credit terms, TDS applicability, document
 * uploads, and other administrative information.
 */

interface BankDetailsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors?: Partial<Record<keyof FormData, string>>;
}

function BankDetails({
  formData,
  setFormData,
  errors,
}: BankDetailsProps) {

  // Refs to clear native file inputs when files are removed
  const chequeRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);
  const aadhaarRef = useRef<HTMLInputElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  const fileInputRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    chequePhoto: chequeRef,
    panCard: panRef,
    aadhaarCard: aadhaarRef,
    otherDocuments: otherRef,
  };

  /**
   * Updates form state when a field value changes.
   */
  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Helper to handle specific document uploads (Cheque Photo, PAN, Aadhaar, Other).
   */
  const handleFileChange = (fieldName: keyof FormData, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: [...(Array.isArray(prev[fieldName]) ? (prev[fieldName] as File[]) : []), ...files],
    }));
  };

  const removeFile = (fieldName: keyof FormData, index: number) => {
    setFormData((prev) => {
      const currentList = Array.isArray(prev[fieldName]) ? (prev[fieldName] as File[]) : [];
      const updatedList = currentList.filter((_, i) => i !== index);
      
      // If all files are removed, clear the native file input element safely
      const refObj = fileInputRefs[fieldName as string];
      if (updatedList.length === 0 && refObj && refObj.current) {
        refObj.current.value = "";
      }

      return {
        ...prev,
        [fieldName]: updatedList,
      };
    });
  };

  return (
    <div className="section">
      <h2>Bank & Other Details</h2>

      {/* BANK NAME */}
      <div className="field-row">
        <label className="required">
          Bank Name *
        </label>

        <div>
          <input
            name="bankName"
            value={formData.bankName}
            onChange={handle}
            className={
              errors?.bankName ? "error-input" : ""
            }
          />

          {errors?.bankName && (
            <div className="error-text">
              {errors.bankName}
            </div>
          )}
        </div>
      </div>

      {/* ACCOUNT NAME */}
      <div className="field-row">
        <label className="required">
          Account Name *
        </label>

        <input
          name="accountName"
          value={formData.accountName}
          onChange={handle}
        />
      </div>

      {/* ACCOUNT NUMBER */}
      <div className="field-row">
        <label className="required">
          Account Number *
        </label>

        <input
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handle}
        />
      </div>

      {/* IFSC CODE */}
      <div className="field-row">
        <label className="required">
          IFSC Code *
        </label>

        <input
          name="ifscCode"
          value={formData.ifscCode}
          placeholder="ICIC0004937"
          maxLength={11}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement>
          ) => {
            setFormData({
              ...formData,
              ifscCode: e.target.value.toUpperCase(),
            });
          }}
        />
      </div>

      {/* CREDIT DAYS */}
      <div className="field-row">
        <label className="required">
          Credit Days *
        </label>

        <div>
          <select
            name="creditDays"
            value={formData.creditDays}
            onChange={handle}
            className={
              errors?.creditDays
                ? "error-input"
                : ""
            }
          >
            <option value="">
              Select
            </option>

            <option value="7">
              7 Days
            </option>

            <option value="15">
              15 Days
            </option>

            <option value="30">
              30 Days
            </option>

            <option value="On Received">
              On Received
            </option>
          </select>

          {errors?.creditDays && (
            <div className="error-text">
              {errors.creditDays}
            </div>
          )}
        </div>
      </div>

      {/* TDS APPLICABLE */}
      <div className="field-row">
        <label>
          TDS Applicable
        </label>

        <select
          name="tdsApplicable"
          value={formData.tdsApplicable}
          onChange={handle}
        >
          <option value="">
            Select TDS Applicable
          </option>

          <option value="Yes">
            Yes
          </option>

          <option value="No">
            No
          </option>
        </select>
      </div>

      {/* CHEQUE PHOTO */}
      <div className="field-row">
        <label>Cheque Photo</label>
        <div>
          <input
            ref={chequeRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('chequePhoto' as keyof FormData, e)}
          />
          {Array.isArray(formData.chequePhoto) && formData.chequePhoto.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              {formData.chequePhoto.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('chequePhoto' as keyof FormData, index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PAN CARD */}
      <div className="field-row">
        <label>PAN Card</label>
        <div>
          <input
            ref={panRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('panCard' as keyof FormData, e)}
          />
          {Array.isArray(formData.panCard) && formData.panCard.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              {formData.panCard.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('panCard' as keyof FormData, index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AADHAAR CARD */}
      <div className="field-row">
        <label>Aadhaar Card</label>
        <div>
          <input
            ref={aadhaarRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('aadhaarCard' as keyof FormData, e)}
          />
          {Array.isArray(formData.aadhaarCard) && formData.aadhaarCard.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              {formData.aadhaarCard.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('aadhaarCard' as keyof FormData, index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OTHER DOCUMENTS */}
      <div className="field-row">
        <label>Other Documents</label>
        <div>
          <input
            ref={otherRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('otherDocuments' as keyof FormData, e)}
          />
          {Array.isArray(formData.otherDocuments) && formData.otherDocuments.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              {formData.otherDocuments.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('otherDocuments' as keyof FormData, index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BankDetails;
