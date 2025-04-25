import axios from "axios";
import { Doctor, Patient } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

// ---------------- MÉDICOS ----------------

export const getDoctors = async (): Promise<Doctor[]> => {
  const res = await api.get("/doctor");
  console.log(res.data);
  return res.data;
};

export const createDoctor = async (doctor: Doctor) => {
  const res = await api.post("/doctor", doctor);
  return res.data;
};

export const updateDoctor = async (id: string, doctor: Doctor) => {
  const res = await api.put(`/doctor/${id}`, doctor);
  return res.data;
};

export const deleteDoctor = async (id: string) => {
  const res = await api.delete(`/doctor/${id}`);
  return res.data;
};

// ---------------- PACIENTES ----------------

export const getPatients = async (): Promise<Patient[]> => {
  const res = await api.get("/patient");
  console.log(res.data);
  return res.data;
};

export const createPatient = async (patient: Patient) => {
  const res = await api.post("/patient", patient);
  return res.data;
};

export const updatePatient = async (id: string, patient: Patient) => {
  const res = await api.put(`/patient/${id}`, patient);
  return res.data;
};

export const deletePatient = async (id: string) => {
  const res = await api.delete(`/patient/${id}`);
  return res.data;
};
