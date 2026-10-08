import { Container } from "@/components/ui/section";

export function NetworkStrip() {
  const networks = [
    { name: "MTN Nigeria", status: "Active", ping: "0.2s" },
    { name: "Airtel Nigeria", status: "Active", ping: "0.3s" },
    { name: "Globacom", status: "Active", ping: "0.4s" },
    { name: "9mobile", status: "Active", ping: "0.3s" },
    { name: "All 10 DisCos", status: "Live STS", ping: "Token Ready" },
    { name: "DStv & GOtv", status: "Online", ping: "Instant" },
  ];

  return (
    <div className="border-y border-border bg-surface-card/60 py-6">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-accent-strong" />
            </span>
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Direct Provider Gateway Status
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            {networks.map((net) => (
              <div key={net.name} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                <span className="text-subtle font-medium">{net.name}</span>
                <span className="text-[10px] text-muted rounded bg-surface px-1.5 py-0.5 border border-border">
                  {net.ping}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
