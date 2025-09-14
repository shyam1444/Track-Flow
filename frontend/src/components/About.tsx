import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Container,
  Link,
} from '@mui/material';
import {
  Business,
  People,
  Speed,
  Security,
  Analytics,
  Support,
  Email,
  Phone,
  LocationOn,
  LinkedIn,
  Twitter,
  GitHub,
  CheckCircle,
  Star,
  TrendingUp,
  Assignment,
  Dashboard,
  Assessment,
  CloudUpload,
  MobileFriendly,
} from '@mui/icons-material';

const About = () => {
  const features = [
    {
      icon: <Dashboard color="primary" />,
      title: 'Comprehensive Dashboard',
      description: 'Real-time insights and analytics for your business performance'
    },
    {
      icon: <People color="primary" />,
      title: 'Lead Management',
      description: 'Efficiently track and manage leads through the entire sales pipeline'
    },
    {
      icon: <Assignment color="primary" />,
      title: 'Order Processing',
      description: 'Streamlined order management with status tracking and fulfillment'
    },
    {
      icon: <Analytics color="primary" />,
      title: 'Advanced Analytics',
      description: 'Data-driven insights with cost analysis and performance metrics'
    },
    {
      icon: <CloudUpload color="primary" />,
      title: 'Document Management',
      description: 'Secure file upload and management for leads and orders'
    },
    {
      icon: <MobileFriendly color="primary" />,
      title: 'Responsive Design',
      description: 'Access your data from any device with our mobile-friendly interface'
    }
  ];

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      avatar: 'JS',
      bio: '10+ years in business technology and SaaS solutions',
      linkedin: '#'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      avatar: 'SJ',
      bio: 'Expert in scalable architecture and cloud solutions',
      linkedin: '#'
    },
    {
      name: 'Mike Chen',
      role: 'Lead Developer',
      avatar: 'MC',
      bio: 'Full-stack developer with focus on user experience',
      linkedin: '#'
    },
    {
      name: 'Emily Davis',
      role: 'Product Manager',
      avatar: 'ED',
      bio: 'Passionate about creating intuitive business solutions',
      linkedin: '#'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: <People /> },
    { label: 'Leads Processed', value: '50,000+', icon: <TrendingUp /> },
    { label: 'Orders Completed', value: '25,000+', icon: <CheckCircle /> },
    { label: 'Customer Satisfaction', value: '98%', icon: <Star /> }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Track-Flow
        </Typography>
        <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
          Streamlining Business Operations with Intelligent Lead & Order Management
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', opacity: 0.8 }}>
          Track-Flow is a comprehensive business management platform designed to help companies 
          efficiently manage leads, process orders, and gain valuable insights through advanced analytics.
        </Typography>
      </Paper>

      {/* Mission & Vision */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="Our Mission"
              avatar={<Business color="primary" />}
            />
            <CardContent>
              <Typography variant="body1" paragraph>
                To empower businesses with intuitive tools that streamline their operations, 
                enhance productivity, and drive growth through data-driven decision making.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                We believe that every business deserves access to enterprise-level tools 
                that are both powerful and easy to use.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="Our Vision"
              avatar={<Speed color="primary" />}
            />
            <CardContent>
              <Typography variant="body1" paragraph>
                To become the leading platform for business process automation, 
                helping organizations of all sizes achieve operational excellence.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                We envision a future where businesses can focus on what they do best 
                while our platform handles the complexity of process management.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Track-Flow by the Numbers
        </Typography>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box textAlign="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  {React.cloneElement(stat.icon, { color: 'primary', sx: { fontSize: 40 } })}
                </Box>
                <Typography variant="h4" component="div" color="primary" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Features */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Key Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {React.cloneElement(feature.icon, { sx: { fontSize: 50 } })}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Technology Stack */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Technology Stack
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Chip label="React" color="primary" variant="outlined" />
          </Grid>
          <Grid item>
            <Chip label="TypeScript" color="primary" variant="outlined" />
          </Grid>
          <Grid item>
            <Chip label="Material-UI" color="primary" variant="outlined" />
          </Grid>
          <Grid item>
            <Chip label="FastAPI" color="primary" variant="outlined" />
          </Grid>
          <Grid item>
            <Chip label="Firebase" color="primary" variant="outlined" />
          </Grid>
          <Grid item>
            <Chip label="Python" color="primary" variant="outlined" />
          </Grid>
          <Grid item>
            <Chip label="Firestore" color="primary" variant="outlined" />
          </Grid>
          <Grid item>
            <Chip label="Cloud Storage" color="primary" variant="outlined" />
          </Grid>
        </Grid>
      </Paper>



      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 4, py: 2 }}>
        <Typography variant="body2" color="textSecondary">
          © 2025 Track-Flow. All rights reserved. | 
          <Link href="#" color="inherit" sx={{ ml: 1 }}>
            Privacy Policy
          </Link> | 
          <Link href="#" color="inherit" sx={{ ml: 1 }}>
            Terms of Service
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default About; 