import { useEffect, useState } from "react";
import { getAllRoles } from "./services/adminRolesService";
import NewRoleDialog from "./NewRoleDialog";
import EditRoleDialog from "./EditRoleDialog";
import { deleteRole } from "./services/adminRolesService";

interface Role {
  id: number;
  role_name: string;
  description: string;
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState<any>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      setLoading(true);

      const data = await getAllRoles();

      setRoles(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(role: Role) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${role.role_name}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteRole(role.id);

      alert("Role deleted successfully.");

      loadRoles();
    } catch (err: any) {
      console.error(err);

      alert(err.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2>Roles Management</h2>

        <button
          className="admin-btn new"
          onClick={() => setDialogOpen(true)}
        >
          + New Role
        </button>
      </div>

      {loading ? (
        <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div className="loader"></div>
      </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Role</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.id}</td>

                  <td>{role.role_name}</td>

                  <td>{role.description}</td>

                  <td>
                    <button
                      className="admin-btn edit"
                      onClick={() => {
                        setSelectedRole(role);
                        setEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="admin-btn delete"
                      onClick={() => handleDelete(role)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewRoleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onRoleCreated={loadRoles}
      />

      <EditRoleDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        role={selectedRole}
        onRoleUpdated={loadRoles}
      />
    </div>
  );
}