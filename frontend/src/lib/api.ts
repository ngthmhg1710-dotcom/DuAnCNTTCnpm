import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'https://student-activity-api-w982.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Access token (15 phút) hết hạn -> đổi bằng refresh token rồi gọi lại request một lần.
// Nếu refresh cũng thất bại (session hết hạn hoàn toàn) -> redirect về /login.
api.interceptors.response.use(undefined, async (err) => {
  const cfg = err.config;
  if (err.response?.status !== 401 || !cfg || cfg._retried || /\/auth\/(login|refresh|logout|oauth)/.test(cfg.url || '')) {
    throw err;
  }
  cfg._retried = true;
  try {
    await api.post('/auth/refresh');
    return api(cfg);
  } catch {
    // Refresh token cũng hết hạn hoặc bị revoke -> buộc đăng nhập lại.
    currentUser = null;
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw err;
  }
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

export type StatFilters = { semesterId?: number | ''; className?: string; cohort?: string; category?: string };
export type Named = { name: string; value: number };
export type StaffDashboardData = {
  semester: string; students: number; activities: number; participations: number; attended: number; participationRate: number;
  pendingVerification: number; needsMoreInfo: number; attentionCount: number;
  byCategory: { category: string; value: number }[]; byStatus: Named[]; byMonth: Named[];
  byClass: { name: string; students: number; attended: number }[]; byCohort: { name: string; students: number; attended: number }[];
  bySemester: { name: string; activities: number; attended: number }[]; byDeclarationStatus: { status: string; value: number }[];
};
// Bỏ các bộ lọc rỗng để không gửi ?className= lên server.
const cleanParams = (f: StatFilters) => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '' && v !== undefined));
export async function getStaffDashboard(filters: StatFilters = {}) {
  const { data } = await api.get<StaffDashboardData>('/analytics/dashboard', { params: cleanParams(filters) });
  return data;
}

export type FilterOptions = { semesters: { id: number; name: string; isCurrent: boolean }[]; classes: string[]; cohorts: string[]; categories: string[] };
export const getFilterOptions = async () => (await api.get<FilterOptions>('/analytics/filter-options')).data;

export type ReportType = 'students' | 'history' | 'by-semester' | 'low-participation' | 'verification';
export type ReportData = { title: string; columns: string[]; rows: (string | number)[][] };
export const getReport = async (type: ReportType, filters: StatFilters = {}) =>
  (await api.get<ReportData>(`/analytics/reports/${type}`, { params: cleanParams(filters) })).data;
export const downloadReport = (type: ReportType, filters: StatFilters = {}) =>
  downloadFile(`/analytics/reports/${type}/export`, `bao-cao-${type}.xlsx`, cleanParams(filters));

export type AlertConfig = { lowBelow: number; mediumBelow: number; targetPoints: number; manyPending: number; riskAfterPct: number };
export type AttentionFlag = { code: string; label: string; reason: string };
export type AttentionStudent = {
  id: number; mssv: string; name: string; className: string | null; cohort: string | null;
  activities: number; score: number; missingCriteria: number; pendingRequests: number;
  priority: 'Cao' | 'Trung bình' | 'Thấp'; flags: AttentionFlag[];
};
export type AttentionResult = {
  semester: string | null; config: AlertConfig; target: number; maxTotal: number;
  summary: { code: string; label: string; count: number }[]; students: AttentionStudent[];
};
export async function getAttentionStudents(filters: StatFilters = {}, flag = '') {
  const { data } = await api.get<AttentionResult>('/analytics/attention-students', { params: { ...cleanParams(filters), flag: flag || undefined } });
  return data;
}
export const getAlertConfig = async () => (await api.get<AlertConfig>('/alert-settings')).data;
export const saveAlertConfig = async (c: AlertConfig) => (await api.put<AlertConfig>('/alert-settings', c)).data;

