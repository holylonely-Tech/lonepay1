import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HowItWorks } from "@/components/how-it-works";
import { workflowSteps } from "@/lib/site";

afterEach(cleanup);

describe("HowItWorks", () => {
  it("renders the section heading and supporting message", () => {
    render(<HowItWorks />);

    expect(
      screen.getByRole("heading", { level: 2, name: "How LonePay works" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /three clear steps designed to make every utility payment/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders the three steps as list items in order", () => {
    render(<HowItWorks />);

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(workflowSteps.length);

    workflowSteps.forEach((step, index) => {
      expect(
        screen.getByRole("heading", { level: 3, name: step.title }),
      ).toBeInTheDocument();
      expect(screen.getByText(step.step)).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
      expect(listItems[index].textContent).toContain(step.step);
      expect(listItems[index].textContent).toContain(step.title);
    });
  });
});
