-- ==============================================================================
-- SCRIPT COMPLETO DE PRODUÇÃO (POSTGRESQL) - ARENA JAVA
-- Inclui: Tabelas + 10 Módulos + 100 Questões (c/ Chefões Regex)
-- ==============================================================================

-- 1. LIMPEZA E RECRIAÇÃO DAS TABELAS
DROP TABLE IF EXISTS modulos_concluidos CASCADE;
DROP TABLE IF EXISTS respostas_usuarios CASCADE;
DROP TABLE IF EXISTS perguntas CASCADE;
DROP TABLE IF EXISTS modulos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    github VARCHAR(100) DEFAULT '',
    senha_hash VARCHAR(255) NOT NULL,
    xp INT DEFAULT 0,
    cargo VARCHAR(50) DEFAULT 'Derrubador de Servidor',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ofensiva INT DEFAULT 0,
    ultima_atividade DATE,
    questoes_acertadas INT DEFAULT 0,
    total_questoes INT DEFAULT 100,
    dominio VARCHAR(50) DEFAULT 'Nenhum',
    avatar VARCHAR(255) DEFAULT 'seed=Nebula&baseColor=8e24aa&eyes=eva&mouth=grill01&Top=bulb01'
);

CREATE TABLE modulos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    xp_bonus_conclusao INT DEFAULT 50
);

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

CREATE TABLE respostas_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    pergunta_id INT REFERENCES perguntas(id) ON DELETE CASCADE,
    acertou BOOLEAN NOT NULL,
    respondido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, pergunta_id)
);

CREATE TABLE modulos_concluidos (
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    modulo_id INT REFERENCES modulos(id) ON DELETE CASCADE,
    concluido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, modulo_id)
);

-- ==============================================================================
-- 2. USUÁRIO ADMIN COM TODOS OS MÓDULOS LIBERADOS PARA TESTES
-- Login: admin@java.com | Senha: 123
-- ==============================================================================
INSERT INTO usuarios (nome, email, senha_hash, xp, cargo, ofensiva, avatar)
VALUES (
    'Admin Arena',
    'admin@java.com',
    '123',
    9999,
    'Compilador Humano',
    99,
    'seed=Vortex&baseColor=5e35b1&eyes=shade01&mouth=grill03&texture=camo01'
);

-- ==============================================================================
-- 3. INSERÇÃO DOS 10 MÓDULOS DA TRILHA DE APRENDIZAGEM
-- ==============================================================================
INSERT INTO modulos (nome, descricao, xp_bonus_conclusao) VALUES
('1. Fundamentos e Estrutura Sequencial', 'Domine algoritmos, o modelo híbrido da JVM, variáveis, tipos primitivos, casting, entrada com Scanner e funções Math.', 100),
('2. Estruturas Condicionais', 'Tome decisões inteligentes no código com operadores comparativos, lógicos (&&, ||, !), if-else, switch-case e ternário.', 150),
('3. Laços de Repetição e Debug', 'Automatize processos repetitivos com while, for, do-while, testes de mesa e depuração passo a passo com o Debugger.', 200),
('4. Tópicos Básicos, Strings e Funções', 'Manipule textos com métodos de String (split, substring, replace), operadores bitwise e modularização com funções.', 250),
('5. Introdução à POO e Membros Estáticos', 'Transicione para a Programação Orientada a Objetos: classes, atributos, métodos, instanciação na Heap e membros static.', 300),
('6. Construtores, Sobrecarga e Encapsulamento', 'Proteja o estado dos objetos com visibilidade private, getters, setters, palavra this, construtores e sobrecarga.', 350),
('7. Data-Hora, Enumerações e Composição', 'Trabalhe com a API moderna de tempo (LocalDate, LocalDateTime, Instant), tipos enumerados (enum) e composição de objetos.', 400),
('8. Herança e Polimorfismo', 'Reaproveite e especialize comportamentos com extends, super, upcasting, downcasting, @Override, classes e métodos abstratos.', 450),
('9. Tratamento de Exceções', 'Construa sistemas resilientes tratando falhas com blocos try-catch-finally, pilha de chamadas (Stack Trace) e exceções customizadas.', 500),
('10. Arquivos e Interfaces', 'Domine leitura e escrita de arquivos com File, BufferedReader, try-with-resources e desacoplamento avançado com Interfaces.', 600);

-- ==============================================================================
-- 4. INSERÇÃO DAS 100 QUESTÕES (10 POR MÓDULO)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- MÓDULO 1: Fundamentos e Estrutura Sequencial (Questões 1 a 10)
-- ------------------------------------------------------------------------------
INSERT INTO perguntas (modulo_id, enunciado, codigo_snippet, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, feedback_erro, xp_recompensa, nivel, tipo_pergunta, validacao_regex) VALUES
(1, 'Na computação, o que exatamente é um algoritmo?', NULL,
 'Uma peça de hardware instalada na placa-mãe.',
 'Um software exclusivo de compilação de código.',
 'Uma sequência finita e lógica de instruções para resolver um problema.',
 'Um sistema operacional genérico de código aberto.',
 'C', 'Um algoritmo é uma sequência finita de passos lógicos para resolver um problema, aplicável tanto na programação quanto em tarefas do cotidiano.', 10, 1, 1, NULL),

(1, 'O Java utiliza um modelo de execução de abordagem híbrida. O que isso significa?', NULL,
 'Ele converte o código-fonte diretamente para HTML.',
 'O código-fonte é pré-compilado para Bytecode e depois executado pela Máquina Virtual (JVM).',
 'Ele interpreta o código linha por linha direto no hardware sem compilação prévia.',
 'Ele não usa compilador, apenas um editor de texto simples.',
 'B', 'Na transição da década de 1990 (4ª Geração de Pressman), o Java nasceu para resolver o desafio dos sistemas em rede e interfaces gráficas multiplataforma ("Write Once, Run Anywhere"): o compilador gera o Bytecode (.class) e a JVM o executa em qualquer sistema operacional.', 15, 1, 1, NULL),

(1, 'Qual das seguintes declarações de variáveis segue a boa prática do padrão camelCase e é permitida em Java?', NULL,
 'int salario do funcionario;',
 'int 5minutos;',
 'int salario-do-funcionario;',
 'int salarioDoFuncionario;',
 'D', 'Nomes de variáveis não podem conter espaços, hifens ou começar com dígitos. Para variáveis e métodos em Java, utiliza-se o padrão camelCase.', 10, 1, 1, NULL),

(1, 'Qual dos tipos primitivos abaixo é utilizado para armazenar números de ponto flutuante (decimais) de dupla precisão (64 bits) em Java?', NULL,
 'int', 'boolean', 'double', 'char',
 'C', 'O tipo double armazena números decimais de 64 bits. O tipo int armazena inteiros, boolean armazena true/false e char armazena um único caractere Unicode.', 10, 1, 1, NULL),

(1, 'Qual será o valor armazenado na variável resultado após executar a operação de resto da divisão?', 'int resultado = 14 % 3;',
 '4', '2', '4.66', '1',
 'B', 'O operador % (módulo) retorna o resto da divisão inteira: 14 dividido por 3 dá quociente 4 e resto 2.', 15, 2, 1, NULL),

