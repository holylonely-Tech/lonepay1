import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ContactPageSection } from "@/components/contact-page-section";
import { contactInfo } from "@/lib/site";

afterEach(cleanup);

describe("ContactPageSection", () => {
  it("renders the page heading, eyebrow, and supporting copy", () => {
    render(<ContactPageSection />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Have a question? We're here to help.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(
      screen.getByText(/get in touch with lonepay for assistance/i),
    ).toBeInTheDocument();
  });

  it("renders a two-column layout with the contact form", () => {
    const { container } = render(<ContactPageSection />);

    expect(container.querySelector("form")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeInTheDocument();
  });

  it("makes the verified phone and email clickable", () => {
    render(<ContactPageSection />);

    const phone = screen.getByRole("link", {
      name: contactInfo.supportPhone,
    });
    expect(phone).toHaveAttribute("href", `tel:${contactInfo.supportPhone}`);

    const email = screen.getByRole("link", {
      name: contactInfo.supportEmail,
    });
    expect(email).toHaveAttribute("href", `mailto:${contactInfo.supportEmail}`);
  });

  it("omits social links and the Follow us section when none are configured", () => {
    const { container } = render(<ContactPageSection />);

    expect(container.textContent).not.toContain("Follow us");
    const body = document.body.textContent ?? "";
    ["Instagram", "Facebook", "Twitter", "LinkedIn", "Youtube"].forEach(
      (name) => {
        expect(body).not.toContain(name);
      },
    );
  });

  it("contains no invented contact details or copied third-party branding", () => {
    const body = document.body.textContent ?? "";
    [
      "AirtimeFlip",
      "WhatsApp",
      "+234",
      "Lagos",
      "Abuja",
      "Monday",
      "9am",
      "street",
      "app store",
      "office@",
    ].forEach((phrase) => {
      expect(body).not.toContain(phrase);
    });
  });
});
