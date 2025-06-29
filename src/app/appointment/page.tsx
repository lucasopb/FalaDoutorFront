"use client";

import { useEffect, useState } from "react";
import { getAppointments, createAppointment, deleteAppointment, updateAppointment } from "@/lib/api";
import { getDoctors, getPatients } from "@/lib/api";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Appointment } from "@/types/appointment";
import { Doctor } from "@/types/doctor";
import { Patient } from "@/types/patient";
import { HealthInsurance } from "@/types/healthInsurance";
import Loading from "@/components/Loading";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<{
    doctorId?: string;
    patientId?: string;
    date?: string;
    observation?: string;
  }>({});
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);

  const loadAppointments = async () => {
    setLoading(true);
    const res = await getAppointments();
    setAppointments(res);
    setLoading(false);
  };

  const loadDoctorsAndPatients = async () => {
    const doctorsRes = await getDoctors(100, 1);
    const patientsRes = await getPatients(100, 1);
    setDoctors(doctorsRes.data);
    setPatients(patientsRes.data);
  };

  useEffect(() => {
    loadAppointments();
    loadDoctorsAndPatients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "patientId") {
      const patient = patients.find((p) => p.id === value);
      setSelectedPatient(patient || null);
    }
    if (name === "doctorId") {
      const doctor = doctors.find((d) => d.id === value);
      setSelectedDoctor(doctor || null);
    }
  };

  const handleEdit = (appt: Appointment) => {
    setEditingAppointmentId(appt.id);
    setForm({
      doctorId: appt.doctor.id,
      patientId: appt.patient.id,
      date: appt.date.slice(0, 16), // formato yyyy-MM-ddTHH:mm
      observation: appt.observation || ""
    });
    setSelectedDoctor(doctors.find((d) => d.id === appt.doctor.id) || null);
    setSelectedPatient(patients.find((p) => p.id === appt.patient.id) || null);
  };

  const handleCancelEdit = () => {
    setEditingAppointmentId(null);
    setForm({});
    setSelectedDoctor(null);
    setSelectedPatient(null);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (!form.doctorId || !form.patientId || !form.date) return;
    setErrorMessage(null);
    try {
      if (editingAppointmentId) {
        await updateAppointment(editingAppointmentId, {
          date: form.date,
          observation: form.observation || undefined
        });
        setEditingAppointmentId(null);
      } else {
        await createAppointment({
          doctorId: form.doctorId,
          patientId: form.patientId,
          date: form.date,
          observation: form.observation || ""
        });
      }
      setForm({});
      setSelectedPatient(null);
      setSelectedDoctor(null);
      loadAppointments();
    } catch (error: any) {
      if (error?.response?.data?.message === "Doctor does not accept the patient's health insurance.") {
        setErrorMessage("O plano de saúde do paciente não é aceito pelo médico selecionado.");
      } else {
        setErrorMessage(editingAppointmentId ? "Erro ao editar consulta. Tente novamente." : "Erro ao criar consulta. Tente novamente.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAppointment(id);
    loadAppointments();
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="title-xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Gestão de Consultas
        </h1>

        <div className="card mb-6 animate-fade-in bg-white rounded-lg p-6 shadow-lg border border-indigo-100">
          <h2 className="title-md mb-4 text-gray-800">Cadastrar Nova Consulta</h2>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 animate-fade-in">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col w-full md:w-1/4">
              <label htmlFor="doctorId" className="text-xs text-gray-500 font-semibold mb-1">Médico</label>
              <select
                id="doctorId"
                name="doctorId"
                value={form.doctorId || ""}
                onChange={handleChange}
                className="input-field"
                disabled={!!editingAppointmentId}
              >
                <option value="">Selecione um médico</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.name} ({doc.cpf})</option>
                ))}
              </select>
              {selectedDoctor && selectedDoctor.healthInsurances && selectedDoctor.healthInsurances.length > 0 && (
                <div className="mt-1">
                  <span className="text-xs text-gray-700 font-semibold">Planos aceitos:</span>
                  <ul className="list-disc list-inside text-xs text-gray-700">
                    {selectedDoctor.healthInsurances.map((plan) => (
                      <li key={plan.id}>{plan.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex flex-col w-full md:w-1/4">
              <label htmlFor="patientId" className="text-xs text-gray-500 font-semibold mb-1">Paciente</label>
              <select
                id="patientId"
                name="patientId"
                value={form.patientId || ""}
                onChange={handleChange}
                className="input-field"
                disabled={!!editingAppointmentId}
              >
                <option value="">Selecione um paciente</option>
                {patients.map((pat) => (
                  <option key={pat.id} value={pat.id}>{pat.name} ({pat.cpf})</option>
                ))}
              </select>
              {selectedPatient && (
                <div className="mt-1">
                  <span className="text-xs text-gray-700 font-semibold">Plano:</span> <span className="text-xs text-gray-700">{selectedPatient.healthInsurance?.name || "Não informado"}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col w-full md:w-1/4">
              <label htmlFor="date" className="text-xs text-gray-500 font-semibold mb-1">Data e Hora</label>
              <input
                id="date"
                type="datetime-local"
                name="date"
                value={form.date || ""}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <textarea
              name="observation"
              placeholder="Observações"
              value={form.observation || ""}
              onChange={handleChange}
              className="input-field w-full md:w-1/2"
            ></textarea>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            {editingAppointmentId && (
              <button className="btn-secondary" onClick={handleCancelEdit} type="button">
                Cancelar Edição
              </button>
            )}
            <button className="btn-primary" onClick={handleSubmit} type="button">
              {editingAppointmentId ? "Salvar Alterações" : "Cadastrar Consulta"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden mt-8">
          {loading ? (
            <Loading />
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nenhuma consulta cadastrada.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 p-2 bg-gradient-to-br from-white to-blue-50">
              {appointments.map((appt) => (
                <div key={appt.id} className="flex flex-col gap-1 rounded-md bg-white shadow border border-gray-100 p-3 hover:shadow-lg transition-all min-h-[110px] max-w-xs mx-auto w-full">
                  <div className="flex flex-col mb-0.5">
                    <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Paciente</span>
                    <span className="font-bold text-black text-sm">{appt.patient.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Médico</span>
                    <span className="font-bold text-black text-sm">{appt.doctor.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(appt.date).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>
                    {appt.patient.healthInsurance?.name || "Sem plano"}
                  </div>
                  {appt.observation && (
                    <div className="flex items-center gap-1 text-gray-400 text-xs italic">
                      <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2m2-4h6a2 2 0 012 2v4H7V6a2 2 0 012-2z" /></svg>
                      {appt.observation}
                    </div>
                  )}
                  <div className="flex justify-end mt-0.5 gap-2">
                    <button onClick={() => handleEdit(appt)} className="bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-full p-1 transition-all" title="Editar consulta">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(appt.id)} className="bg-red-50 hover:bg-red-100 text-red-500 rounded-full p-1 transition-all" title="Excluir consulta">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
