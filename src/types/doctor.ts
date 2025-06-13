import { HealthInsurance } from "./healthInsurance";

export type Doctor = {
  id: string;
  name: string
  cpf: string;
  crm: string;
  birthDate: Date;
  healthInsurances: HealthInsurance[]
};
  