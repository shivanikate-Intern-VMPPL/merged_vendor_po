import { useState } from 'react'
import { Box, Tabs, Tab, IconButton, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../shared/components/Layout'
import { Roles } from './Roles'
import { Permissions } from './Permissions'
import { RolePermissions } from './RolePermissions'
import { Users } from './Users'

export function RbacManagement() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

  return (
    <Layout maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{ color: '#004B8B' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E' }}>
          Manage Users & Roles
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid #E5E7EB' }}
      >
        <Tab label="Users" />
        <Tab label="Roles" />
        <Tab label="Permissions" />
        <Tab label="Role Permissions" />
      </Tabs>

      {tab === 0 && <Users />}
      {tab === 1 && <Roles />}
      {tab === 2 && <Permissions />}
      {tab === 3 && <RolePermissions />}
    </Layout>
  )
}