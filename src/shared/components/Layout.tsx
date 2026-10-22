// import { useState } from 'react'
// import type { ReactNode } from 'react'
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   IconButton,
//   Box,
//   Container,
//   Drawer,
//   useMediaQuery,
//   useTheme,
// } from '@mui/material'
// import LogoutIcon from '@mui/icons-material/Logout'
// import SettingsIcon from '@mui/icons-material/Settings'
// import MenuIcon from '@mui/icons-material/Menu'
// import { useAuthContext } from '../../features/auth/AuthContext'
// import { useNavigate } from 'react-router-dom'
// import { MulyamLogoSmall } from './MulyamLogo'
// import { AppNavigation } from '../auth/AppNavigation'

// interface LayoutProps {
//   children: ReactNode
//   maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | false
// }

// const SIDEBAR_WIDTH = 252

// export function Layout({ children, maxWidth = 'sm' }: LayoutProps) {
//   const { signOut } = useAuthContext()
//   const navigate = useNavigate()
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'))
//   const [mobileNavOpen, setMobileNavOpen] = useState(false)

//   // async function handleLogout() {
//   //   await signOut()
//   //   window.location.replace('/')
//   // }
//     function handleLogout() {
//     navigate('/auth/zoho-logout')
//   }

//   const sidebarContent = (
//     <Box
//       sx={{
//         height: '100%',
//         display: 'flex',
//         flexDirection: 'column',
//         bgcolor: 'white',
//       }}
//     >
//       <Box
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: 1,
//           px: 2.5,
//           py: 2.4,
//           cursor: 'pointer',
//           borderBottom: '1px solid #E5E7EB',
//         }}
//         onClick={() => {
//           navigate('/dashboard')
//           setMobileNavOpen(false)
//         }}
//       >
//         <MulyamLogoSmall />
//         <Typography sx={{ color: '#004B8B', fontWeight: 800, fontSize: 19 }}>
//           Mulyam
//         </Typography>
//       </Box>

//       <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }} onClick={() => setMobileNavOpen(false)}>
//         <AppNavigation />
//       </Box>
//     </Box>
//   )

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF', display: 'flex' }}>
//       {isMobile ? (
//         <Drawer
//           variant="temporary"
//           open={mobileNavOpen}
//           onClose={() => setMobileNavOpen(false)}
//           ModalProps={{ keepMounted: true }}
//           sx={{
//             '& .MuiDrawer-paper': {
//               width: SIDEBAR_WIDTH,
//               boxSizing: 'border-box',
//             },
//           }}
//         >
//           {sidebarContent}
//         </Drawer>
//       ) : (
//         <Box
//           component="nav"
//           sx={{
//             width: SIDEBAR_WIDTH,
//             flexShrink: 0,
//             position: 'sticky',
//             top: 0,
//             height: '100vh',
//             borderRight: '1px solid #E5E7EB',
//           }}
//         >
//           {sidebarContent}
//         </Box>
//       )}

//       <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
//         <AppBar
//           position="sticky"
//           elevation={0}
//           sx={{
//             bgcolor: 'white',
//             borderBottom: '1px solid #E5E7EB',
//           }}
//         >
//           <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
//             {isMobile && (
//               <IconButton
//                 onClick={() => setMobileNavOpen(true)}
//                 sx={{ color: '#6B7280', mr: 1 }}
//                 title="Menu"
//               >
//                 <MenuIcon sx={{ fontSize: 22 }} />
//               </IconButton>
//             )}

//             <Box sx={{ flex: 1 }} />

//             <IconButton onClick={() => navigate('/settings')} sx={{ color: '#6B7280', mr: 0.5 }} title="Settings">
//               <SettingsIcon sx={{ fontSize: 22 }} />
//             </IconButton>

//             <IconButton onClick={handleLogout} sx={{ color: '#6B7280' }} title="Logout">
//               <LogoutIcon sx={{ fontSize: 22 }} />
//             </IconButton>
//           </Toolbar>
//         </AppBar>

//         {/* FIX: MUI's Container keeps its own max-width/centering logic
//             even when maxWidth={false} is passed in some setups, which is
//             what was leaving a big empty gap on the right. When a page
//             explicitly asks for maxWidth={false}, render a plain full-width
//             Box instead of Container so nothing can re-impose a cap. Pages
//             using the default maxWidth="sm" keep using Container as before. */}
//         {maxWidth === false ? (
//           <Box
//             sx={{
//               width: '100%',
//               maxWidth: '100%',
//               boxSizing: 'border-box',
//               py: 3,
//               px: { xs: 1, sm: 1.5 },
//               flex: 1,
//             }}
//           >
//             {children}
//           </Box>
//         ) : (
//           <Container maxWidth={maxWidth} sx={{ py: 3, px: { xs: 2, sm: 3 }, flex: 1 }}>
//             {children}
//           </Container>
//         )}
//       </Box>
//     </Box>
//   )
// }
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import { useNavigate } from 'react-router-dom'
import { MulyamLogoSmall } from './MulyamLogo'
import { AppNavigation } from '../auth/AppNavigation'

interface LayoutProps {
  children: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | false
}

const SIDEBAR_WIDTH = 252

export function Layout({ children, maxWidth = 'sm' }: LayoutProps) {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  function handleLogout() {
    navigate('/auth/zoho-logout')
  }

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2.5,
          py: 2.4,
          cursor: 'pointer',
          borderBottom: '1px solid #E5E7EB',
        }}
        onClick={() => {
          navigate('/dashboard')
          setMobileNavOpen(false)
        }}
      >
        <MulyamLogoSmall />
        <Typography sx={{ color: '#004B8B', fontWeight: 800, fontSize: 19 }}>
          Mulyam
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }} onClick={() => setMobileNavOpen(false)}>
        <AppNavigation />
      </Box>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF', display: 'flex' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Box
          component="nav"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            borderRight: '1px solid #E5E7EB',
          }}
        >
          {sidebarContent}
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'white',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
            {isMobile && (
              <IconButton
                onClick={() => setMobileNavOpen(true)}
                sx={{ color: '#6B7280', mr: 1 }}
                title="Menu"
              >
                <MenuIcon sx={{ fontSize: 22 }} />
              </IconButton>
            )}

            <Box sx={{ flex: 1 }} />

            <IconButton onClick={() => navigate('/settings')} sx={{ color: '#6B7280', mr: 0.5 }} title="Settings">
              <SettingsIcon sx={{ fontSize: 22 }} />
            </IconButton>

            <IconButton onClick={handleLogout} sx={{ color: '#6B7280' }} title="Logout">
              <LogoutIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* FIX: MUI's Container keeps its own max-width/centering logic
            even when maxWidth={false} is passed in some setups, which is
            what was leaving a big empty gap on the right. When a page
            explicitly asks for maxWidth={false}, render a plain full-width
            Box instead of Container so nothing can re-impose a cap. Pages
            using the default maxWidth="sm" keep using Container as before. */}
        {maxWidth === false ? (
          <Box
            sx={{
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              py: 3,
              px: { xs: 1, sm: 1.5 },
              flex: 1,
            }}
          >
            {children}
          </Box>
        ) : (
          <Container maxWidth={maxWidth} sx={{ py: 3, px: { xs: 2, sm: 3 }, flex: 1 }}>
            {children}
          </Container>
        )}
      </Box>
    </Box>
  )
}