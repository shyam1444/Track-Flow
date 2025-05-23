import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

interface LeadFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (lead: any) => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    follow_up_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
      follow_up_date: '',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Lead</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              name="phone"
              label="Phone"
              fullWidth
              required
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              name="company"
              label="Company"
              fullWidth
              value={formData.company}
              onChange={handleChange}
            />
            <TextField
              name="follow_up_date"
              label="Follow Up Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.follow_up_date}
              onChange={handleChange}
            />
            <TextField
              name="notes"
              label="Notes"
              fullWidth
              multiline
              rows={4}
              value={formData.notes}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Add Lead
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LeadForm; 