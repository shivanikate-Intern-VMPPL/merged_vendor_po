/**
 * File: Address.tsx
 * Description:
 * This component captures vendor address and tax-related information,
 * including registered address, communication address, GST number,
 * PAN number, and MSME status. It also displays validation errors
 * for mandatory fields.
 *
 * Props:
 * - formData: Object containing vendor form data.
 * - setFormData: Function to update form state.
 * - errors: Object containing validation error messages.
 */

import React from "react";
import type { FormData } from "../constants/formData.ts";

interface AddressProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors?: Partial<Record<keyof FormData, string>>;
}

/**
 * Address Component
 *
 * Renders the Address & Tax section of the Vendor Registration Form.
 * Handles user input and updates the parent form state.
 *
 * @param {AddressProps} props - Component props.
 * @returns {JSX.Element}
 */
const Address: React.FC<AddressProps> = ({
  formData,
  setFormData,
  errors
}) => {
  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="section">
      <h2>Address & Tax</h2>

      <h3>Registered Address</h3>

<div className="field-row">
  <label>Attention</label>
  <input
    name="registeredAttention"
    value={formData.registeredAttention}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label className="required">Country/Region *</label>
  <select
    name="registeredCountry"
    value={formData.registeredCountry}
    onChange={handle}
  >
    <option value="">Select</option>
    <option value="India">India</option>
  </select>
</div>

<div className="field-row">
  <label className="required">Address Line 1 *</label>
  <textarea
    name="registeredAddress1"
    value={formData.registeredAddress1}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label>Address Line 2</label>
  <textarea
    name="registeredAddress2"
    value={formData.registeredAddress2}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label className="required">City *</label>
  <input
    name="registeredCity"
    value={formData.registeredCity}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label className="required">State *</label>
  <input
    name="registeredState"
    value={formData.registeredState}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label className="required">Pin Code *</label>
  <input
    name="registeredPincode"
    value={formData.registeredPincode}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label></label>

  <div>
    <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <input
        type="checkbox"
        onChange={(e) => {
          if (e.target.checked) {
            setFormData({
              ...formData,

              communicationAttention: formData.registeredAttention,
              communicationCountry: formData.registeredCountry,
              communicationAddress1: formData.registeredAddress1,
              communicationAddress2: formData.registeredAddress2,
              communicationCity: formData.registeredCity,
              communicationState: formData.registeredState,
              communicationPincode: formData.registeredPincode,
            });
          }
        }}
      />

      Same as Registered Address
    </label>
  </div>
</div>

<h3>Communication Address</h3>

<div className="field-row">
  <label>Attention</label>
  <input
    name="communicationAttention"
    value={formData.communicationAttention}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label className="required">Country/Region *</label>
  <select
    name="communicationCountry"
    value={formData.communicationCountry}
    onChange={handle}
  >
    <option value="">Select</option>
    <option value="India">India</option>
  </select>
</div>

<div className="field-row">
  <label className="required">Address Line 1 *</label>
  <textarea
    name="communicationAddress1"
    value={formData.communicationAddress1}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label>Address Line 2</label>
  <textarea
    name="communicationAddress2"
    value={formData.communicationAddress2}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label className="required">City *</label>
  <input
    name="communicationCity"
    value={formData.communicationCity}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label className="required">State *</label>
  <input
    name="communicationState"
    value={formData.communicationState}
    onChange={handle}
  />
</div>

<div className="field-row">
  <label className="required">Pin Code *</label>
  <input
    name="communicationPincode"
    value={formData.communicationPincode}
    onChange={handle}
  />
</div>

      <div className="field-row">
  <label>
    GST Treatment
  </label>

  <select
    name="gstTreatment"
    value={formData.gstTreatment}
    onChange={handle}
  >
    <option value="">Select GST Treatment</option>
    <option value="Registered Business-Regular">
      Registered Business-Regular
    </option>
    <option value="Registered Business-Composition">
      Registered Business-Composition
    </option>
    <option value="Unregistered Business">
      Unregistered Business
    </option>
    <option value="Overseas">
      Overseas
    </option>
  </select>
</div>

{formData.gstTreatment !== "Unregistered Business" && (
  <div className="field-row">
    <label className="required">
      GST No *
    </label>

    <div>
      <input
        name="gstNo"
        value={formData.gstNo}
        onChange={handle}
        className={errors?.gstNo ? "error-input" : ""}
      />

      {errors?.gstNo && (
        <div className="error-text">
          {errors.gstNo}
        </div>
      )}
    </div>
  </div>
)}

      <div className="field-row">
        <label className="required">
          PAN No *
        </label>
        <div>
          <input
            name="panNo"
            value={formData.panNo}
            onChange={handle}
            className={errors?.panNo ? "error-input" : ""}
          />
          {errors?.panNo && (
            <div className="error-text">
              {errors.panNo}
            </div>
          )}
        </div>
      </div>

      <div className="field-row">
        <label>
          MSME Status
        </label>
        <select
          name="msmeStatus"
          value={formData.msmeStatus}
          onChange={handle}
        >
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>
      {formData.msmeStatus === "Yes" && (
  <>
    <div className="field-row">
      <label>MSME Type</label>

      <select
        name="msmeType"
        value={formData.msmeType}
        onChange={handle}
      >
        <option value="">Select MSME Type</option>
        <option value="Micro">Micro</option>
        <option value="Small">Small</option>
        <option value="Medium">Medium</option>
      </select>
    </div>

    <div className="field-row">
      <label>MSME Number</label>

      <input
        type="text"
        name="msmeNumber"
        value={formData.msmeNumber}
        onChange={handle}
      />
    </div>
  </>
)}
    </div>
  );
};

export default Address;
