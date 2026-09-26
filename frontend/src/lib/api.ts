import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://student-activity-api-w982.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export type CurrentUser = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
};

export async function getCurrentUser(): Promise<CurrentUser> {
  const stored = localStorage.getItem('tdtu_current_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && (parsed.name || parsed.email || parsed.username)) {
        return parsed;
      }
    } catch (e) {}
  }
  try {
    const { data } = await api.get<CurrentUser>('/auth/me');
    if (data && (data.name || data.email || data.username)) {
      localStorage.setItem('tdtu_current_user', JSON.stringify(data));
      return data;
    }
  } catch (e) {}

  return { id: 1, username: 'google_user', name: 'Sinh viên TDTU', email: 'user@student.tdtu.edu.vn', role: 'STUDENT' };
}

export function loginWithOAuth() {
  window.location.href = `${API_BASE}/auth/oauth/google`;
}

export async function loginWithCredentials(username: string, password?: string) {
  const { data } = await api.post<{ user: CurrentUser; redirectUrl: string }>('/auth/login', { username, password });
  if (data?.user) {
    localStorage.setItem('tdtu_current_user', JSON.stringify(data.user));
  }
  return data;
}

export async function loginWithGoogleDirect(email: string, name?: string) {
  const clean = email.trim().toLowerCase();
  if (!clean.endsWith('@tdtu.edu.vn') && !clean.endsWith('@student.tdtu.edu.vn')) {
    throw new Error('Hệ thống chỉ cho phép đăng nhập bằng email trường TDTU (@tdtu.edu.vn hoặc @student.tdtu.edu.vn).');
  }

  const { data } = await api.post<{ user: CurrentUser; redirectUrl: string }>('/auth/oauth/google-direct', { email, name });
  if (data?.user) {
    localStorage.setItem('tdtu_current_user', JSON.stringify(data.user));
  }
  return data;
}

export async function loginWithGoogleToken(idToken: string) {
  const { data } = await api.post<{ user: CurrentUser; redirectUrl: string }>('/auth/oauth/google-token', { idToken });
  if (data?.user) {
    localStorage.setItem('tdtu_current_user', JSON.stringify(data.user));
  }
  return data;
}

export async function getAccounts() {
  const { data } = await api.get('/auth/users');
  if (!Array.isArray(data)) return [];
  return data.map((u: any) => ({
    id: u.id,
    username: u.username || u.email.split('@')[0],
    name: u.name || u.username,
    email: u.email,
    role: u.role === 'ADMIN' || u.role === 'Admin' ? 'Admin' : u.role === 'STAFF' || u.role === 'Cán bộ' ? 'Cán bộ' : 'Sinh viên',
    status: u.status === 'INACTIVE' ? 'Khóa' : 'Hoạt động',
    lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString('vi-VN') : 'Vừa xong',
    created: u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo',
  }));
}

export async function logout() {
  localStorage.removeItem('tdtu_current_user');
  try {
    await api.get('/auth/logout');
  } catch (e) {
    // ignore
  }
  window.location.href = '/login';
}

export async function getAnalyticsOverview() {
  const { data } = await api.get('/analytics/overview');
  return data;
}

export async function getStaffDashboard() {
  const { data } = await api.get('/analytics/dashboard');
  return data;
}

export async function getAttentionStudents() {
  const { data } = await api.get('/analytics/attention-students');
  return data;
}

export async function getRecommendations() {
  const { data } = await api.get('/analytics/recommendations');
  return data;
}

export type Activity = {
  id: number;
  title: string;
  category: string;
  unit: string | null;
  location: string | null;
  description: string | null;
  startAt: string;
  endAt: string | null;
  capacity: number | null;
  published: boolean;
  registered: number;
  status: string;
};

export type ActivityDetail = Activity & {
  participants: { id: number; mssv: string; name: string; className: string | null; status: string; joinedAt: string | null }[];
};

export async function getActivities() {
  const { data } = await api.get<Activity[]>('/activities');
  return data;
}

export async function getActivity(id: number | string) {
  const { data } = await api.get<ActivityDetail>(`/activities/${id}`);
  return data;
}

export async function createActivity(payload: Partial<Activity>) {
  const { data } = await api.post<Activity>('/activities', payload);
  return data;
}

export async function updateActivity(id: number | string, payload: Partial<Activity>) {
  const { data } = await api.patch<Activity>(`/activities/${id}`, payload);
  return data;
}

export async function deleteActivity(id: number | string) {
  await api.delete(`/activities/${id}`);
}

export type StudentSummary = {
  id: number;
  mssv: string;
  name: string;
  email: string;
  className: string | null;
  cohort: string | null;
  major: string | null;
  status: string;
  activities: number;
  participation: 'Cao' | 'Trung bình' | 'Thấp';
};

export type StudentDetail = StudentSummary & {
  participations: { id: number; activityId: number; activityTitle: string; category: string; startAt: string; status: string }[];
  declarations: { code: string; activityName: string; unit: string; submittedAt: string; status: string }[];
};

export async function getStudents() {
  const { data } = await api.get<StudentSummary[]>('/students');
  return data;
}

export async function getStudent(id: number | string) {
  const { data } = await api.get<StudentDetail>(`/students/${id}`);
  return data;
}

export type ParticipationRow = {
  id: number;
  mssv: string;
  name: string;
  activityId: number;
  activity: string;
  registeredAt: string;
  status: 'REGISTERED' | 'ATTENDED' | 'ABSENT';
};

export async function getParticipations(filters?: { activityId?: number; studentId?: number; status?: string }) {
  const { data } = await api.get<ParticipationRow[]>('/participations', { params: filters });
  return data;
}

export async function updateParticipationStatus(id: number, status: string) {
  const { data } = await api.patch(`/participations/${id}`, { status });
  return data;
}

export type DeclarationRow = {
  code: string;
  student: string;
  mssv: string;
  activity: string;
  unit: string;
  submittedDate: string;
  status: string;
  handler: string;
  reviewNote: string | null;
};

export async function getDeclarations() {
  const { data } = await api.get<DeclarationRow[]>('/declarations');
  return data;
}

export async function getDeclaration(code: string) {
  const { data } = await api.get<DeclarationRow>(`/declarations/${code}`);
  return data;
}

export async function reviewDeclaration(code: string, action: 'receive' | 'approve' | 'reject' | 'supplement', note?: string) {
  const { data } = await api.patch<DeclarationRow>(`/declarations/${code}`, { action, note });
  return data;
}

export default api;

