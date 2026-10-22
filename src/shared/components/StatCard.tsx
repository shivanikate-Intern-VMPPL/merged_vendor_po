import { Paper, Box, Typography, type SvgIconProps } from '@mui/material';
import type { ComponentType } from 'react';

interface StatCardProps {
  icon: ComponentType<SvgIconProps>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  caption: string;
}

export function StatCard({ icon: Icon, iconBg, iconColor, label, value, caption }: StatCardProps) {
  return (
    <Paper sx={{ p: 3, flex: 1, minWidth: 220 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 800 }} color={iconColor === '#16A34A' ? 'primary.main' : 'text.primary'}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {caption}
      </Typography>
    </Paper>
  );
}