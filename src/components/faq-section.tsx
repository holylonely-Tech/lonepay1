"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Container, Section, SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import { faqs } from "@/lib/site";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section id="faq" className="bg-background">
      <Container>
        <SectionHeading
          eyebrow="Help & Support"
          title="Frequently asked questions"
          description="Everything you need to know about payments, electricity tokens, wallet funding, and refund policies."
          align="center"
        />

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const triggerId = `faq-trigger-${index}`;
            const panelId = `faq-panel-${index}`;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-border bg-surface-card"
              >
                <button
                  id={triggerId}
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:text-accent focus-visible:text-accent sm:py-5"
                >
                  <span className="text-base font-semibold text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none",
                      isOpen && "rotate-180 text-accent",
                    )}
                  />
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  inert={!isOpen}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-border/50 px-5 pb-5 pt-4">
                      <p className="text-sm leading-relaxed text-subtle sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
