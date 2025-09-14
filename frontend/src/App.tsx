import React, { useState, useContext } from 'react';
import { Routes, Route, useLocation, Navigate, Link, Outlet } from 'react-router-dom';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  useMediaQuery,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import InsightsIcon from '@mui/icons-material/Insights';
import TimerIcon from '@mui/icons-material/Timer';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import Dashboard from './components/Dashboard';
import LeadManagement from './components/LeadManagement';
import OrderManagement from './components/OrderManagement';
import Tasks from './components/Tasks';
import Reports from './components/Reports';
import TimeTracking from './components/TimeTracking';
import KanbanBoard from './components/KanbanBoard';
import About from './components/About';
import Login from './components/Login';
import Signup from './components/Signup';
import { useAuth } from './contexts/AuthContext';

const drawerWidth = 320; 

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2', contrastText: '#fff' },
    secondary: { main: '#ff4081' },
    background: { default: '#f4f6fb', paper: '#fff' },
    success: { main: '#43a047' },
    warning: { main: '#ffa726' },
    error: { main: '#e53935' },
    info: { main: '#1e88e5' },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { 
      fontWeight: 700, 
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    },
    h2: { 
      fontWeight: 700,
      letterSpacing: '-0.015em',
      lineHeight: 1.25
    },
    h3: { 
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3
    },
    h4: { 
      fontWeight: 600, 
      letterSpacing: '-0.01em',
      lineHeight: 1.35
    },
    h5: { 
      fontWeight: 600,
      lineHeight: 1.4
    },
    h6: { 
      fontWeight: 600,
      lineHeight: 1.5
    },
    button: { 
      textTransform: 'none', 
      fontWeight: 600,
      letterSpacing: '0.01em'
    },
    body1: {
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    body2: {
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      color: 'rgba(0, 0, 0, 0.7)'
    }
  },
  shape: { borderRadius: 14 },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
  },
});

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Leads', icon: <AssignmentIndIcon />, path: '/leads' },
  { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
  { text: 'Kanban', icon: <ViewKanbanIcon />, path: '/kanban' },
  { text: 'Tasks', icon: <AssignmentIcon />, path: '/tasks' },
  { text: 'Time Tracking', icon: <TimerIcon />, path: '/time-tracking' },
  { text: 'Reports', icon: <InsightsIcon />, path: '/reports' },
  { text: 'About', icon: <InfoIcon />, path: '/about' },
];

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return <>{children}</>;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  
  // Get the current route name for the title
  const currentRoute = navItems.find(item => item.path === location.pathname) || navItems[0];
  
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 1 }}>
          TrackFlow CRM
        </Typography>
      </Toolbar>
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path} selected={location.pathname === item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {currentRoute.text}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<LeadManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/time-tracking" element={<TimeTracking />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/about" element={<About />} />
            </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
