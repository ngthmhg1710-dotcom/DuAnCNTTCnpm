import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://student-activity-api-w982.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Access token (15 phút) hết hạn -> đổi bằng refresh token rồi gọi lại request một lần.
api.interceptors.response.use(undefined, async (err) => {
  const cfg = err.config;
  if (err.response?.status !== 401 || !cfg || cfg._retried || /\/auth\/(login|refresh|logout|oauth)/.test(cfg.url || '')) {
    throw err;
  }
  cfg._retried = true;
  await api.post('/auth/refresh');
  return api(cfg);
});

export type CurrentUser = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
};

// Người dùng chỉ giữ trong bộ nhớ (không dùng localStorage); nguồn sự thật là cookie HttpOnly + /auth/me.
let currentUser: Promise<CurrentUser> | null = null;

export function getCurrentUser(): Promise<CurrentUser> {
  currentUser ??= api.get<CurrentUser>('/auth/me').then(
    ({ data }) => data,
    () => {
      currentUser = null;
      throw new Error('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
    },
  );
  return currentUser;
}

export function loginWithOAuth() {
  window.location.href = `${API_BASE}/auth/oauth/google`;
}

export async function loginWithCredentials(username: string, password?: string) {
  const { data } = await api.post<{ user: CurrentUser; redirectUrl: string }>('/auth/login', { username, password });
  currentUser = data?.user ? Promise.resolve(data.user) : null;
  return data;
}

export async function loginWithGoogleToken(idToken: string) {
  const { data } = await api.post<{ user: CurrentUser; redirectUrl: string }>('/auth/oauth/google-token', { idToken });
  currentUser = data?.user ? Promise.resolve(data.user) : null;
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
  currentUser = null;
  try {
    await api.post('/auth/logout');
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

export async function getAttentionStudents(semesterId?: number) {
  const { data } = await api.get('/analytics/attention-students', { params: { semesterId } });
  return data.students;
}

// Tải file (xlsx) qua axios để dùng chung cookie + refresh token.
export async function downloadFile(path: string, filename: string) {
  const { data } = await api.get(path, { responseType: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(data);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export type Integration = {
  id: number;
  name: string;
  baseUrl: string;
  authType: string;
  isActive: boolean;
  hasKey: boolean;
  lastSyncAt: string | null;
};
export type SyncLog = {
  id: number;
  integration: string;
  startedAt: string;
  records: number;
  success: number;
  failed: number;
  durationMs: number;
  status: string;
  error: string | null;
};
export const getIntegrations = async () => (await api.get<Integration[]>('/integrations')).data;
export const saveIntegration = async (id: number | null, body: Record<string, unknown>) =>
  (await (id ? api.patch(`/integrations/${id}`, body) : api.post('/integrations', body))).data;
export const deleteIntegration = (id: number) => api.delete(`/integrations/${id}`);
export const testIntegration = async (id: number) => (await api.post<{ ok: boolean; message: string }>(`/integrations/${id}/test`)).data;
export const syncIntegration = async (id: number) => (await api.post<SyncLog>(`/integrations/${id}/sync`)).data;
export const getSyncHistory = async () => (await api.get<SyncLog[]>('/integrations/sync-history')).data;

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

export async function importStudents(rows: Record<string, string>[]) {
  const { data } = await api.post<{ created: number; errors: string[] }>('/students/import', { rows });
  return data;
}

// CSV (UTF-8, dòng đầu là tiêu đề): MSSV,Họ tên,Email,Lớp,Khóa,Ngành. Trả về chuỗi tóm tắt để alert.
// ponytail: split theo dấu phẩy, không hỗ trợ ô có dấu phẩy/ngoặc kép; dùng thư viện CSV nếu cần.
export async function importStudentsFile(file: File) {
  const [head, ...lines] = (await file.text()).replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim())
  const alias: Record<string, string> = { 'mssv': 'mssv', 'họ tên': 'name', 'lớp': 'className', 'khóa': 'cohort', 'ngành': 'major' }
  const keys = head.split(',').map(k => alias[k.trim().toLowerCase()] ?? k.trim())
  const rows = lines.map(l => Object.fromEntries(l.split(',').map((v, i) => [keys[i], v.trim()])))
  try {
    return await importStudents(rows)
  } catch (e: any) {
    return { created: 0, errors: [e?.response?.data?.message || 'Import thất bại'] }
  }
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

// CSV xuất từ Google Sheet (File > Tải xuống > .csv). Lấy cột có tiêu đề chứa "mssv" (mặc định cột đầu); bỏ qua cột khác.
// ponytail: tách theo dấu phẩy sau khi bỏ ngoặc kép; ô có dấu phẩy bên trong sẽ lệch cột.
export async function importAttendanceFile(activityId: number, file: File) {
  const [head, ...lines] = (await file.text()).replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
  const cells = (l: string) => l.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
  const col = Math.max(cells(head).findIndex(h => h.toLowerCase().includes('mssv')), 0);
  const rows = lines.map(l => ({ mssv: cells(l)[col] }));
  try {
    const { data } = await api.post<{ updated: number; created: number; errors: string[] }>('/participations/import', { activityId, rows });
    return data;
  } catch (e: any) {
    return { updated: 0, created: 0, errors: [e?.response?.data?.message || 'Import thất bại'] };
  }
}

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


export const getRoles = () => api.get('/roles').then(r => (Array.isArray(r.data) ? r.data : []));
export const saveRole = (r: { id?: number; name: string; desc: string; status: string }) =>
  (r.id ? api.patch(`/roles/${r.id}`, r) : api.post('/roles', r)).then(x => x.data);
export const deleteRole = (id: number) => api.delete(`/roles/${id}`);

export const saveAccount = (a: { id?: number; username?: string; name: string; email: string; status?: string; role?: string; password?: string }) =>
  (a.id ? api.patch(`/auth/users/${a.id}`, a) : api.post('/auth/users', a)).then(x => x.data);
export const deleteAccount = (id: number) => api.delete(`/auth/users/${id}`);

export type AuditLogItem = {
  id: number;
  time: string;
  user: string;
  role: string;
  action: string;
  object: string;
  objectId: string | null;
  status: 'Thành công' | 'Thất bại';
  detail: string | null;
};

export async function getAuditLogs() {
  const { data } = await api.get<AuditLogItem[]>('/audit-logs');
  return data;
}

export type Semester = { id: number; name: string; year: string; startDate: string; endDate: string; isCurrent: boolean; status: string };
export type SemesterInput = { name: string; year: string; startDate: string; endDate: string };

export const getSemesters = () => api.get<Semester[]>('/semesters').then(r => (Array.isArray(r.data) ? r.data : []));
export const saveSemester = (s: SemesterInput & { id?: number }) =>
  (s.id ? api.patch(`/semesters/${s.id}`, { name: s.name, year: s.year, startDate: s.startDate, endDate: s.endDate }) : api.post('/semesters', s)).then(x => x.data);
export const setCurrentSemester = (id: number) => api.post(`/semesters/${id}/current`);
export const deleteSemester = (id: number) => api.delete(`/semesters/${id}`);

export type CriteriaRow = {
  id: number; semesterId: number; group: string; name: string; description: string | null;
  requirement: number; activities: number; semester: string; status: string;
};
export type CriteriaInput = { semesterId: number; group: string; name: string; description?: string; requirement: number };

export const getCriteria = () => api.get<CriteriaRow[]>('/criteria').then(r => (Array.isArray(r.data) ? r.data : []));
export const saveCriteria = (c: CriteriaInput & { id?: number }) =>
  (c.id ? api.patch(`/criteria/${c.id}`, { ...c, id: undefined }) : api.post('/criteria', c)).then(x => x.data);
export const deleteCriteria = (id: number) => api.delete(`/criteria/${id}`);

export type CriteriaProgress = {
  id: number; name: string; group: string; required: number; current: number; missing: number; pct: number;
  done: { name: string; date: string; status: string }[];
};
export type CriteriaProgressDetail = CriteriaProgress & { recommended: { id: number; name: string; unit: string | null; time: string }[] };

export const getCriteriaProgress = () =>
  api.get<{ semester: string | null; items: CriteriaProgress[] }>('/criteria/progress').then(r => r.data);
export const getCriteriaProgressDetail = (id: number | string) =>
  api.get<CriteriaProgressDetail>(`/criteria/progress/${id}`).then(r => r.data);

export type NotificationItem = { id: number; title: string; message: string; type: string; read: boolean; time: string };
export type SentNotification = { id: string; title: string; message: string; type: string; recipients: number; time: string };

export const getNotifications = () => api.get<NotificationItem[]>('/notifications').then(r => (Array.isArray(r.data) ? r.data : []));
export const getSentNotifications = () => api.get<SentNotification[]>('/notifications/sent').then(r => (Array.isArray(r.data) ? r.data : []));
export const sendNotification = (n: { title: string; message: string; className?: string; cohort?: string }) =>
  api.post<{ sent: number }>('/notifications', n).then(r => r.data);
export const markNotificationRead = (id: number) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');
