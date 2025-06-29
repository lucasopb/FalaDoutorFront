import { Doctor } from "./doctor";
import { Patient } from "./patient";

export type Appointment = {
    id: string;
    patient: Patient;
    doctor: Doctor;
    date: string;
    observation: string
  };
  