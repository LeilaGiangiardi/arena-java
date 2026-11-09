-- ==============================================================================
-- INSERÇÃO DE MÓDULOS (TRILHA DE APRENDIZAGEM)
-- ==============================================================================
INSERT INTO modulos (nome, descricao, xp_bonus_conclusao) VALUES 
('Fundamentos e Variáveis', 'Domine o hardware, software, variáveis, tipos primitivos e entrada/saída de dados.', 100),
('Estruturas Condicionais', 'Aprenda a tomar decisões lógicas com if, else, switch-case e operadores ternários.', 150),
('Laços de Repetição', 'Automatize processos com while, for e do-while, e não caia no loop infinito!', 200);

-- ==============================================================================
-- INSERÇÃO DE PERGUNTAS - MÓDULO 1: Fundamentos e Variáveis (ID 1)
-- ==============================================================================
INSERT INTO perguntas (modulo_id, enunciado, codigo_snippet, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, feedback_erro, xp_recompensa, nivel, tipo_pergunta) VALUES
(1, 'Na computação, o que exatamente é um algoritmo?', NULL, 
 'Uma peça de hardware instalada na placa-mãe.', 
 'Um software de compilação de código.', 
 'Uma sequência finita de instruções para se resolver um problema.', 
 'Um sistema operacional genérico.', 
 'C', 'Um algoritmo é uma sequência finita de passos para resolver um problema, que pode ser aplicado em várias áreas, não apenas na programação[cite: 2].', 10, 1, 1),

(1, 'O Java utiliza um modelo de execução de abordagem híbrida. O que isso significa?', NULL,
 'Ele converte o código apenas para HTML.',
 'O código fonte é precompilado para Bytecode e depois interpretado pela Máquina Virtual (JVM).',
 'Ele interpreta o código linha por linha direto no Sistema Operacional.',
 'Ele não usa compilador, apenas um editor de texto simples.',
 'B', 'No Java, o código fonte passa por um compilador que gera o Bytecode, que então é interpretado pela Máquina Virtual (JVM)[cite: 17].', 15, 1, 1),

(1, 'Qual das seguintes declarações de variáveis segue a boa prática do padrão "camel case" e é permitida no Java?', NULL,
 'int salario do funcionario;',
 'int 5minutos;',
 'int salario_do_funcionario;',
 'int salarioDoFuncionario;',
 'D', 'Nomes de variáveis não podem ter espaços ou começar com dígitos. A convenção recomendada é o camelCase: primeira palavra minúscula e as seguintes com inicial maiúscula[cite: 25].', 10, 1, 1),

(1, 'Qual dos tipos primitivos abaixo é utilizado para armazenar valores de ponto flutuante (decimais) com 64 bits em Java?', NULL,
 'int', 'boolean', 'double', 'char', 
 'C', 'O tipo "double" é usado para pontos flutuantes de 64 bits. "int" é para inteiros, "boolean" para verdadeiro/falso e "char" para caractere Unicode[cite: 24].', 10, 1, 1),

(1, 'Qual é o resultado da expressão aritmética: 14 % 3?', 'int resultado = 14 % 3;',
 '4', '2', '4.66', '1', 
 'B', 'O operador "%" (mod) retorna o resto da divisão. 14 dividido por 3 é 4, com resto 2[cite: 21].', 15, 2, 1),

(1, 'Quando dividimos dois números inteiros em Java, o resultado também é inteiro. O que devemos fazer para obter o valor com casas decimais (Casting)?', 'int a = 5; int b = 2;\ndouble resultado = a / b; // resultado dá 2.0',
 'Alterar as variáveis a e b para String.',
 'Colocar (double) na frente do cálculo: (double) a / b;',
 'Multiplicar o resultado por 1.0 depois da divisão.',
 'Usar o comando Math.decimal().',
 'B', 'O Casting é a conversão explícita. Ao colocar (double) antes de a / b, o compilador entende que a expressão resultará em ponto flutuante (2.5)[cite: 38, 39].', 20, 2, 1),

(1, 'Ao usar a classe Scanner, qual é o propósito do comando Locale.setDefault(Locale.US)?', NULL,
 'Traduzir o código do Java para inglês.',
 'Considerar o separador de casas decimais como ponto (.) ao invés de vírgula.',
 'Formatar a saída de texto para o teclado americano.',
 'Limpar o buffer de leitura pendente.',
 'B', 'Serve para garantir que o programa utilize o ponto (.) como separador de decimais, independentemente da localidade do sistema operacional do usuário[cite: 30, 43].', 15, 2, 1),