(1, 'Ao dividir dois números inteiros em Java, o resultado padrão é truncado como inteiro. Como obtemos o valor decimal exato usando Casting?', 'int a = 5;\nint b = 2;\ndouble resultado = a / b; // resulta em 2.0',
 'Alterando as variáveis a e b para String.',
 'Colocando (double) antes da operação: (double) a / b;',
 'Usando o método Math.decimal(a, b);',
 'Trocando o operador / por %.',
 'B', 'O casting (double) converte explicitamente o operando para ponto flutuante antes da divisão, resultando em 2.5.', 20, 2, 1, NULL),

(1, 'Ao utilizar a classe Scanner ou System.out.printf, qual é a finalidade do comando Locale.setDefault(Locale.US)?', NULL,
 'Traduzir as mensagens de erro do compilador para inglês.',
 'Padronizar o ponto (.) como separador de casas decimais em vez da vírgula.',
 'Alterar o fuso horário do sistema operacional.',
 'Limpar o buffer do teclado após ler um número.',
 'B', 'Locale.setDefault(Locale.US) garante que a entrada e a saída de números reais utilizem o ponto (.) como separador decimal.', 15, 2, 1, NULL),

(1, 'Qual marcador de formatação usamos no método System.out.printf para imprimir um número de ponto flutuante com exatamente 2 casas decimais e quebra de linha?', NULL,
 '%s%n', '%d%n', '%.2f%n', '%2c%n',
 'C', 'A máscara %.2f formata valores de ponto flutuante com duas casas decimais, e %n insere a quebra de linha independente de plataforma.', 15, 3, 1, NULL),

(1, 'Na biblioteca matemática padrão do Java, o que retorna a chamada Math.pow(x, y)?', NULL,
 'A raiz quadrada de x.',
 'O valor absoluto de x.',
 'O valor de x elevado à potência y.',
 'O maior valor entre x e y.',
 'C', 'Math.pow(x, y) calcula a potenciação (x elevado a y), enquanto Math.sqrt(x) calcula a raiz quadrada e Math.abs(x) o valor absoluto.', 15, 3, 1, NULL),

(1, 'Chegou o Chefão! Você precisa ler um número inteiro do teclado usando o objeto Scanner (já instanciado como "sc"). Digite a instrução que deve ser atribuída à variável "x":', 'int x;\nx = _______________',
 NULL, NULL, NULL, NULL, NULL,
 'Utilize o método nextInt() do objeto Scanner: sc.nextInt();', 50, 4, 2, '^sc\.nextInt\(\s*\);?$'),

-- ------------------------------------------------------------------------------
-- MÓDULO 2: Estruturas Condicionais (Questões 11 a 20)
-- ------------------------------------------------------------------------------
(2, 'Qual é o símbolo do operador lógico "OU" (disjunção) em Java, que retorna verdadeiro se pelo menos uma das condições for verdadeira?', NULL,
 '&&', '||', '!', '==',
 'B', 'Em Java, o operador lógico OU é representado por ||, o operador E por && e a negação lógica por !.', 10, 1, 1, NULL),

(2, 'Supondo que a variável X valha 5, qual será o resultado da expressão lógica: (X <= 20 && X == 10 && X != 3)?', NULL,
 'true (Verdadeiro)',
 'false (Falso)',
 'Erro de compilação',
 '5',
 'B', 'No operador && (E), todas as proposições precisam ser verdadeiras. Como X == 10 é falso (5 != 10), toda a expressão resulta em false.', 15, 1, 1, NULL),

(2, 'Qual é o papel fundamental da estrutura condicional if-else em um programa Java?', NULL,
 'Declarar variáveis globais na memória.',
 'Controlar o desvio de fluxo, executando um bloco de código apenas se uma condição lógica for atendida.',
 'Repetir um conjunto de instruções até que o usuário encerre o programa.',
 'Converter tipos primitivos em objetos.',
 'B', 'O if-else avalia uma condição booleana para decidir qual caminho de execução o programa deve seguir.', 10, 1, 1, NULL),

(2, 'Analise o operador de atribuição cumulativa: se inicialmente "int conta = 50;", qual será o valor de "conta" após executar "conta += 15;"?', 'int conta = 50;\nconta += 15;',
 '15', '35', '65', '750',
 'C', 'O operador += soma o valor da direita ao valor atual da variável (conta = conta + 15), resultando em 65.', 15, 2, 1, NULL),

(2, 'Quando a expressão condicional ternária (condicao ? valorSeVerdadeiro : valorSeFalso) é mais indicada?', NULL,
 'Para substituir qualquer laço de repetição while.',
 'Para decidir e atribuir um valor a uma variável em uma única linha com base em uma condição simples.',
 'Para capturar exceções de banco de dados.',
 'Para criar classes abstratas.',
 'B', 'O operador ternário enxuga estruturas if-else simples cujo único objetivo é retornar um entre dois valores.', 20, 2, 1, NULL),

(2, 'Quando precisamos avaliar o valor exato de uma única variável inteira ou String contra diversas opções fixas (como os dias da semana de 1 a 7), qual estrutura é mais limpa que vários if-else encadeados?', NULL,
 'do-while', 'switch-case', 'try-catch', 'Math.sqrt',
 'B', 'A estrutura switch-case avalia o valor da expressão e salta diretamente para o case correspondente.', 15, 2, 1, NULL),

(2, 'O que acontece se esquecermos de colocar o comando "break;" ao final de um bloco "case" dentro de um switch tradicional?', NULL,
 'O código não compila.',
 'Ocorre o efeito fall-through: o Java executa os comandos dos cases seguintes até encontrar um break ou o fim do switch.',
 'O programa reinicia o switch voltando para o primeiro case.',
 'A variável avaliada tem seu valor zerado.',
 'B', 'Sem o comando break, a execução "cai" para os próximos cases sequencialmente (fall-through).', 15, 3, 1, NULL),

(2, 'Sobre escopo e inicialização de variáveis em Java, o que ocorre ao tentar imprimir uma variável que foi declarada apenas dentro das chaves de um bloco if?', 'if (preco > 100.0) {\n    double imposto = preco * 0.1;\n}\nSystem.out.println(imposto);',
 'Imprime 0.0 por padrão.',
 'Gera erro de compilação, pois a variável "imposto" só existe dentro do escopo do bloco if onde foi declarada.',
 'Imprime null.',
 'Funciona normalmente se o preço for maior que 100.',
 'B', 'Uma variável local só é visível dentro do bloco { } onde foi declarada.', 20, 3, 1, NULL),

(2, 'Qual será o resultado booleano da expressão com operador de negação lógica: !(5 > 10)?', NULL,
 'true', 'false', 'null', 'Erro de sintaxe',
 'A', 'A comparação (5 > 10) é false. O operador ! inverte o valor booleano para true.', 15, 3, 1, NULL),

(2, 'Chefão! Reescreva a regra de desconto utilizando a expressão condicional ternária equivalente:', 'double preco = 34.5;\n// Se preco < 20.0, desconto é preco * 0.1; senão é preco * 0.05\ndouble desconto = _________________________________________;',
 NULL, NULL, NULL, NULL, NULL,
 'Use a sintaxe (condicao) ? valorVerdadeiro : valorFalso -> (preco < 20.0) ? preco * 0.1 : preco * 0.05;', 50, 4, 2, '(?i)^\(?preco\s*<\s*20(\.0)?\)?\s*\?\s*preco\s*\*\s*0\.1\s*:\s*preco\s*\*\s*0\.05;?$'),

