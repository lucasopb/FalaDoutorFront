"use client";

import { useEffect, useState } from "react";
import { Patient } from "@/types";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "@/lib/api";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<Partial<Patient>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);

  const loadPatients = async () => {
    const data = await getPatients();
    setPatients(data);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // limpa erro do campo conforme digita
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name || form.name.trim() === "") {
      newErrors.name = "Nome é obrigatório.";
    }

    const cpf = form.cpf?.replace(/\D/g, "");
    if (!cpf || cpf.length < 11) {
      newErrors.cpf = "CPF deve ter 11 dígitos.";
    }

    if (!form.healthInsurance) {
      newErrors.healthInsurance = "Selecione um plano de saúde.";
    }

    if (!form.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const preparedForm = {
      ...form,
      birthDate: form.birthDate
        ? new Date(form.birthDate).toISOString()
        : undefined,
    };

    if (editId) {
      await updatePatient(editId, preparedForm as Patient);
    } else {
      await createPatient(preparedForm as Patient);
    }

    setForm({});
    setErrors({});
    setEditId(null);
    loadPatients();
  };

  const handleEdit = (patient: Patient) => {
    setEditId(patient.id);
    setForm({
      name: patient.name,
      cpf: patient.cpf,
      healthInsurance: patient.healthInsurance,
      birthDate: patient.birthDate?.toString().split("T")[0],
    });
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    await deletePatient(id);
    loadPatients();
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestão de Pacientes</h1>

      <div className="mb-8 bg-white p-4 rounded-xl shadow border">
        <h2 className="text-xl font-semibold mb-4">{editId ? "Editar Paciente" : "Novo Paciente"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Nome */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Nome"
              value={form.name || ""}
              onChange={handleChange}
              className="p-2 border rounded-md w-full"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* CPF */}
          <div>
            <input
              type="text"
              name="cpf"
              placeholder="CPF"
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
              className="p-2 border rounded-md w-full"
            />
            {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
          </div>

          {/* Convênio */}
          <div>
            <select
              name="healthInsurance"
              value={form.healthInsurance || ""}
              onChange={handleChange}
              className="p-2 border rounded-md w-full"
            >
              <option value="">Selecione o Convênio</option>
              <option value="plano 1">Plano 1</option>
              <option value="plano 2">Plano 2</option>
              <option value="plano 3">Plano 3</option>
            </select>
            {errors.healthInsurance && <p className="text-red-500 text-sm mt-1">{errors.healthInsurance}</p>}
          </div>

          {/* Data de nascimento */}
          <div>
            <input
              type="date"
              name="birthDate"
              value={form.birthDate || ""}
              onChange={handleChange}
              className="p-2 border rounded-md w-full"
            />
            {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({});
                setErrors({});
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editId ? "Atualizar" : "Cadastrar"}
          </button>
        </div>
      </div>

      {/* Lista de pacientes */}
      <table className="w-full border shadow rounded-xl overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3 border">Nome</th>
            <th className="p-3 border">CPF</th>
            <th className="p-3 border">Convênio</th>
            <th className="p-3 border">Nascimento</th>
            <th className="p-3 border text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border-t">
              <td className="p-3 border">{patient.name}</td>
              <td className="p-3 border">{patient.cpf}</td>
              <td className="p-3 border">{patient.healthInsurance}</td>
              <td className="p-3 border">
                {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
              </td>
              <td className="p-3 border text-center">
                <button
                  onClick={() => handleEdit(patient)}
                  className="text-blue-600 hover:underline mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(patient.id)}
                  className="text-red-600 hover:underline"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
