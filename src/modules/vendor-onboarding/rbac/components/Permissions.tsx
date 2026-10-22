import { useEffect, useState } from "react";
import { getAllPermissions } from "./services/adminPermissionService";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField 
} from "@mui/material";
import { supabase } from "../../supabase.js";

interface Permission {
  id: number;
  permission_name: string;
  description: string;
}

export default function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Dialog State
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [editFormData, setEditFormData] = useState({
    permission_name: "",
    description: ""
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setLoading(true);
      const data = await getAllPermissions();
      if (data) {
        setPermissions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------------
  // DELETE HANDLER
  // -------------------------------------------------------------
  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this permission?");
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from("permissions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Refresh the list after successful deletion
      loadPermissions();
    } catch (err: any) {
      console.error("Error deleting permission:", err);
      alert(err.message || "Failed to delete permission.");
    }
  };

  // -------------------------------------------------------------
  // EDIT HANDLERS
  // -------------------------------------------------------------
  const handleOpenEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setEditFormData({
      permission_name: permission.permission_name,
      description: permission.description || ""
    });
    setOpenEditDialog(true);
  };

  const handleCloseEdit = () => {
    setOpenEditDialog(false);
    setEditingPermission(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPermission) return;

    try {
      const { error } = await supabase
        .from("permissions")
        .update({
          permission_name: editFormData.permission_name,
          description: editFormData.description
        })
        .eq("id", editingPermission.id);

      if (error) throw error;

      // Close dialog and refresh list
      handleCloseEdit();
      loadPermissions();
    } catch (err: any) {
      console.error("Error updating permission:", err);
      alert(err.message || "Failed to update permission.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Permissions Management</h2>

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
                <th>Permission</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {permissions.map((permission) => (
                <tr key={permission.id}>
                  <td>{permission.id}</td>
                  <td>{permission.permission_name}</td>
                  <td>{permission.description}</td>
                  <td>
                    {/* ADDED ONCLICK TO EDIT BUTTON */}
                    <button 
                      className="admin-btn edit"
                      onClick={() => handleOpenEdit(permission)}
                    >
                      Edit
                    </button>

                    {/* ADDED ONCLICK TO DELETE BUTTON */}
                    <button 
                      className="admin-btn delete"
                      onClick={() => handleDelete(permission.id)}
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

      {/* -------------------------------------------------------------
       * EDIT PERMISSION DIALOG POPUP
       * ------------------------------------------------------------- */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1565C0" }}>
          Edit Permission
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 3 }}>
          <TextField
            label="Permission Name"
            fullWidth
            variant="outlined"
            value={editFormData.permission_name}
            onChange={(e) => setEditFormData({ ...editFormData, permission_name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editFormData.description}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={handleCloseEdit} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            sx={{ bgcolor: "#1976d2", fontWeight: 600 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}