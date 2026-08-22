import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopNavbar from './components/layout/TopNavbar';

// Portals by role
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemHealth from './pages/admin/SystemHealth';
import AssessmentDetails from './pages/officer/AssessmentDetails';

// Shared / Role Specific Functional Pages
import SubmitReport from './pages/SubmitReport';
import RiskOfficerReview from './pages/RiskOfficerReview';
import RisksList from './pages/RisksList';
import Login from './pages/Login';

function ProtectedLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background font-body-md text-body-md text-on-background antialiased flex">
      <Sidebar />
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        <TopNavbar title={title} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function RoleBasedDashboard() {
  const { user } = useAuth();
  if (user?.role === 'employee') {
    return (
      <ProtectedLayout title="Loan Officer Intake & Reports Portal">
        <EmployeeDashboard />
      </ProtectedLayout>
    );
  }
  if (user?.role === 'risk_officer') {
    return (
      <ProtectedLayout title="Risk Officer Decision Desk & AI Modeling">
        <OfficerDashboard />
      </ProtectedLayout>
    );
  }
  return (
    <ProtectedLayout title="Executive System Administration Dashboard">
      <AdminDashboard />
    </ProtectedLayout>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      {/* Dynamic Role-Based Dashboard Portal */}
      <Route path="/dashboard" element={<RoleBasedDashboard />} />

      {/* Employee Specific Routes */}
      <Route
        path="/submissions/new"
        element={
          <ProtectedLayout title="Submit Risk Evidence & PII Scanner">
            <SubmitReport />
          </ProtectedLayout>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedLayout title="Staff Member Profile">
            <EmployeeProfile />
          </ProtectedLayout>
        }
      />

      {/* Risk Officer Specific Routes */}
      <Route
        path="/officer/reviews"
        element={
          <ProtectedLayout title="Risk Decision Desk & Custom Underwriting Rules">
            <RiskOfficerReview />
          </ProtectedLayout>
        }
      />

      <Route
        path="/officer/assessment/:id"
        element={
          <ProtectedLayout title="AI Risk Assessment & Predictive Analytics">
            <AssessmentDetails />
          </ProtectedLayout>
        }
      />

      {/* Admin Specific Routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedLayout title="Staff User Management">
            <UserManagement />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin/health"
        element={
          <ProtectedLayout title="PostgreSQL Database & System Health">
            <SystemHealth />
          </ProtectedLayout>
        }
      />

      {/* Risk Registry Table in Rwf */}
      <Route
        path="/risks"
        element={
          <ProtectedLayout title="Active Risk Registry (Rwf Exposure)">
            <RisksList />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