-- ------------------------------------------------------------------------------
-- MÓDULO 3: Laços de Repetição e Debug (Questões 21 a 30)
-- ------------------------------------------------------------------------------
(3, 'Qual estrutura de repetição é a mais indicada quando NÃO sabemos previamente quantas vezes o bloco precisará ser repetido?', NULL,
 'for', 'switch-case', 'while', 'if-else',
 'C', 'O laço while é ideal quando a parada depende de uma condição dinâmica (como ler dados até que o usuário digite zero).', 10, 1, 1, NULL),

(3, 'Na assinatura do laço "for (A; B; C)", qual é a ordem correta dos três elementos separados por ponto e vírgula?', NULL,
 'condição ; incremento ; inicialização',
 'inicialização ; condição ; incremento',
 'incremento ; condição ; inicialização',
 'condição ; inicialização ; incremento',
 'B', 'No laço for (inicialização; condição; incremento), a inicialização executa uma única vez no início, a condição é testada antes de cada ciclo e o incremento ocorre ao final de cada repetição.', 15, 1, 1, NULL),

(3, 'Realize o teste de mesa no laço while abaixo. O que será impresso no console?', 'int x = 5;\nwhile (x > 2) {\n    System.out.print(x);\n    x = x - 1;\n}',
 '543', '5432', '5', '432',
 'A', 'O laço imprime 5, decrementa para 4 (imprime 4), decrementa para 3 (imprime 3) e decrementa para 2. Como 2 > 2 é falso, o laço termina.', 20, 2, 1, NULL),

(3, 'O operador unário de pós-incremento "i++" utilizado em laços de repetição equivale a qual instrução?', NULL,
 'i = i * 2;',
 'i = i + 1;',
 'i = i - 1;',
 'i == i + 1;',
 'B', 'O comando i++ incrementa o valor atual da variável inteira i em exatamente 1 unidade (i = i + 1).', 10, 1, 1, NULL),

(3, 'Qual é a diferença fundamental entre o laço "do-while" e o laço "while" tradicional?', NULL,
 'O do-while não precisa de condição booleana.',
 'O do-while testa a condição apenas no final, garantindo que o bloco seja executado pelo menos uma vez.',
 'O do-while só funciona com variáveis do tipo char.',
 'O do-while executa sempre em contagem regressiva.',
 'B', 'Como o teste "while (condicao);" fica no rodapé do bloco do { ... }, suas instruções rodam ao menos uma vez antes da primeira verificação.', 15, 2, 1, NULL),

(3, 'Qual cabeçalho de laço "for" realiza corretamente uma contagem regressiva começando em 10 e indo até 0 (inclusive)?', NULL,
 'for (int i = 10; i >= 0; i--)',
 'for (int i = 0; i <= 10; i++)',
 'for (int i = 10; i < 0; i--)',
 'for (int i = 10; i == 0; i++)',
 'A', 'Começamos em 10 (int i = 10), mantemos o laço ativo enquanto i for maior ou igual a zero (i >= 0) e subtraímos 1 a cada passo (i--).', 20, 2, 1, NULL),

(3, 'Qual é a principal utilidade do recurso de Debug (Depuração) com Breakpoints em uma IDE Java?', NULL,
 'Aumentar a velocidade de processamento da JVM.',
 'Pausar a execução em uma linha específica e inspecionar passo a passo o valor das variáveis na memória.',
 'Corrigir erros de ortografia nos comentários do código.',
 'Gerar automaticamente o banco de dados PostgreSQL.',
 'B', 'O Debugger permite executar o código linha por linha (Step Over) e acompanhar a evolução de cada variável em tempo real.', 15, 2, 1, NULL),

(3, 'Analise o acumulador "y" no laço for abaixo. Qual valor será impresso ao final?', 'int y = 0;\nfor (int i = 1; i <= 4; i++) {\n    y += i;\n}\nSystem.out.println(y);',
 '4', '6', '10', '12',
 'C', 'A variável y acumula a soma de 1 + 2 + 3 + 4, resultando em 10.', 20, 3, 1, NULL),

(3, 'O que acontece em tempo de execução se a condição de um laço "while" nunca se tornar falsa (por exemplo, esquecer de incrementar a variável de controle)?', NULL,
 'O compilador corrige adicionando um break invisível.',
 'O programa entra em Loop Infinito, executando o bloco ininterruptamente.',
 'A JVM encerra o programa após 3 repetições.',
 'O código não compila.',
 'B', 'Sem atualizar a variável que controla a condição de parada, a expressão permanece true para sempre, causando um loop infinito.', 15, 3, 1, NULL),

(3, 'Chefão dos Loops! Escreva o cabeçalho do "for" para que a variável inteira "j" comece em 1, repita enquanto "j <= 5" e incremente de 1 em 1 (j++):', '_____________________________ {\n    System.out.println(j);\n}',
 NULL, NULL, NULL, NULL, NULL,
 'A sintaxe esperada é: for (int j = 1; j <= 5; j++)', 50, 4, 2, '(?i)^for\s*\(\s*int\s+j\s*=\s*1\s*;\s*j\s*<=\s*5\s*;\s*j\+\+\s*\)\s*\{?;?$'),

-- ------------------------------------------------------------------------------
-- MÓDULO 4: Tópicos Básicos, Strings e Funções (Questões 31 a 40)
-- ------------------------------------------------------------------------------
(4, 'Em Java, qual método da classe String retorna uma nova String com todas as letras convertidas para minúsculas?', NULL,
 'toLower()', 'toLowerCase()', 'lowerCase()', 'smallLetters()',
 'B', 'O método toLowerCase() converte todos os caracteres da String para minúsculas, enquanto toUpperCase() converte para maiúsculas.', 10, 1, 1, NULL),

(4, 'Para remover espaços em branco desnecessários apenas das extremidades (início e fim) de uma String, qual método utilizamos?', NULL,
 'trim()', 'split()', 'cut()', 'clean()',
 'A', 'O método trim() gera uma nova String removendo espaços em branco no início e no fim do texto.', 10, 1, 1, NULL),

(4, 'O que retorna a execução de s.substring(2, 5) sobre a String s = "Programar"?', 'String s = "Programar";\nString sub = s.substring(2, 5);',
 '"Pro"', '"ogr"', '"ogra"', '"gram"',
 'B', 'Em substring(inicio, fim), o índice inicial (2 -> letra o) é incluído e o índice final (5 -> letra a) é exclusivo, pegando os índices 2, 3 e 4 ("ogr").', 20, 2, 1, NULL),

(4, 'Qual é a função do método s.split(" ") quando aplicado a uma frase como "Java POO Arena"?', 'String frase = "Java POO Arena";\nString[] vetor = frase.split(" ");',
 'Juntar todas as palavras sem espaço.',
 'Recortar a String com base no separador espaço e devolver um vetor (array) com as partes: ["Java", "POO", "Arena"].',
 'Contar quantos espaços existem na frase.',
 'Apagar a primeira palavra da String.',
 'B', 'O método split recebe um delimitador e divide a String em um vetor de Strings (String[]).', 15, 2, 1, NULL),

