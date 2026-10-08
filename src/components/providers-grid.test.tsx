import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProvidersGrid } from "@/components/providers-grid";
import {
  cableProviders,
  electricityDiscos,
  examProviders,
  telcoProviders,
} from "@/lib/site";

afterEach(cleanup);

describe("ProvidersGrid", () => {
  it("renders the section heading, description and provider groups", () => {
    render(<ProvidersGrid />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Direct integration across Nigeria",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /telecom aggregators, electricity distributors and payment service providers/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /telecom \/ network/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /electricity distribution companies/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /cable tv providers/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /examination service providers/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders every supported provider with its status label", () => {
    render(<ProvidersGrid />);

    const telcos = telcoProviders as {
      name: string;
      mark: string;
      logo?: string;
    }[];
    for (const telco of telcos) {
      expect(screen.getByText(telco.name)).toBeInTheDocument();
      if (telco.logo) {
        expect(
          screen.getByRole("img", { name: `${telco.name} logo` }),
        ).toHaveAttribute("src", telco.logo);
      } else {
        expect(screen.getByText(telco.mark)).toBeInTheDocument();
      }
    }
    for (const disco of electricityDiscos) {
      expect(screen.getByText(disco.short)).toBeInTheDocument();
      expect(screen.getByText(disco.name)).toBeInTheDocument();
      expect(screen.getByText(disco.state)).toBeInTheDocument();
    }
    for (const cable of cableProviders) {
      expect(screen.getByText(cable.name)).toBeInTheDocument();
      expect(screen.getByText(cable.packages)).toBeInTheDocument();
    }
    for (const exam of examProviders) {
      expect(screen.getByText(exam.name)).toBeInTheDocument();
      expect(screen.getByText(exam.desc)).toBeInTheDocument();
    }

    expect(screen.getAllByText("Payment Ready")).toHaveLength(
      telcoProviders.length + electricityDiscos.length,
    );
  });

  it("makes no unverified partnership claims", () => {
    const { container } = render(<ProvidersGrid />);

    expect(container.textContent).not.toMatch(
      /official partner|powered directly by|official integration/i,
    );
  });
});
