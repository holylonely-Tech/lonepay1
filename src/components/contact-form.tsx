"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildContactMailtoUrl,
  contactMessageSchema,
  submitContactMessage,
  type ContactMessage,
} from "@/lib/contact";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

type SubmitErrorState = {
  message: string;
  mailtoHref: string;
};

const fieldBaseClasses =
  "w-full rounded-xl border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60";

function errorTextClasses(hasError: boolean) {
  return cn(
    fieldBaseClasses,
    hasError
      ? "border-error focus:border-error"
      : "border-border focus:border-primary",
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<SubmitErrorState | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactMessage>({
    resolver: zodResolver(contactMessageSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const isSubmitting = status === "submitting";

  async function onSubmit(values: ContactMessage) {
    if (isSubmitting) {
      return;
    }

    setStatus("submitting");
    setSubmitError(null);

    try {
      await submitContactMessage(values);
      reset();
      setStatus("success");
    } catch {
      setSubmitError({
        message:
          "Website message delivery is still being connected, so your message could not be sent automatically. Use your email app to send it to our support team instead — your subject and message have already been filled in.",
        mailtoHref: buildContactMailtoUrl(values),
      });
      setStatus("error");
    }
  }

  function handleTryAgain() {
    setStatus("idle");
    setSubmitError(null);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl border border-border-strong bg-surface-card p-5 shadow-card sm:p-7"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              className={errorTextClasses(Boolean(errors.name))}
              disabled={isSubmitting}
              {...register("name")}
            />
            {errors.name && (
              <p
                id="contact-name-error"
                role="alert"
                className="mt-1.5 text-sm text-error"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={
                errors.email ? "contact-email-error" : undefined
              }
              className={errorTextClasses(Boolean(errors.email))}
              disabled={isSubmitting}
              {...register("email")}
            />
            {errors.email && (
              <p
                id="contact-email-error"
                role="alert"
                className="mt-1.5 text-sm text-error"
              >
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="contact-subject"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Subject
          </label>
          <input
            id="contact-subject"
            type="text"
            placeholder="How can we help?"
            aria-invalid={errors.subject ? true : undefined}
            aria-describedby={
              errors.subject ? "contact-subject-error" : undefined
            }
            className={errorTextClasses(Boolean(errors.subject))}
            disabled={isSubmitting}
            {...register("subject")}
          />
          {errors.subject && (
            <p
              id="contact-subject-error"
              role="alert"
              className="mt-1.5 text-sm text-error"
            >
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            rows={5}
            placeholder="Tell us a little about your question or issue…"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={
              errors.message ? "contact-message-error" : undefined
            }
            className={cn(
              errorTextClasses(Boolean(errors.message)),
              "min-h-32 resize-y py-2.5",
            )}
            disabled={isSubmitting}
            {...register("message")}
          />
          {errors.message && (
            <p
              id="contact-message-error"
              role="alert"
              className="mt-1.5 text-sm text-error"
            >
              {errors.message.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending message…
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden="true" />
              Send Message
            </>
          )}
        </Button>
      </div>

      <div aria-live="polite">
        {status === "success" && (
          <div
            role="status"
            className="mt-5 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4"
          >
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-success"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Message sent
              </p>
              <p className="mt-1 text-sm text-subtle">
                Thanks for reaching out. Our team will get back to you at the
                email address you provided.
              </p>
            </div>
          </div>
        )}

        {status === "error" && submitError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-error/30 bg-error/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 size-5 shrink-0 text-error"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  We could not deliver your message
                </p>
                <p className="mt-1 text-sm text-subtle">
                  {submitError.message}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <a
                href={submitError.mailtoHref}
                className={cn(
                  buttonVariants({ variant: "primary", size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                <Send className="size-4" aria-hidden="true" />
                Open in your email app
              </a>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleTryAgain}
              >
                Edit message
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
