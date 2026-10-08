import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ContactSection } from "@/components/contact-section";

afterEach(cleanup);

describe("ContactSection", () => {
  it("renders the section heading bound to aria-labelledby", () => {
    render(<ContactSection />);

    const section = screen.getByRole("region", {
      name: "Get in touch with LonePay",
    });
    expect(section).toHaveAttribute("aria-labelledby", "contact-heading");

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Get in touch with LonePay",
    });
    expect(heading).toHaveAttribute("id", "contact-heading");
    expect(
      screen.getByText(/reach us through the contact details below/i),
    ).toBeInTheDocument();
  });

  it("renders a clickable tel: phone link with the exact number", () => {
    render(<ContactSection />);

    const phone = screen.getByRole("link", { name: "09067669513" });
    expect(phone).toHaveAttribute("href", "tel:09067669513");
  });

  it("renders a clickable mailto: email link with the exact address", () => {
    render(<ContactSection />);

    const email = screen.getByRole("link", {
      name: "holylonely3@gmail.com",
    });
    expect(email).toHaveAttribute("href", "mailto:holylonely3@gmail.com");
  });

  it("shows Nigeria as the location without a fake map link", () => {
    render(<ContactSection />);

    expect(screen.getByText("Nigeria")).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(
      links.some((link) => {
        const href = link.getAttribute("href") ?? "";
        return /maps\.google|goo\.gl\/maps|waze/i.test(href);
      }),
    ).toBe(false);
  });

  it("uses decorative icons and contains no invented contact details", () => {
    const { container } = render(<ContactSection />);

    const tiles = container.querySelectorAll(
      'span[aria-hidden="true"].grid.size-11',
    );
    expect(tiles.length).toBe(3);

    const body = document.body.textContent ?? "";
    [
      "AirtimeFlip",
      "WhatsApp",
      "Instagram",
      "Facebook",
      "Twitter",
      "+234",
      "Lagos",
      "Abuja",
      "Monday",
      "Monday – Friday",
      "9am",
      "street",
    ].forEach((phrase) => {
      expect(body).not.toContain(phrase);
    });
  });
});
