import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  Group,
  Security,
  Lock,
  AssignmentTurnedIn,
} from "@mui/icons-material";

interface Props {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  pendingApprovals: number;
}

export default function AdminDashboard({
  totalUsers,
  totalRoles,
  totalPermissions,
  pendingApprovals,
}: Props) {
  const cards = [
    {
      title: "Users",
      value: totalUsers,
      icon: <Group sx={{ fontSize: 40 }} />,
      color: "#1976d2",
    },
    {
      title: "Roles",
      value: totalRoles,
      icon: <Security sx={{ fontSize: 40 }} />,
      color: "#2e7d32",
    },
    {
      title: "Permissions",
      value: totalPermissions,
      icon: <Lock sx={{ fontSize: 40 }} />,
      color: "#ed6c02",
    },
    {
      title: "Pending Vendors",
      value: pendingApprovals,
      icon: <AssignmentTurnedIn sx={{ fontSize: 40 }} />,
      color: "#9c27b0",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          lg: "repeat(4, 1fr)",
        },
        gap: 3,
        mb: 4,
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.title}
          sx={{
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>

              <Typography
  variant="h4"
  sx={{
    fontWeight: 700,
  }}
>
  {card.value}
</Typography>
            </Box>

            <Box sx={{ color: card.color }}>
              {card.icon}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}