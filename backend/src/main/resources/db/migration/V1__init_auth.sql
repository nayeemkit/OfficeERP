CREATE TABLE users (
                       id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email           VARCHAR(255) NOT NULL UNIQUE,
                       password_hash   VARCHAR(255) NOT NULL,
                       first_name      VARCHAR(100) NOT NULL,
                       last_name       VARCHAR(100) NOT NULL,
                       role            VARCHAR(20)  NOT NULL DEFAULT 'EMPLOYEE',
                       is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
                       is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
                       created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
                       updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
                       created_by      UUID
);

CREATE TABLE refresh_tokens (
                                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                token           VARCHAR(512) NOT NULL UNIQUE,
                                expires_at      TIMESTAMP    NOT NULL,
                                revoked         BOOLEAN      NOT NULL DEFAULT FALSE,
                                created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
           'admin@erp.com',
           '$2a$12$LJ3m4ys3LkBNSafGwljjAOBEk4sP2o/WYK8GdhsWVJ5juyOCkFceG',
           'System',
           'Admin',
           'ADMIN'
       );