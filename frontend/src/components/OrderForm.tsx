import React, { useState, useEffect } from 'react';

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear the form after successful submission
      setSelectedLeadId('');
      setStatus('Order Received');
      setDispatchDate('');
      setTrackingInfo('');
      setErrors({});

      onOrderAdded(); // Notify the parent component to refresh the list

    } catch (error) {
      console.error('Error adding order:', error);
      // Optionally show an error message
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
    </form>
  );
};

export default OrderForm; 