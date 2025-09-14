import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, updateUserData, deleteUserData } from '../utils/userStorage';
import { Box, Typography, Paper } from '@mui/material';
import LeadKanban from './LeadKanban';
import LeadDetailsModal from './LeadDetailsModal';
import { Lead } from '../types/lead';

const KanbanBoard: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<Lead | null>(null);

  const fetchLeads = () => {
    if (user?.id) {
      const userLeads = getUserData(user.id, 'leads') || [];
      setLeads(Array.isArray(userLeads) ? userLeads : []);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const handleLeadStageChange = (leadId: string, newStage: string) => {
    if (!user?.id) return;
    
    try {
      updateUserData(user.id, 'leads', leadId, { stage: newStage });
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead stage:', error);
    }
  };

  const handleDeleteLead = (leadId: string) => {
    if (!user?.id) return;
    
    try {
      deleteUserData(user.id, 'leads', leadId);
      fetchLeads();
    } catch (error) {
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
          Kanban Board
        </Typography>
      </Box>
      <Paper sx={{ p: 2 }}>
        <LeadKanban
          leads={leads}
          onStageChange={handleLeadStageChange}
          onLeadClick={handleLeadClick}
          // Do not pass onDeleteLead to remove delete option
        />
      </Paper>
      <LeadDetailsModal
        open={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
        lead={selectedLeadForDetails}
        onLeadUpdated={fetchLeads}
      />
    </Box>
  );
};

export default KanbanBoard; 