import { Card, CardContent, Typography, Box } from "@mui/material";
import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
}: StatsCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #E5E7EB",
        background: "#fff",
        transition: "all .3s ease",
        overflow: "hidden",

        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 28px rgba(0,0,0,.12)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#6B7280",
              fontSize: {
                xs: 13,
                md: 15,
              },
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontWeight: 800,
              color: "#111827",
              fontSize: {
                xs: 28,
                md: 36,
              },
            }}
          >
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            width: {
              xs: 58,
              md: 70,
            },
            height: {
              xs: 58,
              md: 70,
            },
            borderRadius: "50%",
            background: `${color}15`,
            color: color,

            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            "& svg": {
              fontSize: {
                xs: 32,
                md: 40,
              },
            },
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
}