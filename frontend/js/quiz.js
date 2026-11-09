document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const moduloId = urlParams.get('id') || 1; 
    
    const API_URL = `http://localhost:8080/backend/api/quiz?moduloId=${moduloId}`;
    const PROGRESSO_URL = 'http://localhost:8080/backend/api/progresso';
    const emailDoJogador = sessionStorage.getItem("emailUsuario");

    // Validação Segura de UI
    const elNome = document.getElementById("user-nome");
    const elCargo = document.getElementById("user-cargo");
    const elXp = document.getElementById("user-xp");

    if (elNome) elNome.innerText = sessionStorage.getItem("nomeUsuario") || "Anônimo";
    if (elCargo) elCargo.innerText = sessionStorage.getItem("cargoUsuario") || "Recruta";
    if (elXp) elXp.innerText = sessionStorage.getItem("xpUsuario") || "0";

    let questions = [];
    let currentIndex = 0;
    let timerInterval;
    let timeLeft = 45;
    let earnedXP = 0;
    let correctCount = 0;
    let errorCount = 0;
    let missedTopics = [];
    let selectedAnswer = null;

    const questionText = document.getElementById("question-text");
    const codeSnippet = document.getElementById("code-snippet");
    const answerArea = document.getElementById("answer-area");
    const btnConfirm = document.getElementById("btn-confirm");
    const questionCounter = document.getElementById("question-counter");
    const xpReward = document.getElementById("xp-reward");
    const timerBar = document.getElementById("timer-bar");
    const feedbackModal = document.getElementById("feedback-modal");
    const btnNextQuestion = document.getElementById("btn-next-question");
    const btnCloseQuiz = document.getElementById("btn-close-quiz");

    const saveKey = `arena_progresso_mod_${moduloId}_${emailDoJogador}`;

    function checarProgressoSalvo() {
        const progressoSalvo = localStorage.getItem(saveKey);
        if (progressoSalvo) {
            const confirmed = confirm("Você tem um progresso salvo. Deseja continuar de onde parou?");
            if (confirmed) {
                const state = JSON.parse(progressoSalvo);
                currentIndex = state.currentIndex;
                earnedXP = state.earnedXP;
                correctCount = state.correctCount;
                errorCount = state.errorCount;
                missedTopics = state.missedTopics;
            } else {
                localStorage.removeItem(saveKey);
            }
        }
        renderQuestion();
    }

    if (btnCloseQuiz) {
        btnCloseQuiz.addEventListener("click", () => {
            clearInterval(timerInterval);
            if (questions.length > 0) {
                const action = confirm("Seus pontos já estão a salvo no servidor! Deseja salvar também a posição desta pergunta para continuar depois?\n\n[OK] Salva a posição\n[Cancelar] Sai e descarta a posição");
                if (action) {
                    const state = { currentIndex, earnedXP, correctCount, errorCount, missedTopics };
                    localStorage.setItem(saveKey, JSON.stringify(state));
                } else {
                    localStorage.removeItem(saveKey);
                }
            }
            window.location.href = "trilha.html";
        });
    }

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            questions = data;
            if(questions.length > 0) checarProgressoSalvo();
            else questionText.innerText = "Nenhuma pergunta encontrada para este módulo.";
        })
        .catch(error => console.error(error));

    function renderQuestion() {
        const q = questions[currentIndex];
        questionCounter.innerText = `Pergunta ${currentIndex + 1}/${questions.length}`;
        xpReward.innerText = `+ ${q.xpRecompensa} XP`;
        questionText.innerText = q.enunciado;

        if (q.codigoSnippet) {
            codeSnippet.innerHTML = `<code>${q.codigoSnippet}</code>`;
            codeSnippet.classList.remove("hidden");
        } else {
            codeSnippet.classList.add("hidden");
        }

        answerArea.innerHTML = ""; 
        selectedAnswer = null;
        btnConfirm.disabled = true;

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
        else if (q.tipoPergunta === 2) {
            const input = document.createElement("input");
            input.type = "text";
            input.className = "ide-input";
            input.placeholder = "Sua resposta...";
            input.oninput = (e) => {
                selectedAnswer = e.target.value;
                btnConfirm.disabled = selectedAnswer.trim() === "";
            };
            answerArea.appendChild(input);
            btnConfirm.innerText = "Confirmar Resposta";
        }
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

    function selectOption(btnElement, optionId) {
        document.querySelectorAll(".btn-alt").forEach(b => b.classList.remove("selected"));
        btnElement.classList.add("selected");
        selectedAnswer = optionId;
        btnConfirm.disabled = false;
    }

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 45; 
        timerBar.style.width = "100%";
        timerBar.classList.remove("danger");

        timerInterval = setInterval(() => {
            timeLeft--;
            timerBar.style.width = ((timeLeft / 45) * 100) + "%";
            if (timeLeft <= 10) timerBar.classList.add("danger");
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                checkAnswer(true); 
            }
        }, 1000);
    }

    btnConfirm.addEventListener("click", () => checkAnswer(false));

    // A MÁGICA EM TEMPO REAL ACONTECE AQUI
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
            let flags = padrao.startsWith("(?i)") ? "i" : "";
            padrao = padrao.replace("(?i)", "");
            const regex = new RegExp(padrao, flags);
            isCorrect = regex.test(selectedAnswer || "");
        } else if (q.tipoPergunta === 3) {
            isCorrect = selectedAnswer.includes("System.out.println") && selectedAnswer.includes("Arena Java");
        }

        const xpDaQuestao = isCorrect ? q.xpRecompensa : 0;

        // BATE NO JAVA NA HORA QUE O USUÁRIO CLICA EM CONFIRMAR
        fetch(PROGRESSO_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: emailDoJogador, 
                xpGanho: xpDaQuestao, 
                acertou: isCorrect 
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                // Atualiza o visual no topo da tela instantaneamente
                sessionStorage.setItem("xpUsuario", data.novoXp);
                sessionStorage.setItem("cargoUsuario", data.novoCargo);
                if (elXp) elXp.innerText = data.novoXp;
                if (elCargo) elCargo.innerText = data.novoCargo;

                // Mostra alerta de Promoção no meio do jogo se ele upar!
                if (data.subiuDeNivel) {
                    alert(`🎉 PROMOÇÃO! Seus acertos te elevaram ao cargo de: ${data.novoCargo}`);
                }
            }
        });

        // Contadores locais para exibir no final
        if (isCorrect) {
            earnedXP += xpDaQuestao;
            correctCount++;
        } else {
            errorCount++;
            if (q.tipoPergunta === 1) missedTopics.push("Teoria e conceitos básicos");
            else if (q.tipoPergunta === 2) missedTopics.push("Lembrar do vocabulário exato");
            else if (q.tipoPergunta === 3) missedTopics.push("Prática de Código");
        }

        showFeedback(isCorrect, q.feedbackErro, xpDaQuestao);
    }

    function showFeedback(isCorrect, explanation, xp) {
        feedbackModal.classList.remove("hidden");
        const modalContent = feedbackModal.querySelector(".modal-content");
        modalContent.classList.remove("success", "error");

        if (isCorrect) {
            modalContent.classList.add("success");
            document.getElementById("feedback-title").innerText = "Correto! 🚀";
            document.getElementById("feedback-title").style.color = "#00ff73";
            document.getElementById("feedback-explanation").innerText = explanation || `XP adicionado direto na sua conta!`;
        } else {
            modalContent.classList.add("error");
            document.getElementById("feedback-title").innerText = "Bug Encontrado! 🐛";
            document.getElementById("feedback-title").style.color = "#ff1744";
            document.getElementById("feedback-explanation").innerText = explanation;
        }
    }

    // Como o Banco já salvou, o botão "Próximo" só avança a tela
    btnNextQuestion.addEventListener("click", () => {
        feedbackModal.classList.add("hidden");
        currentIndex++;

        if (currentIndex < questions.length) {
            renderQuestion();
        } else {
            localStorage.removeItem(saveKey); // Limpa o save
            document.querySelector(".quiz-card").classList.add("hidden");
            
            const summary = document.getElementById("summary-section");
            summary.classList.remove("hidden");
            window.scrollTo({ top: 0, behavior: 'smooth' });

            document.getElementById("final-xp").innerText = "+ " + earnedXP;
            document.getElementById("final-correct").innerText = correctCount;
            document.getElementById("final-errors").innerText = errorCount;

            const ul = document.getElementById("improvement-list");
            ul.innerHTML = ""; 
            if (errorCount === 0) {
                ul.innerHTML = "<li style='color: #00ff73;'>✨ Código impecável! Você dominou o assunto!</li>";
                // Bônus visual de perfect
                if (document.getElementById("bonus-box")) document.getElementById("bonus-box").classList.remove("hidden");
            } else {
                const uniqueTopics = [...new Set(missedTopics)];
                uniqueTopics.forEach(topic => {
                    const li = document.createElement("li");
                    li.innerText = "⚠️ Revise: " + topic;
                    ul.appendChild(li);
                });
            }
        }
    });
});