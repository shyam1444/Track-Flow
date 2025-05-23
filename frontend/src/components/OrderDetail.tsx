import React, { useState, useEffect } from 'react';

interface Order {
  id: string;
  lead_id: string;
  status: string;
  dispatch_date?: string;
  tracking_info?: string;
}

interface OrderDetailProps {
  order: Order;
  onStatusUpdated: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onStatusUpdated }) => {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [dispatchDate, setDispatchDate] = useState(order.dispatch_date || '');
  const [trackingInfo, setTrackingInfo] = useState(order.tracking_info || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);

  // Update local state if the order prop changes (e.g., after a successful update triggered by parent refresh)
  useEffect(() => {
    setCurrentStatus(order.status);
    setDispatchDate(order.dispatch_date || '');
    setTrackingInfo(order.tracking_info || '');
  }, [order]); // Depend on the entire order object to catch all changes

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`http://localhost:8000/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Notify parent to refresh the orders list, which will update this component's props
      onStatusUpdated();

    } catch (error) {
      console.error('Error updating order status:', error);
      // Optionally show an error message to the user
    } finally {
      setIsUpdatingStatus(false);
    }
  };

   const handleDetailsUpdate = async () => {
    setIsUpdatingDetails(true);
    try {
      const response = await fetch(`http://localhost:8000/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Only include fields that can be updated via this endpoint
            dispatch_date: dispatchDate || null, // Use null for empty strings for optional fields in backend
            tracking_info: trackingInfo || null,
            // Include lead_id and status to match backend model, although not changed here
            lead_id: order.lead_id,
            status: currentStatus // Use current local status
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Notify parent to refresh the orders list
      onStatusUpdated();

    } catch (error) {
      console.error('Error updating order details:', error);
      // Optionally show an error message to the user
    } finally {
      setIsUpdatingDetails(false);
    }
   };

  return (
    <div>
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>Lead ID:</strong> {order.lead_id}</p>
      <div>
        <label htmlFor="orderStatus"><strong>Status:</strong></label>
        <select id="orderStatus" value={currentStatus} onChange={(e) => handleStatusChange(e.target.value)} disabled={isUpdatingStatus}>
          <option value="Order Received">Order Received</option>
          <option value="In Development">In Development</option>
          <option value="Ready to Dispatch">Ready to Dispatch</option>
          <option value="Dispatched">Dispatched</option>
        </select>
        {isUpdatingStatus && <span> Updating status...</span>}
      </div>
      <div>
        <label htmlFor="dispatchDate"><strong>Dispatch Date:</strong></label>
        <input id="dispatchDate" type="date" value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} disabled={isUpdatingDetails} />
      </div>
      <div>
        <label htmlFor="trackingInfo"><strong>Tracking Info:</strong></label>
        <input id="trackingInfo" type="text" value={trackingInfo} onChange={(e) => setTrackingInfo(e.target.value)} disabled={isUpdatingDetails} />
      </div>
      <button onClick={handleDetailsUpdate} disabled={isUpdatingDetails}>Update Details</button>
      {isUpdatingDetails && <span> Updating details...</span>}
    </div>
  );
};

export default OrderDetail; 