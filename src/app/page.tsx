import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <h1 className="text-6xl mt-35 font-bold text-center text-gray-800 absolute top-0 left-1/2 transform -translate-x-1/2">
        Fala Doutor
      </h1>
      <h2 className="text-4xl font-bold mb-6 text-center text-gray-800 mt-16">
        Sistema de Gestão Clínica
      </h2>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Bem-vindo! Escolha uma opção abaixo para começar:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
        <Link
          href="/doctor"
          className="block bg-white shadow-md hover:shadow-lg transition rounded-xl p-6 text-center border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Médicos</h3>
          <p className="text-sm text-gray-500">
            Gerencie os dados dos profissionais da clínica.
          </p>
        </Link>

        <Link
          href="/patient"
          className="block bg-white shadow-md hover:shadow-lg transition rounded-xl p-6 text-center border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-green-600 mb-2">Pacientes</h3>
          <p className="text-sm text-gray-500">
            Gerencie os dados dos pacientes.
          </p>
        </Link>
      </div>
    </main>
  );
}
