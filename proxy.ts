import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Le site est PUBLIC par défaut (consultation des ateliers + paiement en
// invité + webhook Stripe). Seules ces routes exigent une connexion.
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/mes-reservations(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
