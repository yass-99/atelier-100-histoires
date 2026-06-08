import Link from "next/link";

export default function Merci() {
  return (
    <main className="screen py-12 text-center">
      <div className="card">
        <h1 className="text-3xl">Merci !</h1>
        <p className="mt-3 text-muted">
          Votre paiement est confirmé. Un email de confirmation vient de vous être envoyé.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
