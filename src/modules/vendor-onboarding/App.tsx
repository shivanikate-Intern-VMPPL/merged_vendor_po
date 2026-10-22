/**
 * File: App.tsx
 * Description:
 * Main application component for the Vendor Registration System.
 * Handles user authentication, dashboard navigation, form submission,
 * vendor viewing, file previews, and approval actions.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  AccountCircle,
  Add,
  Checklist,
  Home,
  Logout,
  AdminPanelSettings,
  Menu,
} from "@mui/icons-material";

import {
  Button,
  Box,
  Tabs,
  Tab,
} from "@mui/material";

import { supabase } from "./supabase.js";

import VendorInfo from "./components/VendorInfo.js";
import Address from "./components/Address.js";
import BankDetails from "./components/BankDetails";

import { initialFormData } from "./constants/formData";
import {
  validateForm,
  type ValidationErrors,
} from "./utils/validation";

import ApproveTable from "./components/ApproveTable";
import Panel from "./components/Panel.js";

import type { FormData } from "./constants/formData.js";

import {
  getUserByEmail,
} from "./rbac/components/services/userService.js";

import {
  getUserRole,
} from "./rbac/components/services/roleService.js";

import {
  getRolePermissions,
} from "./rbac/components/services/permissionService.js";

import Users from "./rbac/components/Users.js";
import Roles from "./rbac/components/Roles";
import Permissions from "./rbac/components/Permissions";
import RolePermissions from "./rbac/components/RolePermissions";

import DashboardCards from "./rbac/components/DashboardCards";
import { getDashboardCounts } from "./rbac/components/services/adminDashboardService";

import ApprovedVendorList from "./components/ApprovedVendorList";
import PendingVendorList from "./components/PendingVendorList";
import ApprovalHistory from "./components/ApprovalHistory";

import Papa from "papaparse";

import "./App.css";

import { hasPermission } from "./utils/permissionGuard";

type FormTabType = "address" | "bank";

type DashboardTabType =
  | "home"
  | "approve"
  | "history"
  | "admin";

type VendorStatus = "pending" | "accepted" | "rejected";

interface AppUser {
  email?: string;
}

interface Vendor {
  id: number;

  vendor_name?: string;
  trade_name?: string;
  vendor_type?: string;
  category?: string;
  contact_person?: string;
  mobile?: string;
  email?: string;

  registered_address?: string;
  communication_address?: string;

  gst_no?: string;
  pan_no?: string;
  msme_status?: string;

  bank_name?: string;
  account_name?: string;
  account_number?: string;
  ifsc_code?: string;

  credit_days?: string;
  tds_applicable?: string;

  attachments?: string[] | string | null;

  requested_by?: string;
  zone?: string;
  date?: string;

  status?: VendorStatus | string | null;

  approval_level?: number;
}

const DEFAULT_FALLBACK_USER = {
  id: 10,
  name: "Mahesh Kedari",
  email: "mahesh@mulyam.in",
  zone: "All",
  role: "Admin",
  permissions: [
    "vendor.create",
    "vendor.read",
    "vendor.update",
    "vendor.delete",
    "vendor.approve",
    "user.read",
    "user.create",
    "user.update",
    "user.delete",
    "role.read",
    "role.create",
    "role.update",
    "role.delete",
    "permission.read",
    "permission.update",
    "dashboard.view",
    "vendor.history.read",
  ],
};

function getStoredOrFallbackUser() {
  try {
    const stored = localStorage.getItem("loggedInUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.email) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_FALLBACK_USER;
}

function App() {
  const location = useLocation();
  const initialUser = getStoredOrFallbackUser();
  const [user, setUser] = useState<AppUser | null>({ email: initialUser.email });

  const [currentUser, setCurrentUser] = useState<any>(initialUser);

  const [currentRole, setCurrentRole] = useState(initialUser.role || "Admin");

  const [userPermissions, setUserPermissions] = useState<string[]>(initialUser.permissions || []);

  const [activeTab, setActiveTab] =
    useState<FormTabType>("address");

  const [dashboardTab, setDashboardTab] =
    useState<DashboardTabType>("home");

  const [profileOpen, setProfileOpen] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [approvalLoadingId, setApprovalLoadingId] =
    useState<number | null>(null);

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [vendors, setVendors] =
    useState<Vendor[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedVendor, setSelectedVendor] =
    useState<Vendor | null>(null);

  const [vendorToApproveId, setVendorToApproveId] =
    useState<number | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [zoom, setZoom] = useState(1);

  const listPanelRef =
    useRef<HTMLDivElement | null>(null);

  const [adminTab, setAdminTab] = useState<
    "users" | "roles" | "permissions" | "role_permissions"
  >("users");

  /*
   * STATE FOR HOME TABS:
   * 'pending' (Primary) vs 'approved' (Secondary)
   */
  const [homeVendorTab, setHomeVendorTab] =
    useState<"pending" | "approved">("pending");

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRoles, setTotalRoles] = useState(0);
  const [totalPermissions, setTotalPermissions] = useState(0);

  const [dashboardCounts, setDashboardCounts] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    pendingVendors: 0,
  });

  /*
   * -------------------------------------------------------------
   * INITIAL LOAD
   * -------------------------------------------------------------
   */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const code = params.get("code");

    if (code) {
      (async () => {
        try {
          const res = await fetch(
            "https://owlzfkqptquibqtvztqp.supabase.co/functions/v1/zoho-oauth-callback",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ code }),
            }
          );

          const result = await res.json();

          // Clean the ?code=... out of the URL, preserving the current pathname
          window.history.replaceState({}, "", window.location.pathname || "/vendor-onboarding");

          if (result.email) {
            await loadLoggedInUser(result.email);
            await fetchVendors();
            await loadAdminStats();
            await loadDashboardCounts();
          
            setUser({ email: result.email });
          } else {
            alert(
              "Zoho login failed: " +
                (result.error || "unknown error")
            );
          }
        } catch (err) {
          console.error(
            "Zoho callback error:",
            err
          );

          alert(
            "Zoho login failed. Check console for details."
          );
        }
      })();

      return;
    }

    /*
     * Hydrate user session & data seamlessly
     */
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const sessionEmail = session?.user?.email;

        const stored = localStorage.getItem("loggedInUser");
        let emailToLoad = sessionEmail;

        if (!emailToLoad && stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.email) {
              emailToLoad = parsed.email;
            }
          } catch {}
        }

        if (!emailToLoad) {
          emailToLoad = initialUser.email;
        }

        if (emailToLoad) {
          await loadLoggedInUser(emailToLoad);
        }
      } catch (err) {
        console.warn("Session auto-hydration note:", err);
      } finally {
        await fetchVendors();
        await loadAdminStats();
        await loadDashboardCounts();
      }
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "approve") {
      setDashboardTab("approve");
      setShowForm(false);
    } else if (tab === "history") {
      setDashboardTab("history");
      setShowForm(false);
    } else if (tab === "admin") {
      setDashboardTab("admin");
      setShowForm(false);
    } else if (tab === "new") {
      setShowForm(true);
    } else if (tab === "home") {
      setDashboardTab("home");
      setShowForm(false);
    } else {
      setShowForm(false);
    }
  }, [location.search]);

  /*
   * -------------------------------------------------------------
   * FILTERED VENDORS
   * -------------------------------------------------------------
   */

  const filteredVendors = useMemo(
    () =>
      vendors.filter((vendor) =>
        vendor.vendor_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [searchTerm, vendors]
  );

  /*
   * -------------------------------------------------------------
   * SELECTED APPROVED VENDORS
   * -------------------------------------------------------------
   */

  const [selectedVendorIds, setSelectedVendorIds] =
    useState<number[]>([]);

  /*
   * -------------------------------------------------------------
   * DOWNLOAD SELECTED APPROVED VENDORS CSV
   * -------------------------------------------------------------
   */

  const downloadSelectedCSV = () => {
    const selectedVendors = approvedVendors.filter(
      (vendor) =>
        selectedVendorIds.includes(vendor.id)
    );

    if (selectedVendors.length === 0) {
      alert("Please select at least one vendor.");
      return;
    }

    const csvData = selectedVendors.map(
      (vendor) => ({
        "Vendor Name": vendor.vendor_name ?? "",
        "Trade Name": vendor.trade_name ?? "",
        Category: vendor.category ?? "",
        "Contact Person":
          vendor.contact_person ?? "",
        Mobile: vendor.mobile ?? "",
        Email: vendor.email ?? "",
        GST: vendor.gst_no ?? "",
        PAN: vendor.pan_no ?? "",
        "Bank Name": vendor.bank_name ?? "",
        "Account Name":
          vendor.account_name ?? "",
        "Account Number":
          vendor.account_number ?? "",
        IFSC: vendor.ifsc_code ?? "",
        Status: vendor.status ?? "",
      })
    );

    const csv = Papa.unparse(csvData);

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Approved_Vendors.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  /*
   * -------------------------------------------------------------
   * LOAD LOGGED-IN USER
   * -------------------------------------------------------------
   */

  const loadLoggedInUser = async (
    email: string
  ) => {
    try {
      let user = await getUserByEmail(email);

      if (!user) {
        const { data: fallbackList } = await supabase.from("Users").select("*").order("id").limit(1);
        user = fallbackList?.[0];
      }

      console.log("Database User:", user);

      if (!user) {
        console.error("User not found");
        return;
      }

      let role = "Admin";
      const basePermissions = [
        "vendor.create",
        "vendor.read",
        "vendor.update",
        "vendor.delete",
        "vendor.approve",
        "user.read",
        "dashboard.view",
        "vendor.history.read",
      ];
      let permissions: string[] = [...basePermissions];

      try {
        const roleData = await getUserRole(user.id);
        if (roleData?.role?.role_name) {
          role = roleData.role.role_name;
        }

        if (roleData?.role_id) {
          const permissionData = await getRolePermissions(roleData.role_id);
          const dbPerms = permissionData?.map((item: any) => item.permission_name) || [];
          if (dbPerms.length > 0) {
            permissions = Array.from(new Set([...permissions, ...dbPerms]));
          }
        }
      } catch (roleErr) {
        console.warn("Could not load user role:", roleErr);
      }

      const loggedInUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        zone: user.zone,
        role,
        permissions,
      };

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(loggedInUser)
      );

      setUser({ email: user.email });

      setCurrentUser(user);

      setCurrentRole(role);

      setUserPermissions(
        permissions
      );

      console.log(
        "Logged In User:",
        loggedInUser
      );
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * -------------------------------------------------------------
   * PENDING VENDORS
   * -------------------------------------------------------------
   */

  const pendingVendors = useMemo(
    () =>
      vendors.filter((vendor) => {
        const status =
          vendor.status
            ?.trim()
            .toLowerCase();

        const role =
          currentRole
            .trim()
            .toLowerCase();

        const level =
          vendor.approval_level ?? 0;

        /*
         * APPROVER 1
         */

        if (role === "approver1") {
          return (
            (
              status === "pending" ||
              status === "rejected"
            ) &&
            level === 0
          );
        }

        /*
         * APPROVER 2
         */

        if (role === "approver2") {
          return (
            (
              status === "pending" ||
              status === "rejected"
            ) &&
            level === 1
          );
        }

        /*
         * ADMIN
         */

        if (role === "admin") {
          return (
            status === "pending" ||
            status === "rejected"
          );
        }

        return false;
      }),
    [vendors, currentRole]
  );

  /*
   * -------------------------------------------------------------
   * APPROVED VENDORS
   * -------------------------------------------------------------
   */

  const approvedVendors = useMemo(
    () =>
      vendors.filter(
        (vendor) =>
          vendor.status
            ?.toLowerCase() === "accepted" &&
          vendor.approval_level === 2
      ),
    [vendors]
  );

  /*
   * -------------------------------------------------------------
   * FILTERED APPROVED VENDORS
   * -------------------------------------------------------------
   */

  const filteredApprovedVendors =
    useMemo(
      () =>
        approvedVendors.filter(
          (vendor) =>
            vendor.vendor_name
              ?.toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              )
        ),
      [approvedVendors, searchTerm]
    );

  /*
   * -------------------------------------------------------------
   * FETCH VENDORS
   * -------------------------------------------------------------
   */

  const fetchVendors = async () => {
    const {
      data,
      error,
    } = await supabase
      .from("vendors")
      .select("*")
      .order("id", {
        ascending: false,
      });

    console.log(
      "FETCHED VENDORS:",
      data
    );

    if (!error && data) {
      setVendors(data);
    }
  };

  /*
   * -------------------------------------------------------------
   * GET ATTACHMENT LIST
   * -------------------------------------------------------------
   */

  const getAttachmentList = (
    attachments: Vendor["attachments"]
  ) => {
    if (!attachments) {
      return [];
    }

    if (Array.isArray(attachments)) {
      return attachments;
    }

    try {
      const parsed =
        JSON.parse(attachments);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  };

  /*
   * -------------------------------------------------------------
   * ZOHO SIGN IN
   * -------------------------------------------------------------
   */

  const signInWithZoho = (): void => {
    const ZOHO_CLIENT_ID =
      import.meta.env
        .VITE_ZOHO_CLIENT_ID;

    const REDIRECT_URI =
      import.meta.env
        .VITE_ZOHO_REDIRECT_URI;

    const url =
      `https://accounts.zoho.in/oauth/v2/auth?response_type=code` +
      `&client_id=${ZOHO_CLIENT_ID}` +
      `&scope=AaaServer.profile.READ,ZohoBooks.contacts.CREATE,ZohoBooks.contacts.READ` +
      `&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}` +
      `&access_type=offline&prompt=consent`;

    window.location.href = url;
  };

  /*
   * -------------------------------------------------------------
   * SIGN OUT
   * -------------------------------------------------------------
   */

  const signOut = async (): Promise<void> => {
    localStorage.removeItem("loggedInUser");
    await supabase.auth.signOut();

    setUser(null);

    setProfileOpen(false);

    window.location.href = "/";
  };

  /*
   * -------------------------------------------------------------
   * HANDLE VENDOR FORM SUBMISSION
   * -------------------------------------------------------------
   */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    console.log(
      "Submit button clicked"
    );

    setLoading(true);

    const newErrors =
      validateForm(formData);

    console.log(
      "Validation Errors:",
      newErrors
    );

    if (
      Object.keys(newErrors)
        .length > 0
    ) {
      setErrors(newErrors);

      setLoading(false);

      const errorFieldNames = Object.keys(newErrors);
      const friendlyNames: Record<string, string> = {
        vendorName: "Vendor Name",
        tradeName: "Trade Name",
        mobile: "Mobile Number",
        vendorType: "Vendor Type",
        category: "Category",
        gstNo: "GST Number",
        panNo: "PAN Number",
      };

      const missingList = errorFieldNames
        .map((k) => friendlyNames[k] || k)
        .join(", ");

      alert(`Please complete the required fields: ${missingList}`);
      return;
    }

    setErrors({});

    const uploadedFiles: string[] = [];

    const documentFields = [
      "chequePhoto",
      "panCard",
      "aadhaarCard",
      "otherDocuments",
    ] as const;

    /*
     * Upload documents
     */

    for (
      const field of documentFields
    ) {
      const fileList =
        formData[field];

      if (
        Array.isArray(fileList) &&
        fileList.length > 0
      ) {
        for (
          const file of fileList
        ) {
          if (
            typeof file === "string"
          ) {
            uploadedFiles.push(file);

            continue;
          }

          const cleanFileName =
            file.name
              ?.replace(
                /\s+/g,
                "-"
              )
              .replace(
                /[^\w\.-]/g,
                ""
              ) ||
            "document";

          const fileName =
            `${Date.now()}-${cleanFileName}`;

          const {
            error: uploadError,
          } =
            await supabase.storage
              .from(
                "vendor-documents"
              )
              .upload(
                fileName,
                file
              );

          if (uploadError) {
            alert(
              "Storage Upload Error: " +
                uploadError.message
            );

            setLoading(false);

            return;
          }

          const { data } =
            supabase.storage
              .from(
                "vendor-documents"
              )
              .getPublicUrl(
                fileName
              );

          if (
            data?.publicUrl
          ) {
            uploadedFiles.push(
              data.publicUrl
            );
          }
        }
      }
    }

    /*
     * Insert vendor
     */

    const { error }: {
      error:
        | {
            message: string;
          }
        | null;
    } = await supabase
      .from("vendors")
      .insert([
        {
          vendor_name:
            formData.vendorName,

          trade_name:
            formData.tradeName,

          vendor_type:
            formData.vendorType,

          category:
            formData.category,

          contact_person:
            formData.contactPerson,

          mobile:
            formData.mobile,

          email:
            formData.email,

          registered_address:
            formData.registeredAddress,

          registered_country:
            formData.registeredCountry,

          registered_address_line1:
            formData.registeredAddress,

          registered_address_line2:
            formData.registeredAddress,

          registered_city:
            formData.registeredCity,

          registered_state:
            formData.registeredState,

          registered_pin_code:
            formData.registeredPincode,

          communication_address:
            formData.communicationAddress,

          communication_country:
            formData.communicationCountry,

          communication_address_line1:
            formData.communicationAddress,

          communication_address_line2:
            formData.communicationAddress,

          communication_city:
            formData.communicationCity,

          communication_state:
            formData.communicationState,

          communication_pin_code:
            formData.communicationPincode,

          gst_no:
            formData.gstNo,

          pan_no:
            formData.panNo,

          msme_status:
            formData.msmeStatus,

          bank_name:
            formData.bankName,

          account_name:
            formData.accountName,

          account_number:
            formData.accountNumber,

          ifsc_code:
            formData.ifscCode,

          credit_days:
            formData.creditDays,

          tds_applicable:
            formData.tdsApplicable,

          attachments:
            uploadedFiles,

          requested_by:
            currentUser?.name ||
            user?.email ||
            formData.requestedBy ||
            "Data Entry Operator",

          zone:
            currentUser?.zone ||
            formData.zone ||
            "",

          date:
            formData.date ||
            new Date()
              .toISOString()
              .split("T")[0],

          status:
            "pending",
        },
      ]);

    if (error) {
      alert(error.message);
    } else {
      alert(
        "Vendor Saved Successfully"
      );

      await fetchVendors();

      setFormData(
        initialFormData
      );

      setErrors({});

      setActiveTab(
        "address"
      );

      setShowForm(false);

      setDashboardTab(
        "home"
      );
    }

    setLoading(false);
  };

  /*
   * -------------------------------------------------------------
   * UPDATE VENDOR STATUS
   * -------------------------------------------------------------
   */

  const updateVendorStatus = async (
    vendorId: number,
    status: VendorStatus
  ) => {
    try {
      setApprovalLoadingId(
        vendorId
      );

      const normalizedRole =
        currentRole
          .trim()
          .toLowerCase();

      /*
       * Get current vendor
       */

      const {
        data: currentVendor,
        error: fetchError,
      } = await supabase
        .from("vendors")
        .select(
          "approval_level, status"
        )
        .eq("id", vendorId)
        .single();

      if (
        fetchError ||
        !currentVendor
      ) {
        console.error(
          "Error fetching vendor:",
          fetchError?.message
        );

        return;
      }

      const currentLevel =
        currentVendor
          .approval_level ?? 0;

      let newStatus: VendorStatus;

      let newApprovalLevel: number;

      /*
       * ------------------------------------------------
       * APPROVER 1
       * ------------------------------------------------
       */

      if (
        normalizedRole ===
        "approver1"
      ) {
        if (
          currentLevel !== 0
        ) {
          alert(
            "This vendor is not currently assigned to Approver 1."
          );

          return;
        }

        if (
          status === "accepted"
        ) {
          /*
           * Approver 1 approved
           * Send to Approver 2
           */

          newStatus =
            "pending";

          newApprovalLevel =
            1;
        } else {
          /*
           * Approver 1 rejected
           */

          newStatus =
            "rejected";

          newApprovalLevel =
            0;
        }
      }

      /*
       * ------------------------------------------------
       * APPROVER 2
       * ------------------------------------------------
       */

      else if (
        normalizedRole ===
        "approver2"
      ) {
        if (
          currentLevel !== 1
        ) {
          alert(
            "This vendor is not currently assigned to Approver 2."
          );

          return;
        }

        if (
          status === "accepted"
        ) {
          /*
           * Final approval
           */

          newStatus =
            "accepted";

          newApprovalLevel =
            2;
        } else {
          /*
           * Approver 2 rejected
           * Keep level 1 so Approver 2
           * can see it again.
           */

          newStatus =
            "rejected";

          newApprovalLevel =
            1;
        }
      }

      /*
       * ------------------------------------------------
       * ADMIN
       * ------------------------------------------------
       */

      else if (
        normalizedRole ===
        "admin"
      ) {
        if (
          status === "accepted"
        ) {
          newStatus =
            "accepted";

          newApprovalLevel =
            2;
        } else {
          newStatus =
            "rejected";

          newApprovalLevel =
            currentLevel;
        }
      }

      /*
       * ------------------------------------------------
       * OTHER ROLES
       * ------------------------------------------------
       */

      else {
        alert(
          "You do not have permission to approve this vendor."
        );

        return;
      }

      /*
       * ------------------------------------------------
       * UPDATE VENDOR
       * ------------------------------------------------
       */

      const {
        error: updateError,
      } = await supabase
        .from("vendors")
        .update({
          status: newStatus,
          approval_level:
            newApprovalLevel,
        })
        .eq("id", vendorId);

      if (updateError) {
        console.error(
          "Error updating vendor:",
          updateError.message
        );

        alert(
          updateError.message
        );

        return;
      }

      /*
       * ------------------------------------------------
       * SAVE APPROVAL HISTORY
       * ------------------------------------------------
       */

      if (currentUser) {
        const {
          error: historyError,
        } = await supabase
          .from(
            "vendor_approval_history"
          )
          .insert([
            {
              vendor_id:
                vendorId,

              approver_id:
                currentUser.id,

              approver_role:
                currentRole,

              approval_level:
                newApprovalLevel,

              action:
                status ===
                "accepted"
                  ? "Approved"
                  : "Rejected",

              comments:
                null,
            },
          ]);

        if (
          historyError
        ) {
          console.error(
            "Approval history error:",
            historyError.message
          );
        }
      }

      /*
       * ------------------------------------------------
       * REFRESH DATA
       * ------------------------------------------------
       */

      await fetchVendors();

      await loadDashboardCounts();

      setDrawerOpen(false);

      setSelectedVendor(
        null
      );

      setSelectedFile(
        null
      );
    } catch (error) {
      console.error(
        "Approval error:",
        error
      );
    } finally {
      setApprovalLoadingId(
        null
      );
    }
  };

  /*
   * -------------------------------------------------------------
   * FINALIZE VENDOR APPROVAL
   * -------------------------------------------------------------
   */

  const finalizeVendorApproval =
    async (
      vendorId: number
    ) => {
      try {
        console.log(
          "Level 2 approval started"
        );

        console.log(
          "Vendor ID:",
          vendorId
        );

        setApprovalLoadingId(
          vendorId
        );

        const {
          data,
          error,
        } = await supabase
          .from("vendors")
          .update({
            status:
              "accepted",

            approval_level:
              2,
          })
          .eq(
            "id",
            vendorId
          )
          .select();

        console.log(
          "Final Approval Updated Rows:",
          data
        );

        console.log(
          "Error:",
          error
        );

        if (error) {
          alert(
            error.message
          );

          return;
        }

        console.log(
          "Final approval successful"
        );

        await fetchVendors();

        setDrawerOpen(
          false
        );

        setSelectedVendor(
          null
        );

        setSelectedFile(
          null
        );

        await loadDashboardCounts();
      } catch (err) {
        console.error(
          "Final approval error:",
          err
        );
      } finally {
        setApprovalLoadingId(
          null
        );
      }
    };

  /*
   * -------------------------------------------------------------
   * OPEN ATTACHMENT
   * -------------------------------------------------------------
   */

  const openAttachment = (
    file: string
  ) => {
    setSelectedFile(file);

    setZoom(1);

    if (!drawerOpen) {
      setDrawerOpen(true);
    }

    if (
      listPanelRef.current
    ) {
      listPanelRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /*
   * -------------------------------------------------------------
   * DASHBOARD SHELL
   * -------------------------------------------------------------
   */

  const renderDashboardShell = (
    children: React.ReactNode
  ) => (
    <div
      className="dashboard-shell"
      onClick={() => {
        if (mobileMenuOpen) {
          setMobileMenuOpen(
            false
          );
        }
      }}
    >
      <aside
        className={`sidebar ${
          mobileMenuOpen
            ? "open"
            : ""
        }`}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="sidebar-header">
          <img
            src="/logo.svg"
            alt="Mulyam"
            className="sidebar-logo"
          />

          <div>
            <h1>
              Mulyam
            </h1>

            <p>
              Vendor Portal
            </p>
          </div>
        </div>

        <button
          type="button"
          className={
            dashboardTab ===
            "home"
              ? "sidebar-link active"
              : "sidebar-link"
          }
          onClick={() => {
            setDashboardTab(
              "home"
            );

            setShowForm(
              false
            );

            setMobileMenuOpen(
              false
            );
          }}
        >
          <Home fontSize="small" />

          Home
        </button>

        {hasPermission(
          userPermissions,
          "vendor.approve"
        ) && (
          <button
            type="button"
            className={
              dashboardTab ===
              "approve"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() => {
              setDashboardTab(
                "approve"
              );

              setShowForm(
                false
              );

              setSelectedFile(
                null
              );

              setMobileMenuOpen(
                false
              );
            }}
          >
            <Checklist fontSize="small" />

            Approve Forms
          </button>
        )}

        {(
          hasPermission(
            userPermissions,
            "vendor.history.read"
          ) ||
          hasPermission(
            userPermissions,
            "history.read"
          )
        ) && (
          <button
            type="button"
            className={
              dashboardTab ===
              "history"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() => {
              setDashboardTab(
                "history"
              );

              setShowForm(
                false
              );

              setSelectedFile(
                null
              );

              setMobileMenuOpen(
                false
              );
            }}
          >
            <Checklist fontSize="small" />

            Approval History
          </button>
        )}

        {hasPermission(
          userPermissions,
          "user.read"
        ) && (
          <button
            type="button"
            className={
              dashboardTab ===
              "admin"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() => {
              setDashboardTab(
                "admin"
              );

              setShowForm(
                false
              );

              setSelectedFile(
                null
              );

              setMobileMenuOpen(
                false
              );
            }}
          >
            <AdminPanelSettings fontSize="small" />

            Admin
          </button>
        )}
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <button
            className="mobile-menu-btn"
            onClick={() =>
              setMobileMenuOpen(
                true
              )
            }
          >
            <Menu />
          </button>

          <div>
            <h2>
              {showForm
                ? "Vendor Form"
                : dashboardTab ===
                  "home"
                ? "Home"
                : dashboardTab ===
                  "approve"
                ? "Approve Forms"
                : dashboardTab ===
                  "history"
                ? "Approval History"
                : "Manage Users & Roles"}
            </h2>

            <p>
              {dashboardTab ===
              "approve"
                ? `${pendingVendors.length} pending form${
                    pendingVendors.length ===
                    1
                      ? ""
                      : "s"
                  }`
                : dashboardTab ===
                  "history"
                ? "View complete vendor approval history"
                : dashboardTab ===
                  "admin"
                ? "Manage system users, roles, and permissions"
                : "Manage vendor registration details"}
            </p>
          </div>

          <div className="profile-menu">
            <button
              type="button"
              className="profile-icon-btn"
              aria-label="Open profile menu"
              onClick={() =>
                setProfileOpen(
                  (open) =>
                    !open
                )
              }
            >
              <AccountCircle />
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <p>
                  {user?.email}
                </p>

                <button
                  type="button"
                  onClick={
                    signOut
                  }
                >
                  <Logout fontSize="small" />

                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {children}
      </main>
    </div>
  );

  /*
   * -------------------------------------------------------------
   * HOME
   * -------------------------------------------------------------
   */

  const renderHome = () => (
    <>
      {!showForm && (
        <>
          <div className="screen-actions modern-actions">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setShowForm(
                  true
                );

                setSelectedFile(
                  null
                );
              }}
              sx={{
                borderRadius:
                  "14px",

                px: 3,

                py: 1.4,

                fontWeight: 700,

                fontSize:
                  "15px",

                textTransform:
                  "none",

                background:
                  "linear-gradient(135deg,#1976d2,#42a5f5)",

                boxShadow:
                  "0 8px 20px rgba(25,118,210,.25)",

                transition:
                  "0.25s",

                "&:hover": {
                  background:
                    "linear-gradient(135deg,#1565c0,#1e88e5)",

                  transform:
                    "translateY(-2px)",

                  boxShadow:
                    "0 12px 25px rgba(25,118,210,.35)",
                },
              }}
            >
              New Vendor
            </Button>
          </div>

          <div className="vendor-workspace">
            <div
              className="vendor-list-panel"
              ref={listPanelRef}
            >
              {selectedFile ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setSelectedFile(
                        null
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  >
                    Back
                  </Button>

                  <div
                    style={{
                      display:
                        "flex",

                      gap: "10px",

                      marginBottom:
                        "10px",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setZoom(
                          (z) =>
                            z +
                            0.2
                        )
                      }
                    >
                      +
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() =>
                        setZoom(
                          (z) =>
                            Math.max(
                              0.2,
                              z -
                                0.2
                            )
                        )
                      }
                    >
                      -
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() =>
                        setZoom(
                          1
                        )
                      }
                    >
                      Reset
                    </Button>
                  </div>

                  {selectedFile
                    .toLowerCase()
                    .endsWith(
                      ".pdf"
                    ) ? (
                    <iframe
                      src={
                        selectedFile
                      }
                      title="PDF Preview"
                      style={{
                        width:
                          "100%",

                        height:
                          "700px",

                        border:
                          "1px solid #ccc",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        overflow:
                          "auto",

                        border:
                          "1px solid #ccc",
                      }}
                    >
                      <img
                        src={
                          selectedFile
                        }
                        alt="Preview"
                        style={{
                          maxWidth:
                            "100%",

                          height:
                            "auto",

                          transform:
                            `scale(${zoom})`,

                          transformOrigin:
                            "top left",

                          display:
                            "block",
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                /*
                 * -------------------------------------------------------------
                 * MATERIAL-UI TAB LAYOUT FOR HOME DASHBOARD
                 * -------------------------------------------------------------
                 */

                <Box
                  sx={{
                    width:
                      "100%",
                  }}
                >
                  <Tabs
                    value={
                      homeVendorTab
                    }
                    onChange={(
                      _,
                      value
                    ) =>
                      setHomeVendorTab(
                        value
                      )
                    }
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      mb: 3,

                      "& .MuiTabs-flexContainer":
                        {
                          gap: 1.5,
                        },

                      "& .MuiTabs-indicator":
                        {
                          display:
                            "none",
                        },
                    }}
                  >
                    {/* Primary Tab: Pending Vendors */}

                    <Tab
                      label={`Pending Vendors (${pendingVendors.length})`}
                      value="pending"
                      sx={{
                        textTransform:
                          "none",

                        fontWeight:
                          700,

                        fontSize:
                          "15px",

                        borderRadius:
                          3,

                        minHeight:
                          46,

                        px: 3,

                        transition:
                          "all 0.2s ease-in-out",

                        "&.Mui-selected":
                          {
                            background:
                              "#ED6C02",

                            color:
                              "#fff",

                            boxShadow:
                              "0 4px 12px rgba(237, 108, 2, 0.25)",
                          },

                        "&:not(.Mui-selected)":
                          {
                            background:
                              "#F3F4F6",

                            color:
                              "#374151",

                            "&:hover":
                              {
                                background:
                                  "#E5E7EB",
                              },
                          },
                      }}
                    />

                    {/* Secondary Tab: Approved Vendors */}

                    <Tab
                      label={`Approved Vendors (${approvedVendors.length})`}
                      value="approved"
                      sx={{
                        textTransform:
                          "none",

                        fontWeight:
                          700,

                        fontSize:
                          "15px",

                        borderRadius:
                          3,

                        minHeight:
                          46,

                        px: 3,

                        transition:
                          "all 0.2s ease-in-out",

                        "&.Mui-selected":
                          {
                            background:
                              "#16A34A",

                            color:
                              "#fff",

                            boxShadow:
                              "0 4px 12px rgba(22, 163, 74, 0.25)",
                          },

                        "&:not(.Mui-selected)":
                          {
                            background:
                              "#F3F4F6",

                            color:
                              "#374151",

                            "&:hover":
                              {
                                background:
                                  "#E5E7EB",
                              },
                          },
                      }}
                    />
                  </Tabs>

                  {/* Tab 1 View: Pending Vendors List */}

                  {homeVendorTab ===
                    "pending" && (
                    <Box
                      sx={{
                        width:
                          "100%",

                        minWidth:
                          0,
                      }}
                    >
                      <PendingVendorList
                        vendors={
                          pendingVendors
                        }
                        onVendorClick={(
                          vendor
                        ) => {
                          setDashboardTab(
                            "approve"
                          );

                          setShowForm(
                            false
                          );

                          setSelectedVendor(
                            vendor
                          );

                          setDrawerOpen(
                            true
                          );
                        }}
                      />
                    </Box>
                  )}

                  {/* Tab 2 View: Approved Vendors Table */}

                  {homeVendorTab ===
                    "approved" && (
                    <Box
                      sx={{
                        width:
                          "100%",

                        minWidth:
                          0,
                      }}
                    >
                      <ApprovedVendorList
                        vendors={
                          approvedVendors
                        }
                        selectedVendorIds={
                          selectedVendorIds
                        }
                        setSelectedVendorIds={
                          setSelectedVendorIds
                        }
                        onRefresh={fetchVendors}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </div>
          </div>
        </>
      )}

      {showForm && (
          <form
            onSubmit={
              handleSubmit
            }
          >
            <VendorInfo
              formData={
                formData
              }
              setFormData={
                setFormData
              }
              errors={
                errors
              }
            />

            <div className="tabs">
              <button
                type="button"
                className={
                  activeTab ===
                  "address"
                    ? "active-tab"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "address"
                  )
                }
              >
                Address & Tax
              </button>

              <button
                type="button"
                className={
                  activeTab ===
                  "bank"
                    ? "active-tab"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "bank"
                  )
                }
              >
                Bank & Others
              </button>
            </div>

            {activeTab ===
              "address" && (
              <Address
                formData={
                  formData
                }
                setFormData={
                  setFormData
                }
                errors={
                  errors
                }
              />
            )}

            {activeTab ===
              "bank" && (
              <BankDetails
                formData={
                  formData
                }
                setFormData={
                  setFormData
                }
              />
            )}

            {Object.keys(errors).length > 0 && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "1px solid #f87171",
                }}
              >
                ⚠️ Please fill the required fields:{" "}
                {Object.values(errors).filter(Boolean).join(", ")}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Saving..."
                  : "Submit Vendor"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowForm(
                    false
                  )
                }
              >
                Cancel
              </button>
            </div>
          </form>
        )}
    </>
  );

  /*
   * -------------------------------------------------------------
   * APPROVE
   * -------------------------------------------------------------
   */

  const renderApprove = () => (
    <>
      <Box
        sx={{
          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",

          mb: 3,

          p: 3,

          borderRadius: 3,

          background:
            "#fff",

          border:
            "1px solid #E5E7EB",

          boxShadow:
            "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Box>
          <h2
            style={{
              margin: 0,

              color:
                "#1565C0",

              fontWeight:
                700,

              fontSize:
                "28px",
            }}
          >
            Pending Vendor Approvals
          </h2>

          <p
            style={{
              marginTop:
                6,

              marginBottom:
                0,

              color:
                "#6B7280",
            }}
          >
            Review submitted vendor requests and approve or reject them.
          </p>
        </Box>

        <Box
          sx={{
            px: 3,

            py: 1.2,

            borderRadius:
              "30px",

            bgcolor:
              "#FFF4E5",

            color:
              "#ED6C02",

            fontWeight:
              700,

            fontSize:
              "15px",
          }}
        >
          {pendingVendors.length}{" "}
          Pending
        </Box>
      </Box>

      <ApproveTable
        vendors={
          pendingVendors
        }
        approvalLoadingId={
          approvalLoadingId
        }
        updateVendorStatus={
          updateVendorStatus
        }
        selectedVendorId={
          vendorToApproveId
        }
        onViewVendor={(
          vendor
        ) => {
          setSelectedVendor(
            vendor
          );

          setDrawerOpen(
            true
          );
        }}
      />

      <Panel
        selectedFile={
          selectedFile
        }
        setSelectedFile={
          setSelectedFile
        }
        zoom={zoom}
        setZoom={setZoom}
        drawerOpen={
          drawerOpen
        }
        setDrawerOpen={
          setDrawerOpen
        }
        selectedVendor={
          selectedVendor
        }
        getAttachmentList={
          getAttachmentList
        }
        openAttachment={
          openAttachment
        }
        updateVendorStatus={
          updateVendorStatus
        }
      />
    </>
  );

  /*
   * -------------------------------------------------------------
   * ADMIN
   * -------------------------------------------------------------
   */

  const renderAdmin = () => (
    <div
      style={{
        padding: 20,
      }}
    >
      <DashboardCards
        totalUsers={
          dashboardCounts.totalUsers
        }
        totalRoles={
          dashboardCounts.totalRoles
        }
        totalPermissions={
          dashboardCounts.totalPermissions
        }
        pendingVendors={
          dashboardCounts.pendingVendors
        }
        onUsersClick={() =>
          setAdminTab(
            "users"
          )
        }
        onRolesClick={() =>
          setAdminTab(
            "roles"
          )
        }
        onPermissionsClick={() =>
          setAdminTab(
            "permissions"
          )
        }
        onPendingClick={() => {
          setDashboardTab(
            "approve"
          );

          setShowForm(
            false
          );

          setSelectedFile(
            null
          );
        }}
      />

      <Tabs
        value={
          adminTab
        }
        onChange={(
          _,
          value
        ) =>
          setAdminTab(
            value
          )
        }
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 4,

          "& .MuiTabs-flexContainer":
            {
              gap: 1,
            },

          "& .MuiTabs-indicator":
            {
              display:
                "none",
            },
        }}
      >
        {hasPermission(
          userPermissions,
          "user.read"
        ) && (
          <Tab
            label="Users"
            value="users"
            sx={{
              textTransform:
                "none",

              fontWeight:
                600,

              borderRadius:
                3,

              minHeight:
                44,

              px: 3,

              "&.Mui-selected":
                {
                  background:
                    "#1976d2",

                  color:
                    "#fff",
                },

              "&:not(.Mui-selected)":
                {
                  background:
                    "#F3F4F6",

                  color:
                    "#374151",
                },
            }}
          />
        )}

        {hasPermission(
          userPermissions,
          "role.read"
        ) && (
          <Tab
            label="Roles"
            value="roles"
            sx={{
              textTransform:
                "none",

              fontWeight:
                600,

              borderRadius:
                3,

              minHeight:
                44,

              px: 3,

              "&.Mui-selected":
                {
                  background:
                    "#2e7d32",

                  color:
                    "#fff",
                },

              "&:not(.Mui-selected)":
                {
                  background:
                    "#F3F4F6",

                  color:
                    "#374151",
                },
            }}
          />
        )}

        {hasPermission(
          userPermissions,
          "permission.read"
        ) && (
          <Tab
            label="Permissions"
            value="permissions"
            sx={{
              textTransform:
                "none",

              fontWeight:
                600,

              borderRadius:
                3,

              minHeight:
                44,

              px: 3,

              "&.Mui-selected":
                {
                  background:
                    "#ed6c02",

                  color:
                    "#fff",
                },

              "&:not(.Mui-selected)":
                {
                  background:
                    "#F3F4F6",

                  color:
                    "#374151",
                },
            }}
          />
        )}

        {hasPermission(
          userPermissions,
          "role.update"
        ) && (
          <Tab
            label="Role Permissions"
            value="role_permissions"
            sx={{
              textTransform:
                "none",

              fontWeight:
                600,

              borderRadius:
                3,

              minHeight:
                44,

              px: 3,

              "&.Mui-selected":
                {
                  background:
                    "#9c27b0",

                  color:
                    "#fff",
                },

              "&:not(.Mui-selected)":
                {
                  background:
                    "#F3F4F6",

                  color:
                    "#374151",
                },
            }}
          />
        )}
      </Tabs>

      {adminTab ===
        "users" &&
        hasPermission(
          userPermissions,
          "user.read"
        ) && <Users />}

      {adminTab ===
        "roles" &&
        hasPermission(
          userPermissions,
          "role.read"
        ) && <Roles />}

      {adminTab ===
        "role_permissions" &&
        hasPermission(
          userPermissions,
          "role.update"
        ) && (
          <RolePermissions />
        )}

      {adminTab ===
        "permissions" &&
        hasPermission(
          userPermissions,
          "permission.read"
        ) && (
          <Permissions />
        )}
    </div>
  );

  /*
   * -------------------------------------------------------------
   * ADMIN STATS
   * -------------------------------------------------------------
   */

  async function loadAdminStats() {
    const users =
      await supabase
        .from("Users")
        .select("*");

    const roles =
      await supabase
        .from("roles")
        .select("*");

    const permissions =
      await supabase
        .from("permissions")
        .select("*");

    setTotalUsers(
      users.data?.length ||
        0
    );

    setTotalRoles(
      roles.data?.length ||
        0
    );

    setTotalPermissions(
      permissions.data?.length ||
        0
    );
  }

  /*
   * -------------------------------------------------------------
   * DASHBOARD COUNTS
   * -------------------------------------------------------------
   */

  async function loadDashboardCounts() {
    try {
      const data =
        await getDashboardCounts();

      setDashboardCounts(
        data
      );
    } catch (err) {
      console.error(err);
    }
  }

  /*
   * -------------------------------------------------------------
   * RENDER
   * -------------------------------------------------------------
   */

  return (
    <div className="container">
      {renderDashboardShell(
        dashboardTab === "home"
          ? renderHome()
          : dashboardTab === "approve"
          ? renderApprove()
          : dashboardTab === "history"
          ? <ApprovalHistory />
          : renderAdmin()
      )}
    </div>
  );
}

export default App;