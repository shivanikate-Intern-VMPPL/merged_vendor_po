import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#004B8B' },      // Mulyam navy
    secondary: { main: '#00BD67' },    // Mulyam green
    background: {
      default: '#EEF2FF',
      paper: '#FFFFFF',
    },
    error: { main: '#EF4444' },
    warning: { main: '#FFC400' },      // Mulyam gold
    success: { main: '#00BD67' },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, color: '#0D1B3E' },
    h5: { fontWeight: 700, color: '#0D1B3E' },
    h6: { fontWeight: 600, color: '#0D1B3E' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#EEF2FF',
            '& fieldset': { borderColor: '#E5E7EB' },
            '&:hover fieldset': { borderColor: '#004B8B' },
            '&.Mui-focused fieldset': { borderColor: '#004B8B' },
          },
        },
      },
    },
  },
})