import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AccountActivitySection } from "@/components/account-activity-section";

afterEach(cleanup);

describe("AccountActivitySection", () => {
  it("renders the section heading and supporting message", () => {
    render(<AccountActivitySection />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Keep track of your account activity",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /use your lonepay dashboard to review your wallet balance/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders the three account management points", () => {
    render(<AccountActivitySection />);

    [
      "Your wallet at a glance",
      "Transaction history",
      "Account access",
    ].forEach((title) => {
      expect(
        screen.getByRole("heading", { level: 3, name: title }),
      ).toBeInTheDocument();
    });
  });

  it("shows the account activity illustration with meaningful alt text", () => {
    render(<AccountActivitySection />);

    expect(
      screen.getByAltText(
        "Illustration of a person managing finances on a laptop.",
      ),
    ).toBeInTheDocument();
  });

  it("links to the dashboard and stays honest about live features", () => {
    render(<AccountActivitySection />);

    expect(
      screen.getByRole("link", { name: "Go to your dashboard" }),
    ).toHaveAttribute("href", "/dashboard");

    const body = document.body.textContent ?? "";
    expect(body).not.toContain("live funding");
    expect(body).not.toContain("purchase");
    expect(body).not.toContain("deposit");
    expect(body).not.toContain("withdrawal");
  });
});
