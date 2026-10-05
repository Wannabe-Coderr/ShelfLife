const API_BASE_URL = "http://localhost:5000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Request failed");
  }

  return payload as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ success: boolean; message: string; token: string; user: { email: string; role: string } }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password })
      }
    ),
  getBooks: (params?: Record<string, string | number>) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => query.append(key, String(value)));
    return request<{ success: boolean; data: unknown[]; pagination: { page: number; pages: number; total: number; limit: number } }>(`/books${query && query.toString() ? `?${query.toString()}` : ""}`);
  },
  createBook: (book: Record<string, unknown>) =>
    request<{ success: boolean; message: string; data: unknown }>("/books", {
      method: "POST",
      body: JSON.stringify(book)
    }),
  getMembers: () => request<{ success: boolean; data: unknown[]; pagination?: { total: number } }>("/members"),
  createMember: (member: Record<string, unknown>) =>
    request<{ success: boolean; message: string; data: unknown }>("/members", {
      method: "POST",
      body: JSON.stringify(member)
    }),
  issueBook: (bookId: string, memberId: string, token: string) =>
    request<{ success: boolean; message: string; data: unknown }>("/borrow", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ bookId, memberId })
    }),
  returnBook: (borrowId: string, token: string) =>
    request<{ success: boolean; message: string; data: unknown }>(`/return/${borrowId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getMemberHistory: (memberId: string) =>
    request<{ success: boolean; data: { member: unknown; history: unknown[] } }>(`/members/${memberId}/history`)
};

export default api;
