export type NavLink = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href?: string;
  children?: NavLink[];
};

export type SocialChannel = {
  label: string;
  href: string;
  icon: "Instagram" | "Facebook" | "Twitter" | "Linkedin" | "Youtube";
};

export const exploreLinks: NavLink[] = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Providers", href: "/providers" },
  { label: "FAQ", href: "/#faq" },
  { label: "Security", href: "/#security" },
];

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Explore", children: exploreLinks },
  { label: "Contact Us", href: "/contact" },
];

export const contactInfo = {
  supportPhone: "09067669513",
  supportEmail: "holylonely3@gmail.com",
} as const;

export const socialChannels: SocialChannel[] = [];

export const coreServices = [
  {
    id: "airtime",
    title: "Airtime Top-up",
    description:
      "Instant airtime recharge across MTN, Airtel, Glo, and 9mobile with up to 2.5% discount and zero service fees.",
    tag: "Instant 0s",
    badge: "2% Discount",
    metadata: "MTN • Airtel • Glo • 9mobile",
    action: "Quick purchase",
    icon: "Smartphone",
    route: "/services/airtime",
  },
  {
    id: "data",
    title: "Mobile Data",
    description:
      "SME, Gifting, and direct daily, weekly, or monthly data bundles delivered directly to any Nigerian phone number.",
    tag: "High Speed",
    badge: "Cheapest Rates",
    metadata: "SME • Gifting • Direct",
    action: "View plans",
    icon: "Wifi",
    route: "/services/data",
  },
  {
    id: "electricity",
    title: "Electricity Tokens",
    description:
      "Generate 20-digit prepaid STS tokens or clear postpaid bills for all 10 Nigerian DisCos with instant SMS dispatch.",
    tag: "All DisCos",
    badge: "Instant Token",
    metadata: "All 10 DisCos • Prepaid & Postpaid",
    action: "Buy token",
    icon: "Zap",
    route: "/services/electricity",
  },
  {
    id: "cable",
    title: "Cable TV Subscription",
    description:
      "Renew or upgrade your DStv, GOtv, and StarTimes packages with instant viewing restoration and smartcard validation.",
    tag: "Auto-reconnect",
    badge: "Zero Fee",
    metadata: "DStv • GOtv • StarTimes • Showmax",
    action: "Subscribe",
    icon: "Tv",
    route: "/services/cable",
  },
  {
    id: "exam-pins",
    title: "Examination PINs",
    description:
      "Purchase verified result checker PINs and registration tokens for WAEC, NECO, and JAMB directly to your phone.",
    tag: "Official Pins",
    badge: "Instant Delivery",
    metadata: "WAEC • NECO • JAMB • NABTEB",
    action: "Get PIN",
    icon: "GraduationCap",
    route: "/services/exam-pins",
  },
  {
    id: "wallet",
    title: "Virtual Wallet Funding",
    description:
      "Dedicated virtual bank accounts via Moniepoint and Wema Bank. Transfer from any bank app and get credited instantly.",
    tag: "Automated",
    badge: "100% Reliable",
    metadata: "Moniepoint • Wema Bank",
    action: "Add funds",
    icon: "Wallet",
    route: "/wallet",
  },
] as const;

export const telcoLogoMeta = {
  mtn: { src: "/images/Mtn-main.svg", width: 128, height: 64 },
  airtel: { src: "/images/Airtel-main.svg", width: 64, height: 64 },
  glo: { src: "/images/Glo-main.svg", width: 64, height: 64 },
  "9mobile": { src: "/images/9mobile-main.svg", width: 64, height: 64 },
} as const;

export const telcoProviders = [
  {
    name: "MTN Nigeria",
    code: "mtn",
    logo: telcoLogoMeta.mtn.src,
    logoWidth: telcoLogoMeta.mtn.width,
    logoHeight: telcoLogoMeta.mtn.height,
    mark: "MTN",
    markClass: "bg-[#FFCC00] text-[#0d1316]",
    category: "Mobile Network Operator",
    status: "Payment Ready",
  },
  {
    name: "Airtel",
    code: "airtel",
    logo: telcoLogoMeta.airtel.src,
    logoWidth: telcoLogoMeta.airtel.width,
    logoHeight: telcoLogoMeta.airtel.height,
    mark: "AIR",
    markClass: "bg-[#FF0000] text-white",
    category: "Mobile Network Operator",
    status: "Payment Ready",
  },
  {
    name: "Glo",
    code: "glo",
    logo: telcoLogoMeta.glo.src,
    logoWidth: telcoLogoMeta.glo.width,
    logoHeight: telcoLogoMeta.glo.height,
    mark: "GLO",
    markClass: "bg-[#2E7D32] text-white",
    category: "Mobile Network Operator",
    status: "Payment Ready",
  },
  {
    name: "9mobile",
    code: "9mobile",
    logo: telcoLogoMeta["9mobile"].src,
    logoWidth: telcoLogoMeta["9mobile"].width,
    logoHeight: telcoLogoMeta["9mobile"].height,
    mark: "9M",
    markClass: "bg-[#00693E] text-white",
    category: "Mobile Network Operator",
    status: "Payment Ready",
  },
];

