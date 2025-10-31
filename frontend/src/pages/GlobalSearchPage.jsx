// ============================================================================
// Global Search Page - Material UI Version
// Phase 9: Advanced Search & Filtering
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { api } from '../utils/apiClient';
import SearchResults from '../components/search/SearchResults';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function GlobalSearchPage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter state
  const [selectedEntities, setSelectedEntities] = useState({
    customers: true,
    orders: true,
    projects: true,
    payments: true,
    checks: true,
    tokens: true,
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: '',
  });

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  // Search history
  const [searchHistory, setSearchHistory] = useState([]);

  // Load saved searches and history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }

    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Load last search filters
    const lastFilters = localStorage.getItem('lastSearchFilters');
    if (lastFilters) {
      const parsed = JSON.parse(lastFilters);
      setFilters(parsed.filters || {});
      setSelectedEntities(parsed.entities || selectedEntities);
    }
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim() && !hasActiveFilters()) {
      setError('Please enter a search query or apply filters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = {
        q: searchQuery,
        entities: Object.keys(selectedEntities).filter(k => selectedEntities[k]).join(','),
        ...filters
      };

      const response = await api.get('/api/search', { params });

      if (response.success) {
        setSearchResults(response.data);

        // Add to search history
        const historyItem = {
          query: searchQuery,
          filters: { ...filters },
          entities: { ...selectedEntities },
          timestamp: new Date().toISOString(),
        };
        const newHistory = [historyItem, ...searchHistory.slice(0, 9)]; // Keep last 10
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));

        // Save last filters
        localStorage.setItem('lastSearchFilters', JSON.stringify({
          filters,
          entities: selectedEntities
        }));
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = () => {
    return filters.startDate || filters.endDate || filters.minAmount ||
           filters.maxAmount || filters.status;
  };

  // Handle quick filters
  const applyQuickFilter = (preset) => {
    const now = new Date();
    let startDate, endDate;

    switch (preset) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'thisWeek':
        const first = now.getDate() - now.getDay() + 1;
        startDate = new Date(now.setDate(first));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }));
  };

  // Handle entity toggle
  const toggleEntity = (entity) => {
    setSelectedEntities(prev => ({
      ...prev,
      [entity]: !prev[entity]
    }));
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      status: '',
    });
    setSelectedEntities({
      customers: true,
      orders: true,
      projects: true,
      payments: true,
      checks: true,
      tokens: true,
    });
  };

  // Save current search
  const saveCurrentSearch = () => {
    if (!searchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    const newSearch = {
      id: Date.now(),
      name: searchName,
      query: searchQuery,
      filters: { ...filters },
      entities: { ...selectedEntities },
      savedAt: new Date().toISOString(),
    };

    const updated = [newSearch, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    setSearchName('');
    alert('Search saved successfully!');
  };

  // Load saved search
  const loadSavedSearch = (search) => {
    setSearchQuery(search.query);
    setFilters(search.filters);
    setSelectedEntities(search.entities);
  };

  // Delete saved search
  const deleteSavedSearch = (id) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  // Export results
  const exportResults = () => {
    if (!searchResults) return;

    const allResults = [
      ...searchResults.customers.map(r => ({ ...r, type: 'Customer' })),
      ...searchResults.orders.map(r => ({ ...r, type: 'Order' })),
      ...searchResults.projects.map(r => ({ ...r, type: 'Project' })),
      ...searchResults.payments.map(r => ({ ...r, type: 'Payment' })),
      ...searchResults.checks.map(r => ({ ...r, type: 'Check' })),
      ...searchResults.tokens.map(r => ({ ...r, type: 'Token' })),
    ];

    // Create CSV
    const headers = ['Type', 'ID', 'Name/Description', 'Date', 'Amount'];
    const rows = allResults.map(item => [
      item.type,
      item.customer_id || item.order_id || item.project_id || item.payment_id || item.check_id || item.token_id,
      item.name || item.customer_name || item.project_name || '-',
      new Date(item.created_at).toLocaleDateString(),
      item.amount || item.final_amount || item.balance || '-'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box mb={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <SearchIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Global Search
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Search across all entities with advanced filtering
        </Typography>
      </Box>

      {/* Search Input */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search customers, orders, projects, payments, checks, tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? null : <SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Tooltip title="Refresh">
                <IconButton onClick={handleSearch} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Quick Filters */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
            Quick Filters:
          </Typography>
          <Chip label="Today" onClick={() => applyQuickFilter('today')} />
          <Chip label="This Week" onClick={() => applyQuickFilter('thisWeek')} />
          <Chip label="This Month" onClick={() => applyQuickFilter('thisMonth')} />
          <Chip
            label="Clear All"
            color="error"
            variant="outlined"
            onClick={clearFilters}
            sx={{ ml: 'auto' }}
          />
        </Box>
      </Paper>

      {/* Filters & Options */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            <Typography variant="h6">Advanced Filters</Typography>
            {hasActiveFilters() && (
              <Chip label="Active" color="primary" size="small" sx={{ ml: 1 }} />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Entity Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Search In:
              </Typography>
              <FormGroup row>
                {Object.keys(selectedEntities).map(entity => (
                  <FormControlLabel
                    key={entity}
                    control={
                      <Checkbox
                        checked={selectedEntities[entity]}
                        onChange={() => toggleEntity(entity)}
                      />
                    }
                    label={entity.charAt(0).toUpperCase() + entity.slice(1)}
                  />
                ))}
              </FormGroup>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Amount Range */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Min Amount"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₨</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Amount"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₨</InputAdornment>,
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Saved Searches & History Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab icon={<HistoryIcon />} label="Recent Searches" />
          <Tab icon={<SaveIcon />} label="Saved Searches" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Box sx={{ p: 2 }}>
            {searchHistory.length === 0 ? (
              <Typography color="text.secondary">No recent searches</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {searchHistory.map((item, idx) => (
                  <Chip
                    key={idx}
                    label={`"${item.query}" - ${new Date(item.timestamp).toLocaleString()}`}
                    onClick={() => {
                      setSearchQuery(item.query);
                      setFilters(item.filters);
                      setSelectedEntities(item.entities);
                    }}
                    sx={{ justifyContent: 'flex-start' }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Box sx={{ p: 2 }}>
            {/* Save Current Search */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Search name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveCurrentSearch}
                disabled={!searchQuery && !hasActiveFilters()}
              >
                Save Current
              </Button>
            </Box>

            {/* Saved Searches List */}
            {savedSearches.length === 0 ? (
              <Typography color="text.secondary">No saved searches</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {savedSearches.map((search) => (
                  <Box key={search.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={search.name}
                      onClick={() => loadSavedSearch(search)}
                      sx={{ flexGrow: 1, justifyContent: 'flex-start' }}
                    />
                    <IconButton size="small" onClick={() => deleteSavedSearch(search.id)}>
                      <ClearIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchResults && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Search Results ({searchResults.summary.totalResults} found)
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportResults}
              disabled={searchResults.summary.totalResults === 0}
            >
              Export CSV
            </Button>
          </Box>

          <SearchResults results={searchResults} />
        </Paper>
      )}

      {/* Empty State */}
      {!searchResults && !loading && (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Start searching to find results
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter a search query or apply filters to search across all entities
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
