import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CtaSection } from "@/components/cta-section";

afterEach(cleanup);

describe("CtaSection", () => {
  it("renders the conversion heading and supporting copy", () => {
    render(<CtaSection />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Ready to pay bills without the stress?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /join thousands of smart Nigerians who recharge airtime/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Zero Setup Fee · Instant Account Creation"),
    ).toBeInTheDocument();
  });

  it("renders primary and secondary CTAs with their intended routes", () => {
    render(<CtaSection />);

    const register = screen.getByRole("link", { name: /create free account/i });
    const login = screen.getByRole("link", { name: /sign in to wallet/i });

    expect(register).toHaveAttribute("href", "/register");
    expect(login).toHaveAttribute("href", "/login");
  });

  it("shows the signup reassurance line and no fake social proof", () => {
    render(<CtaSection />);

    expect(
      screen.getByText(
        /dedicated virtual account generated automatically upon signup/i,
      ),
    ).toBeInTheDocument();

    const body = document.body.textContent ?? "";
    ["500,000", "1 million", "Join 1,000,000", "Join 1,000+", "★★★★★"].forEach(
      (phrase) => {
        expect(body).not.toContain(phrase);
      },
    );
  });
});
