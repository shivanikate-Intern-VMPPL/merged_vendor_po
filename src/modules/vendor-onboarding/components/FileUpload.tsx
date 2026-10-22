export interface FormData {
  vendorName: string;
  tradeName: string;
  vendorType: string;
  category: string;
  contactPerson: string;
  mobile: string;
  email: string;

  registeredAddress: string;
  registeredAttention: string;
  registeredCountry: string;
  registeredAddress1: string;
  registeredAddress2: string;
  registeredCity: string;
  registeredState: string;
  registeredPincode: string;

  communicationAddress: string;
  communicationAttention: string;
  communicationCountry: string;
  communicationAddress1: string;
  communicationAddress2: string;
  communicationCity: string;
  communicationState: string;
  communicationPincode: string;

  gstTreatment: string;
  gstNo: string;
  panNo: string;

  msmeStatus: string;
  msmeType: string;
  msmeNumber: string;

  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;

  creditDays: string;
  tdsApplicable: string;

  // Supabase Storage public URLs
  attachments: string[];

  requestedBy: string;
  zone: string;
  date: string;
}

export const initialFormData: FormData = {
  vendorName: "",
  tradeName: "",
  vendorType: "",
  category: "",
  contactPerson: "",
  mobile: "",
  email: "",

  registeredAddress: "",
  registeredAttention: "",
  registeredCountry: "",
  registeredAddress1: "",
  registeredAddress2: "",
  registeredCity: "",
  registeredState: "",
  registeredPincode: "",

  communicationAddress: "",
  communicationAttention: "",
  communicationCountry: "",
  communicationAddress1: "",
  communicationAddress2: "",
  communicationCity: "",
  communicationState: "",
  communicationPincode: "",

  gstTreatment: "",
  gstNo: "",
  panNo: "",

  msmeStatus: "",
  msmeType: "",
  msmeNumber: "",

  bankName: "",
  accountName: "",
  accountNumber: "",
  ifscCode: "",

  creditDays: "",
  tdsApplicable: "",

  attachments: [],

  requestedBy: "",
  zone: "",
  date: "",
};
