import React from "react";
import type { FormData } from "../constants/formData.ts";

interface VendorInfoProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors?: Partial<Record<keyof FormData, string>>;
}

/**
 * File: VendorInfo.tsx
 * Description:
 * This component captures the basic vendor information required
 * for vendor registration. It includes vendor name, trade name,
 * vendor type, category, contact person, mobile number, and email.
 * Validation messages are displayed for mandatory fields.
 */
function VendorInfo({
  formData,
  setFormData,
  errors
}: VendorInfoProps) {
  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
  
    if (name === "vendorName") {
      setFormData({
        ...formData,
        vendorName: value,
  
        // Automatically set Trade Name same as Vendor Name
        tradeName:
          formData.tradeName === "" ||
          formData.tradeName === formData.vendorName
            ? value
            : formData.tradeName
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  return (
    <div className="section">
      <h2>
        Basic Details
      </h2>

      <div className="field-row">
        <label className="required">
          Vendor Name (as per GST if available) *
        </label>
        <div>
          <input
            name="vendorName"
            value={formData.vendorName}
            onChange={handle}
            className={errors?.vendorName ? "error-input" : ""}
          />
          {
            errors?.vendorName &&
            <div className="error-text">
              {errors.vendorName}
            </div>
          }
        </div>
      </div>

      <div className="field-row">
  <label className="required">
    Trade Name (if different) *
  </label>

  <div>
    <input
      name="tradeName"
      value={formData.tradeName}
      onChange={handle}
      placeholder="Enter trade name"
      className={
        errors?.tradeName
          ? "error-input"
          : ""
      }
    />

    {errors?.tradeName && (
      <div className="error-text">
        {errors.tradeName}
      </div>
    )}
  </div>
</div>

      <div className="field-row">
 <label className="required">
   Vendor Type *
 </label>

 <div>
   <select
     name="vendorType"
     value={formData.vendorType}
     onChange={handle}
     className={errors?.vendorType ? "error-input" : ""}
   >
     <option value="">
       Select Vendor Type
     </option>
     <option value="Farmer">Farmer</option>
     <option value="FPO">FPO</option>
     <option value="Aggregator">Aggregator</option>
     <option value="Vendor">Vendor</option>
     <option value="Labour">Labour</option>
     <option value="Transporter">Transporter</option>
     <option value="Packaging">Packaging</option>
     <option value="Rent">Rent</option>
     <option value="Other">Other</option>
   </select>

   {errors?.vendorType && (
     <div className="error-text">
       {errors.vendorType}
     </div>
   )}
 </div>
</div>

<div className="field-row">
 <label className="required">
   Category *
 </label>

 <div>
   <select
     name="category"
     value={formData.category}
     onChange={handle}
     className={errors?.category ? "error-input" : ""}
   >
     <option value="">Select Category</option>
     <option value="RM">RM</option>
     <option value="Packaging">Packaging</option>
     <option value="Labour">Labour</option>
     <option value="Transport">Transport</option>
     <option value="Admin">Admin</option>
     <option value="Consultancy">Consultancy</option>
     <option value="Software/Tech">Software/Tech</option>
     <option value="Marketing">Marketing</option>
     <option value="Financial Services">Financial Services</option>
   </select>

   {errors?.category && (
     <div className="error-text">
       {errors.category}
     </div>
   )}
 </div>
</div>

      <div className="field-row">
        <label className="required">
          Mobile No *
        </label>
        <div>
          <input
            name="mobile"
            value={formData.mobile}
            maxLength={10}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement>
            ) => {
              const value = e.target.value
                .replace(/\D/g, '')
                .slice(0, 10);

              setFormData({
                ...formData,
                mobile: value
              });
            }}
            className={errors?.mobile ? "error-input" : ""}
          />
          {
            errors?.mobile &&
            <div className="error-text">
              {errors.mobile}
            </div>
          }
        </div>
      </div>

      <div className="field-row">
        <label>
          Email
        </label>
        <input
          name="email"
          value={formData.email}
          onChange={handle}
        />
      </div>
    </div>
  );
}

export default VendorInfo;