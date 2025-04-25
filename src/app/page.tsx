// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        Sistema de Gestão Clínica
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Bem-vindo! Escolha uma opção abaixo para começar:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
        <Link
          href="/doctor"
          className="block bg-white shadow-md hover:shadow-lg transition rounded-xl p-6 text-center border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-blue-600 mb-2">Médicos</h2>
          <p className="text-sm text-gray-500">
            Gerencie os dados dos profissionais da clínica.
          </p>
        </Link>

        <Link
          href="/patient"
          className="block bg-white shadow-md hover:shadow-lg transition rounded-xl p-6 text-center border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-green-600 mb-2">Pacientes</h2>
          <p className="text-sm text-gray-500">
            Consulte e edite informações de pacientes.
          </p>
        </Link>
      </div>
    </main>
  );
}
