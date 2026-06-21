// ─────────────────────────────────────────────────────────────
// src/app/core/models/index.ts
// Interfaces TypeScript — miroir des DTOs Response Spring Boot
// ─────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  role: 'TUTEUR' | 'PROFESSEUR' | 'ADMIN';
  userId: string;
  nomComplet: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TuteurResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  typeLien?: string;
  contactUrgenceNom?: string;
  contactUrgenceTelephone?: string;
  createdAt: string;
}

export interface CreateTuteurRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  typeLien: string;
  contactUrgenceNom?: string;
  contactUrgenceTelephone?: string;
  password: string;
}

export interface EleveResponse {
  id: string;
  tuteurId: string;
  nomTuteur: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  niveauScolaire?: string;
  adresse?: string;
  telephone?: string;
}

export interface CreateEleveRequest {
  tuteurId: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  niveauScolaire: string;
  adresse?: string;
  telephone?: string;
}

export interface ProfesseurResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  tarifHoraire?: number;
  disponibilites?: string;
  valide: boolean;
  createdAt: string;
}

export interface CreateProfesseurRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  tarifHoraire?: number;
  disponibilites?: string;
  password: string;
}

export interface MatiereResponse {
  id: string;
  nom: string;
  description?: string;
}

export interface CoursResponse {
  id: string;
  matiereId: string;
  nomMatiere: string;
  niveau: string;
  description?: string;
  tarifHoraire?: number;
}

export interface PrestationResponse {
  id: string;
  eleveId: string;
  nomEleve: string;
  tuteurId: string;
  nomTuteur: string;
  periodicite: string;
  dateDebut: string;
  dateFin?: string;
  montantTotal: number;
  statut: 'EN_COURS' | 'CLOTUREE' | 'ANNULEE';
  createdAt: string;
}

export interface CreatePrestationRequest {
  eleveId: string;
  tuteurId: string;
  periodicite: string;
  dateDebut: string;
  dateFin?: string;
}

export interface SeanceResponse {
  id: string;
  prestationId: string;
  eleveId: string;
  nomEleve: string;
  professeurId: string;
  nomProfesseur: string;
  coursId: string;
  nomCours: string;
  dateHeureDebut: string;
  dureeMinutes: number;
  statut: 'PLANIFIEE' | 'REALISEE' | 'ANNULEE' | 'REPORTEE';
  adresseDomicile?: string;
  notes?: string;
}

export interface CreateSeanceRequest {
  prestationId: string;
  eleveId: string;
  professeurId: string;
  coursId: string;
  dateHeureDebut: string;
  dureeMinutes: number;
  adresseDomicile?: string;
  notes?: string;
}

export interface PaiementResponse {
  id: string;
  prestationId: string;
  tuteurId: string;
  nomTuteur: string;
  montant: number;
  modePaiement: string;
  statut: 'EN_ATTENTE' | 'PAYE' | 'REMBOURSE' | 'ECHEC';
  datePaiement?: string;
}

export interface CreatePaiementRequest {
  prestationId: string;
  tuteurId: string;
  montant: number;
  modePaiement: string;
}

export interface EvaluationResponse {
  id: string;
  seanceId: string;
  professeurId: string;
  nomProfesseur: string;
  noteEleve?: number;
  commentaire?: string;
  createdAt: string;
}

export interface CreateEvaluationRequest {
  seanceId: string;
  professeurId: string;
  noteEleve?: number;
  commentaire?: string;
}

export interface ApiError {
  title: string;
  detail: string;
  status: number;
  errors?: Record<string, string>;
}
