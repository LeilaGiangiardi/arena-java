document.addEventListener("DOMContentLoaded", () => {
    // 1. CAPTURA SEGURA DA SESSÃO E URL
    const emailDoJogador = sessionStorage.getItem("emailUsuario");
    const urlParams = new URLSearchParams(window.location.search);
    const moduloId = urlParams.get('moduloId'); // Correção do bug 'id' para 'moduloId'

    if (!emailDoJogador || !moduloId) {
        alert("Sessão inválida ou módulo não selecionado!");
        window.location.href = "trilha.html";
        return;
    }

    // A URL agora é montada CORRETAMENTE com as variáveis já preenchidas
    const API_URL = `http://localhost:8080/backend/api/quiz?moduloId=${moduloId}&email=${emailDoJogador}`;
    const PROGRESSO_URL = 'http://localhost:8080/backend/api/progresso';

    // 2. ELEMENTOS DA TELA
    const elNome = document.getElementById("user-nome");
    if (elNome) elNome.innerText = sessionStorage.getItem("nomeUsuario") || "Anônimo";

    const elCargo = document.getElementById("user-cargo");
    if (elCargo) elCargo.innerText = sessionStorage.getItem("cargoUsuario") || "Recruta";

    const elXp = document.getElementById("user-xp");
    if (elXp) elXp.innerText = sessionStorage.getItem("xpUsuario") || "0";

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

    // Variáveis de Estado
    let questions = [];
    let currentIndex = 0;
    let timerInterval;
    let timeLeft = 45;
    let earnedXP = 0;
    let correctCount = 0;
    let errorCount = 0;
    let missedTopics = [];
    let selectedAnswer = null;

    if (btnCloseQuiz) {
        btnCloseQuiz.addEventListener("click", () => {
            window.location.href = "trilha.html";
        });
    }

    // 3. BUSCA AS PERGUNTAS NO SERVIDOR (A VERDADE ABSOLUTA)
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error("Erro na rede.");
            return response.json();
        })
        .then(data => {
            if (data.erro) {
                questionText.innerText = "Erro: " + data.erro;
                return;
            }
            questions = data;

            if (questions.length > 0) {
                // TRAVA ANTIFRAUDE: Conta quantas já estão respondidas e pula elas
                let respondidasNoBanco = questions.filter(q => q.jaRespondida === true).length;
                currentIndex = respondidasNoBanco;

                if (currentIndex >= questions.length) {
                    mostrarResumoFinal(); // Se o cara limpou o cache mas já tinha feito tudo, cai aqui direto!
                } else {
                    renderQuestion(); // Renderiza a primeira inédita
                }
            } else {
                questionText.innerText = "Nenhuma pergunta encontrada para este módulo.";
            }
        })
        .catch(error => {
            console.error(error);
            questionText.innerText = "Falha de Conexão com o Servidor Java.";
        });

    // 4. RENDERIZA A PERGUNTA
    function renderQuestion() {
        const q = questions[currentIndex];
        questionCounter.innerText = `Pergunta ${currentIndex + 1}/${questions.length}`;
        xpReward.innerText = `+ ${q.xpRecompensa} XP`;
        questionText.innerText = q.enunciado;

        if (q.codigoSnippet) {
            codeSnippet.innerHTML = `<code>${q.codigoSnippet.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}</code>`;
            codeSnippet.classList.remove("hidden");
        } else {
            codeSnippet.classList.add("hidden");
        }

        answerArea.innerHTML = ""; 
        selectedAnswer = null;
        
        btnConfirm.classList.remove("active");
        btnConfirm.disabled = true; // <-- TRANCA O BOTÃO NO INÍCIO DA PERGUNTA

        if (q.tipoPergunta === 1) {
            const grid = document.createElement("div");
            grid.className = "options-grid";
            const options = [
                { id: 'A', text: q.opcaoA }, { id: 'B', text: q.opcaoB },
                { id: 'C', text: q.opcaoC }, { id: 'D', text: q.opcaoD }
            ];
            options.forEach(opt => {
                if (opt.text) {
                    const btn = document.createElement("button");
                    btn.className = "option-btn";
                    btn.innerHTML = `<span class="text-cyan">>_</span> ${opt.id}) ${opt.text}`;
                    btn.onclick = () => selectOption(btn, opt.id);
                    grid.appendChild(btn);
                }
            });
            answerArea.appendChild(grid);
        }
        else if (q.tipoPergunta === 2 || q.tipoPergunta === 3) {
            const input = document.createElement("input");
            input.type = "text";
            input.className = "ide-input";
            input.placeholder = q.tipoPergunta === 2 ? "Ex: sc.nextInt();" : "// Seu código...";
            input.oninput = (e) => {
                selectedAnswer = e.target.value;
                if (selectedAnswer.trim() !== "") {
                    btnConfirm.classList.add("active");
                    btnConfirm.disabled = false; // <-- DESTRANCA AO DIGITAR
                } else {
                    btnConfirm.classList.remove("active");
                    btnConfirm.disabled = true; // <-- TRANCA SE APAGAR TUDO
                }
            };
            answerArea.appendChild(input);
        }
        startTimer();
    }

    // Seleção Visual de Alternativa
    function selectOption(btnElement, optionId) {
        document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
        btnElement.classList.add("selected");
        selectedAnswer = optionId;
        
        btnConfirm.classList.add("active");
        btnConfirm.disabled = false; // <-- ISSO DESTRANCA O CLIQUE!
    }

    // Cronômetro
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
                processarResposta(true); // Estourou o tempo
            }
        }, 1000);
    }

    // 5. ENVIO E VALIDAÇÃO DA RESPOSTA
    btnConfirm.addEventListener("click", () => {
        if (btnConfirm.classList.contains("active")) {
            processarResposta(false);
        }
    });

    function processarResposta(timeOut = false) {
        clearInterval(timerInterval);
        btnConfirm.classList.remove("active"); // Trava duplo clique
        btnConfirm.disabled = true;
        
        const q = questions[currentIndex];
        let isCorrect = false;

        // Validação Front-end
        if (!timeOut) {
            if (q.tipoPergunta === 1) {
                isCorrect = (selectedAnswer === q.respostaCorreta);
            } else if (q.tipoPergunta === 2 || q.tipoPergunta === 3) {
                let padrao = q.validacaoRegex || "";
                let flags = padrao.startsWith("(?i)") ? "i" : "";
                padrao = padrao.replace("(?i)", "");
                const regex = new RegExp(padrao, flags);
                isCorrect = regex.test(selectedAnswer || "");
            }
        }

        const xpDaQuestao = isCorrect ? q.xpRecompensa : 0;

        // Manda o resultado para o Java salvar no Banco
        fetch(PROGRESSO_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: emailDoJogador,
                perguntaId: q.id,
                xpGanho: xpDaQuestao,
                acertou: isCorrect
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) {
                    if (isCorrect) {
                        earnedXP += xpDaQuestao;
                        correctCount++;
                    } else {
                        errorCount++;
                        if (q.tipoPergunta === 1) missedTopics.push("Teoria e conceitos básicos");
                        else missedTopics.push("Sintaxe de Código e Regex");
                    }

                    // Atualiza a tela com as informações novas do Banco
                    sessionStorage.setItem("xpUsuario", data.novoXp);
                    sessionStorage.setItem("cargoUsuario", data.novoCargo);
                    document.getElementById("user-xp").innerText = data.novoXp;
                    document.getElementById("user-cargo").innerText = data.novoCargo;
                }

                // Abre o feedback independente da resposta do servidor
                showFeedback(isCorrect, q.feedbackErro, xpDaQuestao);
            })
            .catch(err => {
                console.error("Erro ao salvar progresso:", err);
                showFeedback(isCorrect, q.feedbackErro, xpDaQuestao); // Mostra o modal mesmo offline
            });
    }

    // Modal de Explicação
    function showFeedback(isCorrect, explanation, xp) {
        feedbackModal.classList.remove("hidden");
        const modalContent = feedbackModal.querySelector(".modal-content");
        modalContent.classList.remove("success", "error");

        if (isCorrect) {
            modalContent.classList.add("success");
            document.getElementById("feedback-title").innerHTML = `✔️ ACERTOU! <span class="text-cyan fira-code">+${xp}XP</span>`;
            document.getElementById("feedback-title").style.color = "#00ffaa";
            document.getElementById("feedback-explanation").innerHTML = `Excelente lógica de compilação. Avançando para a próxima instrução...`;
        } else {
            modalContent.classList.add("error");
            document.getElementById("feedback-title").innerText = "🐛 EXCEPTION ENCONTRADA!";
            document.getElementById("feedback-title").style.color = "#ff3366";
            document.getElementById("feedback-explanation").innerHTML = explanation || "Você errou a sintaxe.";
        }
    }

    // 6. AVANÇAR E CONCLUIR
    btnNextQuestion.addEventListener("click", () => {
        feedbackModal.classList.add("hidden");
        currentIndex++; // Avança no Array carregado

        if (currentIndex < questions.length) {
            renderQuestion();
        } else {
            mostrarResumoFinal();
        }
    });

    function mostrarResumoFinal() {
        // Agora o elemento existe no HTML, então isso funcionará
        document.getElementById("active-quiz-section").classList.add("hidden");
        const summary = document.getElementById("summary-section");
        summary.classList.remove("hidden");

        document.getElementById("final-xp").innerText = "+ " + earnedXP;
        document.getElementById("final-correct").innerText = correctCount;
        document.getElementById("final-errors").innerText = errorCount;

        const ul = document.getElementById("improvement-list");
        ul.innerHTML = "";
        if (errorCount === 0) {
            // Substituída a injeção de estilo inline (style) por uma classe CSS (.text-green-light)
            ul.innerHTML = "<li class='text-green-light'>✨ Código impecável! Nenhuma anomalia detectada.</li>";
        } else {
            const uniqueTopics = [...new Set(missedTopics)];
            uniqueTopics.forEach(topic => {
                ul.innerHTML += `<li>⚠️ Área de atenção: <strong class="text-pink">${topic}</strong></li>`;
            });
        }
    }

    // 7. ATALHOS DE TECLADO (1 a 4 e Enter)
    document.addEventListener('keydown', function (event) {
        if (!document.getElementById("active-quiz-section").classList.contains("hidden") && feedbackModal.classList.contains("hidden")) {
            // Teclas 1, 2, 3, 4
            if (['1', '2', '3', '4'].includes(event.key)) {
                const index = parseInt(event.key) - 1;
                const options = document.querySelectorAll('.option-btn');
                if (options[index]) {
                    options[index].click();
                }
            }
            // Enter para confirmar
            if (event.key === 'Enter') {
                if (btnConfirm.classList.contains('active')) {
                    btnConfirm.click();
                }
            }
        } else if (!feedbackModal.classList.contains("hidden")) {
            // Enter para avançar o modal
            if (event.key === 'Enter') {
                btnNextQuestion.click();
            }
        }
    });
});