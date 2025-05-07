import { HealthInsurance } from "./healthInsurance";

export type Patient = {
  id: string;
  name: string;
  cpf: string;
  birthDate: Date;
  healthInsurance: HealthInsurance | null;
};
