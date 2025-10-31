// ============================================================================
// Print Settings Page - Material UI Version
// ============================================================================

import { Container, Box, Typography } from '@mui/material';
import PrintSettings from '../components/print/PrintSettings';

const PrintSettingsPage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Print Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your printing preferences, default templates, and company information
        </Typography>
      </Box>

      {/* Content */}
      <Box>
        <PrintSettings />
      </Box>
    </Container>
  );
};

export default PrintSettingsPage;