(4, 'Os operadores bitwise (&, |, ^) operam bit a bit. Em qual situação prática de baixo nível o operador "&" (E bit a bit) é muito utilizado?', NULL,
 'Para concatenar textos longos.',
 'Para testar se um determinado bit de uma máscara de rede ou permissão vale 1 ou 0.',
 'Para arredondar números double.',
 'Para criar laços de repetição.',
 'B', 'Operadores bitwise permitem aplicar máscaras binárias para verificar estados de bits individuais em flags e endereços de rede.', 20, 3, 1, NULL),

(4, 'Qual é a diferença entre usar "//" e "/* ... */" no código-fonte Java?', NULL,
 '// cria variáveis e /* ... */ cria funções.',
 '// comenta uma única linha e /* ... */ comenta um bloco de múltiplas linhas.',
 '// é executado pela JVM e /* ... */ é ignorado.',
 'Não existe o comentário /* ... */ em Java.',
 'B', 'Comentários de linha única começam com // e comentários de bloco são delimitados por /* e */.', 10, 1, 1, NULL),

(4, 'Quais são as duas principais vantagens de dividir um programa grande em pequenas funções (métodos)?', NULL,
 'Gastar mais memória RAM e dificultar a leitura.',
 'Modularização (delegação de responsabilidades) e reaproveitamento de código.',
 'Impedir o uso de variáveis inteiras.',
 'Dispensar o uso da JVM.',
 'B', 'Funções permitem organizar o código em blocos coesos e reutilizáveis, facilitando a manutenção.', 15, 2, 1, NULL),

(4, 'Quando um método em Java executa uma ação (como imprimir um relatório na tela), mas NÃO retorna nenhum valor para quem o chamou, qual palavra-chave define seu tipo de retorno?', NULL,
 'null', 'int', 'void', 'empty',
 'C', 'A palavra reservada void indica que o método não possui valor de retorno.', 15, 2, 1, NULL),

(4, 'Em uma função declarada como "public static int max(int x, int y)", qual palavra reservada envia o resultado calculado de volta para o método chamador?', NULL,
 'send', 'break', 'return', 'output',
 'C', 'A instrução return encerra a execução do método e devolve o valor especificado ao chamador.', 15, 2, 1, NULL),

(4, 'Chefão das Strings! Você possui a variável "texto" e precisa converter todas as suas letras para MAIÚSCULAS. Digite a chamada correta a partir de "texto":', 'String texto = "arena java";\nString grito = ________________________;',
 NULL, NULL, NULL, NULL, NULL,
 'Invoque o método toUpperCase() na variável texto: texto.toUpperCase();', 50, 4, 2, '^texto\.toUpperCase\(\s*\);?$'),

-- ------------------------------------------------------------------------------
-- MÓDULO 5: Introdução à POO e Membros Estáticos (Questões 41 a 50)
-- ------------------------------------------------------------------------------
(5, 'Qual é a distinção fundamental entre Classe e Objeto na Programação Orientada a Objetos?', NULL,
 'Classe é uma variável primitiva e Objeto é um laço de repetição.',
 'Classe é a definição do tipo (o molde/planta com atributos e métodos) e Objeto é uma instância concreta criada em memória a partir dessa classe.',
 'Objeto é o arquivo .java e Classe é o banco de dados.',
 'Não há diferença: ambos são sinônimos exatos.',
 'B', 'A Programação Orientada a Objetos consolidou-se nos anos 90 junto às interfaces gráficas (GUIs): a Classe define o molde estruturado (atributos e métodos) e os Objetos são as instâncias independentes criadas em memória.', 15, 1, 1, NULL),

(5, 'Por que criar uma classe "Triangulo" com os atributos (a, b, c) e o método "area()" é melhor do que declarar 6 variáveis soltas no programa principal?', NULL,
 'Porque o Java proíbe mais de 3 variáveis no método main.',
 'Porque garante coesão, reaproveitamento e delegação: cada objeto Triangulo guarda seus próprios lados e sabe calcular sua própria área.',
 'Porque classes não consomem memória RAM.',
 'Apenas por exigência estética da IDE.',
 'B', 'Agrupar dados e comportamentos correlatos em uma classe respeita a delegação de responsabilidades e evita código duplicado.', 15, 2, 1, NULL),

(5, 'Qual operador da linguagem Java é indispensável para instanciar um novo objeto e alocar seu espaço dinamicamente na memória Heap?', NULL,
 'class', 'create', 'new', 'instance',
 'C', 'O operador new aloca memória na área dinâmica (Heap) e invoca o construtor da classe para inicializar o objeto.', 10, 1, 1, NULL),

(5, 'Quando executamos "Product p = new Product();", o que fica armazenado na área de memória Stack e o que fica na memória Heap?', NULL,
 'Tudo fica na Stack.',
 'A variável "p" na Stack guarda o endereço de referência (ponteiro) que aponta para os dados reais do objeto alocados na Heap.',
 'O objeto fica no HD e a referência na placa de vídeo.',
 'Tipos primitivos ficam na Heap e objetos na Stack.',
 'B', 'Variáveis de referência locais ficam na Stack armazenando o endereço de memória onde o objeto foi instanciado na Heap.', 25, 3, 1, NULL),

(5, 'Toda classe em Java (mesmo sem usar extends explicitamente) herda implicitamente métodos padrões de qual superclasse universal?', NULL,
 'System', 'Main', 'Object', 'Scanner',
 'C', 'Em Java, toda classe é subclasse direta ou indireta de java.lang.Object, herdando métodos como toString(), equals() e hashCode().', 15, 2, 1, NULL),

(5, 'Para que serve sobrescrever o método "public String toString()" dentro de uma classe como Product?', NULL,
 'Para converter o preço do produto em dólar.',
 'Para definir uma representação textual legível do objeto quando ele for impresso no System.out.println.',
 'Para apagar o objeto da memória.',
 'Para ler dados do teclado.',
 'B', 'Sobrescrever toString() permite formatar como o objeto será exibido em texto, em vez de imprimir apenas o nome da classe e o endereço hexadecimal.', 20, 2, 1, NULL),

(5, 'O que caracteriza um membro estático (declarado com a palavra reservada "static") em uma classe Java?', NULL,
 'Ele pertence à Classe em si (compartilhado), podendo ser chamado diretamente pelo nome da classe sem precisar instanciar um objeto.',
 'Ele só pode ser usado uma única vez durante o programa.',
 'Ele impede que a classe tenha métodos.',
 'Ele torna todas as variáveis privadas.',
 'A', 'Membros estáticos (de classe) independem de instância: são acessados diretamente como Classe.metodo(), a exemplo de Math.sqrt().', 20, 3, 1, NULL),

(5, 'Como declaramos corretamente uma constante estática em Java (como o valor de PI) seguindo também a convenção de nomenclatura para constantes?', NULL,
 'static double pi = 3.14;',
 'public static final double PI = 3.14159;',
 'const double PI = 3.14159;',
 'final int pi_valor = 3.14;',
 'B', 'Em Java, constantes utilizam a palavra reservada final (combinada com static para pertencer à classe) e nomes em LETRAS_MAIUSCULAS.', 15, 2, 1, NULL),

