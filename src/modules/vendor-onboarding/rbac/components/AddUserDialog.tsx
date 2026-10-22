import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { supabase } from "../../supabase.js";

interface Props {
  open: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export default function AddUserDialog({
  open,
  onClose,
  onUserAdded,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  async function handleSave() {
    if (!name || !email) {
      alert("Name and Email are required.");
      return;
    }

    try {
      const { error } = await supabase.from("Users").insert([
        {
          name: name,
          email: email,
          employee_id: employeeId || null,
        },
      ]);

      if (error) {
        alert(error.message);
        return;
      }

      // Reset and close
      setName("");
      setEmail("");
      setEmployeeId("");
      onUserAdded();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add user.");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New User</DialogTitle>

      <DialogContent>
        <TextField
          label="Name *"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 2, mb: 2 }}
        />
        <TextField
          label="Email (@mulyam.in) *"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Employee ID"
          fullWidth
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}