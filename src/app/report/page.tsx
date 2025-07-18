"use client";

import { useState, useEffect, useRef } from "react";
import { generateReport } from "@/lib/api";
import { getHealthInsurance } from "@/lib/api";
import { getDoctors, getPatients } from "@/lib/api";
import { HealthInsurance } from "@/types/healthInsurance";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import Loading from "@/components/Loading";
import { Doctor } from "@/types/doctor";
import { Patient } from "@/types/patient";

type Entity = "doctor" | "patient" | "health_insurance" | "appointment";

function isRecord(val: unknown): val is Record<string, any> {
  return typeof val === 'object' && val !== null;
}

export default function ReportPage() {
  const [entity, setEntity] = useState<Entity>("doctor");
  const [healthInsurances, setHealthInsurances] = useState<{ data: HealthInsurance[]; pagination: string }>({ data: [], pagination: "" });
  const [doctors, setDoctors] = useState<{ data: Doctor[]; pagination: string }>({ data: [], pagination: "" });
  const [patients, setPatients] = useState<{ data: Patient[]; pagination: string }>({ data: [], pagination: "" });
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    total: 0,
  });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isHealthInsuranceOpen, setIsHealthInsuranceOpen] = useState(false);
  const [selectedHealthInsurances, setSelectedHealthInsurances] = useState<HealthInsurance[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHealthInsurances = async (limit = 50, page = 1) => {
      try {
        const result = await getHealthInsurance(limit, page);
        setHealthInsurances(result);
      } catch (err) {
        console.error("Erro ao buscar convênios:", err);
      }
    };
    const fetchDoctors = async (limit = 50, page = 1) => {
      try {
        const result = await getDoctors(limit, page);
        setDoctors(result);
      } catch (err) {
        console.error("Erro ao buscar médicos:", err);
      }
    };
    const fetchPatients = async (limit = 50, page = 1) => {
      try {
        const result = await getPatients(limit, page);
        setPatients(result);
      } catch (err) {
        console.error("Erro ao buscar pacientes:", err);
      }
    };
    fetchHealthInsurances();
    fetchDoctors();
    fetchPatients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsHealthInsuranceOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "cpf") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 11);
      newValue = onlyDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (match, p1, p2, p3, p4) =>
        `${p1}.${p2}.${p3}-${p4}`.replace(/[-.]$/, "")
      );
    }

    if (name === "crm") {
      newValue = value.replace(/\D/g, "").slice(0, 6);
    }

    if (name === "code") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFilters((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleHealthInsuranceSelect = (healthInsurance: HealthInsurance) => {
    if (!selectedHealthInsurances.find(hi => hi.id === healthInsurance.id)) {
      setSelectedHealthInsurances(prev => [...prev, healthInsurance]);
      setFilters(prev => ({
        ...prev,
        healthInsuranceIds: [...(prev.healthInsuranceIds || []), healthInsurance.id]
      }));
    }
  };

  const handleHealthInsuranceRemove = (healthInsuranceId: string) => {
    setSelectedHealthInsurances(prev => prev.filter(hi => hi.id !== healthInsuranceId));
    setFilters(prev => ({
      ...prev,
      healthInsuranceIds: (prev.healthInsuranceIds || []).filter((id: string) => id !== healthInsuranceId)
    }));
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await generateReport(entity, filters, pagination.limit, 1);
      setData(response.data || []);
      setPagination((prev) => ({
        ...prev,
        page: 1,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.total || 0,
      }));
      setHasGenerated(true);
    } catch (error) {
      console.error("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEntity(e.target.value as Entity);
    setFilters({});
    setData([]);
    setPagination({ page: 1, limit: 5, totalPages: 1, total: 0 });
    setHasGenerated(false);
    setSelectedHealthInsurances([]);
  };

  const handlePageChange = async (direction: "next" | "prev") => {
    const newPage =
      direction === "next"
        ? Math.min(pagination.page + 1, pagination.totalPages)
        : Math.max(1, pagination.page - 1);

    try {
      setLoading(true);
      const response = await generateReport(entity, filters, pagination.limit, newPage);
      setData(response.data || []);
      setPagination((prev) => ({
        ...prev,
        page: newPage,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.total || 0,
      }));
    } catch (error) {
      console.error("Erro ao mudar página do relatório");
    } finally {
      setLoading(false);
    }
  };

  const renderFilterFields = () => {
    switch (entity) {
      case "patient":
        return (
          <>
            <input name="name" placeholder="Nome" onChange={handleChange} value={filters.name ?? ""} className="input-field" />
            <input name="cpf" type="text" placeholder="CPF" onChange={handleChange} value={filters.cpf ?? ""} className="input-field" />
            <select
              name="healthInsuranceId"
              value={filters.healthInsuranceId ?? ""}
              onChange={(e) => setFilters(prev => ({ ...prev, healthInsuranceId: e.target.value }))}
              className="input-field"
            >
              <option value="">Sem especificar convênio</option>
              {healthInsurances.data.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.name}
                </option>
              ))}
            </select>
            <input name="ageMin" type="number" placeholder="Idade mínima" onChange={handleChange} value={filters.ageMin ?? ""} className="input-field" />
            <input name="ageMax" type="number" placeholder="Idade máxima" onChange={handleChange} value={filters.ageMax ?? ""} className="input-field" />
          </>
        );
      case "doctor":
        return (
          <>
            <input name="name" placeholder="Nome" onChange={handleChange} value={filters.name ?? ""} className="input-field" />
            <input name="cpf" type="text" placeholder="CPF" onChange={handleChange} value={filters.cpf ?? ""} className="input-field" />
            <input name="crm" type="text" placeholder="CRM" onChange={handleChange} value={filters.crm ?? ""} className="input-field" />
            <input name="ageMin" type="number" placeholder="Idade mínima" onChange={handleChange} value={filters.ageMin ?? ""} className="input-field" />
            <input name="ageMax" type="number" placeholder="Idade máxima" onChange={handleChange} value={filters.ageMax ?? ""} className="input-field" />
            <div className="relative" ref={dropdownRef}>
              <div
                className="input-field cursor-pointer flex items-center justify-between"
                onClick={() => setIsHealthInsuranceOpen(!isHealthInsuranceOpen)}
              >
                <span className="text-gray-500">Selecione os planos de saúde</span>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isHealthInsuranceOpen ? 'transform rotate-180' : ''}`} />
              </div>
              {isHealthInsuranceOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                  {healthInsurances.data.map((hi) => (
                    <div
                      key={hi.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                      onClick={() => handleHealthInsuranceSelect(hi)}
                    >
                      <span>{hi.name} ({hi.code})</span>
                      {selectedHealthInsurances.find(selected => selected.id === hi.id) && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {selectedHealthInsurances.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedHealthInsurances.map((hi) => (
                    <span
                      key={hi.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {hi.name}
                      <button
                        onClick={() => handleHealthInsuranceRemove(hi.id)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      case "health_insurance":
        return (
          <>
            <input name="name" placeholder="Nome" onChange={handleChange} value={filters.name ?? ""} className="input-field" />
            <input name="code" type="text" placeholder="Código" onChange={handleChange} value={filters.code ?? ""} className="input-field" />
            <input name="baseValueMin" type="number" placeholder="Valor mínimo" onChange={handleChange} value={filters.baseValueMin ?? ""} className="input-field" />
            <input name="baseValueMax" type="number" placeholder="Valor máximo" onChange={handleChange} value={filters.baseValueMax ?? ""} className="input-field" />
          </>
        );
      case "appointment":
        return (
          <>
            <select
              name="doctorId"
              value={filters.doctorId ?? ""}
              onChange={e => setFilters(prev => ({ ...prev, doctorId: e.target.value }))}
              className="input-field"
            >
              <option value="">Selecione o médico</option>
              {doctors.data.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.cpf})
                </option>
              ))}
            </select>
            <select
              name="patientId"
              value={filters.patientId ?? ""}
              onChange={e => setFilters(prev => ({ ...prev, patientId: e.target.value }))}
              className="input-field"
            >
              <option value="">Selecione o paciente</option>
              {patients.data.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.name} ({pat.cpf})
                </option>
              ))}
            </select>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 mb-1">Data mínima</label>
              <input
                name="dateMin"
                type="date"
                placeholder="Data mínima"
                onChange={e => setFilters(prev => ({ ...prev, dateMin: e.target.value }))}
                value={filters.dateMin ?? ""}
                className="input-field"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 mb-1">Data máxima</label>
              <input
                name="dateMax"
                type="date"
                placeholder="Data máxima"
                onChange={e => setFilters(prev => ({ ...prev, dateMax: e.target.value }))}
                value={filters.dateMax ?? ""}
                className="input-field"
              />
            </div>
            <select
              name="healthInsurance"
              value={filters.healthInsurance ?? ""}
              onChange={e => setFilters(prev => ({ ...prev, healthInsurance: e.target.value }))}
              className="input-field"
            >
              <option value="">Selecione o convênio</option>
              {healthInsurances.data.map((hi) => (
                <option key={hi.id} value={hi.name}>{hi.name}</option>
              ))}
            </select>
          </>
        );
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="title-xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Relatórios
        </h1>

        <div className="card p-4 mb-4 bg-white rounded-lg shadow-lg border border-blue-100">
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Entidade</label>
            <select
              value={entity}
              onChange={handleEntityChange}
              className="input-field"
            >
              <option value="doctor">Médico</option>
              <option value="patient">Paciente</option>
              <option value="health_insurance">Convênio</option>
              <option value="appointment">Consulta</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {renderFilterFields()}
          </div>

          <div className="mt-3">
            <button onClick={handleGenerate} className="btn-primary">
              Gerar Relatório
            </button>
          </div>
        </div>

        {hasGenerated && (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-blue-100">
            <h2 className="title-md mb-3 text-gray-700">Resultados</h2>
            <p className="text-xs text-gray-600 mb-2">
              Total de resultados: <span className="font-medium">{pagination.total}</span>
            </p>
            <div className="overflow-x-auto">
              {loading ? (
                <Loading />
              ) : (
                data.length > 0 ? (
                  <table className="w-full text-left table-auto border-collapse">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(data[0])
                          .filter((key) => key !== "id")
                          .map((key) => (
                            <th key={key} className="py-2 px-4 font-medium text-gray-600 capitalize text-xs">
                              {key === "date" ? "Data/Hora" : key === "healthInsurance" ? "Convênio" : key === "patient" ? "Paciente" : key}
                            </th>
                          ))}
                        {/* Se não existir healthInsurance, adiciona coluna */}
                        {data[0].healthInsurance === undefined &&
                          typeof data[0].patient === 'object' &&
                          data[0].patient !== null &&
                          'healthInsurance' in (data[0].patient as any) &&
                          (
                            <th className="py-2 px-4 font-medium text-gray-600 capitalize text-xs">Convênio</th>
                          )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          {Object.entries(item)
                            .filter(([key]) => key !== "id")
                            .map(([key, value]) => (
                              <td key={key} className="py-2 px-4 text-sm">
                                {key === "date" && typeof value === "string" && value.includes("T") && !isNaN(Date.parse(value))
                                  ? new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                  : key === "healthInsurance" && isRecord(value) && "healthInsurance" in value && value.healthInsurance && "name" in value.healthInsurance
                                    ? value.healthInsurance.name
                                    : key === "patient" && isRecord(value) && "name" in value
                                      ? value.name
                                      : isRecord(value) && "healthInsurance" in value && value.healthInsurance && "name" in value.healthInsurance
                                        ? value.healthInsurance.name
                                        : isRecord(value) && "name" in value
                                          ? value.name
                                          : String(value || '')}
                              </td>
                            ))}
                          {/* Se não existir healthInsurance, adiciona coluna */}
                          {item.healthInsurance === undefined &&
                            typeof item.patient === 'object' &&
                            item.patient !== null &&
                            'healthInsurance' in (item.patient as any) &&
                            (
                              <td className="py-2 px-4 text-sm">{((item.patient as any).healthInsurance && typeof (item.patient as any).healthInsurance === 'object' && 'name' in (item.patient as any).healthInsurance) ? (item.patient as any).healthInsurance.name : ''}</td>
                            )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 text-center text-gray-600">
                    Nenhum dado encontrado com os filtros fornecidos.
                  </div>
                )
              )}
            </div>
            {/* Paginação */}
            {!loading && data.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange("prev")}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange("next")}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Página <span className="font-medium">{pagination.page}</span> de <span className="font-medium">{pagination.totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange("prev")}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => handlePageChange("next")}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próximo
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
