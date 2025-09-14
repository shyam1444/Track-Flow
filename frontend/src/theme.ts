import { createTheme, ThemeOptions } from '@mui/material/styles';

const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#4F8CFF', // blue
    contrastText: '#fff',
  },
  secondary: {
    main: '#6BE6FF', // aqua
    contrastText: '#181A20',
  },
  background: {
    default: '#F7F9FB',
    paper: 'rgba(255,255,255,0.85)', // glassmorphism
  },
  error: {
    main: '#F87171',
  },
  success: {
    main: '#4ADE80',
  },
  warning: {
    main: '#FFB86B',
  },
  info: {
    main: '#4F8CFF',
  },
  text: {
    primary: '#181A20',
    secondary: '#4F8CFF',
  },
};

const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: '#4F8CFF',
    contrastText: '#fff',
  },
  secondary: {
    main: '#FFB86B',
    contrastText: '#181A20',
  },
  background: {
    default: '#181A20',
    paper: 'rgba(24,26,32,0.85)',
  },
  error: {
    main: '#F87171',
  },
  success: {
    main: '#4ADE80',
  },
  warning: {
    main: '#FFB86B',
  },
  info: {
    main: '#6BE6FF',
  },
  text: {
    primary: '#fff',
    secondary: '#6BE6FF',
  },
};

export const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: mode === 'light' ? lightPalette : darkPalette,
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          background: 'linear-gradient(90deg, #4F8CFF 0%, #6BE6FF 100%)',
          color: '#fff',
          boxShadow: '0 2px 8px 0 rgba(79,140,255,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #4F8CFF 0%, #6BE6FF 100%)',
          boxShadow: '0 2px 8px 0 rgba(79,140,255,0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
  },
});

export const theme = createTheme(getDesignTokens('light')); 