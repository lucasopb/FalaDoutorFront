"use client";

import { useEffect, useState } from "react";
import { Doctor } from "@/types";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "@/lib/api";

export default function HomePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState<Partial<Doctor>>({});
  const [editId, setEditId] = useState<string | null>(null);

  const loadDoctors = async () => {
    const data = await getDoctors();
    setDoctors(data);
  };

  useEffect(() => {
    loadDoctors();
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
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : undefined,
    };

    if (editId) {
      await updateDoctor(editId, preparedForm as unknown as Doctor);
    } else {
      await createDoctor(preparedForm as unknown as Doctor);
    }
    setForm({});
    setEditId(null);
    loadDoctors();
  };

  const handleEdit = (doctor: Doctor) => {
    setEditId(doctor.id);
    setForm({
      name: doctor.name,
      cpf: doctor.cpf,
      crm: doctor.crm,
      birthDate: doctor.birthDate?.split("T")[0], // para input type="date"
    });
  };

  const handleDelete = async (id: string) => {
    await deleteDoctor(id);
    loadDoctors();
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestão de Médicos</h1>

      <div className="mb-8 bg-white p-4 rounded-xl shadow border">
        <h2 className="text-xl font-semibold mb-4">{editId ? "Editar Médico" : "Novo Médico"}</h2>
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
          <input
            type="text"
            name="crm"
            placeholder="CRM"
            value={form.crm || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6); // permite apenas números e limita a 6 caracteres
              handleChange({ target: { name: "crm", value } });
            }}
            className="p-2 border rounded-md w-full"
          />
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
            <th className="p-3 border">CRM</th>
            <th className="p-3 border">Nascimento</th>
            <th className="p-3 border text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc) => (
            <tr key={doc.id} className="border-t">
              <td className="p-3 border">{doc.name}</td>
              <td className="p-3 border">{doc.cpf}</td>
              <td className="p-3 border">{doc.crm}</td>
              <td className="p-3 border">
                {new Date(doc.birthDate).toLocaleDateString("pt-BR")}
              </td>
              <td className="p-3 border text-center">
                <button
                  onClick={() => handleEdit(doc)}
                  className="text-blue-600 hover:underline mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
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
