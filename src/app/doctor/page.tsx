"use client";

import { useEffect, useState } from "react";
import { Doctor } from "@/types/doctor";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "@/lib/api";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 5, page: 1, totalPages: 0 });
  const [form, setForm] = useState<Partial<Doctor>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadData = async (limit = pagination.limit, page = pagination.page) => {
    const res = await getDoctors(limit, page);
    setDoctors(res.data);
    setPagination(res.pagination);
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      const response = await getDoctors(pagination.limit, pagination.page);
      setDoctors(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    };

    fetchDoctors();
  }, [pagination.page, pagination.limit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!form.name) {
      newErrors.name = "Nome é obrigatório.";
    }

    const cpfClean = (form.cpf || "").replace(/\D/g, "");
    if (!cpfClean || cpfClean.length < 11) {
      newErrors.cpf = "CPF é obrigatorio.(000.000.000-00)";
    }

    if (!form.crm || form.crm.length < 6) {
      newErrors.crm = "CRM é obrigatório.(000000)";
    }

    if (!form.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (editId) {
        await updateDoctor(editId, form as Doctor);
      } else {
        await createDoctor(form as Doctor);
      }

      setForm({});
      setEditId(null);
      setErrors({});
      loadData();
    } catch (error) {
      console.error("Erro ao salvar médico:", error);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditId(doctor.id);
    setForm({
      name: doctor.name,
      cpf: (doctor.cpf),
      crm: doctor.crm,
      birthDate: doctor.birthDate,
    });
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoctor(id);
      loadData();
    } catch (error) {
      console.error("Erro ao deletar médico:", error);
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
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Gestão de Médicos
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-lg text-gray-600">
              Total de médicos: {pagination.total}
            </span>
          </div>
        </div>

        <div className="card mb-8 animate-fade-in bg-white rounded-2xl p-8 shadow-xl border border-blue-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            {editId ? "Editar Médico" : "Cadastrar Novo Médico"}
          </h2>

          <div className="flex flex-wrap">
            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-800 transition-colors">
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className="input-field w-70 group-hover:border-blue-300 transition-colors"
                placeholder="Digite o nome do médico"
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-800 transition-colors">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
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
                placeholder="000.000.000-00"
              />
              {errors.cpf && <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-800 transition-colors">
                CRM
              </label>
              <input
                type="text"
                name="crm"
                value={form.crm || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  handleChange({ target: { name: "crm", value } } as any);
                }}
                className="input-field w-70 group-hover:border-blue-300 transition-colors"
                placeholder="Número do CRM"
              />
              {errors.crm && <p className="text-sm text-red-500 mt-1">{errors.crm}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-800 transition-colors">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birthDate"
                value={form.birthDate ? new Date(form.birthDate).toISOString().split('T')[0] : ""}
                onChange={handleChange}
                className="input-field w-70 group-hover:border-blue-300 transition-colors"
              />
              {errors.birthDate && <p className="text-sm text-red-500 mt-1">{errors.birthDate}</p>}
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
                className="btn-secondary hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="btn-primary hover:scale-105 transition-transform"
            >
              {editId ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </div>

        <div className="table-container animate-fade-in bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="table-cell">Nome</th>
                <th className="table-cell">CPF</th>
                <th className="table-cell">CRM</th>
                <th className="table-cell">Nascimento</th>
                <th className="table-cell text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="table-cell text-center">{doctor.name}</td>
                  <td className="table-cell text-center">{(doctor.cpf)}</td>
                  <td className="table-cell text-center">{doctor.crm}</td>
                  <td className="table-cell text-center">
                    {new Date(doctor.birthDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="table-cell text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleEdit(doctor)}><PencilIcon className="w-5 h-5 text-blue-500" /></button>
                      <button onClick={() => handleDelete(doctor.id)}><TrashIcon className="w-5 h-5 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

                    {/* Paginação */}
          <div className="flex justify-between items-center mt-0">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={pagination.page <= 1}
              className="btn-secondary disabled:opacity-50"
            >
              Página anterior
            </button>

            <span className="text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange("next")}
              disabled={pagination.page >= pagination.totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Próxima página
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}