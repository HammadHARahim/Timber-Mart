import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import UsersPage from './pages/UsersPage';
import OrdersPage from './pages/OrdersPage';
import TemplatesPage from './pages/TemplatesPage';
import TokensPage from './pages/TokensPage';
import PrintSettingsPage from './pages/PrintSettingsPage';
import PaymentsPage from './pages/PaymentsPage';
import ChecksPage from './pages/ChecksPage';
import ProjectsPage from './pages/ProjectsPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import MainLayout from './components/shared/MainLayout';
import './App.css';
import './styles/common.css';

function App() {
  return (
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
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/tokens" element={<TokensPage />} />
                <Route path="/print-settings" element={<PrintSettingsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/checks" element={<ChecksPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/reports" element={<div style={{padding: '20px'}}>Reports Page - Coming Soon</div>} />
                <Route path="/settings" element={<div style={{padding: '20px'}}>Settings Page - Coming Soon</div>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </OfflineProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;