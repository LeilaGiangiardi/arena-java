# ☕ Arena Java

Um software web educacional gamificado focado em ensinar lógica de programação e sintaxe Java para calouros de Sistemas de Informação.

## 🚀 O Projeto
O Arena Java é uma plataforma assíncrona onde os alunos respondem a quizzes técnicos e sobem em um ranking global. Diferente de plataformas comuns, o sistema foca no **Feedback Formativo**: ao errar, o aluno recebe a explicação exata do conceito.

Para inibir o uso de Inteligência Artificial, a interface simula uma IDE com bloqueio de cópia de texto e utiliza cronômetros de resposta rápida.

## 🎮 Sistema de Progressão (XP)
Os alunos ganham experiência e evoluem através de cargos baseados no humor nerd da TI:
1. **Derrubador de Servidor 💥** (0 XP)
2. **Caçador de Ponto e Vírgula (;) 🔍** (500 XP)
3. **Refém da Inteligência Artificial 🤖** (1000 XP)
4. **Mestre do Stack Overflow 🧙‍♂️** (2000 XP)
5. **Compilador Humano 🧠** (3000 XP)

## 🛠️ Tecnologias Utilizadas
* **Front-end:** HTML5, CSS3, JavaScript (Vanilla)
* **Back-end:** Java (Servlets + JDBC) rodando em Apache Tomcat
* **Banco de Dados:** PostgreSQL

## 📂 Como rodar o banco de dados
O script completo de criação das tabelas (Usuários, Perguntas e Respostas) está localizado na pasta `/database/schema.sql`.