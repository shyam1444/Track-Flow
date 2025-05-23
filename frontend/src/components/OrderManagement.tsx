import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    status: 'Order Received',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchLeads();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8000/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:8000/leads');
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });
      if (response.ok) {
        setOpen(false);
        setNewOrder({ status: 'Order Received' });
        fetchOrders();
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
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
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDetailsUpdate = async () => {
    if (!selectedOrder) return;

    const { documents, ...updatePayload } = selectedOrder;

    try {
      const response = await fetch(`http://localhost:8000/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });
      if (response.ok) {
        setDetailsOpen(false);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order details:', error);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`http://localhost:8000/orders/${selectedOrder.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDetailsOpen(false);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
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
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Lead</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Dispatch Date</TableCell>
                <TableCell>Tracking Info</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="subtitle1" color="textSecondary">
                      No orders available.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{getLeadName(order.lead_id)}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        size="small"
                      >
                        {statuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>{order.dispatch_date || 'Not dispatched'}</TableCell>
                    <TableCell>{order.tracking_info || 'No tracking info'}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Documents</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="contained" component="label">
                  Select File
                  <input type="file" hidden onChange={handleFileSelect} />
                </Button>
                {selectedFile && <Typography variant="body2">{selectedFile.name}</Typography>}
                <Button
                  variant="outlined"
                  onClick={handleUploadDocument}
                  disabled={!selectedFile || !selectedOrder?.id}
                  startIcon={<CloudUploadIcon />}
                >
                  Upload
                </Button>
              </Box>

              {selectedOrder.documents && selectedOrder.documents.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Uploaded Documents:</Typography>
                  <List dense>
                    {selectedOrder.documents.map((docUrl, index) => (
                      <ListItem key={index} secondaryAction={
                         <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDocument(docUrl)}>
                          <DeleteIcon />
                        </IconButton>
                      }>
                        <InsertDriveFileIcon sx={{ mr: 1 }} />
                        <ListItemText primary={<a href={docUrl} target="_blank" rel="noopener noreferrer">{docUrl.split('/').pop()}</a>} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Cancel</Button>
          <Button onClick={handleDetailsUpdate} variant="contained" color="primary">
            Save Changes
          </Button>
          <Button onClick={handleDeleteOrder} variant="outlined" color="error">
            Delete Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManagement;