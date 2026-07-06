// Typed client for the MotoClub Go backend. Every function maps 1:1 to an
// endpoint in the API contract. The JWT from the current session is attached
// automatically; the base URL comes from config (env-driven).

import { config } from "@/lib/config";
import { getToken, type Role } from "@/lib/session";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type FetchOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach bearer token (default true)
  signal?: AbortSignal;
};

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data && String(data.error)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

// ---- response/request shapes (mirror the Go DTOs) ----

export type GalleryItem = { id: string; link: string; created_at: string };
export type EventSummary = { id: string; title: string; date: string; last_updated_at: string };
export type EventDetail = {
  id: string;
  title: string;
  date: string;
  location: string | null;
  description: string;
  last_updated_at: string;
};
export type Announcement = {
  id: string;
  title: string;
  description: string;
  last_updated_at: string;
};
export type Profile = {
  name: string;
  email: string;
  phoneNumber: string;
  placeOfBirth: string;
  dateofBirth: string;
  address: string;
  instagramUsername: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactPhoneNumber: string;
  motorbikeName: string;
  motorbikeSelfieLinkPath: string;
  status: string;
  created_at: string;
  approved_at: string | null;
};
export type Registration = {
  member_id: string;
  name: string;
  email: string;
  registered_at: string;
};
export type MemberRow = {
  id: string;
  email: string;
  role: Role;
  registration_date: string;
  approval_date: string | null;
};

export type RegisterRequest = {
  name: string;
  email: string;
  phoneNumber: string;
  placeOfBirth: string;
  dateofBirth: string;
  address: string;
  instagramUsername: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactPhoneNumber: string;
  motorbikeName: string;
  motorbikeSelfieLinkPath: string;
  googleToken: string;
};

export type EventInput = {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  location?: string | null;
};

// ---- auth ----

export const api = {
  register: (body: RegisterRequest) =>
    apiFetch<{ id: string }>("/register", { method: "POST", body, auth: false }),

  login: (email: string, googleToken: string) =>
    apiFetch<{ id: string; token: string }>("/login", {
      method: "POST",
      body: { email, googleToken },
      auth: false,
    }),

  logout: () => apiFetch<void>("/logout", { method: "POST" }),

  // ---- landing / member area ----
  getGallery: () => apiFetch<{ contents: GalleryItem[] }>("/gallery").then((r) => r.contents),

  getEvents: (startFrom?: string) =>
    apiFetch<{ events: EventSummary[] }>(
      "/events" + (startFrom ? `?startFrom=${encodeURIComponent(startFrom)}` : "")
    ).then((r) => r.events),

  getEvent: (id: string) => apiFetch<EventDetail>(`/event/${id}`),

  getAnnouncements: (startFrom?: string) =>
    apiFetch<{ announcements: Announcement[] }>(
      "/announcements" + (startFrom ? `?startFrom=${encodeURIComponent(startFrom)}` : "")
    ).then((r) => r.announcements),

  // ---- profile ----
  getProfile: (memberId: string) => apiFetch<Profile>(`/members/${memberId}/profile`),

  // ---- admin: members ----
  getRegistrationCount: () =>
    apiFetch<{ count: number }>("/members/registration/count").then((r) => r.count),

  getRegistrations: () =>
    apiFetch<{ registrations: Registration[] }>("/members/registration").then((r) => r.registrations),

  setMemberStatus: (id: string, action: "APPROVE" | "REJECT", remarks?: string) =>
    apiFetch<void>(`/members/${id}/status`, { method: "POST", body: { action, remarks: remarks ?? null } }),

  getMembers: () => apiFetch<{ members: MemberRow[] }>("/members").then((r) => r.members),

  updateMemberRole: (id: string, role: "ADMIN" | "MEMBER") =>
    apiFetch<void>(`/members/${id}`, { method: "POST", body: { role } }),

  deleteMember: (id: string) => apiFetch<void>(`/members/${id}`, { method: "DELETE" }),

  // ---- admin: events ----
  createEvent: (body: EventInput) => apiFetch<{ id: string }>("/events", { method: "POST", body }),
  updateEvent: (id: string, body: EventInput) =>
    apiFetch<void>(`/events/${id}`, { method: "PUT", body }),
  deleteEvent: (id: string) => apiFetch<void>(`/events/${id}`, { method: "DELETE" }),

  // ---- admin: announcements ----
  createAnnouncement: (title: string, description: string) =>
    apiFetch<{ id: string }>("/announcements", { method: "POST", body: { title, description } }),
  updateAnnouncement: (id: string, title: string, description: string) =>
    apiFetch<void>(`/announcements/${id}`, { method: "PUT", body: { title, description } }),
  deleteAnnouncement: (id: string) =>
    apiFetch<void>(`/announcements/${id}`, { method: "DELETE" }),

  // ---- admin: gallery ----
  createGalleryItem: (link: string) =>
    apiFetch<{ id: string }>("/gallery", { method: "POST", body: { link } }),
  deleteGalleryItem: (id: string) => apiFetch<void>(`/gallery/${id}`, { method: "DELETE" }),
};
