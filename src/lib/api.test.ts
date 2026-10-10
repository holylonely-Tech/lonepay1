import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_URL, ApiError, apiRequest } from "@/lib/api";

const CSRF_PATH = `${API_URL}/sanctum/csrf-cookie`;
const CSRF_STATUS = 419;

function jsonResponse(status: number, body: unknown = null): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

function isCsrfCall(url: unknown): boolean {
  return String(url) === CSRF_PATH;
}

function setCsrfCookie(value: string): void {
  document.cookie = `XSRF-TOKEN=${encodeURIComponent(value)}; path=/`;
}

function clearCookies(): void {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (name) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
}

async function capture(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }

  throw new Error("Expected the request to reject, but it resolved.");
}

function mutationHeaders(
  calls: unknown[][],
  index: number,
): Record<string, string> {
  const init = calls[index]?.[1] as RequestInit | undefined;
  return (init?.headers as Record<string, string>) ?? {};
}

beforeEach(() => {
  clearCookies();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("requests a CSRF cookie and echoes it back on mutations", async () => {
    const fetchMock = vi.fn(async (...args: unknown[]) => {
      if (isCsrfCall(args[0])) {
        setCsrfCookie("fresh-token");
        return jsonResponse(204);
      }

      return jsonResponse(200, { data: { id: 1 } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest<{ data: { id: number } }>("/api/login", {
      method: "POST",
      body: { email: "a@example.com", password: "secret1" },
    });

    expect(result).toEqual({ data: { id: 1 } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toBe(CSRF_PATH);

    const headers = mutationHeaders(fetchMock.mock.calls, 1);
    expect(headers["X-XSRF-TOKEN"]).toBe("fresh-token");
    expect((fetchMock.mock.calls[1][1] as RequestInit).credentials).toBe(
      "include",
    );
  });

  it("skips the CSRF cookie for GET requests", async () => {
    const fetchMock = vi.fn(async (...args: unknown[]) => {
      void args;
      return jsonResponse(200, { data: null });
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/api/user");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/user");
    expect(
      mutationHeaders(fetchMock.mock.calls, 0)["X-XSRF-TOKEN"],
    ).toBeUndefined();
  });

  it("refreshes the cookie and retries once after a 419", async () => {
    let csrfCount = 0;
    let mutationCount = 0;
    const fetchMock = vi.fn(async (...args: unknown[]) => {
      if (isCsrfCall(args[0])) {
        csrfCount += 1;
        setCsrfCookie(`token-${csrfCount}`);
        return jsonResponse(204);
      }

      mutationCount += 1;
      if (mutationCount === 1) {
        return jsonResponse(419, { message: "CSRF token mismatch." });
      }

      return jsonResponse(200, { data: { id: 7 } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest<{ data: { id: number } }>("/api/register", {
      method: "POST",
      body: { name: "Ada" },
    });

    expect(result).toEqual({ data: { id: 7 } });
    expect(mutationCount).toBe(2);
    expect(csrfCount).toBe(2);

    const mutationCalls = fetchMock.mock.calls.filter(
      ([url]) => !isCsrfCall(url),
    );
    expect(mutationHeaders(mutationCalls, 1)["X-XSRF-TOKEN"]).toBe("token-2");
  });

  it("does not retry more than once when the 419 persists", async () => {
    let mutationCount = 0;
    const fetchMock = vi.fn(async (...args: unknown[]) => {
      if (isCsrfCall(args[0])) {
        return jsonResponse(204);
      }

      mutationCount += 1;
      return jsonResponse(419, { message: "CSRF token mismatch." });
    });
    vi.stubGlobal("fetch", fetchMock);

    const error = (await capture(
      apiRequest("/api/login", { method: "POST", body: {} }),
    )) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(CSRF_STATUS);
    expect(error.message).toBe(
      "Your session expired. Please refresh the page and try again.",
    );
    expect(mutationCount).toBe(2);
  });

  it("propagates a network failure without treating it as a CSRF error", async () => {
    let mutationCount = 0;
    const fetchMock = vi.fn(async (...args: unknown[]) => {
      if (isCsrfCall(args[0])) {
        return jsonResponse(204);
      }

      mutationCount += 1;
      throw new TypeError("Failed to fetch");
    });
    vi.stubGlobal("fetch", fetchMock);

    const error = await capture(
      apiRequest("/api/login", { method: "POST", body: {} }),
    );

    expect(error).toBeInstanceOf(TypeError);
    expect(error).not.toBeInstanceOf(ApiError);
    expect(mutationCount).toBe(1);
  });

  it("surfaces validation errors from the API", async () => {
    const fetchMock = vi.fn(async (...args: unknown[]) => {
      if (isCsrfCall(args[0])) {
        setCsrfCookie("t");
        return jsonResponse(204);
      }

      return jsonResponse(422, {
        message: "The given data was invalid.",
        errors: { email: ["That email is already registered."] },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const error = (await capture(
      apiRequest("/api/register", { method: "POST", body: {} }),
    )) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.isValidationError).toBe(true);
    expect(error.firstError("email")).toBe("That email is already registered.");
    expect(error.message).toBe("The given data was invalid.");
  });

  it("returns null for a 204 response", async () => {
    const fetchMock = vi.fn(async (...args: unknown[]) => {
      if (isCsrfCall(args[0])) {
        setCsrfCookie("t");
        return jsonResponse(204);
      }

      return jsonResponse(204);
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiRequest("/api/logout", { method: "POST" }),
    ).resolves.toBeNull();
  });
});
