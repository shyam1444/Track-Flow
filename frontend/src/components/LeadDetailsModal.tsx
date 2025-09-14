import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserData, deleteUserData } from '../utils/userStorage';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Lead } from '../types/lead';

interface LeadDetailsModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null; // Pass the selected lead data
  onLeadUpdated: () => void; // Callback to refresh lead list
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function LeadDetailsModal({ open, onClose, lead, onLeadUpdated }: LeadDetailsModalProps) {
  const { user } = useAuth();
  const [editedLead, setEditedLead] = useState<Lead | null>(lead);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setEditedLead(lead);
  }, [lead]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedLead((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !editedLead?.id) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('document_type', 'lead');
    formData.append('document_id', editedLead.id);

    try {
      const response = await fetch(`${API_BASE_URL}/upload_document`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        // A more robust solution would be to fetch the updated lead directly
        onLeadUpdated(); // Refresh lead list
        // Find the updated lead from the list to update the modal state
        // This is a simplification; a better way is to fetch the single lead
        // For now, rely on onLeadUpdated refreshing the parent state and prop
        setSelectedFile(null);
      } else {
        console.error('Error uploading document:', response.status);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleDeleteDocument = async (documentUrl: string) => {
    if (!editedLead?.id || !documentUrl) return;

    try {
      const response = await fetch(`${API_BASE_URL}/delete_document`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_type: 'lead',
          document_id: editedLead.id,
          file_path: documentUrl, // Pass the full storage path/URL
        }),
      });

      if (response.ok) {
        console.log('Document deleted successfully');
        // Update the editedLead state by removing the deleted document
        setEditedLead(prev => {
          if (!prev) return null;
          const updatedDocuments = prev.documents?.filter(doc => doc !== documentUrl) || [];
          return { ...prev, documents: updatedDocuments };
        });
        onLeadUpdated(); // Refresh the lead list in the parent component
      } else {
        console.error('Error deleting document:', response.status);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleUpdateLead = () => {
    if (!editedLead || !user?.id) return;
    setSaving(true);

    try {
      // Update lead using user storage
      updateUserData(user.id, 'leads', editedLead.id, {
        name: editedLead.name,
        contact: editedLead.contact,
        company: editedLead.company,
        stage: editedLead.stage,
        follow_up_date: editedLead.follow_up_date,
        notes: editedLead.notes
      });

      setSnackbar({ open: true, message: 'Lead details updated!', severity: 'success' });
      onClose();
      onLeadUpdated();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating lead.', severity: 'error' });
    }
    setSaving(false);
  };

  const handleDeleteLead = () => {
    if (!editedLead?.id || !user?.id) return;

    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      try {
        deleteUserData(user.id, 'leads', editedLead.id);
        
        setSnackbar({ open: true, message: 'Lead deleted successfully!', severity: 'success' });
        onClose();
        onLeadUpdated();
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting lead.', severity: 'error' });
        console.error('Error deleting lead:', error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon fontSize="medium" />
          Edit Lead
        </Box>
      </DialogTitle>
      <DialogContent>
        {editedLead && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={editedLead.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Contact"
              name="contact"
              value={editedLead.contact}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Company"
              name="company"
              value={editedLead.company || ''}
              onChange={handleChange}
              fullWidth
            />
             <TextField
                label="Stage"
                name="stage"
                select
                value={editedLead.stage}
                onChange={handleChange}
                fullWidth
              >
                 {[ 'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map((stage) => (
                  <MenuItem key={stage} value={stage}>
                    {stage}
                  </MenuItem>
                ))}
              </TextField>
            <TextField
              label="Follow Up Date"
              name="follow_up_date"
              type="date"
              value={editedLead.follow_up_date || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Notes"
              name="notes"
              value={editedLead.notes || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />

          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
         {lead && (
            <Button onClick={handleDeleteLead} variant="outlined" color="error">
              Delete Lead
            </Button>
          )}
        <Button onClick={handleUpdateLead} variant="contained" color="primary" disabled={saving} startIcon={saving ? <CircularProgress size={18} /> : null}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
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
    </Dialog>
  );
}

export default LeadDetailsModal; 