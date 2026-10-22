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

  // Document uploads
  attachments: File[];
  chequePhoto: File[];
  panCard: File[];
  aadhaarCard: File[];
  otherDocuments: File[];

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
  registeredCountry: "India",
  registeredAddress1: "",
  registeredAddress2: "",
  registeredCity: "",
  registeredState: "",
  registeredPincode: "",

  communicationAddress: "",
  communicationAttention: "",
  communicationCountry: "India",
  communicationAddress1: "",
  communicationAddress2: "",
  communicationCity: "",
  communicationState: "",
  communicationPincode: "",

  gstTreatment: "Unregistered Business",
  gstNo: "",
  panNo: "",

  msmeStatus: "Not Applicable",
  msmeType: "",
  msmeNumber: "",

  bankName: "",
  accountName: "",
  accountNumber: "",
  ifscCode: "",

  creditDays: "30",
  tdsApplicable: "No",

  attachments: [],
  chequePhoto: [],
  panCard: [],
  aadhaarCard: [],
  otherDocuments: [],

  requestedBy: "",
  zone: "",
  date: new Date().toISOString().split("T")[0],
};