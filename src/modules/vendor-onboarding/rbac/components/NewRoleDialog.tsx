import { useState } from "react";
import { createRole } from "./services/adminRolesService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

interface Props {
    open: boolean;
    onClose: () => void;
    onRoleCreated: () => void;
  }

  export default function NewRoleDialog({
    open,
    onClose,
    onRoleCreated,
  }: Props) {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");

  async function handleSave() {
    try {
      if (!roleName.trim()) {
        alert("Role name is required.");
        return;
      }
  
      await createRole(roleName, description);
  
      alert("Role created successfully.");
  
      setRoleName("");
      setDescription("");
  
      onRoleCreated();
  
      onClose();
  
    } catch (err) {
      console.error(err);
      alert("Failed to create role.");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>

      <DialogTitle>Create New Role</DialogTitle>

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
          label="Description"
          multiline
          rows={3}
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
  onClick={handleSave}
>
  Save
</Button>

      </DialogActions>

    </Dialog>
  );
}