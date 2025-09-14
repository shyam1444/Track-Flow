import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, addUserData, updateUserData, deleteUserData } from '../utils/userStorage';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OrderList from './OrderList';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface Order {
  id: string;
  lead_id: string;
  status: string;
  dispatch_date?: string;
  tracking_info?: string;
  documents?: string[];
}

interface Lead {
  id: string;
  name: string;
}

const statuses = ['Order Received', 'In Development', 'Ready to Dispatch', 'Dispatched'];

const OrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    status: 'Order Received',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null); // orderId being updated
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastImportInfo, setLastImportInfo] = useState<{imported: number, skipped: number} | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchLeads();
  }, [user]);

  const fetchOrders = () => {
    if (user?.id) {
      const userOrders = getUserData(user.id, 'orders');
      setOrders(userOrders);
    }
  };

  const fetchLeads = () => {
    if (user?.id) {
      const userLeads = getUserData(user.id, 'leads');
      setLeads(userLeads);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newOrder.lead_id) return;
    
    try {
      addUserData(user.id, 'orders', {
        lead_id: newOrder.lead_id,
        status: newOrder.status || 'Order Received',
        dispatch_date: newOrder.dispatch_date,
        tracking_info: newOrder.tracking_info
      });
      
      setOpen(false);
      setNewOrder({ status: 'Order Received' });
      fetchOrders();
      setSnackbar({ open: true, message: 'Order created successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error creating order.', severity: 'error' });
      console.error('Error creating order:', error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setStatusLoading(orderId);
    try {
      const response = await fetch(`http://localhost:8000/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchOrders();
        setSnackbar({ open: true, message: 'Order status updated.', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to update order status.', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating order status.', severity: 'error' });
    }
    setStatusLoading(null);
  };

  const handleDetailsUpdate = () => {
    if (!selectedOrder || !user?.id) return;

    try {
      updateUserData(user.id, 'orders', selectedOrder.id, {
        status: selectedOrder.status,
        dispatch_date: selectedOrder.dispatch_date,
        tracking_info: selectedOrder.tracking_info
      });
      
      setDetailsOpen(false);
      fetchOrders();
      setSnackbar({ open: true, message: 'Order updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating order.', severity: 'error' });
      console.error('Error updating order details:', error);
    }
  };

  const handleDeleteOrder = () => {
    if (!selectedOrder || !user?.id) return;
    setDeleteLoading(true);
    
    try {
      deleteUserData(user.id, 'orders', selectedOrder.id);
      setDetailsOpen(false);
      fetchOrders();
      setSnackbar({ open: true, message: 'Order deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting order.', severity: 'error' });
    }
    setDeleteLoading(false);
    setConfirmDelete(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !selectedOrder?.id) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('document_type', 'order');
    formData.append('document_id', selectedOrder.id);

    try {
      const response = await fetch('http://localhost:8000/upload_document', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        fetchOrders();
        setSelectedFile(null);
      } else {
        console.error('Error uploading document:', response.status);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleDeleteDocument = async (documentUrl: string) => {
    if (!selectedOrder?.id || !documentUrl) return;

    try {
      const response = await fetch('http://localhost:8000/delete_document', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_type: 'order',
          document_id: selectedOrder.id,
          file_path: documentUrl, // Pass the full storage path/URL
        }),
      });

      if (response.ok) {
        console.log('Document deleted successfully');
        // Update the selectedOrder state by removing the deleted document
        setSelectedOrder(prev => {
          if (!prev) return null;
          const updatedDocuments = prev.documents?.filter(doc => doc !== documentUrl) || [];
          return { ...prev, documents: updatedDocuments };
        });
        fetchOrders(); // Refresh the order list in the main component
      } else {
        console.error('Error deleting document:', response.status);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

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
        fetchOrders();
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

  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.name : 'Unknown Lead';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Order Management
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Add New Order
        </Button>
      </Box>
      <Paper sx={{ p: 2 }}>
        <OrderList
          orders={orders}
          loading={false}
          error={null}
          fetchOrders={fetchOrders}
          onOrderSelected={(order) => { setSelectedOrder(order); setDetailsOpen(true); }}
        />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Order</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                fullWidth
                label="Lead"
                value={newOrder.lead_id || ''}
                onChange={(e) => setNewOrder({ ...newOrder, lead_id: e.target.value })}
                required
              >
                {leads.map((lead) => (
                  <MenuItem key={lead.id} value={lead.id}>
                    {lead.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Dispatch Date"
                type="date"
                value={newOrder.dispatch_date || ''}
                onChange={(e) => setNewOrder({ ...newOrder, dispatch_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Tracking Info"
                value={newOrder.tracking_info || ''}
                onChange={(e) => setNewOrder({ ...newOrder, tracking_info: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Order
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Order ID"
                value={selectedOrder.id}
                disabled
                fullWidth
              />
              <TextField
                label="Lead"
                value={getLeadName(selectedOrder.lead_id)}
                disabled
                fullWidth
              />
              <TextField
                select
                label="Status"
                value={selectedOrder.status}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                fullWidth
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Dispatch Date"
                type="date"
                value={selectedOrder.dispatch_date || ''}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, dispatch_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Tracking Info"
                value={selectedOrder.tracking_info || ''}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, tracking_info: e.target.value })}
                fullWidth
              />

            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Cancel</Button>
          <Button onClick={handleDetailsUpdate} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this order? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDeleteOrder} color="error" variant="contained" disabled={deleteLoading} startIcon={deleteLoading ? <CircularProgress size={18} /> : null}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
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

export default OrderManagement;