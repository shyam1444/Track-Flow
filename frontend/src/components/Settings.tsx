import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Container,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications,
  Palette,
  Email as EmailIcon,
  Sms,
  PushPin,
  NotificationsActive,
  LightMode,
  DarkMode,
  Translate,
} from '@mui/icons-material';

// Define allowed severity types for Alert
import type { AlertColor } from '@mui/material/Alert';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

const Settings = () => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    leadAlerts: true,
    orderUpdates: true,
    weeklyReports: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
    compactMode: false,
    showAnimations: true,
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleNotificationChange = (setting: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [setting]: value }));
  };

  const handleAppearanceChange = (setting: keyof typeof appearance, value: any) => {
    setAppearance(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveSettings = () => {
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ mr: 2 }} />
        Settings
      </Typography>
      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="Notification Settings"
              avatar={<Notifications color="primary" />}
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notifications.emailNotifications}
                      onChange={e => handleNotificationChange('emailNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Sms />
                  </ListItemIcon>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Receive notifications via SMS"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notifications.smsNotifications}
                      onChange={e => handleNotificationChange('smsNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PushPin />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive push notifications in browser"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notifications.pushNotifications}
                      onChange={e => handleNotificationChange('pushNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lead Alerts"
                    secondary="Get notified about new leads"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notifications.leadAlerts}
                      onChange={e => handleNotificationChange('leadAlerts', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Order Updates"
                    secondary="Get notified about order status changes"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notifications.orderUpdates}
                      onChange={e => handleNotificationChange('orderUpdates', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Weekly Reports"
                    secondary="Receive weekly performance reports"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notifications.weeklyReports}
                      onChange={e => handleNotificationChange('weeklyReports', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="Appearance Settings"
              avatar={<Palette color="primary" />}
            />
            <CardContent>
              <FormControl fullWidth margin="normal">
                <InputLabel>Theme</InputLabel>
                <Select
                  value={appearance.theme}
                  onChange={e => handleAppearanceChange('theme', e.target.value)}
                  label="Theme"
                >
                  <MenuItem value="light">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LightMode sx={{ mr: 1 }} />
                      Light
                    </Box>
                  </MenuItem>
                  <MenuItem value="dark">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DarkMode sx={{ mr: 1 }} />
                      Dark
                    </Box>
                  </MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Language</InputLabel>
                <Select
                  value={appearance.language}
                  onChange={e => handleAppearanceChange('language', e.target.value)}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={appearance.compactMode}
                    onChange={e => handleAppearanceChange('compactMode', e.target.checked)}
                  />
                }
                label="Compact Mode"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={appearance.showAnimations}
                    onChange={e => handleAppearanceChange('showAnimations', e.target.checked)}
                  />
                }
                label="Show Animations"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Save Button */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSaveSettings}
        >
          Save All Settings
        </Button>
      </Box>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 