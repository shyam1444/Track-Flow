import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { Lead } from '../types/lead';

interface LeadDetailsModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null; // Pass the selected lead data
  onLeadUpdated: () => void; // Callback to refresh lead list
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function LeadDetailsModal({ open, onClose, lead, onLeadUpdated }: LeadDetailsModalProps) {
  const [editedLead, setEditedLead] = useState<Lead | null>(lead);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleUpdateLead = async () => {
    if (!editedLead) return;

    // Exclude documents field from the update payload as documents are handled separately
    const { documents, ...updatePayload } = editedLead;

    try {
      const response = await fetch(`${API_BASE_URL}/leads/${editedLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        onClose(); // Close modal on success
        onLeadUpdated(); // Refresh lead list
      } else {
        console.error('Error updating lead:', response.status);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = async () => {
    if (!editedLead?.id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/leads/${editedLead.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onClose(); // Close modal on success
        onLeadUpdated(); // Refresh lead list
      } else {
        console.error('Error deleting lead:', response.status);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    } finally {
      setEditedLead(null); // Clear selected lead
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{lead ? 'Edit Lead' : 'Lead Details'}</DialogTitle>
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

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Documents</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="contained" component="label">
                Select File
                <input type="file" hidden onChange={handleFileSelect} style={{ display: 'none' }} />
              </Button>
              {selectedFile && <Typography variant="body2">{selectedFile.name}</Typography>}
              <Button
                variant="outlined"
                onClick={handleUploadDocument}
                disabled={!selectedFile || !editedLead?.id}
                startIcon={<CloudUploadIcon />}
              >
                Upload
              </Button>
            </Box>

            {editedLead.documents && editedLead.documents.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Uploaded Documents:</Typography>
                <List dense>
                  {editedLead.documents.map((docUrl, index) => (
                    <ListItem key={index} secondaryAction={
                       <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDocument(docUrl)}>
                         <DeleteIcon />
                       </IconButton>
                    }>
                      <InsertDriveFileIcon sx={{ mr: 1 }} />
                      <ListItemText primary={
                        <Typography component="a" href={docUrl} target="_blank" rel="noopener noreferrer">
                          {docUrl.split('/').pop()}
                        </Typography>
                      } />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

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
        <Button onClick={handleUpdateLead} variant="contained" color="primary" disabled={!editedLead}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LeadDetailsModal; 