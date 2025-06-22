"use client";

import { useEffect, useState } from "react";
import React from "react";
import { HealthInsurance } from "@/types/healthInsurance";
import {
  getHealthInsurance,
  createHealthInsurance,
  updateHealthInsurance,
  deleteHealthInsurance,
} from "@/lib/api";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function HealthInsurancePage() {
  const [insurances, setInsurances] = useState<HealthInsurance[]>([]);
  const [form, setForm] = useState<Partial<HealthInsurance>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ total: 0, limit: 1, page: 1, totalPages: 0 });


  const loadData = async (limit = pagination.limit, page = pagination.page) => {
    const res = await getHealthInsurance(limit, page);
    setInsurances(res.data);
    setPagination(res.pagination);
  };

  useEffect(() => {
    loadData(pagination.limit, pagination.page);
  }, [pagination.page, pagination.limit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "baseValue" ? parseFloat(value) || 0 : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = "Nome é obrigatório.";
    if (!form.code || form.code.length < 10) newErrors.code = "Código é obrigatório. (10 Caracteres)";
    if (form.baseValue === undefined || form.baseValue < 0)
      newErrors.baseValue = "Valor base deve ser um número positivo.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        await updateHealthInsurance(editId, form as HealthInsurance);
      } else {
        await createHealthInsurance(form as HealthInsurance);
      }
      setForm({});
      setEditId(null);
      setErrors({});
      loadData();
    } catch (error) {
      console.error("Erro ao salvar plano de saúde:", error);
    }
  };

  const handleEdit = (insurance: HealthInsurance) => {
    setEditId(insurance.id);
    setForm({
      name: insurance.name,
      code: insurance.code,
      baseValue: Number(insurance.baseValue),
    });
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHealthInsurance(id);
      loadData();
    } catch (error) {
      console.error("Erro ao deletar plano de saúde:", error);
    }
  };

  const formatCpf = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '').padEnd(11, '0');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
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
    <main className="min-h-screen p-6 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="title-xl text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
            Gestão de Planos de Saúde
          </h1>
          <span className="text-sm text-gray-600">
            Total: {pagination.total}
          </span>
        </div>

        <div className="card mb-6 animate-fade-in bg-white rounded-lg p-6 shadow-lg border border-green-100">
          <h2 className="title-md mb-4 text-gray-800">
            {editId ? "Editar Plano" : "Cadastrar Novo Plano"}
          </h2>

          <div className="flex flex-wrap">
            <div className="flex flex-col w-full md:w-1/3 p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className="input-field"
                placeholder="Nome do plano"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/3 p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Código
              </label>
              <input
                type="text"
                name="code"
                value={form.code || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permite apenas números e limita a 10 caracteres
                  if (/^\d{0,10}$/.test(value)) {
                    handleChange(e);
                  }
                }}
                className="input-field"
                placeholder="Código do plano"
              />
              {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/3 p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Valor Base (R$)
              </label>
              <input
                type="text" // Usamos "text" para maior controle do que é digitado
                name="baseValue"
                value={form.baseValue || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permite apenas números e ponto (para decimal)
                  if (/^\d*\.?\d*$/.test(value)) {
                    handleChange(e);
                  }
                }}
                className="input-field"
                placeholder="0.00"
              />
              {errors.baseValue && (
                <p className="text-xs text-red-500">{errors.baseValue}</p>
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
            <button onClick={handleSubmit} className="btn-primary">
              {editId ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-green-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Base
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insurances.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-green-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        R$ {Number(item.baseValue).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="action-icon edit-icon"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="action-icon delete-icon"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Lista de pacientes */}
                    {item.patients && item.patients.length > 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 bg-emerald-50 text-sm">
                          <div>
                            <p className="font-semibold mb-2 text-emerald-700 text-xs">
                              Pacientes vinculados:
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {item.patients.map((patient) => (
                                <div
                                  key={patient.id}
                                  className="p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm"
                                >
                                  <p className="font-semibold text-gray-700 text-xs">{patient.name}</p>
                                  <p className="text-gray-500 text-xs">CPF: {formatCpf(patient.cpf)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
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
