import { z } from "zod";

import { contactInfo } from "@/lib/site";

/**
 * Contact message details collected by the Contact Us form. Field lengths are
 * generous so genuine queries are never rejected at the edge.
 */
export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(120, "Name must be 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address, e.g. name@example.com."),
  subject: z
    .string()
    .trim()
    .min(3, "Please enter a short subject.")
    .max(160, "Subject must be 160 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(10, "Please enter a message of at least 10 characters.")
    .max(4000, "Message must be 4000 characters or fewer."),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

export class ContactSubmissionUnavailableError extends Error {
  constructor() {
    super(
      "Contact message delivery is not connected yet. Use the email fallback to reach support.",
    );
    this.name = "ContactSubmissionUnavailableError";
  }
}

/**
 * Delivers a contact message to the LonePay support team.
 *
 * TODO(backend): No contact endpoint or messaging service exists in this
 * project yet, so this function cannot automatically deliver messages. Wire it
 * to the real support API when one becomes available and resolve on success.
 * Until then it always throws so the UI shows an honest "could not deliver"
 * state instead of pretending a message was sent. The Contact form surfaces a
 * prefilled `mailto:` link to the verified support email as the current
 * delivery channel.
 */
export async function submitContactMessage(
  message: ContactMessage,
): Promise<void> {
  void message;
  throw new ContactSubmissionUnavailableError();
}

/** Builds a `mailto:` URL that pre-fills the support email with a message. */
export function buildContactMailtoUrl(message: ContactMessage): string {
  const params = new URLSearchParams({
    subject: `[LonePay Contact] ${message.subject}`,
    body: `Name: ${message.name}\nEmail: ${message.email}\n\n${message.message}`,
  });
  return `mailto:${contactInfo.supportEmail}?${params.toString()}`;
}
