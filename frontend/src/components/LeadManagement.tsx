import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, addUserData, updateUserData, deleteUserData } from '../utils/userStorage';
import {
  Box,
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import LeadForm from './LeadForm';
import LeadList from './LeadList';
import LeadDetailsModal from './LeadDetailsModal';
import { Lead } from '../types/lead';

const LeadManagement = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = () => {
    if (user?.id) {
      const userLeads = getUserData(user.id, 'leads');
      setLeads(userLeads);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const handleLeadAdded = (leadData: { name: string; email: string; phone: string; company?: string; notes?: string; follow_up_date?: string }) => {
    if (!user?.id) return;
    
    try {
      const newLead = addUserData(user.id, 'leads', {
        name: leadData.name,
        email: leadData.email,
        contact: leadData.phone,
        company: leadData.company || '',
        follow_up_date: leadData.follow_up_date || null,
        notes: leadData.notes || '',
        status: 'New'
      });
      
      setIsFormOpen(false);
      fetchLeads();
      setSnackbar({ open: true, message: 'Lead added successfully.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error adding lead.', severity: 'error' });
      console.error('Error adding lead:', error);
    }
  };

  const handleDeleteLead = (leadId: string) => {
    if (!user?.id) return;
    
    try {
      deleteUserData(user.id, 'leads', leadId);
      fetchLeads();
      setSnackbar({ open: true, message: 'Lead deleted successfully.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting lead.', severity: 'error' });
      console.error('Error deleting lead:', error);
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLeadForDetails(lead);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedLeadForDetails(null);
    fetchLeads();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lead Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsFormOpen(true)}
        >
          Add New Lead
        </Button>
      </Box>
      <Paper sx={{ p: 2 }}>
        <LeadList
          leads={leads}
          onLeadUpdated={fetchLeads}
          fetchLeads={async () => fetchLeads()}
          onLeadClick={handleLeadClick}
          onLeadDelete={(lead) => handleDeleteLead(lead.id)}
          loading={loading}
          error={error}
          onAddLead={() => setIsFormOpen(true)}
        />
      </Paper>
      <LeadForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleLeadAdded}
      />
      <LeadDetailsModal
        open={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
        lead={selectedLeadForDetails}
        onLeadUpdated={fetchLeads}
      />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeadManagement;