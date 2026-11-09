-- ==============================================================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS - ARENA JAVA
-- ==============================================================================

-- 1. Remoção das tabelas caso já existam
DROP TABLE IF EXISTS modulos_concluidos CASCADE;
DROP TABLE IF EXISTS respostas_usuarios CASCADE;
DROP TABLE IF EXISTS perguntas CASCADE;
DROP TABLE IF EXISTS modulos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 2. Tabela de Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    github VARCHAR(100),
    senha_hash VARCHAR(255) NOT NULL,
    xp INT DEFAULT 0,
    cargo VARCHAR(50) DEFAULT 'Derrubador de Servidor',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ofensiva INT DEFAULT 0,
    questoes_acertadas INT DEFAULT 0,
    total_questoes INT DEFAULT 50,
    dominio VARCHAR(50) DEFAULT 'Nenhum'
);

-- 3. Tabela de Módulos 
CREATE TABLE modulos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    xp_bonus_conclusao INT DEFAULT 50
);

-- 4. Tabela de Perguntas 
CREATE TABLE perguntas (
    id SERIAL PRIMARY KEY,
    modulo_id INT REFERENCES modulos(id) ON DELETE CASCADE,
    enunciado TEXT NOT NULL,
    codigo_snippet TEXT,
    opcao_a VARCHAR(255),
    opcao_b VARCHAR(255),
    opcao_c VARCHAR(255),
    opcao_d VARCHAR(255),
    resposta_correta CHAR(1),
    feedback_erro TEXT,
    xp_recompensa INT DEFAULT 10,
    nivel INT DEFAULT 1,
    tipo_pergunta INT DEFAULT 1, 
    validacao_regex VARCHAR(255),
    testes_unitarios_ocultos TEXT
);

-- 5. Tabela de Respostas 
CREATE TABLE respostas_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    pergunta_id INT REFERENCES perguntas(id) ON DELETE CASCADE,
    acertou BOOLEAN NOT NULL,
    respondido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Módulos Concluídos 
CREATE TABLE modulos_concluidos (
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    modulo_id INT REFERENCES modulos(id) ON DELETE CASCADE,
    concluido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, modulo_id)
);


