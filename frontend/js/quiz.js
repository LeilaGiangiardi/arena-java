document.addEventListener("DOMContentLoaded", () => {
    // URL da Servlet Java
    const API_URL = 'http://localhost:8080/backend/api/quiz?moduloId=1';

    let questions = [];
    let currentIndex = 0;
    let currentScore = 200; // Pontuação inicial do front
    let timerInterval;
    let timeLeft = 30; // 30 segundos contra ChatGPT
    let earnedXP = 0;
    let correctCount = 0;
    let errorCount = 0;
    let missedTopics = []; // Guarda os assuntos que o aluno errou

    // Elementos da DOM
    const questionText = document.getElementById("question-text");
    const codeSnippet = document.getElementById("code-snippet");
    const answerArea = document.getElementById("answer-area");
    const btnConfirm = document.getElementById("btn-confirm");
    const questionCounter = document.getElementById("question-counter");
    const xpReward = document.getElementById("xp-reward");
    const timerBar = document.getElementById("timer-bar");
    const scoreDisplay = document.getElementById("score-display");

    const feedbackModal = document.getElementById("feedback-modal");
    const feedbackTitle = document.getElementById("feedback-title");
    const feedbackExplanation = document.getElementById("feedback-explanation");
    const btnNextQuestion = document.getElementById("btn-next-question");
    const btnCloseQuiz = document.getElementById("btn-close-quiz");

    // Variável para guardar a resposta atual do usuário
    let selectedAnswer = null;

    // 1. Busca as perguntas no Back-end
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            questions = data;
            renderQuestion();
        })
        .catch(error => {
            questionText.innerText = "Erro ao carregar o servidor Java. Verifique se o Tomcat está rodando!";
            console.error(error);
        });

    // Rota de fuga do usuário (Heurística de IHM)
    if (btnCloseQuiz) {
        btnCloseQuiz.addEventListener("click", () => {
            const confirmed = confirm("Tem certeza que deseja abandonar o quiz? Todo o seu progresso e XP desta rodada serão perdidos.");
            if (confirmed) {
                clearInterval(timerInterval); // Para o cronômetro
                window.location.href = "dashboard.html"; // Volta pro hub
            }
        });
    }
    // 2. Renderiza a pergunta na tela dependendo do Tipo (1, 2 ou 3)
    function renderQuestion() {
        const q = questions[currentIndex];

        questionCounter.innerText = `Pergunta ${currentIndex + 1}/${questions.length}`;
        xpReward.innerText = `+ ${q.xpRecompensa} XP`;
        questionText.innerText = q.enunciado;

        // Trata o trecho de código opcional
        if (q.codigoSnippet) {
            codeSnippet.innerHTML = `<code>${q.codigoSnippet}</code>`;
            codeSnippet.classList.remove("hidden");
        } else {
            codeSnippet.classList.add("hidden");
        }

        answerArea.innerHTML = ""; // Limpa a área
        selectedAnswer = null;
        btnConfirm.disabled = true;

        // TIPO 1: MÚLTIPLA ESCOLHA
        if (q.tipoPergunta === 1) {
            const grid = document.createElement("div");
            grid.className = "alternatives-grid";

            const options = [
                { id: 'A', text: q.opcaoA }, { id: 'B', text: q.opcaoB },
                { id: 'C', text: q.opcaoC }, { id: 'D', text: q.opcaoD }
            ];

            options.forEach(opt => {
                if (opt.text) {
                    const btn = document.createElement("button");
                    btn.className = "btn-alt";
                    btn.innerText = `${opt.id}) ${opt.text}`;
                    btn.onclick = () => selectOption(btn, opt.id);
                    grid.appendChild(btn);
                }
            });
            answerArea.appendChild(grid);
            btnConfirm.innerText = "Confirmar Resposta";
        }

        // TIPO 2: TEXTO ABERTO
        else if (q.tipoPergunta === 2) {
            // IHM: Lê a regra do banco para descobrir se espera texto ou número
            const expectsNumber = q.validacaoRegex && (q.validacaoRegex.includes("\\d") || q.validacaoRegex.includes("[0-9]"));

            const input = document.createElement("input");
            // Se for número, o HTML5 já bloqueia letras e abre o teclado numérico no celular
            input.type = expectsNumber ? "number" : "text";
            input.className = "ide-input";
            input.placeholder = expectsNumber ? "Ex: 20" : "Sua resposta...";
            input.style.minHeight = "50px";

            input.oninput = (e) => {
                selectedAnswer = e.target.value;
                btnConfirm.disabled = selectedAnswer.trim() === "";
            };
            answerArea.appendChild(input);

            // Dica visual abaixo do campo (Prevenção de Erro)
            const tip = document.createElement("span");
            tip.innerText = expectsNumber ? "💡 Formato esperado: Apenas valor numérico." : "💡 Formato esperado: Texto (palavra exata ou sigla).";
            tip.style.color = "#a0a5b5";
            tip.style.fontSize = "0.85rem";
            tip.style.display = "block";
            tip.style.marginTop = "10px";
            answerArea.appendChild(tip);

            btnConfirm.innerText = "Confirmar Resposta";
        }

        // TIPO 3: MINI IDE (CHEFÃO)
        else if (q.tipoPergunta === 3) {
            const textarea = document.createElement("textarea");
            textarea.className = "ide-input";
            textarea.placeholder = "// Digite seu código Java aqui";
            textarea.oninput = (e) => {
                selectedAnswer = e.target.value;
                btnConfirm.disabled = selectedAnswer.trim() === "";
            };
            answerArea.appendChild(textarea);
            btnConfirm.innerText = "▶ Run Code";
        }

        startTimer();
    }

    // Lógica visual de selecionar alternativa (Tipo 1)
    function selectOption(btnElement, optionId) {
        document.querySelectorAll(".btn-alt").forEach(b => b.classList.remove("selected"));
        btnElement.classList.add("selected");
        selectedAnswer = optionId;
        btnConfirm.disabled = false;
    }

    // 3. Cronômetro Antifraude
    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 45; // Mais tempo para dar chance de ler
        timerBar.style.width = "100%";
        timerBar.classList.remove("danger");

        timerInterval = setInterval(() => {
            timeLeft--;
            const percentage = (timeLeft / 45) * 100;
            timerBar.style.width = percentage + "%";

            if (timeLeft <= 10) timerBar.classList.add("danger");

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                checkAnswer(true); // Estourou o tempo = erro automático
            }
        }, 1000);
    }

    // 4. Validação e Feedback Formativo
    btnConfirm.addEventListener("click", () => checkAnswer(false));

    function checkAnswer(timeOut = false) {
        clearInterval(timerInterval);
        const q = questions[currentIndex];
        let isCorrect = false;

        if (timeOut) {
            isCorrect = false;
        } else if (q.tipoPergunta === 1) {
            isCorrect = (selectedAnswer === q.respostaCorreta);
        } else if (q.tipoPergunta === 2) {
            let padrao = q.validacaoRegex;
            let flags = "";
            if (padrao.startsWith("(?i)")) {
                padrao = padrao.replace("(?i)", "");
                flags = "i";
            }
            const regex = new RegExp(padrao, flags);
            isCorrect = regex.test(selectedAnswer || "");
        } else if (q.tipoPergunta === 3) {
            isCorrect = selectedAnswer.includes("System.out.println") && selectedAnswer.includes("Arena Java");
        }

        // NOVO: Contabilidade de Game Design
        if (isCorrect) {
            earnedXP += q.xpRecompensa;
            correctCount++;
        } else {
            errorCount++;
            // Se errou, guarda uma dica do que ele precisa estudar
            if (q.tipoPergunta === 1) missedTopics.push("Teoria e conceitos básicos");
            else if (q.tipoPergunta === 2) missedTopics.push("Lembrar do vocabulário exato (sintaxe/léxica)");
            else if (q.tipoPergunta === 3) missedTopics.push("Prática no Editor (Comandos de Saída do Java)");
        }

        showFeedback(isCorrect, q.feedbackErro, q.xpRecompensa);
    }

    function showFeedback(isCorrect, explanation, xp) {
        feedbackModal.classList.remove("hidden");
        const modalContent = feedbackModal.querySelector(".modal-content");

        modalContent.classList.remove("success", "error");

        if (isCorrect) {
            modalContent.classList.add("success");
            feedbackTitle.innerText = "Correto! 🚀";
            feedbackTitle.style.color = "#00ff73";
            feedbackExplanation.innerText = explanation || `Você ganhou ${xp} XP!`;

            // Atualiza pontuação na tela
            currentScore += xp;
            scoreDisplay.innerText = currentScore;
        } else {
            modalContent.classList.add("error");
            feedbackTitle.innerText = "Bug Encontrado! 🐛";
            feedbackTitle.style.color = "#ff1744";
            feedbackExplanation.innerText = explanation;
        }
    }

    // 5. Próxima Pergunta
    btnNextQuestion.addEventListener("click", () => {
        feedbackModal.classList.add("hidden");
        currentIndex++;

        if (currentIndex < questions.length) {
            renderQuestion();
        } else {
            // OCULTA A TELA DO JOGO
            document.querySelector(".quiz-card").classList.add("hidden");

            // EXIBE A TELA DE RESUMO
            const summary = document.getElementById("summary-section");
            summary.classList.remove("hidden");
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Preenche as estatísticas com a pontuação real
            document.getElementById("final-xp").innerText = "+ " + earnedXP;
            document.getElementById("final-correct").innerText = correctCount;
            document.getElementById("final-errors").innerText = errorCount;

            // Gera o feedback personalizado
            const ul = document.getElementById("improvement-list");
            ul.innerHTML = ""; // Limpa a lista

            if (errorCount === 0) {
                ul.innerHTML = "<li style='color: #00ff73;'>✨ Código impecável! Nenhum bug encontrado. Você dominou o assunto!</li>";
            } else {
                // Remove tópicos repetidos e exibe
                const uniqueTopics = [...new Set(missedTopics)];
                uniqueTopics.forEach(topic => {
                    const li = document.createElement("li");
                    li.innerText = "⚠️ Revise seus conhecimentos em: " + topic;
                    ul.appendChild(li);
                });
            }

            // Lógica fictícia de Promoção de Nível (se ganhar mais de 200 XP na rodada)
            if (earnedXP >= 200) {
                document.getElementById("level-up-banner").classList.remove("hidden");
            }
        }
    });
});