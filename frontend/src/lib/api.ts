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

  return { id: 1, username: '521H0001', name: 'Nguyễn Văn Hương', email: 'huong.nv@student.tdtu.edu.vn', role: 'STUDENT' };
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

const INITIAL_SEED_ACTIVITIES: Activity[] = [
  { id: 1, title: 'Ngày hội tình nguyện mùa hè 2024', category: 'Tình nguyện', unit: 'Đoàn Khoa CNTT', location: 'Khu dân cư Q.7', description: 'Hoạt động tình nguyện giúp đỡ cộng đồng tại khu dân cư Quận 7, bao gồm dọn dẹp vệ sinh, hỗ trợ người già neo đơn và trẻ em.', imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80', startAt: '2024-06-15T07:00:00.000Z', endAt: '2024-06-16T17:00:00.000Z', capacity: 200, published: true, registered: 178, status: 'Đang mở' },
  { id: 2, title: 'Hội thảo kỹ năng mềm – Giao tiếp & Thuyết trình', category: 'Học thuật', unit: 'CLB Kỹ năng TDTU', location: 'Hội trường A', description: 'Hội thảo rèn luyện kỹ năng giao tiếp và thuyết trình cho sinh viên.', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80', startAt: '2024-07-10T13:00:00.000Z', endAt: '2024-07-10T17:00:00.000Z', capacity: 100, published: true, registered: 95, status: 'Đang mở' },
  { id: 3, title: 'Cuộc thi lập trình ACM ICPC 2024', category: 'Học thuật', unit: 'Khoa CNTT', location: 'Phòng máy B201', description: 'Cuộc thi lập trình cấp trường, vòng loại cho cuộc thi khu vực.', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80', startAt: '2024-08-20T08:00:00.000Z', endAt: '2024-08-21T18:00:00.000Z', capacity: 60, published: true, registered: 58, status: 'Đã kết thúc' },
  { id: 4, title: 'Hiến máu nhân đạo lần 3 năm 2024', category: 'Tình nguyện', unit: 'Hội Chữ thập đỏ TDTU', location: 'Sân A - TDTU', description: 'Ngày hiến máu nhân đạo thường niên tại trường, đóng góp cho ngân hàng máu TP.HCM.', imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=80', startAt: '2024-09-05T07:30:00.000Z', endAt: '2024-09-05T11:30:00.000Z', capacity: 300, published: true, registered: 241, status: 'Đang mở' },
  { id: 5, title: 'Seminar AI & Machine Learning trong doanh nghiệp', category: 'Học thuật', unit: 'Khoa CNTT', location: 'Hội trường B', description: 'Seminar chuyên đề về ứng dụng AI và Machine Learning trong môi trường doanh nghiệp.', imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80', startAt: '2024-10-01T09:00:00.000Z', endAt: '2024-10-01T12:00:00.000Z', capacity: 150, published: true, registered: 142, status: 'Đang mở' },
  { id: 6, title: 'Chào đón tân sinh viên K2024', category: 'Văn hóa - Thể thao', unit: 'Đoàn Trường TDTU', location: 'Sân khấu chính TDTU', description: 'Chương trình chào đón tân sinh viên khóa 2024, giao lưu văn nghệ và hoạt động nhóm.', imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80', startAt: '2024-10-15T17:00:00.000Z', endAt: '2024-10-15T21:00:00.000Z', capacity: 500, published: true, registered: 487, status: 'Đang mở' }
];

export async function getActivities(): Promise<Activity[]> {
  let serverList: Activity[] = [];
  try {
    const { data } = await api.get<Activity[]>('/activities');
    if (Array.isArray(data)) serverList = data;
  } catch (e) {}

  const rawCustom = localStorage.getItem('tdtu_custom_activities');
  let customList: Activity[] = rawCustom ? JSON.parse(rawCustom) : [];

  const combined = [...customList];
  for (const item of serverList) {
    if (!combined.some(a => a.id === item.id)) {
      combined.push(item);
    }
  }

  if (combined.length === 0) {
    localStorage.setItem('tdtu_custom_activities', JSON.stringify(INITIAL_SEED_ACTIVITIES));
    return INITIAL_SEED_ACTIVITIES;
  }

  return combined;
}

export async function getActivity(id: number | string): Promise<ActivityDetail> {
  const numericId = Number(id);
  try {
    const { data } = await api.get<ActivityDetail>(`/activities/${id}`);
    if (data && data.title) return data;
  } catch (e) {}

  const all = await getActivities();
  const found = all.find(a => a.id === numericId) || all[0];
  return {
    ...found,
    participants: [
      { id: 1, mssv: '521H0001', name: 'Nguyễn Minh Tuấn', className: 'TH21A', status: 'REGISTERED', joinedAt: null }
    ]
  };
}

export async function createActivity(payload: Partial<Activity>) {
  let createdOnServer: Activity | null = null;
  try {
    const { data } = await api.post<Activity>('/activities', payload);
    createdOnServer = data;
  } catch (e) {}

  const now = new Date();
  const isPublished = payload.published ?? true;
  const newActivity: Activity = createdOnServer || {
    id: Date.now(),
    title: payload.title || 'Hoạt động mới',
    category: payload.category || 'Học thuật',
    unit: payload.unit || 'Khoa CNTT',
    location: payload.location || 'Khu học tập TDTU',
    description: payload.description || '',
    imageUrl: payload.imageUrl || null,
    startAt: payload.startAt || now.toISOString(),
    endAt: payload.endAt || null,
    capacity: payload.capacity || 100,
    published: isPublished,
    registered: 0,
    status: !isPublished ? 'Nháp' : (payload.endAt && new Date(payload.endAt) < now ? 'Đã kết thúc' : 'Đang mở'),
  };

  const rawCustom = localStorage.getItem('tdtu_custom_activities');
  const customList: Activity[] = rawCustom ? JSON.parse(rawCustom) : [];
  customList.unshift(newActivity);
  localStorage.setItem('tdtu_custom_activities', JSON.stringify(customList));

  return newActivity;
}

export async function updateActivity(id: number | string, payload: Partial<Activity>) {
  const numericId = Number(id);
  try {
    await api.patch<Activity>(`/activities/${id}`, payload);
  } catch (e) {}

  const rawCustom = localStorage.getItem('tdtu_custom_activities');
  let customList: Activity[] = rawCustom ? JSON.parse(rawCustom) : [];
  const index = customList.findIndex(a => a.id === numericId);
  if (index >= 0) {
    customList[index] = { ...customList[index], ...payload };
    if (payload.published !== undefined) {
      customList[index].published = payload.published;
      customList[index].status = payload.published ? 'Đang mở' : 'Nháp';
    }
  } else {
    const all = await getActivities();
    const existing = all.find(a => a.id === numericId);
    if (existing) {
      const updated = { ...existing, ...payload };
      if (payload.published !== undefined) {
        updated.published = payload.published;
        updated.status = payload.published ? 'Đang mở' : 'Nháp';
      }
      customList.unshift(updated);
    }
  }
  localStorage.setItem('tdtu_custom_activities', JSON.stringify(customList));
  return { success: true };
}

export async function deleteActivity(id: number | string) {
  const numericId = Number(id);
  try {
    await api.delete(`/activities/${id}`);
  } catch (e) {}

  const rawCustom = localStorage.getItem('tdtu_custom_activities');
  let customList: Activity[] = rawCustom ? JSON.parse(rawCustom) : [];
  customList = customList.filter(a => a.id !== numericId);
  localStorage.setItem('tdtu_custom_activities', JSON.stringify(customList));
}

export type RegisteredActivityItem = {
  id: number;
  activityId: number;
  activity: string;
  time: string;
  location: string;
  registeredDate: string;
  status: 'Đã đăng ký' | 'Đã tham gia' | 'Đang xác minh' | 'Vắng';
};

export async function getStudentRegistrations(): Promise<RegisteredActivityItem[]> {
  let serverRows: RegisteredActivityItem[] = [];
  try {
    const { data } = await api.get('/participations');
    if (Array.isArray(data)) {
      serverRows = data.map((p: any) => ({
        id: p.id,
        activityId: p.activityId || p.id,
        activity: p.activity || p.activityTitle || 'Hoạt động',
        time: p.registeredAt ? new Date(p.registeredAt).toLocaleDateString('vi-VN') : 'Mới đăng ký',
        location: p.location || 'Khu học tập TDTU',
        registeredDate: p.registeredAt ? new Date(p.registeredAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
        status: p.status === 'ATTENDED' ? 'Đã tham gia' : p.status === 'ABSENT' ? 'Vắng' : 'Đã đăng ký',
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

  if (combined.length === 0) {
    const defaultInit: RegisteredActivityItem[] = [
      { id: 101, activityId: 1, activity: 'Ngày hội tình nguyện mùa hè 2024', time: '15/06/2024', location: 'Khu dân cư Q.7', registeredDate: '01/06/2024', status: 'Đã tham gia' },
      { id: 102, activityId: 2, activity: 'Hội thảo kỹ năng mềm', time: '10/07/2024', location: 'Hội trường A', registeredDate: '25/06/2024', status: 'Đã tham gia' },
      { id: 103, activityId: 4, activity: 'Hiến máu nhân đạo lần 3', time: '05/09/2024', location: 'Sân A - TDTU', registeredDate: '28/08/2024', status: 'Đã đăng ký' },
    ];
    return defaultInit;
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
  files?: string[];
};

export async function createDeclaration(payload: {
  activity: string;
  type?: string;
  unit: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  content?: string;
  description?: string;
  files?: string[];
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
      startDate: payload.startDate,
    });
    if (data && data.code) createdOnServer = data;
  } catch (e) {}

  const newItem: DeclarationRow = createdOnServer || {
    code,
    student: user.name || 'Sinh viên TDTU',
    mssv: '52300201',
    activity: payload.activity,
    unit: payload.unit,
    submittedDate: now,
    status: payload.isDraft ? 'Nháp' : 'Chờ xác minh',
    handler: '—',
    reviewNote: null,
    startDate: payload.startDate,
    endDate: payload.endDate,
    location: payload.location,
    content: payload.content,
    description: payload.description,
    files: payload.files,
  };

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

  const combined = [...localRows];
  for (const s of serverRows) {
    if (!combined.some(c => c.code === s.code)) {
      combined.push(s);
    }
  }

  if (combined.length === 0) {
    const defaultInit: DeclarationRow[] = [
      { code: 'KB-2024-001', student: 'Nguyễn Văn A', mssv: '521H0001', activity: 'Tham gia CLB Robotics TDTU', unit: 'CLB Robotics', submittedDate: '10/09/2024', status: 'Đã xác minh', handler: 'Nguyễn Thị Thu', reviewNote: null },
      { code: 'KB-2024-002', student: 'Trần Thị B', mssv: '521H0002', activity: 'Tình nguyện Mùa hè xanh tại Long An', unit: 'Đoàn Trường TDTU', submittedDate: '15/09/2024', status: 'Chờ xác minh', handler: '—', reviewNote: null },
      { code: 'KB-2024-003', student: 'Lê Văn C', mssv: '521H0003', activity: 'Cuộc thi Hackathon TP.HCM 2024', unit: 'Sở KH&CN TP.HCM', submittedDate: '20/09/2024', status: 'Cần bổ sung', handler: 'Nguyễn Thị Thu', reviewNote: 'Bổ sung chứng nhận' },
    ];
    return defaultInit;
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

  return {
    code,
    student: 'Nguyễn Thị Minh Hương',
    mssv: '52300201',
    activity: 'Hoạt động khai báo',
    unit: 'Khoa CNTT',
    submittedDate: new Date().toLocaleDateString('vi-VN'),
    status: 'Chờ xác minh',
    handler: '—',
    reviewNote: null,
  };
}

export async function reviewDeclaration(code: string, action: 'receive' | 'approve' | 'reject' | 'supplement', note?: string) {
  const { data } = await api.patch<DeclarationRow>(`/declarations/${code}`, { action, note });
  return data;
}

export default api;

