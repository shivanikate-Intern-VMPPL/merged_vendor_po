import { Box } from "@mui/material";
import {
  Group,
  Security,
  Lock,
  AssignmentTurnedIn,
} from "@mui/icons-material";

import StatsCard from "./StatsCard";

interface Props {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  pendingVendors: number;

  onUsersClick?: () => void;
  onRolesClick?: () => void;
  onPermissionsClick?: () => void;
  onPendingClick: () => void;
}

export default function DashboardCards({
  totalUsers,
  totalRoles,
  totalPermissions,
  pendingVendors,
  onUsersClick,
  onRolesClick,
  onPermissionsClick,
  onPendingClick,
}: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          lg: "repeat(4,1fr)",
        },
        gap: 3,
        mb: 4,
      }}
    >
      <Box
        onClick={onUsersClick}
        sx={{
          cursor: onUsersClick ? "pointer" : "default",
          transition: "0.2s",
          "&:hover": {
            transform: onUsersClick ? "scale(1.03)" : "none",
          },
        }}
      >
        <StatsCard
          title="Users"
          value={totalUsers}
          color="#1976d2"
          icon={<Group sx={{ fontSize: 42 }} />}
        />
      </Box>

      <Box
        onClick={onRolesClick}
        sx={{
          cursor: onRolesClick ? "pointer" : "default",
          transition: "0.2s",
          "&:hover": {
            transform: onRolesClick ? "scale(1.03)" : "none",
          },
        }}
      >
        <StatsCard
          title="Roles"
          value={totalRoles}
          color="#2e7d32"
          icon={<Security sx={{ fontSize: 42 }} />}
        />
      </Box>

      <Box
        onClick={onPermissionsClick}
        sx={{
          cursor: onPermissionsClick ? "pointer" : "default",
          transition: "0.2s",
          "&:hover": {
            transform: onPermissionsClick ? "scale(1.03)" : "none",
          },
        }}
      >
        <StatsCard
          title="Permissions"
          value={totalPermissions}
          color="#ed6c02"
          icon={<Lock sx={{ fontSize: 42 }} />}
        />
      </Box>

      <Box
        onClick={onPendingClick}
        sx={{
          cursor: "pointer",
          transition: "0.2s",
          "&:hover": {
            transform: "scale(1.03)",
          },
        }}
      >
        <StatsCard
          title="Pending Vendors"
          value={pendingVendors}
          color="#9c27b0"
          icon={<AssignmentTurnedIn sx={{ fontSize: 42 }} />}
        />
      </Box>
    </Box>
  );
}