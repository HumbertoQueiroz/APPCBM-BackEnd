import { Role } from '@prisma/client'
import bcrypt from 'bcrypt'

interface User {
  userName: string;
  cpf: string;
  addressFull?: string | null;
  addressLog?: string | null;
  addressNum?: string | null;
  addressBai?: string | null;
  addressCit?: string | null;
  addressEst?: string | null;
  addressCEP?: string | null;
  addressComp?: string | null;
  telephone: string;
  email: string;
  password: string;
  type: Role;
  createdAt: Date;
  MastersCreated: Master[];
  MasterUser: Master[];
  Vehicle: Vehicle[];
  Occurrence: Occurrence[];
  IncidentResponse: IncidentResponse[];

}

interface Master {
  id: number;
  user: User;
  userId: number;
  matricula: string;
  position: string;
  createdNewUser: boolean;
  createdAt: Date;
  createdBy?: User | null;
  createdByUserId?: number | null;
}

interface Vehicle {
  id: number;
  placa: string;
  type: string;
  model: string;
  description?: string | null;
  createdAt: Date;
  user: User;
  userId: number;
  IncidentResponse: IncidentResponse[];
}


interface Occurrence {
  id: number;
  createdAt: Date;
  user: User;
  userId: number;
  natOco: string;
  geoLat?: number | null;
  geoLong?: number | null;
  addressFull?: string | null;
  addressNum?: string | null;
  addressLog?: string | null;
  addressBairro?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressCEP?: string | null;
  addressComp?: string | null;
  description: string;
  IncidentResponse: IncidentResponse[];
  statusOccurrence: statusOccurrence;
}

interface IncidentResponse {
  id: number;
  dateInit: Date;
  user: User;
  userId: number;
  occurrence: Occurrence;
  occurrenceId: number;
  vehicle?: Vehicle | null;
  vehicleId?: number | null;
  dateStartDisplacement?: Date | null;
  dateArrivalOccurrence?: Date | null;
  arrivalHospital?: Date | null;
  dateReturn?: Date | null;
  Status: Status[];
}

interface Status {
  id: number;
  date: Date;
  incidentResponse: IncidentResponse;
  incidentResponseId: number;
  statusIncidentResponse: statusIncidentResponse;
  description?: string | null;
}

export async function createUsar({ params }: type) {}
