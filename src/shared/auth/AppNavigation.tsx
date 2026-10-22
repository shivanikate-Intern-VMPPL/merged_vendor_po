import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DownloadIcon from '@mui/icons-material/Download'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import StoreIcon from '@mui/icons-material/Store'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import HistoryIcon from '@mui/icons-material/History'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { RoleGuard } from './RoleGuard'
import { ROUTES } from '../../app/config/constants'

// Route of the "Single PO > View Synced" page.
const SINGLE_PO_SYNCED_ROUTE = '/purchase-orders/synced'

// Child routes that live "under" Bulk Purchase Order.
const BULK_PO_CHILD_ROUTES = [
  ROUTES.PURCHASE_ORDERS_DRAFTS,
  ROUTES.PURCHASE_ORDERS_REVIEW,
  ROUTES.PURCHASE_ORDERS_SYNCED,
]

// Child routes that live "under" SinglePO.
const SINGLE_PO_CHILD_ROUTES = [SINGLE_PO_SYNCED_ROUTE]

export function AppNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  // Collapsible section states — default open so everything is readily reachable
  const [poOpen, setPoOpen] = useState(true)
  const [voOpen, setVoOpen] = useState(true)

  // Exact-match for path (ignoring search params for PO routes)
  function isActive(path: string) {
    return location.pathname === path
  }

  function isVoTabActive(tab: string | null) {
    if (!location.pathname.startsWith('/vendor-onboarding')) return false
    const params = new URLSearchParams(location.search)
    const currentTab = params.get('tab')
    if (tab === null) {
      return !currentTab || currentTab === 'home'
    }
    return currentTab === tab
  }

  function isChildOfBulkPoActive() {
    return BULK_PO_CHILD_ROUTES.some(
      (childPath) => location.pathname === childPath
    )
  }

  function isChildOfSinglePoActive() {
    return SINGLE_PO_CHILD_ROUTES.some(
      (childPath) => location.pathname === childPath
    )
  }

  const navItemSx = (path: string) => ({
    borderRadius: 1.5,
    mb: 0.5,
    bgcolor: isActive(path) ? '#E8F5E9' : 'transparent',
    color: isActive(path) ? '#2e7d32' : 'text.primary',
    '&:hover': { bgcolor: '#F1F8E9' },
  })

  const voNavItemSx = (tab: string | null) => ({
    borderRadius: 1.5,
    mb: 0.5,
    bgcolor: isVoTabActive(tab) ? '#E3F2FD' : 'transparent',
    color: isVoTabActive(tab) ? '#0e4a7b' : 'text.primary',
    '&:hover': { bgcolor: '#E3F2FD' },
  })

  // Style for a parent item that has child pages (Bulk Purchase Order and SinglePO)
  const parentNavItemSx = (parentPath: string, onChild: boolean) => {
    const onParent = isActive(parentPath)

    if (onParent) {
      return {
        borderRadius: 1.5,
        mb: 0.5,
        bgcolor: '#E8F5E9',
        color: '#2e7d32',
        '&:hover': { bgcolor: '#F1F8E9' },
      }
    }

    if (onChild) {
      return {
        borderRadius: 1.5,
        mb: 0.5,
        bgcolor: 'transparent',
        color: '#2e7d32',
        borderLeft: '3px solid #2e7d32',
        pl: '13px',
        '&:hover': { bgcolor: '#F1F8E9' },
      }
    }

    return {
      borderRadius: 1.5,
      mb: 0.5,
      bgcolor: 'transparent',
      color: 'text.primary',
      '&:hover': { bgcolor: '#F1F8E9' },
    }
  }

  // Child items get a slight indent
  const childNavItemSx = (path: string) => ({
    borderRadius: 1.5,
    mb: 0.5,
    ml: 1,
    bgcolor: isActive(path) ? '#E8F5E9' : 'transparent',
    color: isActive(path) ? '#2e7d32' : 'text.primary',
    '&:hover': { bgcolor: '#F1F8E9' },
  })

  const sectionHeaderSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 1.5,
    py: 0.6,
    cursor: 'pointer',
    userSelect: 'none',
    borderRadius: 1,
    color: '#6B7280',
    '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
  }

  return (
    <Box sx={{ p: 1 }}>
      <List dense disablePadding>

        {/* ── Section: PURCHASE ORDERS (collapsible) ── */}
        <Box
          sx={sectionHeaderSx}
          onClick={() => setPoOpen(!poOpen)}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Purchase Orders
          </Typography>
          {poOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
        </Box>

        <Collapse in={poOpen} timeout="auto" unmountOnExit>
          <List dense disablePadding sx={{ pt: 0.5 }}>
            {/* Dashboard - all roles */}
            <ListItem disablePadding>
              <ListItemButton
                sx={navItemSx('/dashboard')}
                onClick={() => navigate('/dashboard')}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<span style={{ fontSize: 13, fontWeight: 500 }}>Dashboard</span>}
                />
              </ListItemButton>
            </ListItem>

            {/* Single PO - collector + office + admin */}
            <RoleGuard permission="purchase_orders:create">
              <ListItem disablePadding>
                <ListItemButton
                  sx={parentNavItemSx('/purchase-orders/new', isChildOfSinglePoActive())}
                  onClick={() => navigate('/purchase-orders/new')}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <AddShoppingCartIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontSize: 13, fontWeight: 500 }}>SinglePO</span>}
                  />
                </ListItemButton>
              </ListItem>
            </RoleGuard>

            {/* View Synced - child of SinglePO */}
            <RoleGuard permission="purchase_orders:create">
              <ListItem disablePadding>
                <ListItemButton
                  sx={childNavItemSx(SINGLE_PO_SYNCED_ROUTE)}
                  onClick={() => navigate(SINGLE_PO_SYNCED_ROUTE)}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <CheckCircleOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontSize: 13, fontWeight: 500 }}>View Synced</span>}
                  />
                </ListItemButton>
              </ListItem>
            </RoleGuard>

            {/* Bulk Purchase Order */}
            <RoleGuard permission="purchase_orders:create">
              <ListItem disablePadding>
                <ListItemButton
                  sx={parentNavItemSx(ROUTES.PURCHASE_PLANNING, isChildOfBulkPoActive())}
                  onClick={() => navigate(ROUTES.PURCHASE_PLANNING)}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <LocalShippingIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontSize: 13, fontWeight: 500 }}>Bulk Purchase Order</span>}
                  />
                </ListItemButton>
              </ListItem>
            </RoleGuard>

            {/* View Drafts - child of Bulk Purchase Order */}
            <RoleGuard permission="purchase_orders:create">
              <ListItem disablePadding>
                <ListItemButton
                  sx={childNavItemSx(ROUTES.PURCHASE_ORDERS_DRAFTS)}
                  onClick={() => navigate(ROUTES.PURCHASE_ORDERS_DRAFTS)}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <DescriptionOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontSize: 13, fontWeight: 500 }}>View Drafts</span>}
                  />
                </ListItemButton>
              </ListItem>
            </RoleGuard>

            {/* Review Orders - child of Bulk Purchase Order */}
            <RoleGuard permission="purchase_orders:create">
              <ListItem disablePadding>
                <ListItemButton
                  sx={childNavItemSx(ROUTES.PURCHASE_ORDERS_REVIEW)}
                  onClick={() => navigate(ROUTES.PURCHASE_ORDERS_REVIEW)}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <FlashOnIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontSize: 13, fontWeight: 500 }}>ReviewOrders</span>}
                  />
                </ListItemButton>
              </ListItem>
            </RoleGuard>

            {/* View Synced - child of Bulk Purchase Order */}
            <RoleGuard permission="purchase_orders:create">
              <ListItem disablePadding>
                <ListItemButton
                  sx={childNavItemSx(ROUTES.PURCHASE_ORDERS_SYNCED)}
                  onClick={() => navigate(ROUTES.PURCHASE_ORDERS_SYNCED)}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <CheckCircleOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontSize: 13, fontWeight: 500 }}>View Synced</span>}
                  />
                </ListItemButton>
              </ListItem>
            </RoleGuard>

            {/* Export CSV - office + admin only */}
            <RoleGuard permission="export:csv">
              <ListItem disablePadding>
                <ListItemButton
                  sx={navItemSx('/export')}
                  onClick={() => navigate('/export')}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <DownloadIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ fontSize: 13, fontWeight: 500 }}>ExportCSV</span>}
                  />
                </ListItemButton>
              </ListItem>
            </RoleGuard>
          </List>
        </Collapse>

        <Divider sx={{ my: 1.5 }} />

        {/* ── Section: VENDOR ONBOARDING (collapsible) ── */}
        <Box
          sx={sectionHeaderSx}
          onClick={() => setVoOpen(!voOpen)}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Vendor Onboarding
          </Typography>
          {voOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
        </Box>

        <Collapse in={voOpen} timeout="auto" unmountOnExit>
          <List dense disablePadding sx={{ pt: 0.5 }}>
            {/* Vendor Portal Home */}
            <ListItem disablePadding>
              <ListItemButton
                sx={voNavItemSx(null)}
                onClick={() => navigate('/vendor-onboarding')}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <StoreIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<span style={{ fontSize: 13, fontWeight: 500 }}>Vendor Portal</span>}
                />
              </ListItemButton>
            </ListItem>

            {/* New Vendor Form */}
            <ListItem disablePadding>
              <ListItemButton
                sx={voNavItemSx('new')}
                onClick={() => navigate('/vendor-onboarding?tab=new')}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <PersonAddAlt1Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<span style={{ fontSize: 13, fontWeight: 500 }}>New Vendor</span>}
                />
              </ListItemButton>
            </ListItem>

            {/* Approve Forms */}
            <ListItem disablePadding>
              <ListItemButton
                sx={voNavItemSx('approve')}
                onClick={() => navigate('/vendor-onboarding?tab=approve')}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <FactCheckIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<span style={{ fontSize: 13, fontWeight: 500 }}>Approve Forms</span>}
                />
              </ListItemButton>
            </ListItem>

            {/* Approval History */}
            <ListItem disablePadding>
              <ListItemButton
                sx={voNavItemSx('history')}
                onClick={() => navigate('/vendor-onboarding?tab=history')}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <HistoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<span style={{ fontSize: 13, fontWeight: 500 }}>Approval History</span>}
                />
              </ListItemButton>
            </ListItem>

            {/* Users & Roles (VO Admin) */}
            <ListItem disablePadding>
              <ListItemButton
                sx={voNavItemSx('admin')}
                onClick={() => navigate('/vendor-onboarding?tab=admin')}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <AdminPanelSettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<span style={{ fontSize: 13, fontWeight: 500 }}>Manage Users & Roles</span>}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>

        {/* ── Section: ADMIN (PO Manager Admin) ── */}
        <RoleGuard permission="admin:panel">
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: '#6B7280',
                px: 1.5,
                mb: 0.5,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Admin
            </Typography>
            <ListItem disablePadding>
              <ListItemButton
                sx={navItemSx('/admin/users')}
                onClick={() => navigate('/admin/users')}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <AdminPanelSettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<span style={{ fontSize: 13, fontWeight: 500 }}>Manage Users</span>}
                />
              </ListItemButton>
            </ListItem>
          </>
        </RoleGuard>

      </List>
    </Box>
  )
}