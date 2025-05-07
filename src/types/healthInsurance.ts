import { Patient } from "./patient";

export type HealthInsurance = {
    id: string;
    name: string;
    code: string;
    baseValue: number;
    patients: Patient[]
  };
  