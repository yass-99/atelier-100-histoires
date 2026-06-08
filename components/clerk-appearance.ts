/* Thème Clerk aligné sur l'identité de l'app (pilules noires, coins
   très arrondis, typo bold). Utilisé sur les pages sign-in / sign-up
   et le UserButton. */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#111114",
    colorText: "#14141b",
    colorTextSecondary: "#6b6e7e",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#14141b",
    borderRadius: "1rem",
    fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "shadow-none w-full",
    card: "shadow-none bg-transparent p-0",
    headerTitle: "font-display font-extrabold text-2xl",
    headerSubtitle: "text-muted",
    socialButtonsBlockButton:
      "rounded-2xl border-border h-12 font-semibold",
    formFieldInput:
      "rounded-2xl border-border h-12 focus:ring-4 focus:ring-[#7c93f0]/20",
    formFieldLabel: "font-bold text-sm",
    formButtonPrimary:
      "rounded-full h-12 bg-[#111114] hover:bg-[#111114]/90 text-base font-bold normal-case shadow-none",
    footerActionLink: "text-[#7c93f0] font-bold",
    footer: "bg-transparent",
    otpCodeFieldInput: "rounded-xl border-border",
  },
} as const;
