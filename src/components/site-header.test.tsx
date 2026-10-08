import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/site-header";

afterEach(cleanup);

describe("SiteHeader navigation", () => {
  it("shows a single Contact Us link in the desktop nav pointing to /contact", () => {
    render(<SiteHeader />);

    const desktopNav = screen.getByRole("navigation", { name: "Main" });
    const contactLinks = within(desktopNav).getAllByRole("link", {
      name: "Contact Us",
    });

    expect(contactLinks).toHaveLength(1);
    expect(contactLinks[0]).toHaveAttribute("href", "/contact");
  });

  it("keeps the existing primary navigation links intact", () => {
    render(<SiteHeader />);

    const desktopNav = screen.getByRole("navigation", { name: "Main" });
    const labels = within(desktopNav)
      .getAllByRole("link")
      .map((link) => link.textContent);

    [
      "Services",
      "How It Works",
      "Providers",
      "Security",
      "FAQ",
      "Contact Us",
    ].forEach((label) => {
      expect(labels).toContain(label);
    });
  });

  it("exposes Contact Us through the mobile menu and closes it on selection", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    const drawer = document.getElementById("mobile-nav");
    expect(drawer).not.toBeNull();
    const contact = within(drawer as HTMLElement).getByRole("link", {
      name: "Contact Us",
    });
    expect(contact).toHaveAttribute("href", "/contact");

    await user.click(contact);
    expect(document.getElementById("mobile-nav")?.hidden).toBe(true);
  });
});
