import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TrustSection } from "@/components/trust-section";
import { trustHighlights } from "@/lib/site";

afterEach(cleanup);

describe("TrustSection", () => {
  it("renders the section heading and supporting message", () => {
    render(<TrustSection />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Infrastructure built to prevent stuck transactions",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /we know how frustrating it is when money leaves your account/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders every infrastructure feature with its title and description", () => {
    render(<TrustSection />);

    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles.map((node) => node.textContent)).toEqual(
      trustHighlights.map((item) => item.title),
    );

    trustHighlights.forEach((item) => {
      expect(screen.getByText(item.description)).toBeInTheDocument();
    });
  });

  it("renders a clearly fictional demo transaction card", () => {
    render(<TrustSection />);

    expect(screen.getByText("Transaction Successful")).toBeInTheDocument();
    expect(
      screen.getByText("4820 • 9184 • 5582 • 0194 • 3829"),
    ).toBeInTheDocument();
    expect(screen.getByText("LonePay User")).toBeInTheDocument();
    expect(screen.getByText("₦5,000.00")).toBeInTheDocument();
    expect(
      screen.getByText(/Demo transaction — for illustration/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Delivered · Just now/i)).toBeInTheDocument();
  });

  it("does not make unsupported backend or security guarantees", () => {
    render(<TrustSection />);

    const body = document.body.textContent ?? "";
    [
      "100% guaranteed",
      "100% reliable",
      "Zero failed transactions",
      "Military-grade",
      "Bank-level security",
      "Unhackable",
      "Impossible to lose money",
      "Fraud-proof",
      "Guaranteed refund",
    ].forEach((phrase) => {
      expect(body.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
  });
});
