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

export default function HomePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<Partial<Patient>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [healthInsurances, setHealthInsurances] = useState<HealthInsurance[]>([]);


  const loadPatients = async () => {
    const data = await getPatients();
    setPatients(data);
  };

  useEffect(() => {
    loadPatients();
    loadHealthInsurances();
  }, []);
  
  const loadHealthInsurances = async () => {
    const data = await getHealthInsurance();
    setHealthInsurances(data);
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
      cpf: patient.cpf,
      birthDate: patient.birthDate,
      healthInsurance: patient.healthInsurance || null,
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

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Gestão de Pacientes
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-lg text-gray-600">
              Total de pacientes: {patients.length}
            </span>
          </div>
        </div>

        <div className="card mb-8 animate-fade-in bg-white rounded-2xl p-8 shadow-xl border border-indigo-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            {editId ? "Editar Paciente" : "Cadastrar Novo Paciente"}
          </h2>

          <div className="flex flex-wrap">
            <div className="flex flex-col w-full md:w-1/4 group">
              <label className="block text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-800 transition-colors">
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
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/4 group">
              <label className="block text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-800 transition-colors">
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
              {errors.cpf && <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/4 group">
              <label className="block text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-800 transition-colors">
                Convênio
              </label>
              <select
                name="healthInsurance"
                value={form.healthInsurance ? form.healthInsurance.id : ""}
                onChange={handleChange}
                className="input-field w-70 group-hover:border-indigo-300 transition-colors"
              >
                <option value="">Sem Convênio</option>
                {healthInsurances.map((hi) => (
                  <option key={hi.id} value={hi.id}>
                    {hi.name}
                  </option>
                ))}
              </select>

              {errors.healthInsurance && <p className="text-sm text-red-500 mt-1">{errors.healthInsurance}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/4 group">
              <label className="block text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-800 transition-colors">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birthDate"
                value={form.birthDate ? new Date(form.birthDate).toISOString().split('T')[0] : ""}
                onChange={handleChange}
                className="input-field w-70 group-hover:border-indigo-300 transition-colors"
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

        <div className="table-container animate-fade-in bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <th className="table-cell text-center">Nome</th>
                <th className="table-cell text-center">CPF</th>
                <th className="table-cell text-center">Nascimento</th>
                <th className="table-cell text-center">Convênio</th>
                <th className="table-cell text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="table-cell text-center">{patient.name}</td>
                  <td className="table-cell text-center">{patient.cpf}</td>
                  <td className="table-cell text-center">
                    {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="table-cell text-center">
                    {patient.healthInsurance?.name ?? "Sem convênio"}
                  </td>
                  <td className="table-cell text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(patient)}
                        className="action-icon edit-icon hover:scale-110 transition-transform"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="action-icon delete-icon hover:scale-110 transition-transform"
                        title="Deletar"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
