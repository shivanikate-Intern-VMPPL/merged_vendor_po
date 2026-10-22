import { useEffect, useState } from "react";
import { updateRole } from "./services/adminRolesService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  role: any;
  onRoleUpdated: () => void;
}

export default function EditRoleDialog({
  open,
  onClose,
  role,
  onRoleUpdated,
}: Props) {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (role) {
      setRoleName(role.role_name || "");
      setDescription(role.description || "");
    }
  }, [role]);

  async function handleUpdate() {
    try {
      if (!roleName.trim()) {
        alert("Role name is required.");
        return;
      }
  
      await updateRole(
        role.id,
        roleName,
        description
      );
  
      alert("Role updated successfully.");
  
      onRoleUpdated();
  
      onClose();
  
    } catch (err) {
      console.error(err);
      alert("Failed to update role.");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>

      <DialogTitle>Edit Role</DialogTitle>

      <DialogContent>

        <TextField
          fullWidth
          margin="normal"
          label="Role Name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />

        <TextField
          fullWidth
          margin="normal"
          multiline
          rows={3}
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

      </DialogContent>

      <DialogActions>

        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
  variant="contained"
  onClick={handleUpdate}
>
  Update
</Button>

      </DialogActions>

    </Dialog>
  );
}