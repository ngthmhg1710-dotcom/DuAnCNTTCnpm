import { Routes, Route, Navigate } from 'react-router-dom'

// Auth
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'

// Layouts
import StudentLayout from './components/layouts/StudentLayout'
import StaffLayout from './components/layouts/StaffLayout'
import AdminLayout from './components/layouts/AdminLayout'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentActivities from './pages/student/Activities'
import StudentActivityDetail from './pages/student/ActivityDetail'
import StudentRegistered from './pages/student/Registered'
import StudentParticipations from './pages/student/Participations'
import StudentDeclarations from './pages/student/Declarations'
import DeclarationCreate from './pages/student/DeclarationCreate'
import DeclarationDetail from './pages/student/DeclarationDetail'
import StudentCriteria from './pages/student/Criteria'
import CriteriaDetail from './pages/student/CriteriaDetail'
import StudentHistory from './pages/student/History'
import StudentNotifications from './pages/student/Notifications'
import StudentProfile from './pages/student/Profile'

// Staff pages
import StaffDashboard from './pages/staff/Dashboard'
import StaffStudents from './pages/staff/Students'
import StaffStudentDetail from './pages/staff/StudentDetail'
import StaffActivities from './pages/staff/Activities'
import StaffActivityCreate from './pages/staff/ActivityCreate'
import StaffActivityDetail from './pages/staff/ActivityDetail'
import StaffParticipations from './pages/staff/Participations'
import StaffVerifications from './pages/staff/Verifications'
import StaffVerificationDetail from './pages/staff/VerificationDetail'
import StaffSemesters from './pages/staff/Semesters'
import StaffCriteria from './pages/staff/Criteria'
import StaffCriteriaCreate from './pages/staff/CriteriaCreate'
import StaffAnalytics from './pages/staff/Analytics'
import StaffReports from './pages/staff/Reports'
import StaffReportDetail from './pages/staff/ReportDetail'
import StaffAttentionStudents from './pages/staff/AttentionStudents'
import StaffRecommendations from './pages/staff/Recommendations'
import StaffNotifications from './pages/staff/Notifications'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminAccounts from './pages/admin/Accounts'
import AdminAccountDetail from './pages/admin/AccountDetail'
import AdminRoles from './pages/admin/Roles'
import AdminPermissionMatrix from './pages/admin/PermissionMatrix'
import AdminCategories from './pages/admin/Categories'
import AdminIntegrations from './pages/admin/Integrations'
import AdminIntegrationDetail from './pages/admin/IntegrationDetail'
import AdminSynchronization from './pages/admin/Synchronization'
import AdminSyncDetail from './pages/admin/SyncDetail'
import AdminAuditLogs from './pages/admin/AuditLogs'
import AdminAuditDetail from './pages/admin/AuditDetail'
import AdminSettings from './pages/admin/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="activities" element={<StudentActivities />} />
        <Route path="activities/:id" element={<StudentActivityDetail />} />
        <Route path="registered" element={<StudentRegistered />} />
        <Route path="participations" element={<StudentParticipations />} />
        <Route path="declarations" element={<StudentDeclarations />} />
        <Route path="declarations/create" element={<DeclarationCreate />} />
        <Route path="declarations/:id" element={<DeclarationDetail />} />
        <Route path="criteria" element={<StudentCriteria />} />
        <Route path="criteria/:id" element={<CriteriaDetail />} />
        <Route path="history" element={<StudentHistory />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Staff */}
      <Route path="/staff" element={<StaffLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="students" element={<StaffStudents />} />
        <Route path="students/:id" element={<StaffStudentDetail />} />
        <Route path="activities" element={<StaffActivities />} />
        <Route path="activities/create" element={<StaffActivityCreate />} />
        <Route path="activities/:id" element={<StaffActivityDetail />} />
        <Route path="activities/:id/edit" element={<StaffActivityCreate />} />
        <Route path="participations" element={<StaffParticipations />} />
        <Route path="verifications" element={<StaffVerifications />} />
        <Route path="verifications/:id" element={<StaffVerificationDetail />} />
        <Route path="semesters" element={<StaffSemesters />} />
        <Route path="criteria" element={<StaffCriteria />} />
        <Route path="criteria/create" element={<StaffCriteriaCreate />} />
        <Route path="analytics" element={<StaffAnalytics />} />
        <Route path="reports" element={<StaffReports />} />
        <Route path="reports/:id" element={<StaffReportDetail />} />
        <Route path="attention-students" element={<StaffAttentionStudents />} />
        <Route path="recommendations" element={<StaffRecommendations />} />
        <Route path="notifications" element={<StaffNotifications />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="accounts" element={<AdminAccounts />} />
        <Route path="accounts/:id" element={<AdminAccountDetail />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="roles/:id/permissions" element={<AdminPermissionMatrix />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="integrations" element={<AdminIntegrations />} />
        <Route path="integrations/:id" element={<AdminIntegrationDetail />} />
        <Route path="synchronization" element={<AdminSynchronization />} />
        <Route path="synchronization/:id" element={<AdminSyncDetail />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="audit-logs/:id" element={<AdminAuditDetail />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="text-6xl font-bold text-slate-200 mb-4">404</div>
            <div className="text-slate-500">Không tìm thấy trang.</div>
            <a href="/login" className="btn-primary mt-4 inline-flex">Về trang chủ</a>
          </div>
        </div>
      } />
    </Routes>
  )
}
