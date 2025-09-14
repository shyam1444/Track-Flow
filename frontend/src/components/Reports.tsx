import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Download,
  Refresh,
  FilterList,
  Assessment,
  AttachMoney,
  People,
  Speed,
  BarChart,
  PieChart,
  Analytics,
  Business,
} from '@mui/icons-material';
import { AnalyticsData, ReportFilters, ExportOptions } from '../types/global';

const Reports = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    stages: [],
    statuses: [],
    companies: [],
    products: [],
  });
  const [exportDialog, setExportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/analytics/comprehensive');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/analytics/export?format=${exportOptions.format}&include_charts=${exportOptions.includeCharts}&include_details=${exportOptions.includeDetails}`
      );
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      const data = await response.json();
      setSnackbar({ open: true, message: data.message, severity: 'success' });
      setExportDialog(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Export failed', severity: 'error' });
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" />;
      case 'down':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="action" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box p={3}>
        <Alert severity="info">No analytics data available</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" display="flex" alignItems="center">
          <Analytics sx={{ mr: 2 }} />
          Analytics & Reports
        </Typography>
        <Box>
          <Button variant="outlined" startIcon={<FilterList />} sx={{ mr: 1 }}>
            Filters
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAnalytics} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Download />} onClick={() => setExportDialog(true)}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        {/* Total Leads */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary">Total Leads</Typography>
                  <Typography variant="h4">{analyticsData.leads.total}</Typography>
                  <Typography variant="body2" color="success.main">+15% from last month</Typography>
                </Box>
                <People color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary">Total Orders</Typography>
                  <Typography variant="h4">{analyticsData.orders.total}</Typography>
                  <Typography variant="body2" color="success.main">+12% from last month</Typography>
                </Box>
                <Business color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Conversion Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary">Conversion Rate</Typography>
                  <Typography variant="h4">{analyticsData.leads.conversionRate}%</Typography>
                  <Typography variant="body2" color="success.main">+2.5% from last month</Typography>
                </Box>
                <TrendingUp color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ROI */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary">ROI</Typography>
                  <Typography variant="h4">{analyticsData.costs.roi}%</Typography>
                  <Typography variant="body2" color="success.main">+8% from last month</Typography>
                </Box>
                <AttachMoney color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

             {/* Cost & Performance */}
       <Grid container spacing={3} mb={3} justifyContent="center">
         <Grid item xs={12} md={6}>
           {/* Cost Analytics */}
           <Card>
             <CardHeader title="Cost Analytics" action={<IconButton><BarChart /></IconButton>} />
             <CardContent>
               <Typography variant="h6">Total Costs: ${analyticsData.costs.totalCosts.toLocaleString()}</Typography>
               <Typography variant="body2">Cost per Lead: ${analyticsData.costs.costPerLead}</Typography>
               <Typography variant="body2">Cost per Order: ${analyticsData.costs.costPerOrder}</Typography>
               <Divider sx={{ my: 2 }} />
               <Typography variant="subtitle1">Cost Breakdown</Typography>
               {Object.entries(analyticsData.costs.costBreakdown).map(([key, value]) => (
                 <Box key={key} mb={1}>
                   <Box display="flex" justifyContent="space-between">
                     <Typography variant="body2">{key}</Typography>
                     <Typography variant="body2">${value.toLocaleString()}</Typography>
                   </Box>
                   <LinearProgress
                     variant="determinate"
                     value={(value / analyticsData.costs.totalCosts) * 100}
                     sx={{ height: 8, borderRadius: 4 }}
                   />
                 </Box>
               ))}
               <Divider sx={{ my: 2 }} />
               <Typography variant="subtitle1">Cost Trends</Typography>
               <TableContainer>
                 <Table size="small">
                   <TableHead>
                     <TableRow>
                       <TableCell>Period</TableCell>
                       <TableCell>Cost</TableCell>
                       <TableCell>Trend</TableCell>
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {analyticsData.costs.costTrends.map((trend) => (
                       <TableRow key={trend.period}>
                         <TableCell>{trend.period}</TableCell>
                         <TableCell>${trend.cost.toLocaleString()}</TableCell>
                         <TableCell>{getTrendIcon(trend.trend)}</TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </TableContainer>
             </CardContent>
           </Card>
         </Grid>
       </Grid>

       {/* Lead Analytics */}
       <Grid container spacing={3} mb={3} justifyContent="center">
         <Grid item xs={12} md={6}>
           <Card>
             <CardHeader title="Lead Analytics" action={<IconButton><PieChart /></IconButton>} />
             <CardContent>
               <Typography variant="subtitle1" gutterBottom>Leads by Stage</Typography>
               {Object.entries(analyticsData.leads.byStage).map(([stage, count]) => (
                 <Box key={stage} mb={1}>
                   <Box display="flex" justifyContent="space-between">
                     <Typography variant="body2">{stage}</Typography>
                     <Typography variant="body2">{count}</Typography>
                   </Box>
                   <LinearProgress variant="determinate" value={(count / analyticsData.leads.total) * 100} sx={{ height: 8, borderRadius: 4 }} />
                 </Box>
               ))}
             </CardContent>
           </Card>
         </Grid>
       </Grid>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="normal">
            <InputLabel>Format</InputLabel>
            <Select
              value={exportOptions.format}
              onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as "pdf" | "excel" | "csv" })}
              label="Format"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <input
                  type="checkbox"
                  checked={exportOptions.includeCharts}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeCharts: e.target.checked })}
                />
                <Typography variant="body2">Include Charts</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <input
                  type="checkbox"
                  checked={exportOptions.includeDetails}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeDetails: e.target.checked })}
                />
                <Typography variant="body2">Include Detailed Data</Typography>
              </Box>
            </Box>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleExport}>Export</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports; 
