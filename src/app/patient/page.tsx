"use client";

import { useEffect, useState } from "react";
import { Patient } from "@/types/patient";
import { HealthInsurance } from "@/types/healthInsurance";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  getHealthInsurance
} from "@/lib/api";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Loading from "@/components/Loading";

export default function HomePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<Partial<Patient>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [healthInsurances, setHealthInsurances] = useState<HealthInsurance[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 5, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const loadPatients = async (limit = pagination.limit, page = pagination.page) => {
    setLoading(true);
    const res = await getPatients(limit, page);
    setPatients(res.data);
    setPagination(res.pagination);
    setLoading(false);
  };

  useEffect(() => {
    loadPatients(pagination.limit, pagination.page);
    loadHealthInsurances();
  }, [pagination.page]);


  const loadHealthInsurances = async (limit = 10, page = 0) => {
    const res = await getHealthInsurance(limit, page);
    setHealthInsurances(res.data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name || form.name.trim() === "") {
      newErrors.name = "Nome é obrigatório.";
    }

    const cpfClean = (form.cpf || "").replace(/\D/g, "");
    if (!cpfClean || cpfClean.length < 11) {
      newErrors.cpf = "CPF é obrigatorio. (000.000.000-00)";
    }

    if (!form.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const preparedForm = {
      ...form,
      birthDate: form.birthDate,
      healthInsuranceId: form.healthInsurance || null,
    };
    console.log(preparedForm)

    try {
      if (editId) {
        await updatePatient(editId, preparedForm as Patient);
      } else {
        await createPatient(preparedForm as Patient);
      }

      setForm({});
      setEditId(null);
      setErrors({});
      loadPatients();
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditId(patient.id);
    setForm({
      name: patient.name,
      cpf: (patient.cpf),
      birthDate: patient.birthDate,
      healthInsurance: patient.healthInsurance?.id || null,
    });
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePatient(id);
      loadPatients();
    } catch (error) {
      console.error("Erro ao deletar paciente:", error);
    }
  };

  const handlePageChange = (direction: "next" | "prev") => {
    setPagination((prev) => {
      const nextPage =
        direction === "next"
          ? Math.min(prev.page + 1, prev.totalPages)
          : Math.max(0, prev.page - 1);

      return { ...prev, page: nextPage };
    });
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="title-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Gestão de Pacientes
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Total de pacientes: {pagination.total}
            </span>
          </div>
        </div>

        <div className="card mb-6 animate-fade-in bg-white rounded-lg p-6 shadow-lg border border-indigo-100">
          <h2 className="title-md mb-4 text-gray-800">
            {editId ? "Editar Paciente" : "Cadastrar Novo Paciente"}
          </h2>

          <div className="flex flex-wrap">
            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">
                Nome
              </label>
              <input
                type="text"
                name="name"
                placeholder="Digite o nome do paciente"
                value={form.name || ""}
                onChange={handleChange}
                className="input-field w-70 group-hover:border-indigo-300 transition-colors"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                placeholder="000.000.000-00"
                value={form.cpf || ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '').slice(0, 11);
                  if (value.length <= 3) {
                    value = value;
                  } else if (value.length <= 6) {
                    value = value.replace(/(\d{3})(\d{0,3})/, '$1.$2');
                  } else if (value.length <= 9) {
                    value = value.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
                  } else {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
                  }
                  handleChange({ target: { name: "cpf", value } } as any);
                }}
                className="input-field w-70 group-hover:border-indigo-300 transition-colors"
              />
              {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">
                Convênio
              </label>
              <select
                name="healthInsurance"
                value={form.healthInsurance || ""}
                onChange={handleChange}
                className="input-field w-70 group-hover:border-indigo-300 transition-colors"
              >
                <option value="">Selecione um convênio</option>
                {healthInsurances.map((hi) => (
                  <option key={hi.id} value={hi.id}>
                    {hi.name} ({hi.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birthDate"
                value={form.birthDate ? new Date(form.birthDate).toISOString().split('T')[0] : ""}
                onChange={handleChange}
                className="input-field w-70 group-hover:border-indigo-300 transition-colors"
              />
              {errors.birthDate && (
                <p className="text-xs text-red-500 mt-1">{errors.birthDate}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            {editId && (
              <button
                onClick={() => {
                  setEditId(null);
                  setForm({});
                  setErrors({});
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="btn-primary"
            >
              {editId ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-indigo-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <Loading />
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Convênio
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Nascimento
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                        {patient.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                        {patient.cpf}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                        {patient.healthInsurance ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {patient.healthInsurance.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Sem convênio</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                        {new Date(patient.birthDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="action-icon edit-icon"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="action-icon delete-icon"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginação */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
        </div>
      </div>
    </main>
  );
}
