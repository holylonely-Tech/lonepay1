import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/site-footer";
import { footerSections } from "@/lib/site";

afterEach(cleanup);

describe("SiteFooter", () => {
  it("renders the LonePay brand with an accessible home link", () => {
    render(<SiteFooter />);

    const home = screen.getByRole("link", { name: "LonePay Home" });
    expect(home).toHaveAttribute("href", "/");
    expect(
      screen.getByText(/modern Nigerian digital payment and VTU platform/i),
    ).toBeInTheDocument();
  });

  it("renders one labelled navigation group per footer section", () => {
    render(<SiteFooter />);

    const navs = screen.getAllByRole("navigation");
    expect(navs).toHaveLength(footerSections.length);

    footerSections.forEach((section) => {
      expect(
        screen.getByRole("navigation", { name: section.title }),
      ).toBeInTheDocument();
      section.links.forEach((link) => {
        expect(screen.getByRole("link", { name: link.label })).toHaveAttribute(
          "href",
          link.href,
        );
      });
    });
  });

  it("uses the intended account and support destinations", () => {
    render(<SiteFooter />);

    expect(
      screen.getByRole("link", { name: "Create free account" }),
    ).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Help Center" })).toHaveAttribute(
      "href",
      "#faq",
    );
  });

  it("shows copyright, market line, and no invented contact details", () => {
    render(<SiteFooter />);

    expect(
      screen.getByText(/© \d{4} LonePay\. All rights reserved\./),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Built for everyday payments in Nigeria."),
    ).toBeInTheDocument();

    const body = document.body.textContent ?? "";
    [
      "support@",
      "WhatsApp",
      "+234",
      "Ikeja",
      "NDPR",
      "All Systems Operational",
      "Registered office",
      "LonePay Technologies Ltd",
    ].forEach((phrase) => {
      expect(body).not.toContain(phrase);
    });
  });
});
