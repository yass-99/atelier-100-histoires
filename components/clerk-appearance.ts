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

    /* UserButton — déclencheur (avatar dans le header) */
    userButtonTrigger:
      "rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
    userButtonAvatarBox: "h-9 w-9 rounded-full border-[1.5px] border-ink",

    /* UserButton — popover : carte contournée encre, surface blanche (look « outlined ») */
    userButtonPopoverCard:
      "rounded-card border-[1.5px] border-ink bg-surface shadow-pop overflow-hidden",
    userButtonPopoverMain: "bg-surface",
    userPreviewMainIdentifier: "font-display font-extrabold text-foreground",
    userPreviewSecondaryIdentifier: "text-muted",
    userButtonPopoverActions: "p-1.5",
    userButtonPopoverActionButton:
      "rounded-2xl font-semibold text-foreground hover:bg-background",
    userButtonPopoverActionButtonIcon: "text-muted",
    userButtonPopoverActionButtonText: "font-semibold",
    /* On masque le branding « Secured by Clerk » pour un menu 100 % app.
       Modificateur important (Tailwind v4) pour battre le CSS interne de Clerk. */
    userButtonPopoverFooter: "hidden!",
  },
} as const;
