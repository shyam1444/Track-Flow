import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Snackbar, Alert, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface Order {
  id: string;
  lead_id: string;
  status: string;
  dispatch_date?: string;
  tracking_info?: string;
}

interface OrderListProps {
  orders: Order[];
  onOrderSelected: (order: Order) => void;
  onOrderDelete?: (order: Order) => void;
  loading?: boolean;
  error?: string | null;
  onAddOrder?: () => void;
  fetchOrders?: () => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders = [], onOrderSelected, onOrderDelete, loading, error, onAddOrder, fetchOrders }) => {
  const [importing, setImporting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [lastImportInfo, setLastImportInfo] = useState<{imported: number, skipped: number} | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!(file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      setSnackbar({ open: true, message: 'Only CSV or Excel files are accepted.', severity: 'error' });
      return;
    }
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8000/import/orders', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: `Imported ${data.imported} orders, Skipped ${data.skipped} rows.`, severity: 'success' });
        setLastImportInfo({imported: data.imported, skipped: data.skipped});
        if (fetchOrders) fetchOrders();
      } else {
        setSnackbar({ open: true, message: data.error ? data.error : 'Import failed.', severity: 'error' });
        setLastImportInfo(null);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Import failed.', severity: 'error' });
      setLastImportInfo(null);
    }
    setImporting(false);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(orders.map((order) => order.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('http://localhost:8000/orders/bulk_delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: selected }),
      });
      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: `Deleted ${data.deleted} orders.${data.not_found.length ? ' Not found: ' + data.not_found.join(', ') : ''}`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.error || 'Bulk delete failed.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Bulk delete failed.', severity: 'error' });
    }
    setSelected([]);
    if (fetchOrders) fetchOrders();
    setDeleteLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFileIcon />}
          disabled={importing}
        >
          Import Orders
          <input
            type="file"
            accept=".csv,.xlsx"
            hidden
            onChange={handleImport}
          />
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={selected.length === 0 || deleteLoading}
          onClick={handleDeleteSelected}
        >
          {deleteLoading ? <CircularProgress size={18} /> : 'Delete Selected'}
        </Button>
      </Box>
      <Paper sx={{ overflowX: 'auto', p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < orders.length}
                  checked={orders.length > 0 && selected.length === orders.length}
                  onChange={handleSelectAll}
                  inputProps={{ 'aria-label': 'select all orders' }}
                />
              </TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Lead ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Dispatch Date</TableCell>
              <TableCell>Tracking Info</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="subtitle1" color="error">
                    {error}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
                    No orders found.
                  </Typography>
                  {onAddOrder && (
                    <Button variant="contained" color="primary" onClick={onAddOrder}>
                      Add New Order
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} selected={selected.includes(order.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(order.id)}
                      onChange={() => handleSelect(order.id)}
                      inputProps={{ 'aria-label': `select order ${order.id}` }}
                    />
                  </TableCell>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.lead_id}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.dispatch_date || 'N/A'}</TableCell>
                  <TableCell>{order.tracking_info || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => onOrderSelected(order)}><EditIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
      {lastImportInfo && (
        <Typography variant="subtitle2" color="success.main" sx={{ mt: 1, mb: 1 }}>
          Last import: Imported {lastImportInfo.imported} orders, Skipped {lastImportInfo.skipped} rows.
        </Typography>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderList; 