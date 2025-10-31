// ============================================================================
// Reports Page - Material UI Version
// ============================================================================

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as RevenueIcon,
  People as CustomersIcon,
} from '@mui/icons-material';
import RevenueReport from '../components/reports/RevenueReport';
import CustomerReport from '../components/reports/CustomerReport';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ReportsPage() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box mb={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Reports & Analytics
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          View detailed revenue reports by project and customer analytics
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="report tabs"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              },
            }}
          >
            <Tab
              icon={<RevenueIcon />}
              iconPosition="start"
              label="Revenue Reports by Project"
            />
            <Tab
              icon={<CustomersIcon />}
              iconPosition="start"
              label="Customer Reports"
            />
          </Tabs>
        </Box>

        {/* Revenue Report Tab */}
        <TabPanel value={currentTab} index={0}>
          <RevenueReport />
        </TabPanel>

        {/* Customer Report Tab */}
        <TabPanel value={currentTab} index={1}>
          <CustomerReport />
        </TabPanel>
      </Paper>
    </Container>
  );
}