(5, 'Por que o método "public static void main" não consegue chamar diretamente um método NÃO estático da mesma classe sem antes dar um "new"?', NULL,
 'Porque o Java não permite mais de um método na classe principal.',
 'Porque um método estático não está vinculado a nenhum objeto específico (this), logo não pode acessar membros de instância diretamente.',
 'Porque o método main é privado.',
 'Porque métodos não estáticos só funcionam em banco de dados.',
 'B', 'Um contexto estático (static) existe mesmo sem objetos instanciados; portanto, não pode chamar membros de instância sem uma referência de objeto.', 25, 3, 1, NULL),

(5, 'Chefão da POO! Instancie um novo objeto da classe "Produto" (usando o construtor padrão sem parâmetros) e atribua à variável "p":', 'Produto p;\np = ________________________;',
 NULL, NULL, NULL, NULL, NULL,
 'Use o operador new seguido do construtor da classe: new Produto();', 50, 4, 2, '^new\s+Produto\(\s*\);?$'),

-- ------------------------------------------------------------------------------
-- MÓDULO 6: Construtores, Sobrecarga e Encapsulamento (Questões 51 a 60)
-- ------------------------------------------------------------------------------
(6, 'Qual é o objetivo principal de um Construtor em uma classe Java?', NULL,
 'Destruir objetos antigos da memória.',
 'Executar no momento da instanciação (new) para iniciar os atributos ou exigir valores obrigatórios na criação do objeto.',
 'Substituir o método main.',
 'Conectar o Java à internet.',
 'B', 'O construtor tem o mesmo nome da classe, não possui tipo de retorno e garante que o objeto já nasça em um estado consistente.', 15, 1, 1, NULL),

(6, 'Para que serve a referência "this" dentro de um construtor ou método como "this.nome = nome;"?', NULL,
 'Para criar uma nova classe.',
 'Para diferenciar o atributo do próprio objeto (this.nome) do parâmetro local que recebeu o mesmo nome (nome).',
 'Para transformar a variável em estática.',
 'Para encerrar o programa.',
 'B', 'A palavra reservada this referencia o próprio objeto atual, resolvendo a ambiguidade entre atributos da classe e parâmetros locais.', 15, 2, 1, NULL),

(6, 'Em que consiste o recurso de Sobrecarga (Overloading) em uma classe Java?', NULL,
 'Quando o servidor trava por excesso de usuários.',
 'Disponibilizar mais de uma versão de construtor ou método com o mesmo nome na mesma classe, diferenciando-os pela lista de parâmetros.',
 'Herdar métodos de dez classes diferentes ao mesmo tempo.',
 'Escrever um laço for dentro de outro laço for.',
 'B', 'A sobrecarga permite oferecer múltiplos construtores ou métodos de mesmo nome, desde que tenham quantidades ou tipos de parâmetros distintos.', 20, 2, 1, NULL),

(6, 'Segundo o princípio do Encapsulamento, qual é a boa prática para proteger os atributos de uma classe contra modificações diretas inválidas?', NULL,
 'Declarar todos os atributos como public.',
 'Esconder os atributos com o modificador private e controlar o acesso através de métodos públicos (getters e setters).',
 'Não declarar atributos na classe.',
 'Colocar todos os atributos dentro do método main.',
 'B', 'O encapsulamento oculta os detalhes internos do estado do objeto (private) e expõe apenas operações seguras e validadas.', 15, 1, 1, NULL),

(6, 'Em uma classe "ContaBancaria", o saldo só pode ser alterado por meio dos métodos depositar() e sacar(). O que devemos fazer com os métodos getSaldo() e setSaldo()?', NULL,
 'Criar tanto getSaldo() quanto setSaldo(double saldo) públicos.',
 'Criar apenas o método getSaldo() para consulta e NÃO criar um setSaldo() público, protegendo a regra de negócio da conta.',
 'Deixar o atributo saldo como public.',
 'Apagar o atributo saldo.',
 'B', 'Se o saldo só pode mudar via depósito ou saque, jamais devemos expor um setSaldo() livre que permitiria alterar o saldo arbitrariamente.', 20, 3, 1, NULL),

(6, 'Se um atributo ou método de uma classe for declarado sem nenhum modificador de acesso explícito (nem public, nem private, nem protected), qual será sua visibilidade?', NULL,
 'Visível apenas dentro da própria classe.',
 'Package-private (visível apenas para classes que estão dentro do mesmo pacote).',
 'Visível para qualquer classe da internet.',
 'O código não compila.',
 'B', 'A ausência de modificador aplica a visibilidade padrão de pacote (package-private).', 20, 3, 1, NULL),

(6, 'Qual é a diferença entre tipos Valor (primitivos como double, int) e tipos Referência (Classes) quando atribuímos "b = a"?', NULL,
 'Não há diferença.',
 'Em tipos primitivos copia-se o valor independente; em tipos referência copia-se o endereço de memória (ambas as variáveis apontam para o mesmo objeto na Heap).',
 'Tipos primitivos aceitam o valor null.',
 'Tipos referência são armazenados apenas no processador.',
 'B', 'Quando fazemos p2 = p1 com objetos, ambas as variáveis passam a apontar para a mesma instância na Heap.', 25, 3, 1, NULL),

(6, 'Como funciona o desalocamento automático de memória de objetos que perderam todas as suas referências na Heap do Java?', NULL,
 'O programador precisa chamar delete(objeto) manualmente.',
 'O Garbage Collector (Coletor de Lixo) da JVM monitora e libera automaticamente os objetos órfãos da memória Heap.',
 'A memória só é liberada quando o computador é reiniciado.',
 'O objeto vai para a memória Stack.',
 'B', 'O Garbage Collector identifica objetos sem referências ativas e libera sua memória automaticamente na Heap.', 15, 2, 1, NULL),

(6, 'Em um vetor de inteiros "int[] vect = new int[10];", qual propriedade retorna a quantidade total de elementos do vetor?', NULL,
 'vect.size()', 'vect.length', 'vect.count()', 'vect.total',
 'B', 'Em arrays nativos do Java, o tamanho é acessado pelo atributo length (sem parênteses): vect.length.', 15, 2, 1, NULL),

(6, 'Chefão do Encapsulamento! Declare o atributo "saldo" do tipo "double" com visibilidade privada dentro da classe Conta:', 'public class Conta {\n    __________________________\n}',
 NULL, NULL, NULL, NULL, NULL,
 'Use o modificador private seguido do tipo e do nome do atributo: private double saldo;', 50, 4, 2, '^private\s+double\s+saldo\s*;?$'),

-- ------------------------------------------------------------------------------
-- MÓDULO 7: Data-Hora, Enumerações e Composição (Questões 61 a 70)
-- ------------------------------------------------------------------------------
(7, 'Na API moderna de Data-Hora do Java (java.time), qual é a diferença entre LocalDateTime e Instant?', NULL,
 'LocalDateTime guarda apenas o ano e Instant guarda apenas os segundos.',
 'LocalDateTime representa data e hora locais (sem fuso horário), enquanto Instant representa um ponto exato na linha do tempo global em UTC (GMT / letra Z).',
 'Instant só funciona para datas anteriores ao ano 2000.',
 'LocalDateTime já vem com fuso horário de Brasília embutido.',
 'B', 'LocalDate e LocalDateTime representam datas/horas locais, enquanto Instant armazena um marco temporal global no fuso UTC (sufixo Z).', 20, 2, 1, NULL),

