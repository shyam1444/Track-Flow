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
  Typography,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  Checkbox,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Lead } from '../types/lead';

interface LeadListProps {
  onLeadUpdated: () => void;
  leads: Lead[];
  fetchLeads: () => Promise<void>;
  onLeadClick: (lead: Lead) => void;
  onLeadDelete?: (lead: Lead) => void;
  loading?: boolean;
  error?: string | null;
  onAddLead?: () => void;
}

const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

const LeadList: React.FC<LeadListProps> = ({ onLeadUpdated, leads, fetchLeads, onLeadClick, onLeadDelete, loading, error, onAddLead }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [importing, setImporting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

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
      const res = await fetch('http://localhost:8000/import/leads', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: `Imported ${data.imported} leads, Skipped ${data.skipped} rows.`, severity: 'success' });
        fetchLeads();
        onLeadUpdated();
      } else {
        setSnackbar({ open: true, message: data.error ? data.error : 'Import failed.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Import failed.', severity: 'error' });
    }
    setImporting(false);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(leads.map((lead) => lead.id));
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
    setActionLoading(true);
    let deleted = 0;
    for (const id of selected) {
      try {
        const res = await fetch(`http://localhost:8000/leads/${id}`, { method: 'DELETE' });
        if (res.ok) deleted++;
      } catch {}
    }
    setSnackbar({ open: true, message: `Deleted ${deleted} leads.`, severity: 'success' });
    setSelected([]);
    fetchLeads();
    setActionLoading(false);
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
          Import Leads
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
          disabled={selected.length === 0 || actionLoading}
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < leads.length}
                  checked={leads.length > 0 && selected.length === leads.length}
                  onChange={handleSelectAll}
                  inputProps={{ 'aria-label': 'select all leads' }}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Created At</TableCell>
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
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
                    No leads available.
                  </Typography>
                  {onAddLead && (
                    <Button variant="contained" color="primary" onClick={onAddLead}>
                      Add New Lead
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id} selected={selected.includes(lead.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(lead.id)}
                      onChange={() => handleSelect(lead.id)}
                      inputProps={{ 'aria-label': `select lead ${lead.name}` }}
                    />
                  </TableCell>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.contact}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.stage}</TableCell>
                  <TableCell>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => onLeadClick(lead)}><EditIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
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

export default LeadList;