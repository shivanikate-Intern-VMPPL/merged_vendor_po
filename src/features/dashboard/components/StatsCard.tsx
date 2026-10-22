import { Paper, Typography, Box } from '@mui/material'
import type { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  iconBgColor?: string
  iconColor?: string
  subtitleColor?: string
}

export function StatsCard({
  title, value, subtitle, icon,
  iconBgColor = '#EEF2FF', iconColor = '#004B8B', subtitleColor = '#00BD67',
}: StatsCardProps) {
  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 3, border: '1px solid #E5E7EB', bgcolor: 'white',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2,
    }}>
      <Box>
        <Typography variant="body2" sx={{ color: '#6B7280', mb: 1.5, fontWeight: 500 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
          <Typography sx={{ fontSize: 36, fontWeight: 700, color: '#0D1B3E', lineHeight: 1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: subtitleColor, fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{
        width: 44, height: 44, borderRadius: 2, bgcolor: iconBgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor, flexShrink: 0,
      }}>
        {icon}
      </Box>
    </Paper>
  )
}