(1, 'Qual caractere especial (máscara) usamos no printf para formatar a saída de um número de ponto flutuante com quebra de linha?', NULL,
 '%s%n', '%d%n', '%f%n', '%c%n',
 'C', 'O %f é a máscara para ponto flutuante, %d para inteiros, %s para textos e %n insere a quebra de linha[cite: 32].', 15, 3, 1),

(1, 'A classe Math possui várias funções. O que o comando Math.pow(x, y) faz?', NULL,
 'Calcula a raiz quadrada de x.',
 'Mostra o valor absoluto de x.',
 'Eleva o valor x à potência de y.',
 'Multiplica x por y.',
 'C', 'Math.pow(x,y) calcula a potenciação (x elevado a y). A raiz quadrada é Math.sqrt(x) e valor absoluto é Math.abs(x)[cite: 47].', 15, 3, 1),

(1, 'Chegou o Chefão! Você precisa ler um número inteiro do teclado usando o objeto Scanner (já instanciado como "sc"). Digite o comando completo que deve ser atribuído à variável "x".', 'int x;\nx = _____',
 NULL, NULL, NULL, NULL, NULL, 
 'Você deve usar o método nextInt() do objeto sc para ler valores inteiros[cite: 43]. A resposta esperada é: sc.nextInt();', 50, 4, 2); 
-- NOTA: O Chefão usa tipo_pergunta = 2. A validação será feita via regex no campo validacao_regex abaixo.
UPDATE perguntas SET validacao_regex = '^sc\.nextInt\(\);?$' WHERE enunciado LIKE 'Chegou o Chefão!%inteiro%';

-- ==============================================================================
-- INSERÇÃO DE PERGUNTAS - MÓDULO 2: Estruturas Condicionais (ID 2)
-- ==============================================================================
INSERT INTO perguntas (modulo_id, enunciado, codigo_snippet, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, feedback_erro, xp_recompensa, nivel, tipo_pergunta) VALUES
(2, 'Os operadores lógicos do Java são essenciais para testes condicionais múltiplos. Qual o símbolo do operador "OU" (pelo menos uma condição deve ser verdadeira)?', NULL,
 '&&', '||', '!', '==',
 'B', 'O operador "OU" é representado por "||". O operador "&&" significa "E", enquanto "!" significa "NÃO" (inversão)[cite: 52, 54].', 10, 1, 1),

(2, 'O que acontecerá ao executar a expressão lógica: X <= 20 && X == 10 && X != 3 (Suponha que X seja 5).', NULL,
 'Retorna verdadeiro (V)',
 'Retorna falso (F)',
 'Causa erro de compilação',
 'Gera um loop infinito',
 'B', 'Na tabela verdade do "&&" (E), TODAS as condições devem ser verdadeiras. Como 5 não é igual a 10 (X == 10 é Falso), a expressão inteira se torna Falsa[cite: 53].', 15, 1, 1),

(2, 'Qual é a finalidade principal do comando "if-else" em Java?', NULL,
 'Criar uma nova variável na memória RAM.',
 'Definir que um bloco de comandos só será executado dependendo de uma condição.',
 'Repetir um código milhares de vezes em poucos milissegundos.',
 'Converter uma String para double.',
 'B', 'É uma estrutura de controle que desvia o fluxo do programa, executando o if se a condição for V, ou o else se for F[cite: 58, 59].', 10, 2, 1),

(2, 'Analise o uso do operador de atribuição cumulativa. Se a = 10, qual o resultado de: a += 5?', NULL,
 '5', '15', '50', '2',
 'B', 'O operador "a += b" é uma sintaxe encurtada para "a = a + b". Logo, a recebe 10 + 5, resultando em 15[cite: 62].', 15, 2, 1),

(2, 'A estrutura condicional ternária é ideal para:', NULL,
 'Criar dezenas de alternativas como um menu complexo.',
 'Decidir um VALOR a ser atribuído a uma variável em uma única linha baseada em uma condição simples.',
 'Substituir exclusivamente o comando while.',
 'Ler dados do teclado de forma assíncrona.',
 'B', 'O ternário (condição ? valor_V : valor_F) é um atalho elegante para atribuir valores mediante condições simples e diretas, sem precisar abrir blocos if-else[cite: 66].', 20, 2, 1),

