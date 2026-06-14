-- =====================================================================
--  MTP PLATFORM — Esquema MySQL  (compatible con MySQL 8 / MariaDB 10.4+)
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(150)  NOT NULL,
    email           VARCHAR(190)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    role            ENUM('admin','usuario','verificador') NOT NULL DEFAULT 'usuario',
    entity_type     ENUM('empresa','profesional','organizacion','proyecto','inversor') NOT NULL DEFAULT 'empresa',
    company_name    VARCHAR(190)  NULL,
    document_id     VARCHAR(40)   NULL,
    sector          VARCHAR(100)  NULL,
    specialty       VARCHAR(100)  NULL,
    kyc_status      ENUM('pendiente','verificado','rechazado') NOT NULL DEFAULT 'pendiente',
    reputation      DECIMAL(6,2)  NOT NULL DEFAULT 50.00,
    membership      ENUM('basica','profesional','premium') NOT NULL DEFAULT 'basica',
    wallet_address  VARCHAR(50)   NULL,   -- billetera EVM (0x...) del usuario en ETTIOS
    status          ENUM('activo','suspendido') NOT NULL DEFAULT 'activo',
    -- Marco legal / consentimientos
    terms_accepted_at  DATETIME      NULL,
    terms_version      VARCHAR(20)   NULL,
    privacy_accepted_at DATETIME     NULL,
    kyc_consent        TINYINT(1)    NOT NULL DEFAULT 0,
    -- KYC / AML detail
    kyc_country        VARCHAR(80)   NULL,
    kyc_doc_type       VARCHAR(40)   NULL,   -- DNI, Pasaporte, CI, RUC, NIF, etc.
    kyc_doc_number     VARCHAR(60)   NULL,
    kyc_provider       VARCHAR(60)   NULL,   -- SumSub, Onfido, manual
    kyc_reference      VARCHAR(80)   NULL,   -- referencia del proveedor
    kyc_completed_at   DATETIME      NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documents (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED NOT NULL,
    title           VARCHAR(190)  NOT NULL,
    doc_type        ENUM('cte','ctpi','cen','ctk','contrato','balance','informe_tecnico','whitepaper','certificacion','juridico','financiero','antecedente','otro') NOT NULL DEFAULT 'otro',
    description     TEXT          NULL,
    file_path       VARCHAR(255)  NULL,
    file_hash       VARCHAR(80)   NULL,  -- SHA-256 del archivo (para metadatos NFT)
    ai_risk         ENUM('bajo','medio','alto') NULL,
    ai_summary      TEXT          NULL,
    status          ENUM('cargado','en_analisis_ia','asignado','en_validacion','validado','rechazado') NOT NULL DEFAULT 'cargado',
    assigned_to     INT UNSIGNED NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_documents_user (user_id),
    KEY idx_documents_assigned (assigned_to),
    KEY idx_documents_status (status),
    CONSTRAINT fk_documents_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_documents_verifier FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS validations (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    document_id     INT UNSIGNED NOT NULL,
    verifier_id     INT UNSIGNED NOT NULL,
    val_type        ENUM('tecnica','juridica','economica','estructural') NOT NULL DEFAULT 'estructural',
    result          ENUM('aprobado','observado','rechazado') NOT NULL,
    score_impact    DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    opinion         TEXT          NOT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_validations_doc (document_id),
    KEY idx_validations_verifier (verifier_id),
    CONSTRAINT fk_validations_doc      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_validations_verifier FOREIGN KEY (verifier_id) REFERENCES users(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scoring_history (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED NOT NULL,
    previous_score  DECIMAL(6,2)  NOT NULL,
    new_score       DECIMAL(6,2)  NOT NULL,
    delta           DECIMAL(6,2)  NOT NULL,
    reason          VARCHAR(255)  NOT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_scoring_user (user_id),
    CONSTRAINT fk_scoring_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_log (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED NULL,
    action          VARCHAR(120)  NOT NULL,
    entity          VARCHAR(60)   NULL,
    entity_id       INT UNSIGNED NULL,
    details         VARCHAR(500)  NULL,
    ip_address      VARCHAR(45)   NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_log_user (user_id),
    KEY idx_log_created (created_at),
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  CAPA 7 — NFTs en ETTIOS BLOCKCHAIN  (Chain ID 2237)
--  Registro de cada validación que se "mintea" como NFT con metadatos.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nfts (
    id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
    document_id        INT UNSIGNED NOT NULL,
    user_id            INT UNSIGNED NOT NULL,            -- propietario (=user_id del documento)
    contract_address   VARCHAR(50)   NOT NULL,
    chain_id           INT           NOT NULL DEFAULT 2237,
    token_id           VARCHAR(78)   NOT NULL,           -- uint256 puede tener hasta 78 dígitos
    tx_hash            VARCHAR(80)   NOT NULL,
    block_number       BIGINT UNSIGNED NULL,
    metadata_uri       TEXT          NOT NULL,
    metadata_json      JSON          NOT NULL,
    minted_by          INT UNSIGNED NULL,                -- admin/sistema que disparó el mint
    minted_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_token (contract_address, token_id),
    KEY idx_nft_doc (document_id),
    KEY idx_nft_user (user_id),
    CONSTRAINT fk_nft_doc  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_nft_user FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  Log de consentimientos legales (T&C, privacidad, KYC)
--  Cada aceptación queda registrada con IP, fecha y versión del texto.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_consents (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED NOT NULL,
    document_type   ENUM('terms','privacy','kyc','aml') NOT NULL,
    version         VARCHAR(20)  NOT NULL,
    ip_address      VARCHAR(45)  NULL,
    user_agent      VARCHAR(255) NULL,
    accepted_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_consent_user (user_id),
    CONSTRAINT fk_consent_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