// Tải file (xlsx) qua axios để dùng chung cookie + refresh token.
export async function downloadFile(path: string, filename: string, params?: Record<string, unknown>) {
  const { data } = await api.get(path, { responseType: 'blob', params });
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
  dataType: string;
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
  dataType?: string;
  source?: string; // Kéo: hệ thống gọi đối tác | Đẩy: đối tác gọi vào
  openErrors?: number; // số bản ghi lỗi chưa xử lý
};
export type SyncError = {
  id: number;
  rowIndex: number;
  key: string | null;
  reason: string;
  raw: unknown;
  attempts: number;
  resolved: boolean;
};
export const DATA_TYPE_LABEL: Record<string, string> = {
  STUDENTS: 'Sinh viên',
  ACTIVITIES: 'Hoạt động',
  PARTICIPATIONS: 'Tham gia',
  DECLARATIONS: 'Khai báo',
};
// Đường dẫn đối tác dùng để ĐẨY dữ liệu vào (POST, header x-api-key) theo từng loại dữ liệu.
export const INGEST_PATH: Record<string, string> = { STUDENTS: 'students', ACTIVITIES: 'activities', PARTICIPATIONS: 'participations', DECLARATIONS: 'declarations' };
export const getSyncErrors = async (logId: number) => (await api.get<SyncError[]>(`/integrations/sync-history/${logId}/errors`)).data;
export const retrySyncError = async (errorId: number) => (await api.post<{ resolved: boolean; reason: string | null; message: string }>(`/integrations/errors/${errorId}/retry`)).data;
export const retrySyncLog = async (logId: number) => (await api.post<{ total: number; resolved: number; stillFailing: number }>(`/integrations/sync-history/${logId}/retry`)).data;
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
  ruleCode?: string | null;
  points?: number;
  closed?: boolean;
  cancelled?: boolean;
  targetClasses?: string[];
  targetCohorts?: string[];
  registered: number;
  status: string;
};

export type ActivityDetail = Activity & {
  participants: { id: number; mssv: string; name: string; className: string | null; status: string; registeredAt: string; joinedAt: string | null }[];
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

// Học kỳ chứa một thời điểm (theo bảng Học kỳ); dùng để lọc hoạt động theo học kỳ.
export const semesterOf = (semesters: Semester[], iso: string) => {
  const t = new Date(iso).getTime();
  return semesters.find(s => t >= new Date(s.startDate).getTime() && t <= new Date(s.endDate).getTime() + 86399999);
};

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
  startAt: string;
  endAt: string | null;
  location: string;
  registeredDate: string;
  status: 'Đã đăng ký' | 'Đã tham gia' | 'Vắng';
  cancelled: boolean; // hoạt động đã bị hủy
  canCancel: boolean; // còn hủy đăng ký được (chưa điểm danh và chưa đến giờ bắt đầu)
  category?: string;
  imageUrl?: string;
  unit?: string;
  ruleCode?: string | null;
  points?: number;
};

const fmtShort = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

// Server là nguồn duy nhất: không lưu bản sao trong trình duyệt (từng gây ra đăng ký "ma" không có trên server).
export async function getStudentRegistrations(): Promise<RegisteredActivityItem[]> {
  const { data } = await api.get('/participations/mine');
  if (!Array.isArray(data)) return [];
  return data.map((p: any) => ({
    id: p.id,
    activityId: p.activityId,
    activity: p.activity || 'Hoạt động',
    time: p.startAt ? fmtShort(p.startAt) + (p.endAt ? ` → ${fmtShort(p.endAt)}` : '') : '—',
    startAt: p.startAt,
    endAt: p.endAt ?? null,
    location: p.location || 'Chưa xác định',
    registeredDate: p.registeredAt ? new Date(p.registeredAt).toLocaleDateString('vi-VN') : '—',
    status: p.status === 'ATTENDED' ? 'Đã tham gia' : p.status === 'ABSENT' ? 'Vắng' : 'Đã đăng ký',
    cancelled: !!p.cancelled,
    canCancel: !!p.canCancel && !p.cancelled,
    category: p.category,
    imageUrl: p.imageUrl ?? undefined,
    unit: p.unit ?? undefined,
    ruleCode: p.ruleCode,
    points: p.points,
  }));
}

// Lỗi từ server (hết suất, đã kết thúc, quá hạn hủy...) được ném ra để trang hiển thị.
export const registerActivity = (activity: Activity) => api.post('/participations', { activityId: activity.id }).then(r => r.data);
export const cancelRegisterActivity = (activityId: number | string) => api.delete(`/participations/${activityId}`).then(r => r.data);

