import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "anything",
    });

    expect(result.success).toBe(true);
  });

  it("requires a valid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "x",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/valid email address/i);
    }
  });

  it("requires a password", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    name: "Ada Obi",
    email: "ada@example.com",
    password: "secret123",
    password_confirmation: "secret123",
  };

  it("accepts matching strong credentials", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects passwords shorter than eight characters", () => {
    const result = registerSchema.safeParse({
      ...base,
      password: "s1",
      password_confirmation: "s1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects passwords without a number", () => {
    const result = registerSchema.safeParse({
      ...base,
      password: "onlyletters",
      password_confirmation: "onlyletters",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => /number/i.test(issue.message)),
      ).toBe(true);
    }
  });

  it("rejects mismatched password confirmation", () => {
    const result = registerSchema.safeParse({
      ...base,
      password_confirmation: "different123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          /passwords do not match/i.test(issue.message),
        ),
      ).toBe(true);
    }
  });
});

describe("forgotPasswordSchema", () => {
  it("requires a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(
      false,
    );
  });
});

describe("resetPasswordSchema", () => {
  const base = {
    token: "token-value",
    email: "ada@example.com",
    password: "secret123",
    password_confirmation: "secret123",
  };

  it("accepts a valid reset payload", () => {
    expect(resetPasswordSchema.safeParse(base).success).toBe(true);
  });

  it("requires a token", () => {
    expect(resetPasswordSchema.safeParse({ ...base, token: "" }).success).toBe(
      false,
    );
  });

  it("rejects mismatched confirmation", () => {
    expect(
      resetPasswordSchema.safeParse({
        ...base,
        password_confirmation: "different123",
      }).success,
    ).toBe(false);
  });
});
