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
  const [editId, setEditId] = useState<string | null>(null);

  const loadPatients = async () => {
    const data = await getPatients();
    setPatients(data);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    const preparedForm = {
      ...form,
      birthDate: form.birthDate
        ? new Date(form.birthDate).toISOString()
        : undefined,
    };

    if (editId) {
      await updatePatient(editId, preparedForm as unknown as Patient);
    } else {
      await createPatient(preparedForm as unknown as Patient);
    }
    setForm({});
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
          <input
            type="text"
            name="name"
            placeholder="Nome"
            value={form.name || ""}
            onChange={handleChange}
            className="p-2 border rounded-md w-full"
          />
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

              handleChange({ target: { name: "cpf", value } });
            }}
            className="p-2 border rounded-md w-full"
          />
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
          <input
            type="date"
            name="birthDate"
            value={form.birthDate || ""}
            onChange={handleChange}
            className="p-2 border rounded-md w-full"
          />
        </div>
        <div className="flex justify-end gap-4">
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({});
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
