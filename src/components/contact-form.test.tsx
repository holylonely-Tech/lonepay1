import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/components/contact-form";
import { submitContactMessage } from "@/lib/contact";
import { contactInfo } from "@/lib/site";

vi.mock("@/lib/contact", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/contact")>();
  return {
    ...actual,
    submitContactMessage: vi.fn(),
  };
});

const mockedSubmit = vi.mocked(submitContactMessage);

const validValues = {
  name: "Ada Obi",
  email: "ada.obi@example.com",
  subject: "Wallet funding help",
  message:
    "Hi LonePay, I transferred to my virtual account but the funds have not reflected yet. Please help.",
};

async function fillValidForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/^name$/i), validValues.name);
  await user.type(screen.getByLabelText(/^email$/i), validValues.email);
  await user.type(screen.getByLabelText(/^subject$/i), validValues.subject);
  await user.type(screen.getByLabelText(/^message$/i), validValues.message);
  return user;
}

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("ContactForm", () => {
  it("renders accessible labelled fields and a send button", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/^name$/i)).toHaveAttribute("type", "text");
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/^subject$/i)).toHaveAttribute("type", "text");
    expect(screen.getByLabelText(/^message$/i).tagName).toBe("TEXTAREA");

    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeInTheDocument();
  });

  it("blocks empty submission with inline validation and never calls the backend", async () => {
    mockedSubmit.mockRejectedValueOnce(new Error("unexpected"));
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText("Please enter your name."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter your email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a short subject."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a message of at least 10 characters."),
    ).toBeInTheDocument();

    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it("flags a malformed email inline", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/^name$/i), validValues.name);
    await user.type(screen.getByLabelText(/^email$/i), "not-an-email");
    await user.type(screen.getByLabelText(/^subject$/i), validValues.subject);
    await user.type(screen.getByLabelText(/^message$/i), validValues.message);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText(/please enter a valid email address/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it("shows a loading state and disables the form while submitting", async () => {
    let resolveSubmit!: () => void;
    mockedSubmit.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<ContactForm />);
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: /send message/i }));

    const loading = screen.getByRole("button", { name: /sending message/i });
    expect(loading).toBeDisabled();
    expect(screen.getByLabelText(/^name$/i)).toBeDisabled();
    expect(screen.getByLabelText(/^message$/i)).toBeDisabled();
    expect(mockedSubmit).toHaveBeenCalledTimes(1);

    resolveSubmit();
    expect(await screen.findByText("Message sent")).toBeInTheDocument();
  });

  it("shows an honest error and offers a mailto fallback when no backend is connected", async () => {
    mockedSubmit.mockRejectedValueOnce(new Error("backend unavailable"));

    render(<ContactForm />);
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText(/we could not deliver your message/i),
    ).toBeInTheDocument();

    const emailApp = screen.getByRole("link", {
      name: /open in your email app/i,
    });
    const mailtoHref = emailApp.getAttribute("href") ?? "";
    expect(mailtoHref).toContain(`mailto:${contactInfo.supportEmail}`);

    const params = new URLSearchParams(mailtoHref.split("?")[1] ?? "");
    expect(params.get("subject")).toBe(
      `[LonePay Contact] ${validValues.subject}`,
    );
    expect(params.get("body")).toContain(validValues.name);
    expect(params.get("body")).toContain(validValues.message);
  });
});
