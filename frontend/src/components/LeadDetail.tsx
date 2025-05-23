import React, { useState, useEffect } from 'react';

interface Lead {
  id: string;
  name: string;
  contact: string;
  company?: string;
  product_interest?: string;
  stage: string;
  follow_up_date?: string;
  notes?: string;
}

interface Order {
  id: string;
  lead_id: string;
  status: string;
  dispatch_date?: string;
  tracking_info?: string;
}

interface LeadDetailProps {
  lead: Lead;
}

const LeadDetail: React.FC<LeadDetailProps> = ({ lead }) => {
  const [relatedOrders, setRelatedOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Fetch orders related to this lead
    const fetchRelatedOrders = async () => {
      try {
        const response = await fetch(`http://localhost:8000/orders?lead_id=${lead.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Order[] = await response.json();
        setRelatedOrders(data);
      } catch (error) {
        console.error('Error fetching related orders:', error);
      }
    };

    fetchRelatedOrders();
  }, [lead.id]); // Refetch orders when the lead ID changes

  return (
    <div>
      <h2>Lead Details</h2>
      <p><strong>Name:</strong> {lead.name}</p>
      <p><strong>Contact:</strong> {lead.contact}</p>
      {lead.company && <p><strong>Company:</strong> {lead.company}</p>}
      {lead.product_interest && <p><strong>Product Interest:</strong> {lead.product_interest}</p>}
      <p><strong>Stage:</strong> {lead.stage}</p>
      {lead.follow_up_date && <p><strong>Follow-up Date:</strong> {lead.follow_up_date}</p>}
      {lead.notes && <p><strong>Notes:</strong> {lead.notes}</p>}

      <h3>Related Orders</h3>
      {relatedOrders.length === 0 ? (
        <p>No orders associated with this lead.</p>
      ) : (
        <ul>
          {relatedOrders.map(order => (
            <li key={order.id}>
              Order ID: {order.id}, Status: {order.status}
              {/* Could add a link or button here to view full order details */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LeadDetail; 