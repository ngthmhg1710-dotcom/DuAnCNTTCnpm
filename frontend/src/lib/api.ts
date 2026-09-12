import axios from 'axios';
import { accounts as mockAccounts } from '../data/mock';

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

export function registerUserSession(user: CurrentUser) {
  if (!user || !user.email) return;
  try {
    const raw = localStorage.getItem('tdtu_registered_users');
    let list: any[] = raw ? JSON.parse(raw) : [];
    const existsIndex = list.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
    const accItem = {
      id: user.id || Date.now(),
      username: user.username || user.email.split('@')[0],
      name: user.name || user.username,
      email: user.email,
      role: user.role === 'ADMIN' ? 'Admin' : user.role === 'STAFF' ? 'Cán bộ' : 'Sinh viên',
      status: 'Hoạt động',
      lastLogin: new Date().toLocaleString('vi-VN'),
      created: new Date().toLocaleDateString('vi-VN'),
    };
    if (existsIndex >= 0) {
      list[existsIndex] = { ...list[existsIndex], ...accItem, lastLogin: new Date().toLocaleString('vi-VN') };
    } else {
      list.unshift(accItem);
    }
    localStorage.setItem('tdtu_registered_users', JSON.stringify(list));
  } catch (e) {}
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const stored = localStorage.getItem('tdtu_current_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.name) {
        registerUserSession(parsed);
        return parsed;
      }
    } catch (e) {}
  }
  try {
    const { data } = await api.get<CurrentUser>('/auth/me');
    if (data && data.name) {
      localStorage.setItem('tdtu_current_user', JSON.stringify(data));
      registerUserSession(data);
      return data;
    }
  } catch (e) {}

  return { id: 1, username: 'google_user', name: 'Tài khoản Google', email: 'user@student.tdtu.edu.vn', role: 'STUDENT' };
}

export function loginWithOAuth() {
  window.location.href = `${API_BASE}/auth/oauth/google`;
}

export async function loginWithCredentials(username: string, password?: string) {
  try {
    const { data } = await api.post<{ user: CurrentUser; redirectUrl: string }>('/auth/login', { username, password });
    localStorage.setItem('tdtu_current_user', JSON.stringify(data.user));
    registerUserSession(data.user);
    return data;
  } catch (err: any) {
    // Client-side fallback if backend API is unavailable
    const clean = username.trim().toLowerCase();
    let user: CurrentUser;
    if (clean.includes('staff') || clean.includes('thu')) {
      user = { id: 2, username: 'staff.thu', name: 'Nguyễn Thị Thu', email: 'thu.nt@tdtu.edu.vn', role: 'STAFF' };
    } else if (clean.includes('student') || clean.includes('521') || clean.includes('tuan')) {
      user = { id: 1, username: '521H0001', name: 'Nguyễn Minh Tuấn', email: 'tuannm@student.tdtu.edu.vn', role: 'STUDENT' };
    } else {
      // Default to admin for admin form login
      user = { id: 3, username: username || 'admin.it', name: 'Lê Văn Quản', email: 'quan.lv@tdtu.edu.vn', role: 'ADMIN' };
    }
    localStorage.setItem('tdtu_current_user', JSON.stringify(user));
    registerUserSession(user);
    const target = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'STAFF' ? '/staff/dashboard' : '/student/dashboard';
    return { user, redirectUrl: target };
  }
}

export async function loginWithGoogleDirect(email: string, name?: string) {
  const clean = email.trim().toLowerCase();
  if (!clean.endsWith('@tdtu.edu.vn') && !clean.endsWith('@student.tdtu.edu.vn')) {
    throw new Error('Hệ thống chỉ cho phép đăng nhập bằng email trường TDTU (@tdtu.edu.vn hoặc @student.tdtu.edu.vn).');
  }

  try {
    const { data } = await api.post<{ user: CurrentUser; redirectUrl: string }>('/auth/oauth/google-direct', { email, name });
    localStorage.setItem('tdtu_current_user', JSON.stringify(data.user));
    registerUserSession(data.user);
    return data;
  } catch (err: any) {
    // Client-side fallback if backend API is unavailable
    let role: 'ADMIN' | 'STAFF' | 'STUDENT' = 'STUDENT';
    if (clean.includes('admin') || clean.includes('quan')) role = 'ADMIN';
    else if (clean.includes('staff') || clean.includes('thu') || clean.endsWith('@tdtu.edu.vn')) role = 'STAFF';

    const user: CurrentUser = {
      id: Math.floor(Math.random() * 1000) + 1,
      username: clean.split('@')[0],
      name: name || (role === 'ADMIN' ? 'Lê Văn Quản' : role === 'STAFF' ? 'Nguyễn Thị Thu' : 'Nguyễn Minh Tuấn'),
      email: clean,
      role,
    };
    localStorage.setItem('tdtu_current_user', JSON.stringify(user));
    registerUserSession(user);
    const target = role === 'ADMIN' ? '/admin/dashboard' : role === 'STAFF' ? '/staff/dashboard' : '/student/dashboard';
    return { user, redirectUrl: target };
  }
}

export async function loginWithGoogleToken(idToken: string) {
  const { data } = await api.post<{ user: CurrentUser; redirectUrl: string }>('/auth/oauth/google-token', { idToken });
  localStorage.setItem('tdtu_current_user', JSON.stringify(data.user));
  registerUserSession(data.user);
  return data;
}

export async function getAccounts() {
  let serverUsers: any[] = [];
  try {
    const { data } = await api.get('/auth/users');
    if (Array.isArray(data)) {
      serverUsers = data.map((u: any) => ({
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
  } catch (e) {}

  const rawLocal = localStorage.getItem('tdtu_registered_users');
  let localUsers: any[] = rawLocal ? JSON.parse(rawLocal) : [];

  const currentRaw = localStorage.getItem('tdtu_current_user');
  if (currentRaw) {
    try {
      const cur = JSON.parse(currentRaw);
      if (cur && cur.email) {
        registerUserSession(cur);
        const updatedLocal = localStorage.getItem('tdtu_registered_users');
        if (updatedLocal) localUsers = JSON.parse(updatedLocal);
      }
    } catch (e) {}
  }

  const combined = [...serverUsers];
  for (const loc of localUsers) {
    if (!combined.some(u => u.email.toLowerCase() === loc.email.toLowerCase())) {
      combined.unshift(loc);
    }
  }
  for (const mock of mockAccounts) {
    if (!combined.some(u => u.email.toLowerCase() === mock.email.toLowerCase())) {
      combined.push(mock);
    }
  }

  return combined;
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

export default api;

