// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  TuteurResponse, UpdateTuteurRequest,
  EleveResponse, CreateEleveRequest,
  ProfesseurResponse,
  MatiereResponse,
  CoursResponse,
  PrestationResponse, CreatePrestationRequest,
  SeanceResponse, CreateSeanceRequest,
  PaiementResponse, CreatePaiementRequest,
  EvaluationResponse, CreateEvaluationRequest
} from '../models';

const API = environment.apiUrl;

/**
 * Services API – Pattern : Repository côté client
 *
 * Chaque service encapsule les appels HTTP vers un groupe d'endpoints.
 * Les composants ne connaissent jamais l'URL de l'API — ils passent
 * toujours par ces services.
 *
 * Responsabilité unique : communication HTTP avec le backend Spring Boot.
 */

@Injectable({ providedIn: 'root' })
export class TuteurApiService {
  constructor(private http: HttpClient) {}

  findById(id: string): Observable<TuteurResponse> {
    return this.http.get<TuteurResponse>(`${API}/tuteurs/${id}`);
  }

  findAll(): Observable<TuteurResponse[]> {
    return this.http.get<TuteurResponse[]>(`${API}/tuteurs`);
  }

  update(id: string, req: Partial<TuteurResponse>): Observable<TuteurResponse> {
    return this.http.patch<TuteurResponse>(`${API}/tuteurs/${id}`, req);
  }

  findEleves(tuteurId: string): Observable<EleveResponse[]> {
    return this.http.get<EleveResponse[]>(`${API}/eleves/tuteur/${tuteurId}`);
  }

  findPrestations(tuteurId: string): Observable<PrestationResponse[]> {
    return this.http.get<PrestationResponse[]>(`${API}/prestations/tuteur/${tuteurId}`);
  }

  findPaiements(tuteurId: string): Observable<PaiementResponse[]> {
    return this.http.get<PaiementResponse[]>(`${API}/paiements/tuteur/${tuteurId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class EleveApiService {
  constructor(private http: HttpClient) {}

  create(req: CreateEleveRequest): Observable<EleveResponse> {
    return this.http.post<EleveResponse>(`${API}/eleves`, req);
  }

  findById(id: string): Observable<EleveResponse> {
    return this.http.get<EleveResponse>(`${API}/eleves/${id}`);
  }

  findAll(): Observable<EleveResponse[]> {
    return this.http.get<EleveResponse[]>(`${API}/eleves`);
  }

  findSeances(eleveId: string): Observable<SeanceResponse[]> {
    return this.http.get<SeanceResponse[]>(`${API}/seances/eleve/${eleveId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ProfesseurApiService {
  constructor(private http: HttpClient) {}

  findById(id: string): Observable<ProfesseurResponse> {
    return this.http.get<ProfesseurResponse>(`${API}/professeurs/${id}`);
  }

  findAll(): Observable<ProfesseurResponse[]> {
    return this.http.get<ProfesseurResponse[]>(`${API}/professeurs`);
  }

  findNonValides(): Observable<ProfesseurResponse[]> {
    return this.http.get<ProfesseurResponse[]>(`${API}/professeurs/non-valides`);
  }

  valider(id: string): Observable<ProfesseurResponse> {
    return this.http.patch<ProfesseurResponse>(`${API}/professeurs/${id}/valider`, {});
  }

  findSeances(professeurId: string): Observable<SeanceResponse[]> {
    return this.http.get<SeanceResponse[]>(`${API}/seances/professeur/${professeurId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class MatiereApiService {
  constructor(private http: HttpClient) {}

  findAll(): Observable<MatiereResponse[]> {
    return this.http.get<MatiereResponse[]>(`${API}/matieres`);
  }
}

@Injectable({ providedIn: 'root' })
export class CoursApiService {
  constructor(private http: HttpClient) {}

  findAll(): Observable<CoursResponse[]> {
    return this.http.get<CoursResponse[]>(`${API}/cours`);
  }

  findById(id: string): Observable<CoursResponse> {
    return this.http.get<CoursResponse>(`${API}/cours/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class PrestationApiService {
  constructor(private http: HttpClient) {}

  create(req: CreatePrestationRequest): Observable<PrestationResponse> {
    return this.http.post<PrestationResponse>(`${API}/prestations`, req);
  }

  findById(id: string): Observable<PrestationResponse> {
    return this.http.get<PrestationResponse>(`${API}/prestations/${id}`);
  }

  findAll(): Observable<PrestationResponse[]> {
    return this.http.get<PrestationResponse[]>(`${API}/prestations`);
  }

  findByEleve(eleveId: string): Observable<PrestationResponse[]> {
    return this.http.get<PrestationResponse[]>(`${API}/prestations/eleve/${eleveId}`);
  }

  cloturer(id: string): Observable<PrestationResponse> {
    return this.http.patch<PrestationResponse>(`${API}/prestations/${id}/cloturer`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class SeanceApiService {
  constructor(private http: HttpClient) {}

  create(req: CreateSeanceRequest): Observable<SeanceResponse> {
    return this.http.post<SeanceResponse>(`${API}/seances`, req);
  }

  findById(id: string): Observable<SeanceResponse> {
    return this.http.get<SeanceResponse>(`${API}/seances/${id}`);
  }

  findByPrestation(prestationId: string): Observable<SeanceResponse[]> {
    return this.http.get<SeanceResponse[]>(`${API}/seances/prestation/${prestationId}`);
  }

  changerStatut(id: string, statut: string): Observable<SeanceResponse> {
    return this.http.patch<SeanceResponse>(`${API}/seances/${id}/statut`, { statut });
  }
}

@Injectable({ providedIn: 'root' })
export class PaiementApiService {
  constructor(private http: HttpClient) {}

  create(req: CreatePaiementRequest): Observable<PaiementResponse> {
    return this.http.post<PaiementResponse>(`${API}/paiements`, req);
  }

  findByPrestation(prestationId: string): Observable<PaiementResponse[]> {
    return this.http.get<PaiementResponse[]>(`${API}/paiements/prestation/${prestationId}`);
  }

  confirmer(id: string): Observable<PaiementResponse> {
    return this.http.patch<PaiementResponse>(`${API}/paiements/${id}/confirmer`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class EvaluationApiService {
  constructor(private http: HttpClient) {}

  create(req: CreateEvaluationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(`${API}/evaluations`, req);
  }

  findBySeance(seanceId: string): Observable<EvaluationResponse> {
    return this.http.get<EvaluationResponse>(`${API}/evaluations/seance/${seanceId}`);
  }

  findByProfesseur(professeurId: string): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(`${API}/evaluations/professeur/${professeurId}`);
  }
}
