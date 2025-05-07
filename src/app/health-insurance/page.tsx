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

  const loadData = async () => {
    const data = await getHealthInsurance();
    setInsurances(data);
  };

  useEffect(() => {
    loadData();
  }, []);

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

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
            Gestão de Planos de Saúde
          </h1>
          <span className="text-lg text-gray-600">
            Total: {insurances.length}
          </span>
        </div>

        <div className="card mb-8 animate-fade-in bg-white rounded-2xl p-8 shadow-xl border border-green-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            {editId ? "Editar Plano" : "Cadastrar Novo Plano"}
          </h2>

          <div className="flex flex-wrap">
            <div className="flex flex-col w-full md:w-1/3 p-2 group">
              <label className="block text-sm font-medium text-gray-600 mb-2">
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
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/3 p-2 group">
              <label className="block text-sm font-medium text-gray-600 mb-2">
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
              {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/3 p-2 group">
              <label className="block text-sm font-medium text-gray-600 mb-2">
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
                <p className="text-sm text-red-500">{errors.baseValue}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
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

        <div className="table-container animate-fade-in bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                <th className="table-cell">Nome</th>
                <th className="table-cell">Código</th>
                <th className="table-cell">Valor Base</th>
                <th className="table-cell text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
  {insurances.map((item) => (
    <React.Fragment key={item.id}>
      <tr className="hover:bg-green-50 transition-colors">
        <td className="table-cell text-center">{item.name}</td>
        <td className="table-cell text-center">{item.code}</td>
        <td className="table-cell text-center">
          R$ {Number(item.baseValue).toFixed(2)}
        </td>
        <td className="table-cell text-center">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleEdit(item)}
              className="action-icon edit-icon"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="action-icon delete-icon"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Lista de pacientes */}
      {item.patients && item.patients.length > 0 && (
        <tr>
          <td colSpan={4} className="table-cell bg-emerald-50 text-sm p-4">
            <div>
              <p className="font-semibold mb-2 text-emerald-700">
                Pacientes vinculados:
              </p>
              <div className="flex flex-wrap gap-4">
                {item.patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm"
                  >
                    <p className="font-semibold text-gray-700">{patient.name}</p>
                    <p className="text-gray-500 text-sm">CPF: {patient.cpf}</p>
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
      </div>
    </main>
  );
}
