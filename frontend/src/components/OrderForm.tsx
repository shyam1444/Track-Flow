import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

interface Lead {
  id: string;
  name: string;
}

interface OrderFormProps {
  onOrderAdded: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onOrderAdded }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [status, setStatus] = useState('Order Received');
  const [dispatchDate, setDispatchDate] = useState('');
  const [trackingInfo, setTrackingInfo] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Fetch leads to allow selection for the order
    const fetchLeads = async () => {
      try {
        const response = await fetch('http://localhost:8000/leads'); // Assuming your backend runs on port 8000
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Lead[] = await response.json();
        setLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
        // Optionally show an error message
      }
    };

    fetchLeads();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!selectedLeadId) {
      newErrors.lead = 'Lead selection is required';
    }
    // Add other validations if needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const newOrder = {
      lead_id: selectedLeadId,
      status,
      dispatch_date: dispatchDate || undefined,
      tracking_info: trackingInfo || undefined,
    };

    try {
      const response = await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        setSelectedLeadId('');
        setStatus('Order Received');
        setDispatchDate('');
        setTrackingInfo('');
        setErrors({});
        setSnackbar({ open: true, message: 'Order added successfully.', severity: 'success' });
        onOrderAdded(); // Notify the parent component to refresh the list
      } else {
        const data = await response.json();
        if (response.status === 400 && data.detail && data.detail.includes('already exists')) {
          setSnackbar({ open: true, message: data.detail, severity: 'error' });
        } else {
          setSnackbar({ open: true, message: data.detail || 'Error adding order.', severity: 'error' });
        }
      }

    } catch (error) {
      setSnackbar({ open: true, message: 'Error adding order.', severity: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="lead">Select Lead:</label>
        <select id="lead" value={selectedLeadId} onChange={(e) => setSelectedLeadId(e.target.value)} required>
          <option value="">-- Select a Lead --</option>
          {leads.map(lead => (
            <option key={lead.id} value={lead.id}>{lead.name}</option>
          ))}
        </select>
        {errors.lead && <span style={{ color: 'red' }}>{errors.lead}</span>}
      </div>
      <div>
        <label htmlFor="status">Status:</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Order Received">Order Received</option>
          <option value="In Development">In Development</option>
          <option value="Ready to Dispatch">Ready to Dispatch</option>
          <option value="Dispatched">Dispatched</option>
        </select>
      </div>
      <div>
        <label htmlFor="dispatchDate">Dispatch Date:</label>
        <input id="dispatchDate" type="date" value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} />
      </div>
      <div>
        <label htmlFor="trackingInfo">Tracking Info:</label>
        <input id="trackingInfo" type="text" value={trackingInfo} onChange={(e) => setTrackingInfo(e.target.value)} />
      </div>
      <button type="submit">Add Order</button>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </form>
  );
};

export default OrderForm; 