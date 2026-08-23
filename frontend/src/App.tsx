import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopNavbar from './components/layout/TopNavbar';

// Core Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrganizationProfile from './pages/OrganizationProfile';
import NewAssessment from './pages/NewAssessment';
import AssessmentList from './pages/AssessmentList';
import AssessmentDetails from './pages/AssessmentDetails';
import MitigationManagement from './pages/MitigationManagement';
import AssessmentHistory from './pages/AssessmentHistory';
import Reports from './pages/Reports';

// Admin Governance Pages
import UserManagement from './pages/admin/UserManagement';
import RiskCategories from './pages/admin/RiskCategories';
import RiskRules from './pages/admin/RiskRules';
import AuditLogs from './pages/admin/AuditLogs';
import SystemHealth from './pages/admin/SystemHealth';

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

function AppRoutes() {
  const { user, isSystemAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Main Dashboard for both roles */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout title="Executive Enterprise Risk Intelligence Dashboard">
            <Dashboard />
          </ProtectedLayout>
        }
      />

      {/* Risk Officer Endpoints */}
      <Route
        path="/organization"
        element={
          <ProtectedLayout title="Organization Profile & Scope">
            <OrganizationProfile />
          </ProtectedLayout>
        }
      />

      <Route
        path="/assessments/new"
        element={
          <ProtectedLayout title="Single-Document Risk Assessment Wizard">
            <NewAssessment />
          </ProtectedLayout>
        }
      />

      <Route
        path="/assessments"
        element={
          <ProtectedLayout title="Enterprise Assessments Repository">
            <AssessmentList />
          </ProtectedLayout>
        }
      />

      <Route
        path="/assessments/:id"
        element={
          <ProtectedLayout title="Risk Decision Desk & AI Analytics">
            <AssessmentDetails />
          </ProtectedLayout>
        }
      />

      <Route
        path="/mitigations"
        element={
          <ProtectedLayout title="Risk Mitigation & Action Management">
            <MitigationManagement />
          </ProtectedLayout>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedLayout title="Longitudinal Risk Progression & Historical Trends">
            <AssessmentHistory />
          </ProtectedLayout>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedLayout title="Audit-Ready Formal Enterprise Risk Reports">
            <Reports />
          </ProtectedLayout>
        }
      />

      {/* System Admin Governance Endpoints */}
      <Route
        path="/admin/users"
        element={
          <ProtectedLayout title="User Accounts & Permissions Governance">
            <UserManagement />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <ProtectedLayout title="Risk Categories & Mathematical Weighting Engine">
            <RiskCategories />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin/rules"
        element={
          <ProtectedLayout title="Deterministic Business Rules Engine">
            <RiskRules />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedLayout title="System Activity & Security Audit Trail">
            <AuditLogs />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin/health"
        element={
          <ProtectedLayout title="Database & Operational Diagnostics">
            <SystemHealth />
          </ProtectedLayout>
        }
      />

      {/* Fallback Redirect */}
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
