import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";

type Service = {
  nom: string;
  variables: string[];
};

const SERVICES: Service[] = [
  {
    nom: "Supabase",
    variables: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ],
  },
  { nom: "Modèle IA", variables: ["AI_API_KEY"] },
  {
    nom: "Langfuse",
    variables: ["LANGFUSE_PUBLIC_KEY", "LANGFUSE_SECRET_KEY", "LANGFUSE_BASE_URL"],
  },
  {
    nom: "Upstash QStash",
    variables: ["QSTASH_TOKEN", "QSTASH_CURRENT_SIGNING_KEY", "QSTASH_NEXT_SIGNING_KEY"],
  },
  {
    nom: "Upstash Redis",
    variables: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  },
];

function variablesManquantes(variables: string[]): string[] {
  return variables.filter((nom) => !process.env[nom]);
}

async function TableauServices() {
  await connection();

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="py-2">Service</th>
          <th className="py-2">Statut</th>
          <th className="py-2">Variables manquantes</th>
        </tr>
      </thead>
      <tbody>
        {SERVICES.map((service) => {
          const manquantes = variablesManquantes(service.variables);
          const ok = manquantes.length === 0;

          return (
            <tr key={service.nom} className="border-b">
              <td className="py-2 font-medium">{service.nom}</td>
              <td className="py-2">
                <span
                  className={
                    ok
                      ? "rounded bg-green-100 px-2 py-1 text-green-800"
                      : "rounded bg-red-100 px-2 py-1 text-red-800"
                  }
                >
                  {ok ? "Configuré" : "Non configuré"}
                </span>
              </td>
              <td className="py-2 font-mono text-xs text-gray-600">
                {ok ? "—" : manquantes.join(", ")}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function AdminPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-2 text-2xl font-bold">Administration</h1>
      <p className="mb-6 text-sm text-gray-600">
        État de configuration des services.
      </p>

      <Suspense fallback={<p className="text-sm text-gray-500">Vérification des services…</p>}>
        <TableauServices />
      </Suspense>

      <p className="mt-6 text-xs text-gray-500">
        Environnement : {process.env.NODE_ENV}
      </p>
    </main>
  );
}