export const electricityDiscos = [
  {
    name: "Ikeja Electric",
    short: "IKEDC",
    state: "Lagos (Ikeja & Suburbs)",
    status: "Payment Ready",
  },
  {
    name: "Eko Electricity",
    short: "EKEDC",
    state: "Lagos (Island & Lekki)",
    status: "Payment Ready",
  },
  {
    name: "Abuja DisCo",
    short: "AEDC",
    state: "Abuja, Kogi, Nasarawa, Niger",
    status: "Payment Ready",
  },
  {
    name: "Ibadan DisCo",
    short: "IBEDC",
    state: "Oyo, Ogun, Osun, Kwara",
    status: "Payment Ready",
  },
  {
    name: "Enugu DisCo",
    short: "EEDC",
    state: "Enugu, Abia, Imo, Anambra",
    status: "Payment Ready",
  },
  {
    name: "Kano DisCo",
    short: "KEDCO",
    state: "Kano, Katsina, Jigawa",
    status: "Payment Ready",
  },
  {
    name: "Port Harcourt",
    short: "PHED",
    state: "Rivers, Bayelsa, Cross River",
    status: "Payment Ready",
  },
  {
    name: "Benin DisCo",
    short: "BEDC",
    state: "Edo, Delta, Ondo, Ekiti",
    status: "Payment Ready",
  },
];

export const cableProviders = [
  { name: "DStv", packages: "Padi, Yanga, Confam, Compact, Premium" },
  { name: "GOtv", packages: "Smallie, Jinja, Jolli, Max, Supa, Supa+" },
  { name: "StarTimes", packages: "Nova, Basic, Classic, Super" },
  { name: "Showmax", packages: "Entertainment, Premier League" },
];

export const examProviders = [
  { name: "WAEC", desc: "Result Checker & Verification PIN" },
  { name: "NECO", desc: "e-Verify Token & Result PIN" },
  { name: "JAMB", desc: "UTME & DE Profile Registration PIN" },
  { name: "NABTEB", desc: "Exam Scratch Card" },
];

export const trustHighlights = [
  {
    title: "Direct Gateway Routing",
    description:
      "Direct API connections to telcos and electricity distribution companies with auto-failover to prevent stuck transactions.",
  },
  {
    title: "Instant Automated Refunds",
    description:
      "If a provider times out or a payment fails mid-way, eligible transactions are routed through an automated recovery workflow instead of leaving you waiting.",
  },
  {
    title: "Transaction Tracking",
    description:
      "Every payment gets a clear transaction reference and a permanent history, so tokens, receipts, and statuses can be followed and retrieved at any time.",
  },
  {
    title: "Transaction PIN Protection",
    description:
      "Every wallet deduction is authorized with your personal 4-digit PIN for complete financial security.",
  },
];

export const faqs = [
  {
    question: "How do I receive my electricity token after payment?",
    answer:
      "The 20-digit token is displayed right on your screen immediately after payment. We also send it to your phone number via SMS and save it in your transaction history so you can retrieve it at any time.",
  },
  {
    question: "What happens if a network operator or DisCo has downtime?",
    answer:
      "LonePay checks gateway availability before you pay and shows a notice if a provider is temporarily unavailable. If a transaction fails mid-flight, its status updates and eligible funds are routed through the recovery workflow back to your wallet.",
  },
  {
    question: "How do I fund my LonePay wallet?",
    answer:
      "When you create an account, you receive a dedicated virtual bank account number (via Moniepoint or Wema Bank). Simply make a regular bank transfer from your mobile banking app or USSD, and your LonePay wallet updates in seconds.",
  },
  {
    question: "Are there extra convenience charges on airtime and data?",
    answer:
      "No. Airtime and data purchases carry zero convenience fees. In fact, you receive up to 2.5% discount cashback on airtime and cheap SME rates on data bundles.",
  },
  {
    question: "Can I download receipts for business or expense tracking?",
    answer:
      "Yes. Every transaction generates a standard Nigerian payment receipt showing transaction reference, meter/phone number, provider token, amount, date, and status. Receipts can be downloaded as PDF or printed with one click.",
  },
];

export const footerSections = [
  {
    title: "Services",
    links: [
      { label: "Airtime Top-up", href: "/services/airtime" },
      { label: "Mobile Data", href: "/services/data" },
      { label: "Electricity Tokens", href: "/services/electricity" },
      { label: "Cable TV", href: "/services/cable" },
      { label: "Examination PINs", href: "/services/exam-pins" },
      { label: "Virtual Wallet", href: "/wallet" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Recharge Calculator", href: "/#recharge-calculator" },
      { label: "Providers", href: "/providers" },
      { label: "Security", href: "/#security" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Create free account", href: "/register" },
      { label: "Sign in", href: "/login" },
      { label: "Help Center", href: "/#faq" },
    ],
  },
];
