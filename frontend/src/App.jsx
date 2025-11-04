import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import UsersPage from './pages/UsersPage';
import OrdersPage from './pages/OrdersPage';
import TemplatesPage from './pages/TemplatesPage';
import TokensPage from './pages/TokensPage';
import PrintSettingsPage from './pages/PrintSettingsPage';
import PaymentsPage from './pages/PaymentsPage';
import PaymentDetailPage from './pages/PaymentDetailPage';
import ChecksPage from './pages/ChecksPage';
import CheckDetailPage from './pages/CheckDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ReportsPage from './pages/ReportsPage';
import GlobalSearchPage from './pages/GlobalSearchPage';
import ItemsPage from './pages/ItemsPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import MainLayout from './components/shared/MainLayout';
import './App.css';
import './styles/common.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <OfflineProvider>
            <NotificationProvider>
              <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes with MainLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />

                {/* Customers */}
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />

                {/* Users */}
                <Route path="/users" element={<UsersPage />} />

                {/* Orders */}
                <Route path="/orders" element={<OrdersPage />} />

                {/* Items */}
                <Route path="/items" element={<ItemsPage />} />
                <Route path="/items/:id" element={<ItemDetailPage />} />

                {/* Templates & Tokens */}
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/tokens" element={<TokensPage />} />

                {/* Print Settings */}
                <Route path="/print-settings" element={<PrintSettingsPage />} />

                {/* Payments */}
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/payments/:id" element={<PaymentDetailPage />} />

                {/* Checks */}
                <Route path="/checks" element={<ChecksPage />} />
                <Route path="/checks/:id" element={<CheckDetailPage />} />

                {/* Projects */}
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />

                {/* Reports & Search */}
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/search" element={<GlobalSearchPage />} />

                {/* Settings */}
                <Route path="/settings" element={<div style={{padding: '20px'}}>Settings Page - Coming Soon</div>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </NotificationProvider>
          </OfflineProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;