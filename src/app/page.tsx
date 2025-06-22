import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Efeito de gradiente animado no fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-indigo-100/20 animate-gradient-x" />

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        <h1 className="title-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 animate-fade-in">
          Fala Doutor
        </h1>
        <h2 className="title-lg text-gray-800 mb-4 animate-fade-in delay-100">
          Sistema de Gestão Clínica
        </h2>
        <p className="text-base text-gray-600 mb-8 animate-fade-in delay-200">
          Bem-vindo! Escolha uma opção abaixo para começar
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/doctor"
            className="group relative bg-white rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 border border-blue-100 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-300" />
            <div className="relative z-10">
              <h3 className="title-md text-blue-600 mb-2 group-hover:text-blue-700 transition-colors">
                Médicos
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                Gerencie os dados dos profissionais da clínica
              </p>
            </div>
          </Link>

          <Link
            href="/patient"
            className="group relative bg-white rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 border border-indigo-100 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
            <div className="relative z-10">
              <h3 className="title-md text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">
                Pacientes
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                Gerencie os dados dos pacientes
              </p>
            </div>
          </Link>

          <Link
            href="/health-insurance"
            className="group relative bg-white rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 border border-indigo-100 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
            <div className="relative z-10">
              <h3 className="title-md text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">
                Convênio
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                Gerencie os dados dos convênios
              </p>
            </div>
          </Link>

          <Link
            href="/report"
            className="group relative bg-white rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 border border-indigo-100 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
            <div className="relative z-10">
              <h3 className="title-md text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">
                Relatorios
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                Gere relatorios com os dados
              </p>
            </div>
          </Link>

          <Link
            href="/import"
            className="group relative bg-white rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 border border-indigo-100 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
            <div className="relative z-10">
              <h3 className="title-md text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">
                importar
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                Adicione dados de forma automatica através planilhas no excel
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}