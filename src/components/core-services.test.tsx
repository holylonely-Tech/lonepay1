import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CoreServices } from "@/components/core-services";
import { coreServices } from "@/lib/site";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

afterEach(cleanup);

describe("CoreServices", () => {
  it("renders the approved heading and supporting message", () => {
    render(<CoreServices />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Designed for everyday Nigerian payments",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/backed by direct telecom and utility connections/i),
    ).toBeInTheDocument();
  });

  it("renders one card per service with metadata and an action link", () => {
    render(<CoreServices />);

    for (const service of coreServices) {
      expect(
        screen.getByRole("heading", { level: 3, name: service.title }),
      ).toBeInTheDocument();
      expect(screen.getByText(service.metadata)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: service.action }),
      ).toHaveAttribute("href", service.route);
    }

    expect(screen.getAllByRole("link")).toHaveLength(coreServices.length);
  });
});
