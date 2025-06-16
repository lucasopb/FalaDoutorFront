"use client";

import { useState, useEffect, useRef } from "react";
import { generateReport } from "@/lib/api";
import { getHealthInsurance } from "@/lib/api";
import { HealthInsurance } from "@/types/healthInsurance";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

type Entity = "doctor" | "patient" | "health_insurance";

export default function ReportPage() {
  const [entity, setEntity] = useState<Entity>("doctor");
  const [healthInsurances, setHealthInsurances] = useState<{ data: HealthInsurance[]; pagination: string }>({ data: [], pagination: "" });
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

  useEffect(() => {
    const fetchHealthInsurances = async (limit = 50, page = 1) => {
      try {
        const result = await getHealthInsurance(limit, page);
        setHealthInsurances(result);
      } catch (err) {
        console.error("Erro ao buscar convênios:", err);
      }
    };

    fetchHealthInsurances();
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
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Relatórios
        </h1>

        <div className="card p-6 mb-6 bg-white rounded-2xl shadow-xl border border-blue-100">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Entidade</label>
            <select
              value={entity}
              onChange={handleEntityChange}
              className="input-field"
            >
              <option value="doctor">Médico</option>
              <option value="patient">Paciente</option>
              <option value="health_insurance">Convênio</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderFilterFields()}
          </div>

          <div className="mt-4">
            <button onClick={handleGenerate} className="btn-primary">
              Gerar Relatório
            </button>
          </div>
        </div>

        {hasGenerated && data.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Resultados</h2>
            <p className="text-sm text-gray-600 mb-2">
              Total de resultados: <span className="font-medium">{pagination.total}</span>
            </p>
            <table className="w-full text-left table-auto border-collapse">
              <thead>
                <tr className="border-b">
                  {Object.keys(data[0])
                    .filter((key) => key !== "id")
                    .map((key) => (
                      <th key={key} className="py-2 px-4 font-medium text-gray-600 capitalize">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    {Object.entries(item)
                      .filter(([key]) => key !== "id")
                      .map(([key, value], j) => (
                        <td key={j} className="py-2 px-4 text-sm text-gray-700">
                          {key === "healthInsurance"
                            ? (value && typeof value === "object" && "name" in value
                              ? (value as { name: string }).name
                              : "Sem convênio")
                            : String(value)}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => handlePageChange("prev")}
                disabled={pagination.page <= 1}
                className="btn-secondary"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange("next")}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary"
              >
                Próxima
              </button>
            </div>
          </div>
        )}

        {hasGenerated && data.length === 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 text-center text-gray-600">
            Nenhum dado encontrado com os filtros fornecidos.
          </div>
        )}

      </div>
    </main>
  );
}
