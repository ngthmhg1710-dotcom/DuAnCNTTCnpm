import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Auth
const Login = lazy(() => import('./pages/auth/Login'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))

// Layouts
import StudentLayout from './components/layouts/StudentLayout'
import StaffLayout from './components/layouts/StaffLayout'
import AdminLayout from './components/layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'))
const StudentActivities = lazy(() => import('./pages/student/Activities'))
const StudentActivityDetail = lazy(() => import('./pages/student/ActivityDetail'))
const StudentRegistered = lazy(() => import('./pages/student/Registered'))
const StudentParticipations = lazy(() => import('./pages/student/Participations'))
const StudentDeclarations = lazy(() => import('./pages/student/Declarations'))
const DeclarationCreate = lazy(() => import('./pages/student/DeclarationCreate'))
const DeclarationDetail = lazy(() => import('./pages/student/DeclarationDetail'))
const StudentCriteria = lazy(() => import('./pages/student/Criteria'))
const CriteriaDetail = lazy(() => import('./pages/student/CriteriaDetail'))
const StudentHistory = lazy(() => import('./pages/student/History'))
const StudentNotifications = lazy(() => import('./pages/student/Notifications'))
const StudentProfile = lazy(() => import('./pages/student/Profile'))

// Staff pages
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'))
const StaffAccounts = lazy(() => import('./pages/staff/Accounts'))
const StaffStudents = lazy(() => import('./pages/staff/Students'))
const StaffStudentDetail = lazy(() => import('./pages/staff/StudentDetail'))
const StaffActivities = lazy(() => import('./pages/staff/Activities'))
const StaffActivityCreate = lazy(() => import('./pages/staff/ActivityCreate'))
const StaffActivityDetail = lazy(() => import('./pages/staff/ActivityDetail'))
const StaffParticipations = lazy(() => import('./pages/staff/Participations'))
const StaffVerifications = lazy(() => import('./pages/staff/Verifications'))
const StaffVerificationDetail = lazy(() => import('./pages/staff/VerificationDetail'))
const StaffSemesters = lazy(() => import('./pages/staff/Semesters'))
const StaffCriteria = lazy(() => import('./pages/staff/Criteria'))
const StaffCriteriaCreate = lazy(() => import('./pages/staff/CriteriaCreate'))
const StaffCriteriaDetail = lazy(() => import('./pages/staff/CriteriaDetail'))
const StaffAnalytics = lazy(() => import('./pages/staff/Analytics'))
const StaffReports = lazy(() => import('./pages/staff/Reports'))
const StaffReportDetail = lazy(() => import('./pages/staff/ReportDetail'))
const StaffAttentionStudents = lazy(() => import('./pages/staff/AttentionStudents'))
const StaffRecommendations = lazy(() => import('./pages/staff/Recommendations'))
const StaffNotifications = lazy(() => import('./pages/staff/Notifications'))
const StaffMessages = lazy(() => import('./pages/staff/Messages'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminAccounts = lazy(() => import('./pages/admin/Accounts'))
const AdminAccountDetail = lazy(() => import('./pages/admin/AccountDetail'))
const AdminRoles = lazy(() => import('./pages/admin/Roles'))
const AdminPermissionMatrix = lazy(() => import('./pages/admin/PermissionMatrix'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))
const AdminIntegrations = lazy(() => import('./pages/admin/Integrations'))
const AdminSynchronization = lazy(() => import('./pages/admin/Synchronization'))
const AdminAuditLogs = lazy(() => import('./pages/admin/AuditLogs'))
const AdminAuditDetail = lazy(() => import('./pages/admin/AuditDetail'))

function RouteLoading() {
  return (
    <div className="min-h-[240px] grid place-items-center text-sm text-slate-500" role="status">
      Đang tải trang...
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['STUDENT']}>
          <StudentLayout />
        </ProtectedRoute>
      }>
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
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
          <StaffLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="accounts" element={<StaffAccounts />} />
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
        <Route path="criteria/:id" element={<StaffCriteriaDetail />} />
        <Route path="criteria/:id/edit" element={<StaffCriteriaCreate />} />
        <Route path="analytics" element={<StaffAnalytics />} />
        <Route path="reports" element={<StaffReports />} />
        <Route path="reports/:id" element={<StaffReportDetail />} />
        <Route path="attention-students" element={<StaffAttentionStudents />} />
        <Route path="recommendations" element={<StaffRecommendations />} />
        <Route path="notifications" element={<StaffNotifications />} />
        <Route path="messages" element={<StaffMessages />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="accounts" element={<AdminAccounts />} />
        <Route path="accounts/:id" element={<AdminAccountDetail />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="roles/:id/permissions" element={<AdminPermissionMatrix />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="integrations" element={<AdminIntegrations />} />
        <Route path="synchronization" element={<AdminSynchronization />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="audit-logs/:id" element={<AdminAuditDetail />} />
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
    </Suspense>
  )
}
