"use client";

import { useState } from "react";
import { generateReport } from "@/lib/api";

type Entity = "doctor" | "patient" | "health_insurance";

export default function ReportPage() {
  const [entity, setEntity] = useState<Entity>("doctor");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    total: 0,
  });
  const [hasGenerated, setHasGenerated] = useState(false); // NOVO estado para controlar exibição dos dados

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  let newValue = value;

  if (name === "cpf") {
    // Remove tudo que não é número
    const onlyDigits = value.replace(/\D/g, "").slice(0, 11);
    // Formata: 000.000.000-00
    newValue = onlyDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (match, p1, p2, p3, p4) =>
      `${p1}.${p2}.${p3}-${p4}`.replace(/[-.]$/, "")
    );
  }

  if (name === "crm") {
    newValue = value.replace(/\D/g, "").slice(0, 6); // Apenas números, máximo 6 dígitos
  }

  if (name === "code") {
    newValue = value.replace(/\D/g, "").slice(0, 10); // Apenas números, máximo 10 dígitos
  }

  setFilters((prev) => ({
    ...prev,
    [name]: newValue,
  }));
};


  const handleGenerate = async () => {
    console.log(filters)
    try {
      const response = await generateReport(entity, filters, pagination.limit, 1); // força página 1
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
            <input name="healthInsuranceId" placeholder="ID do Convênio" onChange={handleChange} value={filters.healthInsuranceId ?? ""} className="input-field" />
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
          </>
        );
      case "health_insurance":
        return (
          <>
            <input name="name" placeholder="Nome" onChange={handleChange} value={filters.name ?? ""} className="input-field" />
            <input name="code" type="text" placeholder="Código" onChange={handleChange} value={filters.code ?? ""} className="input-field" />
            <input name="baseValueMin" type="number" placeholder="Valor mínimo" onChange={handleChange} value={filters.baseValueMin ?? ""} className="input-field" />
            <input name="baseValueMax" type="number" placeholder="Valor máximo" onChange={handleChange} value={filters.baseValueMax?? ""} className="input-field" />
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
            <table className="w-full text-left table-auto border-collapse">
              <thead>
                <tr className="border-b">
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="py-2 px-4 font-medium text-gray-600">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    {Object.values(item).map((value, j) => (
                      <td key={j} className="py-2 px-4 text-sm text-gray-700">
                        {String(value)}
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
