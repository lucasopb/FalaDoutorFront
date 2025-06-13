import axios from "axios";
import { Doctor } from "@/types/doctor";
import { Patient } from "@/types/patient";
import { HealthInsurance } from "@/types/healthInsurance";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

// ---------------- MÉDICOS ----------------

// MÉDICOS

export const getDoctors = async (limit: number, page: number) => {
  try {
    const res = await api.get("/doctor", {
      params: {
        page,
        limit,
      },
    });
    return res.data;
  } catch (error: any) {
    console.error("Erro ao pegar médicos:", error.response?.data || error.message);
    throw error;
  }
};

export const getDoctorsById = async (id: string) => {
  try {
    const res = await api.get(`/doctor/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao pegar médicos:", error.response?.data || error.message);
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

export const getPatients = async (limit: number, page: number) => {
  try {
    const res = await api.get("/patient", {
      params: {
        page,
        limit,
      },
    });
    console.log(res.data)
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

// HEALTHINSURANCE

export const getHealthInsurance = async (limit: number, page: number) => {
  try {
    const res = await api.get("/health-insurance", {
      params: {
        page,
        limit,
      },
    });
    return res.data;
  } catch (error: any) {
    console.error("Erro ao pegar plano:", error.response?.data || error.message);
    throw error;
  }
};

export const createHealthInsurance = async (healthInsurance: HealthInsurance) => {
  try {
    const res = await api.post("/health-insurance", healthInsurance);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao criar plano:", error.response?.data || error.message);
    throw error;
  }
};

export const updateHealthInsurance = async (id: string, healthInsurance: HealthInsurance) => {
  try {
    const res = await api.put(`/health-insurance/${id}`, healthInsurance);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao atualizar plano:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteHealthInsurance = async (id: string) => {
  try {
    const res = await api.delete(`/health-insurance/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao deletar plano:", error.response?.data || error.message);
    throw error;
  }
};

//  REPORT

export const generateReport = async (
  entity: string,
  filters: Record<string, any>,
  limit: number,
  page: number
) => {
  try {
    console.log(filters)
    const res = await api.post(
      "/report",
      {
        entity,
        filters,
      },
      {
        params: {
          page,
          limit,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error("Erro ao gerar relatório:", error.response?.data || error.message);
    throw error;
  }
};

// DOCTOR_HEALTH_INSURANCE

export const getDoctorHealthInsurance = async () => {
  try {
    const res = await api.get("/doctor-health-insurance")
    return res.data
  } catch (err: any) {
    throw err
  }
}

export const deleteDoctorHealthInsurance = async (id: string) => {
  try {
    const res = await api.delete(`/doctor-health-insurance/${id}`)
    return res.data
  } catch (err: any) {
    throw err
  }
}

export const createDoctorHealthInsurance = async (
  doctorId: string,
  healthInsuranceId: string
) => {
  try {
    const res = await api.post("/doctor-health-insurance", {
      doctorId,
      healthInsuranceId,
    });
    return res.data;
  } catch (error: any) {
    console.error("Erro ao criar associação médico/plano:", error.response?.data || error.message);
    throw error;
  }
};

