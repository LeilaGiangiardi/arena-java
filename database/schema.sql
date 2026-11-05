-- 1. Criação da tabela de Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    github VARCHAR(100),
    senha_hash VARCHAR(255) NOT NULL,
    xp INT DEFAULT 0,
    cargo VARCHAR(100) DEFAULT 'Derrubador de Servidor',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criação da tabela de Perguntas (O conteúdo do Quiz)
CREATE TABLE perguntas (
    id SERIAL PRIMARY KEY,
    enunciado TEXT NOT NULL,
    codigo_snippet TEXT,
    opcao_a VARCHAR(255) NOT NULL,
    opcao_b VARCHAR(255) NOT NULL,
    opcao_c VARCHAR(255) NOT NULL,
    opcao_d VARCHAR(255) NOT NULL,
    resposta_correta CHAR(1) CHECK (resposta_correta IN ('A', 'B', 'C', 'D')),
    feedback_erro TEXT NOT NULL,
    xp_recompensa INT DEFAULT 20
);

-- 3. Criação da tabela de Histórico de Respostas 
CREATE TABLE respostas_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pergunta_id INT NOT NULL REFERENCES perguntas(id) ON DELETE CASCADE,
    acertou BOOLEAN NOT NULL,
    respondido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, pergunta_id) 
);

-- 4. Inserindo uma pergunta de teste para o nosso front-end consumir depois
INSERT INTO perguntas (enunciado, codigo_snippet, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, feedback_erro) 
VALUES (
    'Qual será a saída no console ao executar o código abaixo?',
    'int[] numeros = {10, 20, 30, 40};\nSystem.out.println(numeros[1]);',
    '10', '20', '30', 'Erro de compilação',
    'B',
    'Você esqueceu que Arrays em Java começam no índice 0, e não no 1! Portanto, numeros[0] é 10 e numeros[1] é 20.'
);