(2, 'Para checar múltiplas opções específicas do valor de uma mesma variável (ex: menu de 1 a 7), qual estrutura opcional ao if-else encadeado é recomendada?', NULL,
 'Math.pow', 'for-each', 'switch-case', 'while',
 'C', 'O switch-case é excelente quando se tem várias opções de fluxo baseadas no valor exato de uma única variável[cite: 64, 65].', 15, 3, 1),

(2, 'Qual a importância da palavra reservada "break" dentro de uma estrutura switch-case?', NULL,
 'Ela quebra o código e fecha o programa abruptamente.',
 'Ela encerra o caso atual impedindo que os blocos de baixo (os outros cases) sejam executados em cascata.',
 'Ela não tem uso real no Java moderno.',
 'Ela força o switch a recomeçar a leitura desde o case 1.',
 'B', 'Sem o break, o Java continua executando todos os cases abaixo do case correspondente (efeito fall-through)[cite: 65].', 15, 3, 1),

(2, 'Em relação a "escopo e inicialização", o que acontece se tentarmos usar uma variável declarada dentro de um if (ex: double desconto) fora dele?', NULL,
 'O programa imprimirá zero por padrão.',
 'O compilador apontará erro porque a variável está fora de escopo e não é reconhecida.',
 'A variável se transforma em constante global.',
 'O programa usa o último valor de RAM guardado.',
 'B', 'O escopo de uma variável é limitado ao bloco {} em que foi criada. Usá-la fora gera erro de compilação[cite: 68].', 20, 3, 1),

(2, 'Qual a saída do código usando inversão lógica (!): !(5 > 10)?', NULL,
 'Verdadeiro (V)', 'Falso (F)', 'Nulo', '5',
 'A', '5 > 10 é Falso. O operador "!" inverte o valor de Falso para Verdadeiro[cite: 56].', 15, 3, 1),

(2, 'Chefão! Substitua o bloco if-else pela expressão condicional ternária equivalente para definir o desconto.', 'double preco = 34.5;\n// if (preco < 20.0) { desconto = preco * 0.1; } \n// else { desconto = preco * 0.05; }\n\ndouble desconto = _____________________________;',
 NULL, NULL, NULL, NULL, NULL,
 'A sintaxe do ternário é: (condição) ? valor_V : valor_F. A resposta esperada: (preco < 20.0) ? preco * 0.1 : preco * 0.05;[cite: 67].', 50, 4, 2);
UPDATE perguntas SET validacao_regex = '(?i)\(preco\s*<\s*20\.0\)\s*\?\s*preco\s*\*\s*0\.1\s*:\s*preco\s*\*\s*0\.05;?$' WHERE enunciado LIKE 'Chefão! Substitua o bloco if-else%';

-- ==============================================================================
-- INSERÇÃO DE PERGUNTAS - MÓDULO 3: Laços de Repetição (ID 3)
-- ==============================================================================
INSERT INTO perguntas (modulo_id, enunciado, codigo_snippet, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta, feedback_erro, xp_recompensa, nivel, tipo_pergunta) VALUES
(3, 'Qual estrutura repetitiva é mais recomendada quando NÃO se sabe previamente a quantidade exata de repetições que será realizada?', NULL,
 'for', 'switch', 'while', 'if-else',
 'C', 'O "enquanto" (while) repete o bloco de comandos indefinidamente até que sua condição se torne Falsa[cite: 71, 72].', 10, 1, 1),

(3, 'Ao utilizar a estrutura "for", sabemos que ela recebe três argumentos entre os parênteses separados por ponto-e-vírgula. Qual a ordem correta?', NULL,
 'condição ; incremento ; início',
 'incremento ; início ; condição',
 'início ; condição ; incremento',
 'condição ; início ; incremento',
 'C', 'A sintaxe correta é for (inicio; condição; incremento). O início roda só na primeira vez, a condição é verificada a cada ciclo, e o incremento roda no final do ciclo[cite: 76].', 15, 1, 1),

(3, 'Observe o teste de mesa de um while. O que será impresso na tela no final da execução?', 'int x = 5;\nint y = 0;\nwhile (x > 2) {\n    System.out.print(x);\n    y = y + x;\n    x = x - 1;\n}',
 '543', '5', '5432', '345',
 'A', 'A variável x começa em 5, o loop imprime e desconta 1 de x. Executará para 5, 4 e 3. Quando x for 2, a condição (2 > 2) é Falsa, encerrando o loop[cite: 73, 74].', 20, 2, 1),

