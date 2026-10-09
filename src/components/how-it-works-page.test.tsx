import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HowItWorksPage } from "@/components/how-it-works-page";

afterEach(cleanup);

describe("HowItWorksPage", () => {
  it("renders the page heading and supporting message", () => {
    render(<HowItWorksPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Your account. Your transactions. One place.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /manage your lonepay account and view your wallet information/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows the financial illustration with meaningful alt text", () => {
    render(<HowItWorksPage />);

    expect(
      screen.getByAltText(
        "Illustration of people reviewing financial charts and account information.",
      ),
    ).toBeInTheDocument();
  });

  it("links to the registration and sign-in routes", () => {
    render(<HowItWorksPage />);
    expect(
      screen.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("describes the three available steps", () => {
    render(<HowItWorksPage />);

    const steps = [
      "Create your account",
      "View your wallet",
      "Track your account activity",
    ];

    const stepsList = screen.getByRole("list", {
      name: "What you can do today",
    });
    expect(within(stepsList).getAllByRole("listitem")).toHaveLength(
      steps.length,
    );

    steps.forEach((title) => {
      expect(
        within(stepsList).getByRole("heading", { level: 3, name: title }),
      ).toBeInTheDocument();
    });
  });

  it("does not include the account activity section for the homepage", () => {
    render(<HowItWorksPage />);

    expect(
      screen.queryByRole("heading", {
        name: "Keep track of your account activity",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByAltText(
        "Illustration of a person managing finances on a laptop.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Go to your dashboard" }),
    ).not.toBeInTheDocument();
  });

  it("states what is implemented and what is not yet available", () => {
    render(<HowItWorksPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "What is available today?",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/paginated transaction history have been implemented/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/live vtu purchases are not yet implemented/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/live wallet funding is not available yet/i),
    ).toBeInTheDocument();
  });
});
