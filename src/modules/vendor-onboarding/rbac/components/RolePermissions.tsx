import { useEffect, useState } from "react";
import { getRoles } from "./services/roleService";
import { getAllPermissions } from "./services/adminPermissionService";
import { getRolePermissionIds, assignPermission, removePermission } from "./services/adminRolePermissionService";
import { Switch, CircularProgress } from "@mui/material";

interface Role {
  id: number;
  role_name: string;
}

interface Permission {
  id: number;
  permission_name: string;
  description: string;
}

export default function RolePermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | "">("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  
  // Added loading state for specific toggle actions
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole !== "") {
      loadRolePermissions(Number(selectedRole));
    } else {
      setSelectedPermissions([]);
    }
  }, [selectedRole]);

  async function loadRoles() {
    try {
      const data = await getRoles();
      if (data) setRoles(data);
    } catch (err) {
      console.error("Error loading roles:", err);
    }
  }

  async function loadPermissions() {
    try {
      const data = await getAllPermissions();
      if (data) setPermissions(data);
    } catch (err) {
      console.error("Error loading permissions:", err);
    }
  }

  async function loadRolePermissions(roleId: number) {
    try {
      const data = await getRolePermissionIds(roleId);
      const ids = data.map((item: any) => item.permission_id);
      setSelectedPermissions(ids);
    } catch (err) {
      console.error("Error loading role permissions:", err);
    }
  }

  async function togglePermission(permissionId: number) {
    if (selectedRole === "") return;

    setTogglingId(permissionId);
    const checked = selectedPermissions.includes(permissionId);
    
    // LOGGING: Check what we are sending
    console.log("Toggling Permission:", { 
        roleId: Number(selectedRole), 
        permissionId, 
        action: checked ? "REMOVE" : "ASSIGN" 
    });

    try {
      if (checked) {
        await removePermission(Number(selectedRole), permissionId);
        setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId));
      } else {
        await assignPermission(Number(selectedRole), permissionId);
        setSelectedPermissions((prev) => [...prev, permissionId]);
      }
    } catch (err) {
      console.error("DEBUG ERROR:", err); // This will show the real database error
      alert("Error: Check console for database error details.");
    } finally {
      setTogglingId(null);
    }
  }
  return (
    <div style={{ padding: 20 }}>
      <h2>Role Permissions</h2>

      <div style={{ marginTop: 25, marginBottom: 25 }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
          Select Role
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value === "" ? "" : Number(e.target.value))}
          style={{ width: "100%", maxWidth: 350, padding: 10, borderRadius: 8 }}
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.role_name}
            </option>
          ))}
        </select>
      </div>

      {selectedRole !== "" && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Permission</th>
                <th>Description</th>
                <th>Assigned</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={permission.id}>
                  <td>{permission.permission_name}</td>
                  <td>{permission.description}</td>
                  <td>
                    {togglingId === permission.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Switch
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        color="primary"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}