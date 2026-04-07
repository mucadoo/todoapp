import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { useAuth } from './api/queries';
import { TopLoadingBar } from './components/TopLoadingBar';
import { ToastProvider } from './components/Toast';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const hasToken = !!localStorage.getItem('access_token');

  if (isLoading && hasToken) return null;
  if (!user && !isLoading) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const AppContent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <TopLoadingBar />
      <AppContent />
    </ToastProvider>
  </QueryClientProvider>
);
