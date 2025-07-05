"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getTodayNotifications } from "@/lib/api";

// Definir o tipo Notification conforme a resposta da API
interface Notification {
  id: string;
  time: string;
  patient: string;
  doctor: string;
  observation: string;
}

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar notificações do dia
  const fetchNotifications = async () => {
    try {
      const data = await getTodayNotifications();
      setNotifications(data.notifications || []);
      // Só mostra badge se houver novas notificações não vistas
      if (!sidebarOpen && (data.notifications?.length || 0) > lastSeenCount) {
        setUnreadCount(data.notifications.length - lastSeenCount);
      } else {
        setUnreadCount(0);
      }
    } catch (err) {
      // erro silencioso
    }
  };

  // Polling para atualizar notificações
  useEffect(() => {
    fetchNotifications();
    pollingRef.current = setInterval(() => {
      fetchNotifications();
    }, 10000); // 10 segundos
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSeenCount, sidebarOpen]);

  // Resetar badge ao abrir sidebar e marcar como visto
  const handleOpenSidebar = () => {
    setSidebarOpen(true);
    setLastSeenCount(notifications.length);
    setUnreadCount(0);
  };
  const handleCloseSidebar = () => setSidebarOpen(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Efeito de gradiente animado no fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-indigo-100/20 animate-gradient-x" />

      {/* Ícone de notificação */}
      <button
        className="fixed top-6 right-6 z-30 bg-white rounded-full shadow-md p-2 hover:scale-110 transition-transform"
        onClick={handleOpenSidebar}
        aria-label="Notificações"
      >
        <span className="relative">
          {/* SVG de sino */}
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-indigo-600">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </span>
      </button>

      {/* Sidebar de notificações */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" onClick={handleCloseSidebar} />
          {/* Sidebar */}
          <aside className="relative w-full max-w-xs bg-white h-full shadow-lg p-6 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-indigo-700">Consultas de hoje</h2>
              <button onClick={handleCloseSidebar} className="text-gray-500 hover:text-indigo-600 text-xl">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center mt-8">Nenhuma consulta marcada para hoje.</p>
              ) : (
                <ul className="space-y-4">
                  {notifications.map((n) => (
                    <li key={n.id} className="bg-indigo-50 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-indigo-700">{n.time}</span>
                        <span className="text-xs text-gray-500">Dr(a). {n.doctor}</span>
                      </div>
                      <div className="text-gray-800 font-semibold">{n.patient}</div>
                      {n.observation && (
                        <div className="text-xs text-gray-500 mt-1">Obs: {n.observation}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}

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

          <Link
            href="/appointment"
            className="group relative bg-white rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 border border-indigo-100 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
            <div className="relative z-10">
              <h3 className="title-md text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">
                consultas
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                Gerencie as consultas
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}