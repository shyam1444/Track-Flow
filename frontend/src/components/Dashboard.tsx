import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import moment from 'moment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Metrics {
  total_leads: number;
  leads_by_stage: { [key: string]: number };
  total_orders: number;
  orders_by_status: { [key: string]: number };
}

interface Lead {
  id: string;
  name: string;
  follow_up_date?: string;
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [weeklyFollowUps, setWeeklyFollowUps] = useState<Lead[]>([]);

  useEffect(() => {
    fetchMetrics();
    fetchWeeklyFollowUps();
  }, []);

  const fetchMetrics = async () => {
    try {
      const [leadsResponse, ordersResponse] = await Promise.all([
        fetch('http://localhost:8000/metrics/leads'),
        fetch('http://localhost:8000/metrics/orders'),
      ]);

      const leadsData = await leadsResponse.json();
      const ordersData = await ordersResponse.json();

      setMetrics({
        total_leads: leadsData.total_leads,
        leads_by_stage: leadsData.leads_by_stage,
        total_orders: ordersData.total_orders,
        orders_by_status: ordersData.orders_by_status,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchWeeklyFollowUps = async () => {
    try {
      const response = await fetch('http://localhost:8000/leads/followup');
      const data: Lead[] = await response.json();
      
      const nextWeek = moment().add(7, 'days');
      const filteredLeads = data.filter(lead => 
        lead.follow_up_date && moment(lead.follow_up_date).isBefore(nextWeek)
      );
      
      setWeeklyFollowUps(filteredLeads);

    } catch (error) {
      console.error('Error fetching weekly follow-ups:', error);
    }
  };

  const leadsChartData = {
    labels: metrics ? Object.keys(metrics.leads_by_stage) : [],
    datasets: [
      {
        label: 'Leads by Stage',
        data: metrics ? Object.values(metrics.leads_by_stage) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ordersChartData = {
    labels: metrics ? Object.keys(metrics.orders_by_status) : [],
    datasets: [
      {
        label: 'Orders by Status',
        data: metrics ? Object.values(metrics.orders_by_status) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Total Leads: {metrics?.total_leads || 0}
          </Typography>
          <Box sx={{ height: 300 }}>
            <Pie data={leadsChartData} />
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Total Orders: {metrics?.total_orders || 0}
          </Typography>
          <Box sx={{ height: 300 }}>
            <Bar data={ordersChartData} />
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Weekly Follow-ups Pending
          </Typography>
          <List dense>
            {weeklyFollowUps.length === 0 ? (
              <ListItem>
                <ListItemText primary="No follow-ups due this week." />
              </ListItem>
            ) : (
              weeklyFollowUps.map(lead => (
                <ListItem key={lead.id}>
                  <ListItemText primary={lead.name} secondary={`Follow up by: ${lead.follow_up_date}`} />
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 