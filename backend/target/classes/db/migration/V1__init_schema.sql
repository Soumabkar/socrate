-- V1__init_schema.sql
-- Schéma complet Socrates v5

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE tuteur_legal (
    id                        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nom                       VARCHAR(100) NOT NULL,
    prenom                    VARCHAR(100) NOT NULL,
    email                     VARCHAR(255) NOT NULL UNIQUE,
    telephone                 VARCHAR(20),
    adresse                   TEXT,
    type_lien                 VARCHAR(50),
    contact_urgence_nom       VARCHAR(200),
    contact_urgence_telephone VARCHAR(20),
    password_hash             VARCHAR(255) NOT NULL,
    role                      VARCHAR(30)  NOT NULL DEFAULT 'TUTEUR',
    created_at                TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE eleve (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tuteur_id       UUID         NOT NULL REFERENCES tuteur_legal(id) ON DELETE RESTRICT,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    date_naissance  DATE,
    niveau_scolaire VARCHAR(50),
    adresse         TEXT,
    telephone       VARCHAR(20),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE matiere (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nom         VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE professeur (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    nom             VARCHAR(100)  NOT NULL,
    prenom          VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    telephone       VARCHAR(20),
    tarif_horaire   DECIMAL(8,2)  CHECK (tarif_horaire > 0),
    disponibilites  TEXT,
    password_hash   VARCHAR(255)  NOT NULL,
    role            VARCHAR(30)   NOT NULL DEFAULT 'PROFESSEUR',
    valide          BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE professeur_matiere (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    professeur_id UUID        NOT NULL REFERENCES professeur(id) ON DELETE CASCADE,
    matiere_id    UUID        NOT NULL REFERENCES matiere(id)    ON DELETE CASCADE,
    niveau_max    VARCHAR(50),
    UNIQUE (professeur_id, matiere_id)
);

CREATE TABLE cours (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    matiere_id    UUID         NOT NULL REFERENCES matiere(id) ON DELETE RESTRICT,
    niveau        VARCHAR(50)  NOT NULL,
    description   TEXT,
    tarif_horaire DECIMAL(8,2) CHECK (tarif_horaire > 0)
);

CREATE TABLE prestation (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    eleve_id      UUID          NOT NULL REFERENCES eleve(id)       ON DELETE RESTRICT,
    tuteur_id     UUID          NOT NULL REFERENCES tuteur_legal(id) ON DELETE RESTRICT,
    periodicite   VARCHAR(30)   NOT NULL CHECK (periodicite IN ('HEBDOMADAIRE','MENSUELLE','TRIMESTRIELLE','LIBRE')),
    date_debut    DATE          NOT NULL,
    date_fin      DATE,
    montant_total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (montant_total >= 0),
    statut        VARCHAR(30)   NOT NULL DEFAULT 'EN_COURS' CHECK (statut IN ('EN_COURS','CLOTUREE','ANNULEE')),
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_dates CHECK (date_fin IS NULL OR date_fin >= date_debut)
);

CREATE TABLE seance (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prestation_id    UUID        NOT NULL REFERENCES prestation(id) ON DELETE RESTRICT,
    eleve_id         UUID        NOT NULL REFERENCES eleve(id)      ON DELETE RESTRICT,
    professeur_id    UUID        NOT NULL REFERENCES professeur(id)  ON DELETE RESTRICT,
    cours_id         UUID        NOT NULL REFERENCES cours(id)       ON DELETE RESTRICT,
    date_heure_debut TIMESTAMP   NOT NULL,
    duree_minutes    INT         NOT NULL CHECK (duree_minutes > 0),
    statut           VARCHAR(30) NOT NULL DEFAULT 'PLANIFIEE' CHECK (statut IN ('PLANIFIEE','REALISEE','ANNULEE','REPORTEE')),
    adresse_domicile TEXT,
    notes            TEXT,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE paiement (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    prestation_id UUID          NOT NULL REFERENCES prestation(id)   ON DELETE RESTRICT,
    tuteur_id     UUID          NOT NULL REFERENCES tuteur_legal(id)  ON DELETE RESTRICT,
    montant       DECIMAL(10,2) NOT NULL CHECK (montant > 0),
    mode_paiement VARCHAR(50)   CHECK (mode_paiement IN ('VIREMENT','CHEQUE','ESPECES','CB','PRELEVEMENT')),
    statut        VARCHAR(30)   NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE','PAYE','REMBOURSE','ECHEC')),
    date_paiement TIMESTAMP,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE evaluation (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    seance_id     UUID        NOT NULL REFERENCES seance(id)      ON DELETE CASCADE,
    professeur_id UUID        NOT NULL REFERENCES professeur(id)  ON DELETE RESTRICT,
    note_eleve    INT         CHECK (note_eleve BETWEEN 1 AND 20),
    commentaire   TEXT,
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (seance_id)
);

-- Index
CREATE INDEX idx_eleve_tuteur        ON eleve(tuteur_id);
CREATE INDEX idx_prestation_eleve    ON prestation(eleve_id);
CREATE INDEX idx_prestation_tuteur   ON prestation(tuteur_id);
CREATE INDEX idx_seance_prestation   ON seance(prestation_id);
CREATE INDEX idx_seance_professeur   ON seance(professeur_id);
CREATE INDEX idx_seance_date         ON seance(date_heure_debut);
CREATE INDEX idx_paiement_prestation ON paiement(prestation_id);
CREATE INDEX idx_cours_matiere       ON cours(matiere_id);
CREATE INDEX idx_prof_mat_prof       ON professeur_matiere(professeur_id);

-- Données initiales (matières)
INSERT INTO matiere (nom, description) VALUES
  ('Mathématiques',    'Algèbre, géométrie, analyse'),
  ('Sciences Physiques','Physique et chimie'),
  ('Français',         'Grammaire, littérature, expression écrite'),
  ('SVT',              'Sciences de la vie et de la Terre');
