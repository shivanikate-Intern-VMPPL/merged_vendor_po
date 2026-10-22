import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import { getUsers } from "./services/userService";
import { getRoleNameByUserId } from "./services/roleService";
import AssignRoleDialog from "./AssignRoleDialog";
import EditUserDialog from "./EditUserDialog";
import AddUserDialog from "./AddUserDialog";
import { supabase } from "../../supabase.js";

interface User {
  id: number;
  name: string;
  email: string;
  employee_id: string | null;
  zone?: string | null;
  role?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);

      const data = await getUsers();

      if (!data) return;

      const usersWithRoles = await Promise.all(
        data.map(async (user: User) => {
          const role = await getRoleNameByUserId(user.id);

          return {
            ...user,
            role,
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const { error } = await supabase
          .from("Users")
          .delete()
          .eq("id", userId);

        if (error) {
          alert(error.message);
          return;
        }

        loadUsers();
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Failed to delete user.");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Users Management</h2>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          New User
        </Button>
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
                <th>Name</th>
                <th>Email</th>
                <th>Employee ID</th>
                <th>Zone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>

                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>{user.employee_id ?? "-"}</td>

                    <td>{user.zone ?? "-"}</td>

                    <td>{user.role || "-"}</td>

                    <td>
                      <button
                        className="admin-btn edit"
                        onClick={() => {
                          setSelectedUser(user);
                          setEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="admin-btn delete"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>

                      <button
                        className="admin-btn assign"
                        onClick={() => {
                          setSelectedUser(user);
                          setAssignDialogOpen(true);
                        }}
                      >
                        Assign Role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AddUserDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onUserAdded={loadUsers}
      />

      <AssignRoleDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        onRoleUpdated={loadUsers}
        user={selectedUser}
      />

      <EditUserDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onUserUpdated={loadUsers}
        user={selectedUser}
      />
    </div>
  );
}