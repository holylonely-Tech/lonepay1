/**
 * LonePay API client.
 *
 * Authentication uses Laravel Sanctum's stateful SPA cookie flow: the browser
 * holds an httpOnly session cookie and no credentials or tokens are ever read
 * or stored by JavaScript. Before any mutating request we ask the API for an
 * `XSRF-TOKEN` cookie and echo it back in the `X-XSRF-TOKEN` header.
 *
 * When that token no longer matches the server session (for example the session
 * expired, another tab rotated the token, or the cookie was not persisted),
 * Laravel answers `419` and — importantly — does not refresh the `XSRF-TOKEN`
 * cookie on that response. To recover, we fetch a fresh cookie and retry the
 * request exactly once. A `419` is always raised by the CSRF middleware before
 * the controller runs, so this retry can never repeat a side effect such as
 * creating an account.
 */

/**
 * API base URL. Empty by default so requests go to the SPA's own origin, which
 * `next.config.ts` proxies to Laravel (required for Sanctum's first-party
 * cookie/CSRF flow). Set `NEXT_PUBLIC_API_URL` only when the API genuinely
 * lives on a different, same-site origin.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
  /\/+$/,
  "",
);

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

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";
const CSRF_STATUS = 419;
const CSRF_ERROR_MESSAGE =
  "Your session expired. Please refresh the page and try again.";

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

function buildHeaders(
  isMutation: boolean,
  hasBody: boolean,
): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (isMutation) {
    const token = readCookie(CSRF_COOKIE_NAME);
    if (token) {
      headers[CSRF_HEADER_NAME] = token;
    }
  }

  return headers;
}

async function performRequest(
  path: string,
  method: NonNullable<RequestOptions["method"]>,
  body: unknown,
): Promise<{ response: Response; payload: unknown }> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders(method !== "GET", body !== undefined),
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload: unknown =
    response.status === 204 ? null : await response.json().catch(() => null);

  return { response, payload };
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<T> {
  const isMutation = method !== "GET";

  if (isMutation) {
    await ensureCsrfCookie();
  }

  let { response, payload } = await performRequest(path, method, body);

  if (isMutation && response.status === CSRF_STATUS) {
    await ensureCsrfCookie();
    ({ response, payload } = await performRequest(path, method, body));
  }

  if (!response.ok) {
    const data = (payload ?? {}) as {
      message?: string;
      errors?: FieldErrors;
    };

    throw new ApiError(
      response.status === CSRF_STATUS
        ? CSRF_ERROR_MESSAGE
        : (data.message ?? "Something went wrong. Please try again."),
      response.status,
      data.errors ?? {},
    );
  }

  return payload as T;
}
