import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Paper,
} from '@mui/material';
import LeadForm from './LeadForm';
import LeadList from './LeadList';
import LeadKanban from './LeadKanban'; // Import LeadKanban
import LeadDetailsModal from './LeadDetailsModal'; // Import LeadDetailsModal
import { Lead } from '../types/lead'; // Import Lead interface

const LeadManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // State for details modal
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<Lead | null>(null); // State for selected lead
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'kanban'>('list');

  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:8000/leads');
      const data: Lead[] = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleLeadAdded = async (leadData: { name: string; email: string; phone: string; company?: string; notes?: string; follow_up_date?: string }) => {
    const backendPayload = {
      name: leadData.name,
      contact: leadData.phone,
      company: leadData.company,
      follow_up_date: leadData.follow_up_date || null,
      notes: leadData.notes,
    };

    try {
      const response = await fetch('http://localhost:8000/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload),
      });
      if (response.ok) {
        setIsFormOpen(false);
        fetchLeads();
      } else {
        console.error('Error adding lead:', response.status);
      }
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

   const handleLeadStageChange = async (leadId: string, newStage: string) => {
    try {
      const response = await fetch(`http://localhost:8000/leads/${leadId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (response.ok) {
        fetchLeads();
      } else {
        console.error('Error updating lead stage:', response.status);
      }
    } catch (error) {
      console.error('Error updating lead stage:', error);
    }
  };

  const handleLeadClick = (lead: Lead) => { // Handler to open details modal
    setSelectedLeadForDetails(lead);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => { // Handler to close details modal
    setIsDetailsModalOpen(false);
    setSelectedLeadForDetails(null);
    fetchLeads(); // Refresh leads after potential update/delete
  };


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lead Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
           <ButtonGroup variant="contained" aria-label="view toggle button group" sx={{ mr: 2 }}>
            <Button
              onClick={() => setCurrentView('list')}
              variant={currentView === 'list' ? 'contained' : 'outlined'}
            >
              List View
            </Button>
            <Button
              onClick={() => setCurrentView('kanban')}
              variant={currentView === 'kanban' ? 'contained' : 'outlined'}
            >
              Kanban View
            </Button>
          </ButtonGroup>
           <Button
            variant="contained"
            color="primary"
            onClick={() => setIsFormOpen(true)}
          >
            Add New Lead
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        {currentView === 'list' ? (
          <LeadList leads={leads} onLeadUpdated={fetchLeads} fetchLeads={fetchLeads} onLeadClick={handleLeadClick} />
        ) : (
          <LeadKanban leads={leads} onStageChange={handleLeadStageChange} onLeadClick={handleLeadClick} />
        )}
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
    </Box>
  );
};

export default LeadManagement;