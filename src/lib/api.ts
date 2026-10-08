/**
 * LonePay API client.
 *
 * Authentication uses Laravel Sanctum's stateful SPA cookie flow: the browser
 * holds an httpOnly session cookie and no credentials or tokens are ever read
 * or stored by JavaScript. Before any mutating request we ask the API for an
 * `XSRF-TOKEN` cookie and echo it back in the `X-XSRF-TOKEN` header.
 */

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly errors: FieldErrors;

  constructor(message: string, status: number, errors: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  firstError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1")}=([^;]*)`,
    ),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrfCookie(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const isMutation = method !== "GET";

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (isMutation) {
    await ensureCsrfCookie();

    const token = readCookie("XSRF-TOKEN");
    if (token) {
      headers["X-XSRF-TOKEN"] = token;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload: unknown =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const data = (payload ?? {}) as {
      message?: string;
      errors?: FieldErrors;
    };

    throw new ApiError(
      data.message ?? "Something went wrong. Please try again.",
      response.status,
      data.errors ?? {},
    );
  }

  return payload as T;
}