export type HistoryItem = {
  type: 'Tham gia' | 'Khai báo';
  date: string;
  event: string;
  status: string;
  activityId?: number;
  code?: string;
  points?: number;
};
export const getStudentHistory = () => api.get<HistoryItem[]>('/participations/history').then(r => (Array.isArray(r.data) ? r.data : []));

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

// status: REGISTERED | ATTENDED | ABSENT, hoặc CANCELLED để gỡ lượt đăng ký.
export async function updateParticipationStatus(id: number, status: ParticipationRow['status'] | 'CANCELLED') {
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

// Chỉ lấy từ server (không trộn localStorage) để số liệu dashboard khớp dữ liệu thật.
export const getMyDeclarationStatuses = async () =>
  (await api.get<{ status: string }[]>('/declarations')).data.map(d => d.status)

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
  requirement: number; points: number; activities: number; semester: string; status: string;
};
export type CriteriaInput = { semesterId: number; group: string; name: string; description?: string; requirement: number; points: number };

export type CriteriaSummary = {
  semester: { id: number; label: string } | null;
  maxTotal: number;
  criteria: { id: number; group: string; name: string; requirement: number; points: number }[];
  students: { id: number; mssv: string; name: string; className: string | null; attended: number; byCriteria: number[]; estimated: number; rank: string }[];
};
export const getCriteriaSummary = (semesterId?: number) =>
  api.get<CriteriaSummary>('/criteria/summary', { params: semesterId ? { semesterId } : {} }).then(r => r.data);

export type CategoryType = 'ACTIVITY' | 'UNIT' | 'CRITERIA_GROUP' | 'CLASS' | 'COHORT';
export type Category = { id: number; type: CategoryType; name: string; usage: number };
export const getCategories = (type: CategoryType) =>
  api.get<Category[]>('/categories', { params: { type } }).then(r => (Array.isArray(r.data) ? r.data : []));
export const saveCategory = (c: { id?: number; type: CategoryType; name: string }) =>
  (c.id ? api.patch(`/categories/${c.id}`, { name: c.name }) : api.post('/categories', { type: c.type, name: c.name })).then(x => x.data);
export const deleteCategory = (id: number) => api.delete(`/categories/${id}`);

export const getCriteria = () => api.get<CriteriaRow[]>('/criteria').then(r => (Array.isArray(r.data) ? r.data : []));
export const saveCriteria = (c: CriteriaInput & { id?: number }) =>
  (c.id ? api.patch(`/criteria/${c.id}`, { ...c, id: undefined }) : api.post('/criteria', c)).then(x => x.data);
export const deleteCriteria = (id: number) => api.delete(`/criteria/${id}`);

export type CriteriaProgress = {
  id: number; name: string; group: string; required: number; current: number; missing: number; pct: number;
  points?: number; earned?: number;
  done: { name: string; date: string; status: string }[];
};
export type CriteriaProgressDetail = CriteriaProgress & { recommended: { id: number; name: string; unit: string | null; time: string }[] };

export const getCriteriaProgress = () =>
  api.get<{ semester: string | null; items: CriteriaProgress[]; estimated?: number; maxTotal?: number; rank?: string }>('/criteria/progress').then(r => r.data);
export const getStudentCriteriaProgress = (studentId: number | string) =>
  api.get<{ semester: string | null; items: CriteriaProgress[]; estimated: number; maxTotal: number; rank: string }>(`/criteria/students/${studentId}/progress`).then(r => r.data);
export const getCriteriaProgressDetail =(id: number | string) =>
  api.get<CriteriaProgressDetail>(`/criteria/progress/${id}`).then(r => r.data);

export type NotificationItem = { id: number; title: string; message: string; type: string; read: boolean; time: string };
export type SentNotification = { id: string; title: string; message: string; type: string; recipients: number; time: string };

export const getNotifications = () => api.get<NotificationItem[]>('/notifications').then(r => (Array.isArray(r.data) ? r.data : []));
export const getSentNotifications = () => api.get<SentNotification[]>('/notifications/sent').then(r => (Array.isArray(r.data) ? r.data : []));
export const sendNotification = (n: { title: string; message: string; className?: string; cohort?: string }) =>
  api.post<{ sent: number }>('/notifications', n).then(r => r.data);
export const markNotificationRead = (id: number) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');
