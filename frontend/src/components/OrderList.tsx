import React from 'react';

interface Order {
  id: string;
  lead_id: string;
  status: string;
  dispatch_date?: string;
  tracking_info?: string;
}

interface OrderListProps {
  orders: Order[];
  onOrderSelected: (order: Order) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onOrderSelected }) => {
  return (
    <div>
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Lead ID</th>
              <th>Status</th>
              <th>Dispatch Date</th>
              <th>Tracking Info</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} onClick={() => onOrderSelected(order)} style={{ cursor: 'pointer' }}>
                <td>{order.id}</td>
                <td>{order.lead_id}</td>
                <td>{order.status}</td>
                <td>{order.dispatch_date || 'N/A'}</td>
                <td>{order.tracking_info || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderList; 