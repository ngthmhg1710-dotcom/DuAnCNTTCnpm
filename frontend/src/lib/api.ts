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

  throw new Error('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
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
  imageUrl?: string | null;
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

export async function getActivities(): Promise<Activity[]> {
  const { data } = await api.get<Activity[]>('/activities');
  return Array.isArray(data) ? data : [];
}

export async function getActivity(id: number | string): Promise<ActivityDetail> {
  const { data } = await api.get<ActivityDetail>(`/activities/${id}`);
  if (data && data.title) return data;
  throw new Error(`Không tìm thấy hoạt động với ID: ${id}`);
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

export type RegisteredActivityItem = {
  id: number;
  activityId: number;
  activity: string;
  time: string;
  location: string;
  registeredDate: string;
  status: 'Đã đăng ký' | 'Đã tham gia' | 'Đang xác minh' | 'Vắng';
  category?: string;
  imageUrl?: string;
  unit?: string;
};

export async function getStudentRegistrations(): Promise<RegisteredActivityItem[]> {
  let serverRows: RegisteredActivityItem[] = [];
  try {
    const { data } = await api.get('/participations/mine');
    if (Array.isArray(data)) {
      serverRows = data.map((p: any) => ({
        id: p.id,
        activityId: p.activityId || p.id,
        activity: p.activity || p.activityTitle || 'Hoạt động',
        time: p.registeredAt ? new Date(p.registeredAt).toLocaleDateString('vi-VN') : 'Mới đăng ký',
        location: p.location || 'Khu học tập TDTU',
        registeredDate: p.registeredAt ? new Date(p.registeredAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
        status: p.status === 'ATTENDED' ? 'Đã tham gia' : p.status === 'ABSENT' ? 'Vắng' : 'Đã đăng ký',
        category: p.category,
        imageUrl: p.imageUrl,
        unit: p.unit,
      }));
    }
  } catch (e) {}

  const rawLocal = localStorage.getItem('tdtu_registered_activities');
  const localRows: RegisteredActivityItem[] = rawLocal ? JSON.parse(rawLocal) : [];

  const combined = [...localRows];
  for (const s of serverRows) {
    if (!combined.some(c => c.activityId === s.activityId)) {
      combined.push(s);
    }
  }

  return combined;
}

export function isRegisteredActivity(activityId: number | string): boolean {
  const numId = Number(activityId);
  const rawLocal = localStorage.getItem('tdtu_registered_activities');
  const localRows: RegisteredActivityItem[] = rawLocal ? JSON.parse(rawLocal) : [];
  return localRows.some(r => r.activityId === numId);
}

export async function registerActivity(activity: Activity): Promise<RegisteredActivityItem> {
  try {
    await api.post('/participations', { activityId: activity.id });
  } catch (e) {}

  const newReg: RegisteredActivityItem = {
    id: Date.now(),
    activityId: activity.id,
    activity: activity.title,
    time: new Date(activity.startAt).toLocaleDateString('vi-VN'),
    location: activity.location || 'Khu học tập TDTU',
    registeredDate: new Date().toLocaleDateString('vi-VN'),
    status: 'Đã đăng ký',
  };

  const rawLocal = localStorage.getItem('tdtu_registered_activities');
  const localRows: RegisteredActivityItem[] = rawLocal ? JSON.parse(rawLocal) : [];
  if (!localRows.some(r => r.activityId === activity.id)) {
    localRows.unshift(newReg);
    localStorage.setItem('tdtu_registered_activities', JSON.stringify(localRows));
  }

  const rawCustom = localStorage.getItem('tdtu_custom_activities');
  if (rawCustom) {
    let customList: Activity[] = JSON.parse(rawCustom);
    const idx = customList.findIndex(a => a.id === activity.id);
    if (idx >= 0) {
      customList[idx].registered = (customList[idx].registered || 0) + 1;
      localStorage.setItem('tdtu_custom_activities', JSON.stringify(customList));
    }
  }

  return newReg;
}

export async function cancelRegisterActivity(activityId: number | string) {
  const numId = Number(activityId);
  try {
    await api.delete(`/participations/${activityId}`);
  } catch (e) {}

  const rawLocal = localStorage.getItem('tdtu_registered_activities');
  if (rawLocal) {
    let localRows: RegisteredActivityItem[] = JSON.parse(rawLocal);
    localRows = localRows.filter(r => r.activityId !== numId);
    localStorage.setItem('tdtu_registered_activities', JSON.stringify(localRows));
  }
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
  startDate?: string;
  endDate?: string;
  location?: string;
  content?: string;
  description?: string;
  type?: string;
  files?: EvidenceFile[];
};

export type EvidenceFile = { name: string; data: string };

export async function createDeclaration(payload: {
  activity: string;
  type?: string;
  unit: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  content?: string;
  description?: string;
  files?: EvidenceFile[];
  isDraft?: boolean;
}): Promise<DeclarationRow> {
  const user = await getCurrentUser();
  const code = `KB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toLocaleDateString('vi-VN');

  let createdOnServer: DeclarationRow | null = null;
  try {
    const { data } = await api.post<DeclarationRow>('/declarations', {
      activityName: payload.activity,
      unit: payload.unit,
      type: payload.type,
      startDate: payload.startDate,
      endDate: payload.endDate,
      location: payload.location,
      content: payload.content,
      description: payload.description,
      files: payload.files,
    });
    if (data && data.code) createdOnServer = data;
  } catch (e) {}

  if (!createdOnServer) throw new Error('Không thể tạo khai báo. Vui lòng thử lại.');
  const newItem: DeclarationRow = createdOnServer;

  const raw = localStorage.getItem('tdtu_declarations');
  const list: DeclarationRow[] = raw ? JSON.parse(raw) : [];
  list.unshift(newItem);
  localStorage.setItem('tdtu_declarations', JSON.stringify(list));

  return newItem;
}

export async function getDeclarations(): Promise<DeclarationRow[]> {
  let serverRows: DeclarationRow[] = [];
  try {
    const { data } = await api.get<DeclarationRow[]>('/declarations');
    if (Array.isArray(data)) serverRows = data;
  } catch (e) {}

  const raw = localStorage.getItem('tdtu_declarations');
  const localRows: DeclarationRow[] = raw ? JSON.parse(raw) : [];

  // Server is the source of truth (staff review changes status there); local copies only fill gaps
  const combined = [...serverRows];
  for (const l of localRows) {
    if (!combined.some(c => c.code === l.code)) combined.push(l);
  }

  return combined;
}

export async function getDeclaration(code: string): Promise<DeclarationRow> {
  try {
    const { data } = await api.get<DeclarationRow>(`/declarations/${code}`);
    if (data && data.code) return data;
  } catch (e) {}

  const list = await getDeclarations();
  const found = list.find(d => d.code === code);
  if (found) return found;
  throw new Error(`Không tìm thấy khai báo với mã: ${code}`);
}

export async function reviewDeclaration(code: string, action: 'receive' | 'approve' | 'reject' | 'supplement', note?: string) {
  const { data } = await api.patch<DeclarationRow>(`/declarations/${code}`, { action, note });
  return data;
}

export default api;