(7, 'O que significa o sufixo "Z" ao final de um texto de data-hora no padrão ISO 8601, como "2026-11-15T18:30:00Z"?', NULL,
 'Horário de Brasília.',
 'Zulu Time (horário global de referência em UTC / Londres, sem deslocamento de fuso).',
 'Zona de erro de compilação.',
 'Zero milissegundos.',
 'B', 'No padrão ISO 8601, a letra Z indica Zulu Time (UTC+0 / horário de Londres).', 15, 1, 1, NULL),

(7, 'Os objetos de data-hora como LocalDate e Instant em Java são imutáveis. O que isso significa ao somar 7 dias a uma data com "d01.plusDays(7)"?', NULL,
 'O objeto d01 original é modificado diretamente.',
 'O objeto d01 original permanece intacto; o método retorna um NOVO objeto LocalDate com os 7 dias somados, que deve ser atribuído a uma variável.',
 'O Java lança uma exceção se tentarmos somar dias.',
 'Só é possível somar anos, nunca dias.',
 'B', 'Por serem imutáveis, métodos como plusDays() e minusHours() sempre devolvem uma nova instância com o valor alterado.', 20, 2, 1, NULL),

(7, 'Qual classe do pacote java.time é utilizada para calcular o intervalo de tempo (duração) decorrido entre dois objetos data-hora?', NULL,
 'TimeSpan', 'Duration', 'Calendar', 'Timer',
 'B', 'A classe Duration (ex: Duration.between(t1, t2)) calcula o tempo decorrido entre dois instantes ou datas-horas.', 15, 2, 1, NULL),

(7, 'Para que servem as Enumerações (declaradas com a palavra-chave "enum") em Java, como "OrderStatus { PENDING_PAYMENT, PROCESSING, DELIVERED }"?', NULL,
 'Para substituir laços de repetição for.',
 'Para especificar de forma segura e semântica um conjunto fixo de constantes relacionadas (como os estados do ciclo de vida de um pedido).',
 'Para conectar o sistema a arquivos TXT.',
 'Para somar valores decimais.',
 'B', 'Enums garantem segurança de tipos (type safety) e legibilidade ao representar conjuntos fechados de estados ou categorias.', 15, 1, 1, NULL),

(7, 'Como convertemos uma String lida do usuário (ex: "DELIVERED") para a constante correspondente do tipo enumerado OrderStatus?', NULL,
 'new OrderStatus("DELIVERED");',
 'OrderStatus.valueOf("DELIVERED");',
 '(OrderStatus) "DELIVERED";',
 'OrderStatus.parse("DELIVERED");',
 'B', 'O método estático valueOf("NOME") converte a String exata na constante correspondente do enum.', 20, 2, 1, NULL),

(7, 'Na Orientação a Objetos, o que caracteriza uma relação de Composição ("tem-um" ou "tem-vários") entre classes?', NULL,
 'Quando uma classe copia o código de outra usando Ctrl+C e Ctrl+V.',
 'Quando um objeto contém referências para outro(s) objeto(s) como parte de seus atributos (ex: um Pedido que possui um Cliente e uma lista de Itens).',
 'Quando todas as classes do projeto ficam em um único arquivo.',
 'Quando não usamos métodos nas classes.',
 'B', 'A composição modela relacionamentos do tipo "tem-um" / "tem-muitos", organizando sistemas complexos em objetos menores que colaboram entre si.', 15, 2, 1, NULL),

(7, 'Quando uma classe "Trabalhador" possui uma lista de contratos ("List<Contrato> contratos = new ArrayList<>();"), por que NÃO devemos criar um método "setContratos(List<Contrato> list)" livre?', NULL,
 'Porque listas não funcionam em Java.',
 'Para proteger o encapsulamento da lista: ela já nasce instanciada e só deve ser manipulada pelos métodos adicionarContrato() e removerContrato().',
 'Porque o ArrayList é estático.',
 'Porque listas só aceitam números inteiros.',
 'B', 'Um setter de lista permitiria trocar a lista inteira por outra (ou por null), quebrando a integridade da associação.', 25, 3, 1, NULL),

(7, 'Para montar uma String grande concatenando dezenas de linhas em um laço (como no toString de um Post com vários Comentários), qual classe é muito mais performática em memória que concatenar com "+"?', NULL,
 'StringScanner', 'StringBuilder', 'StringSplitter', 'CharArray',
 'B', 'O StringBuilder monta o texto de forma mutável em um único buffer de memória, evitando criar dezenas de objetos String intermediários.', 20, 3, 1, NULL),

(7, 'Chefão de Data-Hora! Invoque o método estático da classe "LocalDate" que captura e retorna a data de hoje do sistema:', 'LocalDate hoje = ________________________;',
 NULL, NULL, NULL, NULL, NULL,
 'Use o método estático now() da classe LocalDate: LocalDate.now();', 50, 4, 2, '^LocalDate\.now\(\s*\);?$'),

-- ------------------------------------------------------------------------------
-- MÓDULO 8: Herança e Polimorfismo (Questões 71 a 80)
-- ------------------------------------------------------------------------------
(8, 'Qual palavra reservada é utilizada na declaração de uma classe em Java para indicar que ela herda atributos e métodos de uma superclasse?', NULL,
 'inherits', 'super', 'extends', 'implements',
 'C', 'A palavra reservada extends estabelece a relação de herança ("é-um") entre a subclasse e a superclasse.', 10, 1, 1, NULL),

(8, 'Se a superclasse "Conta" possui o atributo saldo e a subclasse "ContaEmpresarial" precisa acessá-lo diretamente sem deixá-lo público para o resto do sistema, qual modificador usamos no saldo?', NULL,
 'private', 'protected', 'static', 'final',
 'B', 'O modificador protected permite que o membro seja acessado pelas subclasses (e classes do mesmo pacote), mantendo-o oculto para classes externas.', 15, 2, 1, NULL),

(8, 'Para que serve a chamada "super(numero, titular, saldo);" na primeira linha do construtor de uma subclasse?', NULL,
 'Para apagar os dados da superclasse.',
 'Para invocar o construtor da superclasse, reaproveitando a lógica de inicialização dos atributos herdados.',
 'Para transformar a subclasse em abstrata.',
 'Para encerrar a execução do construtor.',
 'B', 'O comando super(...) chama o construtor da classe mãe (superclasse) para iniciar os atributos básicos do objeto.', 15, 2, 1, NULL),

(8, 'Considere que "ContaEmpresarial extends Conta". O que é o Upcasting demostrado em "Conta c1 = new ContaEmpresarial();"?', NULL,
 'Um erro de compilação.',
 'Atribuir um objeto da subclasse para uma variável do tipo da superclasse — operação natural e segura, pois toda ContaEmpresarial "é-uma" Conta.',
 'Converter um double em int.',
 'Transformar uma classe em interface.',
 'B', 'O Upcasting (subclasse -> superclasse) é implícito e fundamental para o polimorfismo.', 20, 2, 1, NULL),

(8, 'Antes de fazer um Downcasting de uma variável da superclasse para uma subclasse, qual operador usamos para testar com segurança se o objeto realmente pertence àquela subclasse?', NULL,
 'typeof', 'instanceof', 'isClass', 'equals',
 'B', 'O operador instanceof (ex: if (c1 instanceof ContaEmpresarial)) verifica o tipo real do objeto em tempo de execução antes do casting, evitando ClassCastException.', 20, 3, 1, NULL),

