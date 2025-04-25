import axios from "axios";
import { Doctor, Patient } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

// ---------------- MÉDICOS ----------------

// MÉDICOS

export const getDoctors = async (): Promise<Patient[]> => {
  try {
    const res = await api.get("/doctor");
    return res.data;
  } catch (error: any) {
    console.error("Erro ao pegar Usuários:", error.response?.data || error.message);
    throw error;
  }
};

export const createDoctor = async (doctor: Doctor) => {
  try {
    const res = await api.post("/doctor", doctor);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao criar medicos:", error.response?.data || error.message);
    throw error;
  }
};

export const updateDoctor = async (id: string, doctor: Doctor) => {
  try {
    const res = await api.put(`/doctor/${id}`, doctor);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao atualizar médico:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteDoctor = async (id: string) => {
  try {
    const res = await api.delete(`/doctor/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao deletar médico:", error.response?.data || error.message);
    throw error;
  }
};

// PACIENTES

export const getPatients = async (): Promise<Patient[]> => {
  try {
    const res = await api.get("/patient");
    return res.data;
  } catch (error: any) {
    console.error("Erro ao pegar paciente:", error.response?.data || error.message);
    throw error;
  }
};

export const createPatient = async (patient: Patient) => {
  try {
    const res = await api.post("/patient", patient);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao criar paciente:", error.response?.data || error.message);
    throw error;
  }
};

export const updatePatient = async (id: string, patient: Patient) => {
  try {
    const res = await api.put(`/patient/${id}`, patient);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao atualizar paciente:", error.response?.data || error.message);
    throw error;
  }
};

export const deletePatient = async (id: string) => {
  try {
    const res = await api.delete(`/patient/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao deletar paciente:", error.response?.data || error.message);
    throw error;
  }
};
