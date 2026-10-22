import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { supabase } from "../../supabase.js";

interface Props {
  open: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: any;
}

const ZONES = [
  "Institutional Business",
  "Central Procurement",
  "Otur CC",
  "Parner CC",
  "Pune DBFM",
  "Varanasi DBFM",
  "Chatrapati Sambhajinagar",
  "Registered office",
  "Gorakhpur",
  "Bellari",
  "Head Office",
  "Kalamb CC",
  "Kunjirwadi",
  "Delhi",
  "Hyderabad",
  "Lucknow",
  "Bangalore",
  "Chandigarh DC",
  "Fruit GT",
  "Varanasi UP",
  "UP GT",
  "Kanpur",
  "Kanpur DBFM"
];

export default function EditUserDialog({
  open,
  onClose,
  onUserUpdated,
  user,
}: Props) {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [zone, setZone] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmployeeId(user.employee_id || "");
      setZone(user.zone || "");
    }
  }, [user]);

  async function handleSave() {
    try {
      const { error } = await supabase
        .from("Users")
        .update({
          name: name,
          employee_id: employeeId || null,
          zone: zone || null,
        })
        .eq("id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      onUserUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User</DialogTitle>

      <DialogContent>
        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 2, mb: 2 }}
        />
        <TextField
          label="Employee ID"
          fullWidth
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          select
          label="Zone"
          fullWidth
          value={zone}
          onChange={(e) => setZone(e.target.value)}
        >
          <MenuItem value="">
            <em>Select Zone</em>
          </MenuItem>
          {ZONES.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
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