(8, 'Qual é a importância de colocar a anotação "@Override" acima de um método que está sendo sobrescrito na subclasse?', NULL,
 'Apenas deixar o código colorido.',
 'Avisar o compilador para verificar se a assinatura realmente existe na superclasse (prevenindo erros de digitação) e documentar a leitura do código.',
 'Impedir que o método seja executado.',
 'Tornar o método estático.',
 'B', 'Com @Override, se você errar uma letra no nome do método ao sobrescrever, o compilador avisa imediatamente.', 15, 2, 1, NULL),

(8, 'Em que consiste o Polimorfismo em tempo de execução na Programação Orientada a Objetos?', NULL,
 'Variáveis do mesmo tipo genérico (superclasse) apontando para objetos de subclasses diferentes e executando comportamentos específicos distintos ao chamar o mesmo método.',
 'Criar duas variáveis com o mesmo nome no método main.',
 'Converter um texto em número inteiro.',
 'Usar apenas métodos estáticos no projeto.',
 'A', 'Pela ligação tardia (late binding), chamar conta.sacar() em uma lista de Conta executará a versão específica de cada subclasse instanciada.', 25, 3, 1, NULL),

(8, 'Para que serve adicionar a palavra reservada "final" na declaração de uma classe ("public final class ContaPoupanca") ou de um método?', NULL,
 'Em uma classe, impede que ela seja herdada (não pode ter subclasses); em um método, impede que ele seja sobrescrito (@Override).',
 'Obriga a classe a ser herdada por todas as outras.',
 'Apaga a classe após o primeiro uso.',
 'Transforma a classe em um banco de dados.',
 'A', 'O modificador final evita herança na classe ou sobreposição no método, aumentando a segurança e evitando sobreposições múltiplas inconsistentes.', 20, 3, 1, NULL),

(8, 'O que caracteriza uma Classe Abstrata ("public abstract class Conta") em Java?', NULL,
 'Uma classe que não pode ter atributos.',
 'Uma classe que não pode ser instanciada diretamente com "new", servindo como base de herança e polimorfismo para suas subclasses concretas.',
 'Uma classe que não compila.',
 'Uma classe exclusiva para ler arquivos.',
 'B', 'Classes abstratas garantem o reaproveitamento e o polimorfismo da superclasse sem permitir a criação direta de objetos genéricos incompletos.', 20, 2, 1, NULL),

(8, 'Chefão da Herança! Complete a declaração da classe "ContaEmpresarial" para que ela herde da superclasse "Conta":', 'public class ___________________________ {\n}',
 NULL, NULL, NULL, NULL, NULL,
 'Use a palavra reservada extends: ContaEmpresarial extends Conta', 50, 4, 2, '^ContaEmpresarial\s+extends\s+Conta\s*\{?;?$'),

-- ------------------------------------------------------------------------------
-- MÓDULO 9: Tratamento de Exceções (Questões 81 a 90)
-- ------------------------------------------------------------------------------
(9, 'Na linguagem Java, o que é uma Exceção (Exception)?', NULL,
 'Um comentário ignorado pelo compilador.',
 'Qualquer condição de erro ou comportamento inesperado encontrado por um programa em execução.',
 'Uma variável que guarda valores booleanos.',
 'Um tipo especial de laço de repetição.',
 'B', 'Exceções são objetos que representam falhas ocorridas durante a execução e interrompem o fluxo normal caso não sejam tratadas.', 10, 1, 1, NULL),

(9, 'Quando uma exceção não é tratada em um método, ela sobe pela cadeia de métodos chamadores até estourar na tela. Como se chama essa estrutura que registra a sequência de chamadas?', NULL,
 'Heap Memory', 'Pilha de Chamadas de Métodos (Call Stack / Stack Trace)', 'Garbage Collector', 'ArrayList',
 'B', 'O Stack Trace mostra a pilha de execução reversa indicando a classe, o método e a linha exata onde a exceção foi disparada.', 15, 2, 1, NULL),

(9, 'Na hierarquia de exceções do Java, qual é a diferença entre a classe "Exception" e a classe "Error" (ambas filhas de Throwable)?', NULL,
 'Não existe diferença.',
 'Exception representa erros que o programa deve prever e tratar (como arquivo inexistente ou regra de negócio), enquanto Error representa falhas graves da própria JVM (como OutOfMemoryError).',
 'Error é usado para validar formulários de login.',
 'Exception não pode ser usada com try-catch.',
 'B', 'O desenvolvedor trata subclasses de Exception; já Error indica problemas críticos de infraestrutura da Máquina Virtual.', 20, 2, 1, NULL),

(9, 'Em uma estrutura "try - catch - finally", qual é a função de cada um dos três blocos?', NULL,
 'try repete o código, catch encerra o programa e finally apaga as variáveis.',
 'try contém o código que pode gerar falha; catch captura e trata a exceção caso ela ocorra; finally executa sempre ao final (ocorrendo erro ou não).',
 'try só executa se der erro, e catch executa quando dá tudo certo.',
 'finally só executa quando o computador perde conexão.',
 'B', 'O bloco try protege a execução normal, o catch trata a falha específica e o finally garante a limpeza de recursos em qualquer cenário.', 15, 1, 1, NULL),

(9, 'Se um usuário digitar letras (ex: "abc") quando o programa esperava ler um número inteiro com "sc.nextInt()", qual exceção será lançada?', NULL,
 'NullPointerException',
 'InputMismatchException',
 'ArrayIndexOutOfBoundsException',
 'FileNotFoundException',
 'B', 'InputMismatchException indica que o dado digitado na entrada não corresponde ao tipo esperado pelo Scanner.', 15, 2, 1, NULL),

(9, 'Em qual situação prática o bloco "finally" é classicamente utilizado?', NULL,
 'Para declarar pacotes.',
 'Para fechar recursos externos abertos (como conexões de banco de dados ou leitores de arquivos) independentemente de ter ocorrido exceção ou não.',
 'Para substituir o comando return.',
 'Para criar objetos na Heap.',
 'B', 'O bloco finally garante que conexões, streams e arquivos não fiquem abertos vazando memória caso uma linha anterior lance exceção.', 20, 2, 1, NULL),

(9, 'Qual é a diferença entre criar a sua Exceção Personalizada (ex: DomainException) herdando de "Exception" versus herdando de "RuntimeException"?', NULL,
 'RuntimeException apaga o banco de dados.',
 'Herdando de Exception, o compilador obriga quem chama o método a tratá-la (throws ou try-catch); herdando de RuntimeException, o tratamento não é exigido pelo compilador.',
 'Exception não aceita mensagens de texto.',
 'RuntimeException só funciona no método main.',
 'B', 'Subclasses diretas de Exception são Checked Exceptions (verificadas pelo compilador), enquanto RuntimeException são Unchecked.', 25, 3, 1, NULL),

(9, 'Qual é a diferença entre as palavras reservadas "throw" (no singular) e "throws" (no plural) em Java?', NULL,
 'São sinônimos e podem ser trocadas livremente.',
 '"throw" é o comando usado dentro do método para instanciar e lançar a exceção (ex: throw new DomainException(...)), enquanto "throws" vai na assinatura do método para avisar que ele pode propagar aquela exceção.',
 '"throws" captura a exceção e "throw" fecha o programa.',
 '"throw" só funciona com números inteiros.',
 'B', 'Usamos "throw new ..." no corpo do código para disparar o erro e "throws MinhaException" no cabeçalho do método para delegar o tratamento.', 25, 3, 1, NULL),

