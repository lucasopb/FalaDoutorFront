"use client";

import { useEffect, useState } from "react";
import { Doctor } from "@/types/doctor";
import { HealthInsurance } from "@/types/healthInsurance";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getHealthInsurance,
  createDoctorHealthInsurance,
  getDoctorHealthInsurance,
  getDoctorsById,
  deleteDoctorHealthInsurance,
} from "@/lib/api";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface DoctorHealthInsurance {
  id: string;
  healthInsurance: HealthInsurance;
}

interface DoctorDetails extends Doctor {
  doctorHealthInsurances: DoctorHealthInsurance[];
}

export default function HomePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [healthInsurances, setHealthInsurances] = useState<HealthInsurance[]>([]);
  const [selectedHealthInsurances, setSelectedHealthInsurances] = useState<string[]>([]);
  const [doctorHealthInsurances, setDoctorHealthInsurances] = useState<Record<string, HealthInsurance[]>>({});
  const [expandedDoctors, setExpandedDoctors] = useState<string[]>([]);
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
    const fetchData = async () => {
      const [doctorsRes, healthInsurancesRes] = await Promise.all([
        getDoctors(pagination.limit, pagination.page),
        getHealthInsurance(100, 1), // Get all health insurances
      ]);

      setDoctors(doctorsRes.data);
      setPagination((prev) => ({
        ...prev,
        total: doctorsRes.pagination.total,
        totalPages: doctorsRes.pagination.totalPages,
      }));
      setHealthInsurances(healthInsurancesRes.data);
    };

    fetchData();
  }, [pagination.page, pagination.limit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (checked) {
        setSelectedHealthInsurances(prev => [...prev, value]);
      } else {
        setSelectedHealthInsurances(prev => prev.filter(id => id !== value));
      }
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
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
      let doctorId;
      if (editId) {
        await updateDoctor(editId, form as Doctor);
        doctorId = editId;

        // Get current health insurances for comparison
        const currentDoctor: DoctorDetails = await getDoctorsById(doctorId);
        const currentHealthInsuranceIds = new Set(
          currentDoctor.doctorHealthInsurances?.map(dhi => dhi.healthInsurance.id) || []
        );

        // Add new associations
        for (const healthInsuranceId of selectedHealthInsurances) {
          if (!currentHealthInsuranceIds.has(healthInsuranceId)) {
            try {
              await createDoctorHealthInsurance(doctorId, healthInsuranceId);
            } catch (error) {
              console.error(`Erro ao associar plano ${healthInsuranceId}:`, error);
            }
          }
        }

        // Remove unchecked associations
        for (const dhi of currentDoctor.doctorHealthInsurances || []) {
          if (!selectedHealthInsurances.includes(dhi.healthInsurance.id)) {
            try {
              await deleteDoctorHealthInsurance(dhi.id);
            } catch (error) {
              console.error(`Erro ao remover plano ${dhi.healthInsurance.id}:`, error);
            }
          }
        }
      } else {
        const newDoctor = await createDoctor(form as Doctor);
        doctorId = newDoctor.id;

        // Add health insurance associations for new doctor
        for (const healthInsuranceId of selectedHealthInsurances) {
          try {
            await createDoctorHealthInsurance(doctorId, healthInsuranceId);
          } catch (error) {
            console.error(`Erro ao associar plano ${healthInsuranceId}:`, error);
          }
        }
      }

      setForm({});
      setEditId(null);
      setErrors({});
      setSelectedHealthInsurances([]);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar médico:", error);
    }
  };

  const handleEdit = async (doctor: Doctor) => {
    setEditId(doctor.id);
    setForm({
      name: doctor.name,
      cpf: (doctor.cpf),
      crm: doctor.crm,
      birthDate: doctor.birthDate,
    });

    // Collapse all expanded health insurance views
    setExpandedDoctors([]);
    setDoctorHealthInsurances({});

    try {
      const doctorDetails: DoctorDetails = await getDoctorsById(doctor.id);
      const healthInsuranceIds = doctorDetails.doctorHealthInsurances?.map(dhi => dhi.healthInsurance.id) || [];
      setSelectedHealthInsurances(healthInsuranceIds);
    } catch (error) {
      console.error("Erro ao carregar planos do médico:", error);
    }

    setErrors({});
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({});
    setErrors({});
    setSelectedHealthInsurances([]);
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

  const handleExpandDoctor = async (doctorId: string) => {
    if (expandedDoctors.includes(doctorId)) {
      setExpandedDoctors(prev => prev.filter(id => id !== doctorId));
      return;
    }

    try {
      const doctorDetails: DoctorDetails = await getDoctorsById(doctorId);
      setDoctorHealthInsurances(prev => ({
        ...prev,
        [doctorId]: doctorDetails.doctorHealthInsurances?.map(dhi => dhi.healthInsurance) || []
      }));
      setExpandedDoctors(prev => [...prev, doctorId]);
    } catch (error) {
      console.error("Erro ao carregar planos do médico:", error);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="title-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Gestão de Médicos
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Total de médicos: {pagination.total}
            </span>
          </div>
        </div>

        <div className="card mb-6 animate-fade-in bg-white rounded-lg p-6 shadow-lg border border-blue-100">
          <h2 className="title-md mb-4 text-gray-800">
            {editId ? "Editar Médico" : "Cadastrar Novo Médico"}
          </h2>

          <div className="flex flex-wrap">
            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">
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
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">
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
              {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
            </div>

            <div className="flex flex-col w-full md:w-1/4 p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">
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
                placeholder="000000"
              />
              {errors.crm && <p className="text-xs text-red-500 mt-1">{errors.crm}</p>}
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
                className="input-field w-70 group-hover:border-blue-300 transition-colors"
              />
              {errors.birthDate && (
                <p className="text-xs text-red-500 mt-1">{errors.birthDate}</p>
              )}
            </div>

            <div className="flex flex-col w-full p-2 group">
              <label className="block text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-800 transition-colors">
                Planos de Saúde
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {healthInsurances.map((hi) => (
                  <label key={hi.id} className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      name="healthInsurances"
                      value={hi.id}
                      checked={selectedHealthInsurances.includes(hi.id)}
                      onChange={handleChange}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-700">{hi.name} ({hi.code})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            {editId && (
              <button
                onClick={handleCancel}
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

        <div className="bg-white rounded-lg shadow-lg border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
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
                    CRM
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Nascimento
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planos de Saúde
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                      {doctor.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                      {doctor.cpf}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                      {doctor.crm}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                      {new Date(doctor.birthDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleExpandDoctor(doctor.id)}
                          className="text-blue-600 hover:text-blue-800 underline text-xs"
                        >
                          {expandedDoctors.includes(doctor.id) ? 'Ocultar planos' : 'Ver planos'}
                        </button>
                        {expandedDoctors.includes(doctor.id) && (
                          <div className="flex flex-col gap-1 mt-1 items-center">
                            {doctorHealthInsurances[doctor.id]?.length > 0 ? (
                              doctorHealthInsurances[doctor.id].map((hi) => (
                                <span
                                  key={hi.id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {hi.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">Nenhum plano associado</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="action-icon edit-icon"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
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