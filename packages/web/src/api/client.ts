// Thin typed fetch client. No TanStack Query in this stack — route loaders
// call these functions directly (see router.tsx).
const BASE = '/api';

// Exercise stub: identifies the caller to the API's AuthGuard via x-user-id.
// Seeded users: 'user_admin' (ADMIN), 'user_tech' (TECHNICIAN).
const DEV_USER_ID = 'user_admin';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': DEV_USER_ID,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export interface Building {
  id: string;
  name: string;
  address: string | null;
}

export interface WorkOrder {
  id: string;
  title: string;
  status: string;
  asset: { name: string } | null;
  assignee: { name: string } | null;
}

export const api = {
  getBuildings: () => request<Building[]>('/buildings'),
  getWorkOrders: () => request<WorkOrder[]>('/work-orders'),
};
