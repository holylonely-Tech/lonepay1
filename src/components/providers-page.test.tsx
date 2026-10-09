import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProvidersPage } from "@/components/providers-page";

afterEach(cleanup);

describe("ProvidersPage", () => {
  it("renders the page heading", () => {
    render(<ProvidersPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Providers and coverage" }),
    ).toBeInTheDocument();
  });

  it("distinguishes listed options from confirmed integrations", () => {
    render(<ProvidersPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Listed options vs. confirmed integrations",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/live integrations and purchases.*are not enabled yet/i),
    ).toBeInTheDocument();
  });

  it("still renders the shared providers grid", () => {
    render(<ProvidersPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Direct integration across Nigeria",
      }),
    ).toBeInTheDocument();
  });
});
