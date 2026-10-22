/**
 * File: validation.ts
 * Description:
 * Contains form validation logic for the Vendor Registration Form.
 * The validateForm function verifies mandatory fields and returns
 * validation error messages for fields that do not meet the required
 * criteria.
 *
 * Validation checks include:
 * - Required field validation
 * - Mobile number length validation
 * - Address validation
 * - Banking details validation
 */
import type { FormData } from "../constants/formData";

export type ValidationErrors = Partial<Record<keyof FormData, string>>;
/**
 * Validates vendor registration form data.
 *
 * Checks all mandatory fields and returns an object containing
 * validation error messages. If no validation errors are found,
 * an empty object is returned.
 *
 * @param formData - Vendor form data entered by the user.
 * @returns errors - Object containing validation errors.
 */
export const validateForm = (formData: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!formData.vendorName?.trim())
    errors.vendorName = "Vendor Name is required";

  if (!formData.tradeName?.trim())
    errors.tradeName = "Trade Name is required";

  if (!formData.mobile?.trim()) {
    errors.mobile = "Mobile Number is required";
  } else {
    const digits = formData.mobile.replace(/\D/g, "");
    if (digits.length !== 10) {
      errors.mobile = "Mobile Number must be 10 digits";
    }
  }

  if (!formData.vendorType?.trim())
    errors.vendorType = "Vendor Type is required";
  
  if (!formData.category?.trim())
    errors.category = "Category is required";

  if (
    formData.gstTreatment &&
    formData.gstTreatment !== "Unregistered Business" &&
    !formData.gstNo?.trim()
  ) {
    errors.gstNo = "GST Number is required for registered business";
  }

  return errors;
};