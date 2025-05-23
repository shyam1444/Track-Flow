import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Lead } from '../types/lead';

interface LeadListProps {
  onLeadUpdated: () => void;
  leads: Lead[];
  fetchLeads: () => Promise<void>;
  onLeadClick: (lead: Lead) => void;
}

const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

const LeadList: React.FC<LeadListProps> = ({ onLeadUpdated, leads, fetchLeads, onLeadClick }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLead(null);
  };

  const handleStageChange = async (newStage: string) => {
    if (!selectedLead) return;

    try {
      const response = await fetch(`http://localhost:8000/leads/${selectedLead.id}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (response.ok) {
        fetchLeads();
        onLeadUpdated();
      }
    } catch (error) {
      console.error('Error updating lead stage:', error);
    }

    handleMenuClose();
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;

    try {
      const response = await fetch(`http://localhost:8000/leads/${selectedLead.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchLeads(); // Refresh leads after deletion
        onLeadUpdated();
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }

    handleMenuClose();
  };

  return (
    <Box>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="subtitle1" color="textSecondary">
                    No leads available.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.contact}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.stage}</TableCell>
                  <TableCell>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, lead)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {stages.map((stage) => (
          <MenuItem
            key={stage}
            onClick={() => handleStageChange(stage)}
            disabled={selectedLead?.stage === stage}
          >
            Move to {stage}
          </MenuItem>
        ))}
        <MenuItem onClick={handleDeleteLead} sx={{ color: 'error.main' }}>
          Delete Lead
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LeadList;