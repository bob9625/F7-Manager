export const TEAM_CATEGORIES = [
  "prebenjamin",
  "benjamin",
  "alevin",
  "infantil",
  "cadete",
  "juvenil",
  "senior",
] as const;

export type TeamCategory = (typeof TEAM_CATEGORIES)[number];

export const TEAM_CATEGORY_LABELS: Record<TeamCategory, string> = {
  prebenjamin: "Prebenjamín",
  benjamin: "Benjamín",
  alevin: "Alevín",
  infantil: "Infantil",
  cadete: "Cadete",
  juvenil: "Juvenil",
  senior: "Senior",
};

export const TRAINING_DAYS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;

export type TrainingDay = (typeof TRAINING_DAYS)[number];

export const TRAINING_DAY_LABELS: Record<TrainingDay, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export type Team = {
  id: string;
  owner_id: string;
  name: string;
  category: TeamCategory;
  training_days: string[];
  training_time: string | null;
  created_at: string;
};
