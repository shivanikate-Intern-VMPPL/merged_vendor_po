import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { getRoles } from "./services/roleService";
import { assignRoleToUser } from "./services/adminRoleService";

interface Props {
  open: boolean;
  onClose: () => void;
  onRoleUpdated: () => void;
  user: any;
}

export default function AssignRoleDialog({
  open,
  onClose,
  onRoleUpdated,
  user,
}: Props) {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open]);

  async function loadRoles() {
    try {
      const data = await getRoles();
      setRoles(data || []);
    } catch (err) {
      console.error("Failed to load roles:", err);
    }
  }

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || "");
    } else {
      setSelectedRole("");
    }
  }, [user]);

  async function handleSave() {
    try {
      if (!user?.id) {
        console.error("User ID is missing.");
        return;
      }

      if (!selectedRole) {
        console.error("Please select a role.");
        return;
      }

      const selectedRoleData = roles.find(
        (role) => role.role_name === selectedRole
      );

      if (!selectedRoleData) {
        console.error("Selected role was not found.");
        return;
      }

      setSaving(true);

      await assignRoleToUser(
        user.id,
        selectedRoleData.id
      );

      // Refresh the users table
      await onRoleUpdated();

      // Close the dialog
      onClose();

    } catch (err) {
      console.error("Role assignment failed:", err);

    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Assign Role</DialogTitle>

      <DialogContent>

        <p>
          <strong>User:</strong>{" "}
          {user?.name || "-"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user?.email || "-"}
        </p>

        <FormControl
          fullWidth
          sx={{ mt: 2 }}
        >
          <InputLabel id="role-select-label">
            Role
          </InputLabel>

          <Select
            labelId="role-select-label"
            value={selectedRole}
            label="Role"
            onChange={(e) =>
              setSelectedRole(e.target.value)
            }
            disabled={saving}
          >
            {roles.map((role) => (
              <MenuItem
                key={role.id}
                value={role.role_name}
              >
                {role.role_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

      </DialogContent>

      <DialogActions>

        <Button
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !selectedRole}
        >
          {saving ? "Saving..." : "Save"}
        </Button>

      </DialogActions>
    </Dialog>
  );
}