(3, 'No Java e outras linguagens baseadas em C, "i++" é um atalho bastante utilizado no comando for. O que ele faz exatamente?', NULL,
 'Soma a variável "i" a todos os números anteriores.',
 'Dobra o valor da variável "i".',
 'Incrementa o valor da variável "i" em 1 (o mesmo que i = i + 1).',
 'Inverte o sinal lógico de "i".',
 'C', 'Os operadores unários de incremento (++ e --) adicionam ou subtraem 1 do valor da variável a cada repetição[cite: 77].', 10, 2, 1),

(3, 'Qual a principal diferença da estrutura "do-while" (faça-enquanto) em relação ao "while" padrão?', NULL,
 'Ele só pode ser usado com números decimais.',
 'O bloco de comandos é executado pelo menos uma vez, já que a condição é verificada apenas no final do bloco.',
 'Ele executa de trás para frente.',
 'Não possui diferença de execução lógica, apenas estética.',
 'B', 'O "do-while" realiza os comandos primeiro e só avalia se deve voltar a repetir ao término, garantindo no mínimo uma execução total do bloco[cite: 81, 82].', 15, 2, 1),

(3, 'Se você deseja fazer uma estrutura de repetição baseada em uma CONTAGEM REGRESSIVA (de 10 até 0), qual sintaxe de "for" seria correta?', NULL,
 'for (int i=10; i>=0; i--)',
 'for (int i=0; i<10; i++)',
 'for (int i=10; i==0; i++)',
 'for (int i=10; i<0; i--)',
 'A', 'Para contagem regressiva, iniciamos com o valor alto (i=10), usamos a condição de limite (i>=0) e utilizamos o decremento (i--)[cite: 77].', 20, 3, 1),

(3, 'A ferramenta de Debug (depuração) das IDEs como Eclipse é fundamental para encontrar erros. Qual a principal vantagem do Debugger?', NULL,
 'Ele escreve o código sozinho se você tiver dúvidas.',
 'Permite congelar a execução através de breakpoints e inspecionar o valor das variáveis passo a passo.',
 'Serve para apagar os arquivos temporários do PC.',
 'Converte o código Java para a linguagem Python.',
 'B', 'O debug permite acompanhar o fluxo de execução, observando os testes de mesa de loops e if-else em tempo real (F6) para localizar o bug[cite: 70].', 15, 3, 1),

(3, 'Observe o uso do acumulador. Qual será o valor impresso da variável "y"?', 'int x = 4;\nint y = 0;\nfor (int i=0; i<x; i++) {\n    y = y + i;\n}\nSystem.out.println(y);',
 '4', '6', '10', '0',
 'B', 'O loop vai de i=0 a i=3. Acumulando: y = 0+0=0, depois y = 0+1=1, depois y = 1+2=3, depois y = 3+3=6[cite: 79, 80].', 25, 3, 1),

(3, 'Um erro gravíssimo em laços while é esquecer a atualização da variável de controle (ex: x = x + 1). O que ocorre nesse cenário?', NULL,
 'O programa pulará o laço automaticamente.',
 'A condição se tornará eternamente verdadeira, travando a CPU em um "Loop Infinito".',
 'O Java corrige isso desligando a internet.',
 'O compilador gera um erro de sintaxe antes de rodar.',
 'B', 'Se a variável testada na condição nunca for alterada dentro do bloco, o loop nunca alcança sua rota de fuga, travando a aplicação.', 15, 3, 1),

(3, 'Chegou o Grande Chefão dos Loops! Declare a sintaxe da PRIMEIRA LINHA de um "for" para que a variável int "j" inicie em 1, rode enquanto "j" for menor ou igual a 5, com incremento de 1 passo.', '____ _______________ ___ {\n    System.out.println("Lutando...");\n}',
 NULL, NULL, NULL, NULL, NULL,
 'A sintaxe completa da declaração requer os três parâmetros: for (int j = 1; j <= 5; j++).', 50, 4, 2);
UPDATE perguntas SET validacao_regex = '(?i)for\s*\(\s*int\s+j\s*=\s*1\s*;\s*j\s*<=\s*5\s*;\s*j\+\+\s*\)' WHERE enunciado LIKE 'Chegou o Grande Chefão dos Loops!%';