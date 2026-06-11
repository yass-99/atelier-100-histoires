import { CalendarHeart } from "lucide-react";
import { Show } from "@clerk/nextjs";
import { listPublishedSessions } from "@/lib/sessions";
import { listLieuxPartenaires } from "@/lib/lieux-partenaires";
import { getMyDiscount } from "@/lib/leads";
import { SessionsPreview } from "@/components/SessionsPreview";
import { HeroAlaUne } from "@/components/HeroAlaUne";
import { ReassuranceStrip } from "@/components/ReassuranceStrip";
import { Promesse } from "@/components/Promesse";
import { CommentCaMarche } from "@/components/CommentCaMarche";
import { PartenairesBand } from "@/components/PartenairesBand";
import { CreeTonAtelierCta } from "@/components/CreeTonAtelierCta";
import { Faq } from "@/components/Faq";
import { RestePrevenu } from "@/components/RestePrevenu";
import { MysteryPopup } from "@/components/MysteryPopup";
import { Reveal } from "@/components/motion";
import { SESSIONS_ANCHOR } from "@/lib/hero-slides";

// Pas de cache : données fraîches à chaque visite.
export const dynamic = "force-dynamic";

export default async function Home() {
  const sessions = await listPublishedSessions();
  const aLaUne = sessions.filter((s) => s.a_la_une);
  const discountPct = await getMyDiscount();
  // Non critique : si la table n'existe pas encore (migration non exécutée),
  // on masque le bandeau au lieu de casser l'accueil.
  const partenaires = await listLieuxPartenaires().catch((e) => {
    console.error("Lecture lieux_partenaires (bandeau masqué) :", e);
    return [];
  });

  return (
    <main className="screen space-y-12 py-8">
      {/* Hero : carrousel mixte (slides message + ateliers à la une), toujours
          rempli même sans atelier mis en avant. */}
      <Reveal className="space-y-4">
        <div>
          <p className="eyebrow text-muted">À la une · Ateliers créatifs DIY</p>
          <h1 className="mt-1.5 font-display text-[30px] leading-[1.05]">
            Crée de tes mains, repars avec ta création
          </h1>
        </div>
        <HeroAlaUne sessions={aLaUne} />
      </Reveal>

      <Promesse />

      <Reveal>
        <CommentCaMarche />
      </Reveal>

      <section id={SESSIONS_ANCHOR} className="scroll-mt-24">
        <div className="mb-4">
          <p className="eyebrow text-muted">L&apos;agenda</p>
          <h2 className="mt-1 font-display text-2xl">Nos prochains ateliers</h2>
        </div>
        {sessions.length === 0 ? (
          <Reveal>
            <div className="card flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <CalendarHeart className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <p className="font-display text-xl">Aucun atelier programmé</p>
              <p className="text-muted">De nouvelles dates arrivent très bientôt. Reviens vite&nbsp;!</p>
            </div>
            <div className="mt-4">
              <CreeTonAtelierCta from="empty_state" />
            </div>
          </Reveal>
        ) : (
          <SessionsPreview sessions={sessions} pct={discountPct} count={4} href="/ateliers" />
        )}
      </section>

      {/* Section « atelier privé » : présentée comme une vraie section (titre +
          intro), pas comme une card isolée. */}
      <Reveal>
        <section>
          <p className="eyebrow text-muted">Pour les groupes</p>
          <h2 className="mt-1 font-display text-2xl">Une occasion à fêter&nbsp;?</h2>
          <p className="mt-2 text-muted">
            Anniversaire, entre amis ou en équipe&nbsp;: créez votre atelier privé, rien que
            pour vous.
          </p>
          <div className="mt-4">
            <CreeTonAtelierCta from="home_section" />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <ReassuranceStrip />
      </Reveal>

      {partenaires.length > 0 && (
        <Reveal>
          <PartenairesBand partenaires={partenaires} />
        </Reveal>
      )}

      <Reveal>
        <Faq />
      </Reveal>

      {/* « Reste prévenu » : inutile pour un compte déjà connecté. */}
      <Show when="signed-out">
        <Reveal>
          <RestePrevenu />
        </Reveal>
      </Show>

      <MysteryPopup />
    </main>
  );
}