(9, 'Em relação ao design de código para validação de regras de negócio (como validar datas de uma Reserva), por que a solução com Exceções Personalizadas é muito superior a retornar códigos de erro em String ou validar tudo no programa principal?', NULL,
 'Porque deixa o programa sem classes.',
 'Porque delega a validação para a própria classe de domínio, limpa os if-else aninhados e separa claramente o fluxo normal (try) do tratamento de erros (catch).',
 'Porque impede que o usuário digite datas erradas no teclado.',
 'Porque não precisa usar métodos.',
 'B', 'Com exceções, o código principal segue linear no bloco try e qualquer violação de regra em objetos internos salta direto para o bloco catch.', 20, 3, 1, NULL),

(9, 'Chefão das Exceções! Escreva a cláusula "catch" para capturar uma exceção do tipo "RuntimeException" na variável "e":', 'try {\n    executarOperacao();\n} _____________________________ {\n    System.out.println("Erro inesperado");\n}',
 NULL, NULL, NULL, NULL, NULL,
 'Use a palavra catch seguida do tipo da exceção e do nome da variável entre parênteses: catch (RuntimeException e)', 50, 4, 2, '^catch\s*\(\s*RuntimeException\s+e\s*\)\s*\{?;?$'),

-- ------------------------------------------------------------------------------
-- MÓDULO 10: Arquivos e Interfaces (Questões 91 a 100)
-- ------------------------------------------------------------------------------
(10, 'Por que costumamos combinar as classes "FileReader" e "BufferedReader" para ler arquivos de texto em Java?', NULL,
 'Porque o FileReader sozinho só lê imagens.',
 'Porque o FileReader abre o fluxo de caracteres do arquivo e o BufferedReader adiciona um buffer de memória rápido que permite ler linhas inteiras com readLine().',
 'Porque o BufferedReader criptografa o arquivo.',
 'Porque o Java proíbe usar menos de duas classes.',
 'B', 'O BufferedReader otimiza o acesso ao disco usando memória intermediária (buffer) e oferece o método prático readLine().', 15, 1, 1, NULL),

(10, 'Qual é a grande vantagem de utilizar o bloco "try-with-resources" — ex: try (BufferedReader br = new BufferedReader(...)) — introduzido a partir do Java 7?', NULL,
 'Ele ignora qualquer erro que acontecer no arquivo.',
 'Ele declara e fecha automaticamente os recursos (streams/leitores) ao final do bloco try, sem precisar de um bloco finally verboso.',
 'Ele cria o arquivo caso o disco rígido esteja desconectado.',
 'Ele converte o arquivo TXT em banco de dados.',
 'B', 'Qualquer classe que implemente AutoCloseable/Closeable declarada nos parênteses do try(...) é fechada automaticamente pela JVM.', 20, 2, 1, NULL),

(10, 'Ao instanciar "new FileWriter(caminho, true)" passando o segundo argumento booleano como "true", qual será o comportamento da escrita no arquivo?', NULL,
 'Ele apaga o arquivo inteiro e recria do zero.',
 'Ele abre o arquivo em modo Append, acrescentando as novas linhas ao final do conteúdo já existente sem apagá-lo.',
 'Ele bloqueia o arquivo apenas para leitura.',
 'Ele deleta a pasta onde o arquivo está.',
 'B', 'Sem o parâmetro true, o FileWriter recria/sobrescreve o arquivo; com true, ele preserva o conteúdo e escreve no final.', 20, 2, 1, NULL),

(10, 'O que o método "br.readLine()" de um BufferedReader retorna quando chega ao final do arquivo e não há mais linhas para ler?', NULL,
 'Uma String vazia ""',
 'O valor -1',
 'null',
 'Lança uma exceção obrigatória.',
 'C', 'Quando o arquivo chega ao fim (EOF), readLine() retorna null — por isso usamos o padrão while (line != null).', 15, 2, 1, NULL),

(10, 'Na Programação Orientada a Objetos em Java, o que é uma Interface?', NULL,
 'Apenas a tela gráfica colorida (HTML/CSS) do sistema.',
 'Um tipo que define um contrato (conjunto de operações/métodos abstratos) que uma classe deve cumprir ao implementá-la.',
 'Uma classe que só possui atributos privados.',
 'Um comando para conectar cabos USB.',
 'B', 'Uma interface estabelece "o quê" deve ser feito (o contrato de métodos), deixando "como" fazer para as classes que a implementam.', 15, 1, 1, NULL),

(10, 'Qual palavra reservada uma classe utiliza para declarar que vai cumprir o contrato definido por uma Interface?', NULL,
 'extends', 'implements', 'interface', 'includes',
 'B', 'Enquanto classes herdam de outra classe com extends, elas assinam o contrato de uma ou mais interfaces usando implements.', 10, 1, 1, NULL),

(10, 'Como o uso de Interfaces aliadas à Injeção de Dependência (pelo construtor) reduz o acoplamento em um sistema como o de Aluguel de Carros (RentalService + TaxService)?', NULL,
 'A classe RentalService dá um "new BrazilTaxService()" direto dentro dela.',
 'A classe RentalService depende apenas da interface genérica TaxService e recebe a instância concreta externamente pelo construtor, permitindo trocar a regra de imposto sem alterar o RentalService.',
 'Todas as regras de imposto são apagadas.',
 'O sistema deixa de usar classes.',
 'B', 'Com Inversão de Controle e Injeção de Dependência, a classe de serviço fica desacoplada da implementação concreta, facilitando testes e manutenção.', 25, 3, 1, NULL),

(10, 'Em Java, uma classe pode herdar de várias classes com "extends"? E pode implementar várias interfaces com "implements"?', NULL,
 'Pode herdar de várias classes, mas só pode implementar uma interface.',
 'O Java não permite herança múltipla de classes (apenas 1 extends), mas uma classe pode implementar múltiplas interfaces separadas por vírgula.',
 'Não pode fazer nenhum dos dois.',
 'Pode herdar de até 10 classes simultaneamente.',
 'B', 'Para evitar o "Problema do Diamante", uma classe em Java possui apenas uma superclasse direta, mas pode implementar quantas interfaces desejar.', 20, 3, 1, NULL),

(10, 'Para que uma lista de objetos personalizados (ex: List<Funcionario>) possa ser ordenada automaticamente pelo método "Collections.sort(lista)", qual interface a classe Funcionario deve implementar?', NULL,
 'Serializable', 'Comparable<Funcionario>', 'Runnable', 'Cloneable',
 'B', 'Implementar a interface Comparable<T> (e seu método compareTo) define a regra natural de comparação entre dois objetos da classe.', 25, 3, 1, NULL),

(10, 'Chefão Final da Arena Java! Complete a declaração da classe "BrazilTaxService" para que ela assine e implemente o contrato da interface "TaxService":', 'public class ____________________________________ {\n    public double tax(double amount) { return amount * 0.2; }\n}',
 NULL, NULL, NULL, NULL, NULL,
 'Use a palavra reservada implements: BrazilTaxService implements TaxService', 100, 4, 2, '^BrazilTaxService\s+implements\s+TaxService\s*\{?;?$');

