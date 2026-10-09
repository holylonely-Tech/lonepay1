import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ServicesPage } from "@/components/services-page";
import { coreServices } from "@/lib/site";

afterEach(cleanup);

describe("ServicesPage", () => {
  it("uses the service offerings heading as the page heading", () => {
    render(<ServicesPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Designed for everyday Nigerian payments",
      }),
    ).toBeInTheDocument();
  });

  it("does not render the removed introduction", () => {
    render(<ServicesPage />);

    expect(
      screen.queryByRole("heading", {
        name: "Everyday Nigerian payments, from one account",
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Services")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/airtime, data, electricity, cable tv/i),
    ).not.toBeInTheDocument();
  });

  it("renders one card per listed service with an action link", () => {
    render(<ServicesPage />);

    expect(
      screen.getByRole("heading", {
        name: "Designed for everyday Nigerian payments",
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByRole("link")).toHaveLength(coreServices.length + 1);

    for (const service of coreServices) {
      expect(
        screen.getByRole("heading", { level: 3, name: service.title }),
      ).toBeInTheDocument();
      expect(screen.getByText(service.action)).toBeInTheDocument();
    }
  });

  it("shows the account activity section with the dashboard link", () => {
    render(<ServicesPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Keep track of your account activity",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to your dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
    expect(
      screen.getByAltText(
        "Illustration of a person managing finances on a laptop.",
      ),
    ).toBeInTheDocument();
  });

  it("positions the account activity section after the service offerings", () => {
    const { container } = render(<ServicesPage />);

    const services = container.querySelector("#services");
    const accountActivity = screen.getByRole("heading", {
      name: "Keep track of your account activity",
    });

    expect(services).not.toBeNull();
    const order =
      services!.compareDocumentPosition(accountActivity) &
      Node.DOCUMENT_POSITION_FOLLOWING;
    expect(order).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
