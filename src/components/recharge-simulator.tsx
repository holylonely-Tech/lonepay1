"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { telcoLogoMeta } from "@/lib/site";

type ServiceTab = "airtime" | "data" | "electricity" | "cable";

export function RechargeSimulator() {
  const [activeTab, setActiveTab] = useState<ServiceTab>("airtime");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("mtn");
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [selectedDataPlan, setSelectedDataPlan] = useState<string>("2.5gb");
  const [selectedDisco, setSelectedDisco] = useState<string>("ikedc");
  const [powerAmount, setPowerAmount] = useState<number>(5000);

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-3xl">
      <div className="rounded-2xl border border-border-strong bg-surface-card p-5 shadow-card sm:p-6">
        <div className="border-b border-border pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Quick Recharge
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            Check your recharge total before you pay.
          </p>
        </div>

        {/* Service selector tabs */}
        <div className="mt-4">
          <div className="grid grid-cols-4 gap-1 rounded-xl border border-border bg-surface-raised p-1">
            {(
              [
                { id: "airtime", label: "Airtime" },
                { id: "data", label: "Data" },
                { id: "electricity", label: "Electricity" },
                { id: "cable", label: "Cable" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-subtle hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-4 border-t border-border" />
        </div>

        {/* AIRTIME TAB */}
        {activeTab === "airtime" && (
          <div className="mt-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-subtle">
                  Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "mtn", name: "MTN" },
                      { id: "airtel", name: "Airtel" },
                      { id: "glo", name: "Glo" },
                    ] as const
                  ).map((net) => {
                    const meta = telcoLogoMeta[net.id];
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setSelectedNetwork(net.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 text-xs font-semibold transition-all ${
                          selectedNetwork === net.id
                            ? "border-primary bg-primary/10 text-accent"
                            : "border-border bg-surface text-subtle hover:border-border-strong hover:text-foreground"
                        }`}
                      >
                        <Image
                          src={meta.src}
                          alt={`${net.name} logo`}
                          width={meta.width}
                          height={meta.height}
                          unoptimized
                          className="h-5 w-auto object-contain"
                        />
                        {net.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-subtle">
                  Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 500, label: "₦500" },
                    { value: 1000, label: "₦1,000" },
                    { value: 2000, label: "₦2k" },
                  ].map((amt) => (
                    <button
                      key={amt.value}
                      type="button"
                      onClick={() => setSelectedAmount(amt.value)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                        selectedAmount === amt.value
                          ? "border-primary bg-primary text-on-primary"
                          : "border-border bg-surface text-subtle hover:border-border-strong hover:text-foreground"
                      }`}
                    >
                      {amt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculation breakdown summary */}
            <div className="mt-5 rounded-xl border border-border bg-surface-raised/70 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-subtle">Recharge value</span>
                <span className="font-semibold text-foreground">
                  ₦{selectedAmount.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-subtle">Service fee</span>
                <span className="font-medium text-foreground">₦0</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-base font-bold text-accent">
                  ₦{selectedAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === "data" && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-subtle block mb-2">
                Select Network
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: "mtn", name: "MTN" },
                    { id: "airtel", name: "Airtel" },
                    { id: "glo", name: "Glo" },
                    { id: "9mobile", name: "9mobile" },
                  ] as const
                ).map((net) => {
                  const meta = telcoLogoMeta[net.id];
                  return (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setSelectedNetwork(net.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 text-xs font-semibold transition-all ${
                        selectedNetwork === net.id
                          ? "border-primary bg-primary/10 text-accent"
                          : "border-border bg-surface text-subtle hover:text-foreground"
                      }`}
                    >
                      <Image
                        src={meta.src}
                        alt={`${net.name} logo`}
                        width={meta.width}
                        height={meta.height}
                        unoptimized
                        className="h-5 w-auto object-contain"
                      />
                      {net.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-subtle block mb-2">
                Choose Bundle (30 Days Validity)
              </label>
              <div className="space-y-2">
                {[
                  { id: "1gb", name: "1.0 GB SME Data", price: 290 },
                  {
                    id: "2.5gb",
                    name: "2.5 GB Monthly Bundle",
                    price: 720,
                  },
                  { id: "5gb", name: "5.0 GB Direct Bundle", price: 1450 },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedDataPlan(plan.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                      selectedDataPlan === plan.id
                        ? "border-primary bg-primary/10 text-foreground font-semibold"
                        : "border-border bg-surface text-subtle hover:border-border-strong"
                    }`}
                  >
                    <span>{plan.name}</span>
                    <span className="text-accent font-bold">
                      ₦{plan.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ELECTRICITY TAB */}
        {activeTab === "electricity" && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-subtle block mb-2">
                Distribution Company (DisCo)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "ikedc", name: "Ikeja Electric (IKEDC)" },
                  { id: "ekedc", name: "Eko Electric (EKEDC)" },
                  { id: "aedc", name: "Abuja DisCo (AEDC)" },
                  { id: "ibedc", name: "Ibadan DisCo (IBEDC)" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDisco(d.id)}
                    className={`p-2 rounded-xl border text-left text-xs font-medium transition-all ${
                      selectedDisco === d.id
                        ? "border-primary bg-primary/10 text-accent"
                        : "border-border bg-surface text-subtle"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="power-amount"
                className="text-xs font-medium text-subtle block mb-1"
              >
                Amount (₦)
              </label>
              <input
                id="power-amount"
                type="number"
                value={powerAmount}
                onChange={(e) => setPowerAmount(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-foreground text-sm font-semibold focus:border-primary focus:outline-none"
                placeholder="Enter amount (e.g. 5000)"
              />
              <p className="mt-1 text-[11px] text-muted">
                Estimated yield: ~{(powerAmount / 68.2).toFixed(1)} kWh units
              </p>
            </div>
          </div>
        )}

        {/* CABLE TAB */}
        {activeTab === "cable" && (
          <div className="mt-5 space-y-3">
            <label className="text-xs font-medium text-subtle block">
              Select Provider & Bouquet
            </label>
            <div className="space-y-2">
              {[
                { prov: "DStv", plan: "Compact Bouquet", price: 15700 },
                { prov: "GOtv", plan: "Jolli Monthly", price: 4850 },
                { prov: "StarTimes", plan: "Classic Bouquet", price: 3800 },
              ].map((c) => (
                <div
                  key={c.plan}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface text-xs"
                >
                  <div>
                    <span className="font-bold text-foreground mr-2">
                      {c.prov}
                    </span>
                    <span className="text-subtle">{c.plan}</span>
                  </div>
                  <span className="text-accent font-bold">
                    ₦{c.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA action */}
        <div className="mt-5 pt-4 border-t border-border">
          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-on-primary shadow-primary transition-all hover:bg-primary-hover active:bg-primary-active"
          >
            Continue to recharge
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
