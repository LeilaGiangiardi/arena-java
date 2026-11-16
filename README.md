<div align="center">

# ☕ `<Arena Java/>` 🎮
### Plataforma Web Gamificada para o Ensino de Algoritmos e Programação Orientada a Objetos em Java

![Java](https://img.shields.io/badge/Java-17-f89820?style=for-the-badge&logo=openjdk&logoColor=white)
![Jakarta EE](https://img.shields.io/badge/Jakarta_EE-Tomcat_10-00a8ff?style=for-the-badge&logo=apachetomcat&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-HTML5_%7C_CSS3_%7C_JS_ES6-00f0ff?style=for-the-badge&logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![IHC/IHM](https://img.shields.io/badge/Design-IHC_%2F_IHM_Centrado_no_Usu%C3%A1rio-d500f9?style=for-the-badge)

</div>

---

## 📖 1. Sobre o Projeto

O **Arena Java** é uma plataforma educacional web gamificada com estética **Cyberpunk Neon & Console Retrô 16-Bit**, desenvolvida para auxiliar estudantes de computação no domínio progressivo da linguagem **Java** e do paradigma de **Programação Orientada a Objetos (POO)**.

O projeto une a **Engenharia de Software** (arquitetura cliente-servidor desacoplada em camadas com persistência relacional) aos fundamentos de **Interface Homem-Máquina (IHM / IHC)**, transformando listas de exercícios tradicionais em uma jornada interativa de **10 estágios (100 questões)** com feedback pedagógico imediato, desafios práticos de codificação (*Boss Fights*), sintetizador sonoro 8-bit nativo e ranking competitivo em tempo real.

---

## ✨ 2. Princípios de IHM / IHC Implementados

Toda a interface foi projetada e refatorada com base na literatura clássica de Interação Humano-Computador (**Donald Norman**, **Jakob Nielsen**, **Roger Pressman** e **Rocha & Baranauskas**):

* **Visibilidade e Foco sem Rolagem (`100vh` App-Like):** Telas de Dashboard, Trilha e Perfil dimensionadas para caber integralmente na janela desktop sem barras de rolagem desnecessárias, reduzindo a carga cognitiva (Heurística #8 de Nielsen).
* **Affordance e Prevenção de Falsa Affordance (Norman):** Diferenciação visual rigorosa entre botões interativos (preenchimento sólido, *hover* luminoso e som) e *badges* puramente informativas (borda tracejada e cursor padrão). Cartuchos bloqueados exibem `cursor: not-allowed` e filtro monocromático.
* **Complacência e Prevenção de Erros:**
  * **Validador Preventivo de Sintaxe no Chefão:** Antes de submeter o código ao servidor, o sistema verifica se o aluno esqueceu ponto e vírgula (`;`) ou parênteses abertos, emitindo um alerta construtivo **sem descontar XP e sem gastar a tentativa**.
  * **Detector de Caps Lock em Tempo Real:** Alerta imediato nos campos de senha e na IDE do Chefão caso a tecla `Caps Lock` esteja ativa (`getModifierState("CapsLock")`).
  * **Confirmação ao Sair (`Esc`):** Modal de segurança ao pausar uma missão, informando claramente que o progresso já respondido está salvo no banco de dados.
* **Passividade e Personalização (Controle do Usuário):** Painel de Preferências (`Ctrl + /`) dividido em abas com *Toggle Switches* para ativar/desativar **Efeitos Sonoros 8-Bit**, **Cronômetro Visual** e **Animação de Tremor (*Shake*)**, além da escolha entre o tema **Cyberpunk Neon** e o tema **Cinza Neutro (IDE Clássica)**.
* **Flexibilidade e Aceleradores de Teclado (Cubo de Nielsen):** Suporte completo para usuários novatos (mouse) e experientes (atalhos `[1]` a `[4]` para alternativas, `[Enter]` para confirmar/avançar, `[Esc]` para pausar/fechar e `[Ctrl + /]` para abrir os ajustes).
* **Estímulo Multissensorial (Web Audio API):** Sintetizador de áudio 8-bit/16-bit nativo (zero arquivos `.mp3` externos) gerando ondas *triangle*, *sine*, *square* e *sawtooth* em tempo real para cliques, navegação, digitação em estilo terminal, vitória, *level up*, erro/bug e *power-down* ao sair.

---

## 🕹️ 3. Mecânicas de Gamificação e Regras de Negócio

### 🗺️ A Trilha dos 10 Cartuchos (100 Questões + 10 Chefões)
Cada estágio é representado por um **Cartucho Retrô 16-Bit** renderizado em Pixel Art vetorial (`SVG crispEdges`) e contém **9 questões de múltipla escolha** + **1 questão Chefão (Boss Fight)** onde o jogador digita código Java avaliado por **Expressões Regulares (Regex)** no servidor:

| Estágio | Etiqueta do Cartucho | Módulo de Aprendizagem | Foco Técnico | Bônus de Conclusão |
| :---: | :---: | :--- | :--- | :---: |
| **01** | `STAGE 01 • CPU & JVM` | **Fundamentos e Variáveis** | Algoritmos, Bytecode, JVM, tipos primitivos, `Scanner` e `Math` | `+100 XP` |
| **02** | `STAGE 02 • IF / ELSE` | **Estruturas Condicionais** | Operadores lógicos, `if-else`, `switch-case`, escopo e ternário | `+150 XP` |
| **03** | `STAGE 03 • LOOPS` | **Laços de Repetição** | `while`, `for`, `do-while`, acumuladores e depuração (*Debug*) | `+200 XP` |
| **04** | `STAGE 04 • STRINGS & FN` | **Strings, Vetores e Funções** | Manipulação de `String`, arrays indexados e modularização | `+250 XP` |
| **05** | `STAGE 05 • POO CORE` | **Introdução à POO** | Classes, Objetos, atributos, métodos, `this` e construtores | `+300 XP` |
| **06** | `STAGE 06 • PRIVATE` | **Encapsulamento** | Modificadores de acesso, `getters/setters` e proteção de estado | `+350 XP` |
| **07** | `STAGE 07 • DATE & ENUM` | **Data-Hora, Enum e Composição** | `LocalDate`, `Instant`, enumerações e associação de objetos | `+400 XP` |
| **08** | `STAGE 08 • EXTENDS` | **Herança e Polimorfismo** | `extends`, `super`, `@Override`, *Upcasting* e *Downcasting* | `+450 XP` |
| **09** | `STAGE 09 • TRY / CATCH` | **Tratamento de Exceções** | Pilha de chamadas, blocos `try-catch-finally` e exceções customizadas | `+500 XP` |
| **10** | `STAGE 10 • INTERFACES` | **Arquivos e Interfaces** | `File`, `BufferedReader`, contratos `interface` e baixo acoplamento | `+600 XP` |

### 🏆 Sistema de Patentes (Cargos)
Conforme o aluno acumula XP resolvendo desafios, sua patente evolui automaticamente em todas as telas e no Ranking Global BSI:

| Ícone | Patente (Cargo) | XP Mínimo | Cor de Destaque |
| :---: | :--- | :---: | :---: |
| ⚡ | **Derrubador de Servidor** | `0 XP` | `#ff3366` (Vermelho Neon) |
| 🪲 | **Criador de bugs** | `200 XP` | `#00ff73` (Verde Matrix) |
| 🎯 | **Caçador de Ponto e Vírgula (;)** | `500 XP` | `#00f0ff` (Ciano) |
| 🤖 | **Refém da Inteligência Artificial** | `1.500 XP` | `#b84dff` (Roxo Neon) |
| 💻 | **Mestre do Stack Overflow** | `3.000 XP` | `#ff9900` (Laranja Java) |
| 🧠 | **Compilador Humano** | `5.000 XP` | `#ffd700` (Ouro) |

### ⚖️ Progressão, Sistema Anti-Chute e Modo Revisão
1. **Regra de Desbloqueio (Média de 60%):** O Estágio 01 inicia aberto. Para desbloquear o próximo cartucho, o aluno deve acertar pelo menos **6 das 10 questões (60%)** do módulo atual.
2. **Sistema Anti-Chute:** Questões inéditas concedem de **+10 a +100 XP**. Errar uma questão inédita aplica uma penalidade de **-5 XP** (o saldo total nunca fica abaixo de `0 XP`) e exibe a explicação técnica detalhada do erro.
3. **Repescagem Inteligente:** Caso o aluno finalize a tentativa sem atingir os 60%, o sistema reabre apenas as questões que ele errou para que possa aprender e destravar a fase sem refazer o que já dominou.
4. **Modo Revisão Transparente:** Ao rejogar um módulo já concluído, o topo do Quiz exibe a insígnia **`MODO REVISÃO (Sem perda de XP)`**, permitindo treinar livremente sem alterar a pontuação do ranking.

---

## 🏗️ 4. Arquitetura e Stack Tecnológica

```text
arena-java/
├── database/
│   └── schema.sql                 # DDL das 5 tabelas + Seed dos 10 módulos, 100 questões e Admin
├── backend/                       # API RESTful em Java 17 + Jakarta EE 10 (Maven + Docker)
│   ├── Dockerfile                 # Build Multi-Stage (Maven JDK 17 -> Apache Tomcat 10.1)
│   ├── pom.xml                    # Dependências: Jakarta Servlet API 6.0, PostgreSQL JDBC, Gson
│   └── src/main/java/com/arenajava/
│       ├── controller/            # Servlets: Auth, Dashboard, Trilha, Quiz, Progresso e Perfil
│       ├── dao/                   # Persistência JDBC pura: UsuarioDAO, ModuloDAO, PerguntaDAO
│       ├── model/                 # Entidades e DTOs: Usuario, ModuloDTO, Pergunta, RankingDTO
│       └── util/                  # ConexaoJDBC (Env Vars + Fallback Local) e CorsFilter
└── frontend/                      # Aplicação Web Cliente (HTML5, CSS3, Vanilla JS)
    ├── index.html                 # Landing Page Cyberpunk, Login/Cadastro e Modal de Créditos
    ├── dashboard.html             # Painel de Desempenho, Missão Atual e Ranking Global com Filtros
    ├── trilha.html                # Grid 5x2 de Cartuchos 16-Bit e Modal de Detalhes da Missão
    ├── quiz.html                  # Arena de Questões, IDE do Chefão com Dicas e Relatório Final
    ├── perfil.html                # Identidade do Jogador, Seletor de Avatares e Trilha de Patentes
    ├── css/
    │   └── style.css              # Design System unificado, animações, Toggle Switches e Temas
    └── js/
        ├── ihc-shared.js          # Motor de Áudio 8-Bit Global, Favicon SVG, Patentes e Ajustes
        ├── auth.js                # Autenticação, Cadastro, Caps Lock Alert e Modal de Créditos
        ├── dashboard.js           # Métricas do Aluno, Atalho Inteligente e Busca/Filtro de Ranking
        ├── trilha.js              # Renderização dos Cartuchos, Cadeados e Modo Admin
        ├── quiz.js                # Motor do Quiz, Cronômetro, Validador Sintático e Feedback
        └── perfil.js              # Edição de Perfil, Avatares DiceBear Bottts e Barra de Carreira