document.addEventListener("DOMContentLoaded", () => {
    const emailDoJogador = sessionStorage.getItem("emailUsuario");
    const urlParams = new URLSearchParams(window.location.search);
    const moduloId = parseInt(urlParams.get("moduloId") || urlParams.get("id") || "1", 10);

    if (!emailDoJogador || emailDoJogador === "null" || emailDoJogador === "undefined") {
        window.location.href = "index.html";
        return;
    }

    const API_URL = `https://arena-java-api.onrender.com/api/quiz?moduloId=${moduloId}&email=${encodeURIComponent(emailDoJogador)}`;
    const PROGRESSO_URL = "https://arena-java-api.onrender.com/api/progresso";

    const elCargo = document.getElementById("user-cargo");
    const elXp = document.getElementById("user-xp");
    if (elCargo && window.ArenaIHC) {
        const cargoSalvo = sessionStorage.getItem("cargoUsuario") || "Derrubador de Servidor";
        ArenaIHC.renderizarCargo(elCargo, cargoSalvo, true);
    }
    if (elXp) elXp.innerText = sessionStorage.getItem("xpUsuario") || "0";

    const btnAudio = document.getElementById("btn-toggle-audio");
    if (btnAudio && window.ArenaIHC) {
        ArenaIHC.applyThemeAndPrefs();
        btnAudio.addEventListener("click", () => {
            const atual = ArenaIHC.getPrefs().soundEnabled;
            ArenaIHC.savePrefs({ soundEnabled: !atual });
            if (!atual) ArenaIHC.playSound("success");
        });
    }

    const questionText = document.getElementById("question-text");
    const codeSnippet = document.getElementById("code-snippet");
    const answerArea = document.getElementById("answer-area");
    const btnConfirm = document.getElementById("btn-confirm");
    const questionCounter = document.getElementById("question-counter");
    const xpReward = document.getElementById("xp-reward");
    const reviewBadge = document.getElementById("review-mode-badge");
    const timerBar = document.getElementById("timer-bar");
    const timerSeconds = document.getElementById("timer-seconds");

    const bossHelperBar = document.getElementById("boss-helper-bar");
    const btnShowHint = document.getElementById("btn-show-hint");
    const bossHintBox = document.getElementById("boss-hint-box");
    const bossSyntaxWarning = document.getElementById("boss-syntax-warning");
    const capsWarningQuiz = document.getElementById("caps-warning-quiz");

    const feedbackModal = document.getElementById("feedback-modal");
    const btnNextQuestion = document.getElementById("btn-next-question");

    const btnCloseQuiz = document.getElementById("btn-close-quiz");
    const exitConfirmModal = document.getElementById("exit-confirm-modal");
    const btnContinuePlaying = document.getElementById("btn-continue-playing");
    const btnConfirmExit = document.getElementById("btn-confirm-exit");

    let allModuleQuestions = [];
    let questions = [];
    let currentIndex = 0;
    let isModoRevisao = false;
    let timerInterval;
    let maxTimeQuestion = 45;
    let timeLeft = 45;
    let earnedXP = 0;
    let selectedAnswer = null;
    let syntaxWarningAcknowledged = false;

    function abrirModalSaida() {
        if (!exitConfirmModal) {
            window.location.href = "trilha.html";
            return;
        }
        clearInterval(timerInterval);
        exitConfirmModal.classList.remove("hidden");
    }

    function fecharModalSaida() {
        if (exitConfirmModal) exitConfirmModal.classList.add("hidden");
        retomarTimer();
    }

    if (btnCloseQuiz) btnCloseQuiz.addEventListener("click", abrirModalSaida);
    if (btnContinuePlaying) btnContinuePlaying.addEventListener("click", fecharModalSaida);
    if (btnConfirmExit) {
        btnConfirmExit.addEventListener("click", () => {
            clearInterval(timerInterval);
            window.location.href = "trilha.html";
        });
    }

    function setConfirmEnabled(enabled) {
        if (!btnConfirm) return;
        btnConfirm.disabled = !enabled;
        btnConfirm.classList.toggle("active", enabled);
    }

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

            allModuleQuestions = data.map(q => {
                let status = 0;
                if (q.nivel === 20) status = 20;
                else if (q.nivel === 10) status = 10;
                else if (q.jaRespondida === true) status = 20;
                q.statusQuestao = status;
                return q;
            });

            if (allModuleQuestions.length === 0) {
                questionText.innerText = "Nenhuma pergunta encontrada para este módulo.";
                return;
            }

            const ineditas = allModuleQuestions.filter(q => q.statusQuestao === 0);

            if (ineditas.length > 0) {
                isModoRevisao = false;
                questions = ineditas;
                currentIndex = 0;
                renderQuestion();
            } else {
                mostrarResumoFinal();
            }
        })
        .catch(error => {
            console.error(error);
            questionText.innerText = "Falha de Conexão com o Servidor Java.";
        });

    function iniciarRevisaoDeErros() {
        const erradas = allModuleQuestions.filter(q => q.statusQuestao === 10);
        if (erradas.length === 0) return;

        isModoRevisao = true;
        questions = erradas;
        currentIndex = 0;
        earnedXP = 0;

        document.getElementById("summary-section").classList.add("hidden");
        document.getElementById("active-quiz-section").classList.remove("hidden");
        renderQuestion();
    }

    function iniciarRevisaoCompletaModulo() {
        isModoRevisao = true;
        questions = [...allModuleQuestions];
        currentIndex = 0;
        earnedXP = 0;

        document.getElementById("summary-section").classList.add("hidden");
        document.getElementById("active-quiz-section").classList.remove("hidden");
        renderQuestion();
    }

    function renderQuestion() {
        const q = questions[currentIndex];
        syntaxWarningAcknowledged = false;

        const prefixo = isModoRevisao ? "Revisão" : "Pergunta";
        questionCounter.innerText = `${prefixo} ${currentIndex + 1}/${questions.length}`;

        const jaDominada = (q.statusQuestao === 20);
        if (isModoRevisao || jaDominada) {
            reviewBadge.classList.remove("hidden");
            xpReward.innerHTML = jaDominada ? `<i class="ph-bold ph-check"></i> XP Garantido` : `+ ${q.xpRecompensa} XP`;
        } else {
            reviewBadge.classList.add("hidden");
            xpReward.innerText = `+ ${q.xpRecompensa} XP`;
        }

        questionText.innerText = q.enunciado;

        if (q.codigoSnippet) {
            codeSnippet.innerHTML = `<code>${q.codigoSnippet.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}</code>`;
            codeSnippet.classList.remove("hidden");
        } else {
            codeSnippet.classList.add("hidden");
        }

        answerArea.innerHTML = "";
        selectedAnswer = null;
        btnConfirm.innerHTML = "Confirmar Resposta [Enter]";
        setConfirmEnabled(false);

        if (bossHintBox) bossHintBox.classList.add("hidden");
        if (bossSyntaxWarning) bossSyntaxWarning.classList.add("hidden");

        if (q.tipoPergunta === 1) {
            if (bossHelperBar) bossHelperBar.classList.add("hidden");

            const grid = document.createElement("div");
            grid.className = "options-grid alternatives-grid";
            const options = [
                { id: 'A', key: '1', text: q.opcaoA },
                { id: 'B', key: '2', text: q.opcaoB },
                { id: 'C', key: '3', text: q.opcaoC },
                { id: 'D', key: '4', text: q.opcaoD }
            ];
            options.forEach(opt => {
                if (opt.text) {
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "option-btn btn-alt";
                    btn.innerHTML = `<kbd class="key-hint">[${opt.key}]</kbd> <span class="text-cyan">>_</span> <strong>${opt.id})</strong> <span>${opt.text}</span>`;
                    btn.onclick = () => selectOption(btn, opt.id);
                    grid.appendChild(btn);
                }
            });
            answerArea.appendChild(grid);
        } else if (q.tipoPergunta === 2 || q.tipoPergunta === 3) {
            if (bossHelperBar) bossHelperBar.classList.remove("hidden");

            const input = document.createElement("input");
            input.type = "text";
            input.className = "ide-input";
            input.placeholder = "Digite a instrução Java aqui...";
            input.autocomplete = "off";
            input.spellcheck = false;

            if (window.ArenaIHC) {
                ArenaIHC.bindCapsLockWarning(input, capsWarningQuiz);
            }

            input.oninput = (e) => {
                selectedAnswer = e.target.value;
                syntaxWarningAcknowledged = false;
                if (bossSyntaxWarning) bossSyntaxWarning.classList.add("hidden");
                setConfirmEnabled(selectedAnswer.trim() !== "");
            };
            answerArea.appendChild(input);
            setTimeout(() => input.focus(), 50);
        }

        maxTimeQuestion = (q.tipoPergunta !== 1 || q.codigoSnippet) ? 90 : 45;
        startTimer(maxTimeQuestion);
    }

    if (btnShowHint) {
        btnShowHint.addEventListener("click", () => {
            const q = questions[currentIndex];
            if (!q || !bossHintBox) return;
            const dicaTexto = q.feedbackErro
                ? `<i class="ph-fill ph-lightbulb text-cyan"></i> <strong>Dica do Compilador:</strong> ${q.feedbackErro}`
                : `<i class="ph-fill ph-lightbulb text-cyan"></i> <strong>Dica do Compilador:</strong> Verifique os parênteses, nomes exatos de métodos em camelCase e o ponto e vírgula (;) ao final.`;
            bossHintBox.innerHTML = dicaTexto;
            bossHintBox.classList.toggle("hidden");
            if (window.ArenaIHC) ArenaIHC.playSound("click");
        });
    }

    function selectOption(btnElement, optionId) {
        document.querySelectorAll(".option-btn, .btn-alt").forEach(b => b.classList.remove("selected"));
        btnElement.classList.add("selected");
        selectedAnswer = optionId;
        setConfirmEnabled(true);
        if (window.ArenaIHC) ArenaIHC.playSound("click");
    }

    function startTimer(duration) {
        clearInterval(timerInterval);
        timeLeft = duration;
        atualizarVisorTimer();
        retomarTimer();
    }

    function retomarTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            atualizarVisorTimer();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                processarResposta(true);
            }
        }, 1000);
    }

    function atualizarVisorTimer() {
        if (timerSeconds) timerSeconds.innerText = `${Math.max(0, timeLeft)}s`;
        if (timerBar) {
            timerBar.style.width = ((timeLeft / maxTimeQuestion) * 100) + "%";
            timerBar.classList.toggle("danger", timeLeft <= 10);
        }
    }

    function verificarSintaxePreventiva(q, codigoDigitado) {
        if (q.tipoPergunta === 1 || syntaxWarningAcknowledged) return null;

        const limpo = (codigoDigitado || "").trim();
        const abrePar = (limpo.match(/\(/g) || []).length;
        const fechaPar = (limpo.match(/\)/g) || []).length;

        if (abrePar !== fechaPar) {
            return `<i class="ph-fill ph-warning"></i> <strong>Aviso Preventivo do Compilador:</strong> Há parênteses <code>( )</code> abertos sem fechar. Corrija abaixo ou clique em Confirmar novamente para enviar mesmo assim.`;
        }

        const ehDeclaracaoBloco = /^(for\b|extends\b|implements\b)/i.test(limpo);
        if (!ehDeclaracaoBloco && !limpo.endsWith(";")) {
            return `<i class="ph-fill ph-warning"></i> <strong>Aviso Preventivo do Compilador:</strong> Instruções em Java costumam terminar com ponto e vírgula <code>(;)</code>. Adicione o <code>;</code> ou clique em Confirmar novamente para submeter.`;
        }

        return null;
    }

    btnConfirm.addEventListener("click", (e) => {
        e.preventDefault();
        if (btnConfirm.disabled) return;

        const q = questions[currentIndex];
        const avisoSintaxe = verificarSintaxePreventiva(q, selectedAnswer);

        if (avisoSintaxe && bossSyntaxWarning) {
            syntaxWarningAcknowledged = true;
            bossSyntaxWarning.innerHTML = avisoSintaxe;
            bossSyntaxWarning.classList.remove("hidden");
            if (window.ArenaIHC) ArenaIHC.playSound("click");
            return;
        }

        processarResposta(false);
    });

    function processarResposta(timeOut = false) {
        clearInterval(timerInterval);
        setConfirmEnabled(false);
        btnConfirm.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Compilando...`;

        const q = questions[currentIndex];
        const jaEstavaDominada = (q.statusQuestao === 20);
        let isCorrect = false;

        if (!timeOut) {
            if (q.tipoPergunta === 1) {
                isCorrect = (selectedAnswer === q.respostaCorreta);
            } else if (q.tipoPergunta === 2 || q.tipoPergunta === 3) {
                let padrao = q.validacaoRegex || "";
                let flags = padrao.startsWith("(?i)") ? "i" : "";
                padrao = padrao.replace("(?i)", "");
                const regex = new RegExp(padrao, flags);
                isCorrect = regex.test((selectedAnswer || "").trim());
            }
        }

        const xpDaQuestao = isCorrect ? q.xpRecompensa : 0;
        const cargoAnterior = window.ArenaIHC ? ArenaIHC.limparEmojis(sessionStorage.getItem("cargoUsuario")) : sessionStorage.getItem("cargoUsuario");

        q.statusQuestao = isCorrect ? 20 : (jaEstavaDominada ? 20 : 10);
        q.jaRespondida = true;

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
            btnConfirm.innerHTML = "Confirmar Resposta [Enter]";
            const foiDuplicado = (data.status === "DUPLICADO" || jaEstavaDominada);

            if (data.sucesso) {
                if (!foiDuplicado) {
                    if (isCorrect) earnedXP += xpDaQuestao;
                    else earnedXP -= 5;
                }

                const novoCargoLimpo = window.ArenaIHC ? ArenaIHC.limparEmojis(data.novoCargo) : data.novoCargo;
                sessionStorage.setItem("xpUsuario", data.novoXp);
                sessionStorage.setItem("cargoUsuario", novoCargoLimpo);
                if (elXp) elXp.innerText = data.novoXp;
                if (elCargo && window.ArenaIHC) {
                    ArenaIHC.renderizarCargo(elCargo, novoCargoLimpo, true);
                }

                if (cargoAnterior && novoCargoLimpo && cargoAnterior !== novoCargoLimpo) {
                    if (window.ArenaIHC) ArenaIHC.playSound("levelup");
                }
            }

            showFeedback(isCorrect, q.feedbackErro, xpDaQuestao, foiDuplicado);
        })
        .catch(err => {
            console.error("Erro ao salvar progresso:", err);
            btnConfirm.innerHTML = "Confirmar Resposta [Enter]";
            showFeedback(isCorrect, q.feedbackErro, xpDaQuestao, jaEstavaDominada);
        });
    }

    function showFeedback(isCorrect, explanation, xp, foiRevisaoSemXp = false) {
        feedbackModal.classList.remove("hidden");
        const modalContent = feedbackModal.querySelector(".modal-content");
        if (modalContent) modalContent.classList.remove("success", "error", "shake");

        const titleEl = document.getElementById("feedback-title");
        const expEl = document.getElementById("feedback-explanation");

        if (isCorrect) {
            if (window.ArenaIHC) ArenaIHC.playSound("success");
            if (modalContent) modalContent.classList.add("success");

            if (foiRevisaoSemXp) {
                titleEl.innerHTML = `<span class="feedback-icon-badge success-badge"><i class="ph-bold ph-check-circle"></i></span> COMPILAÇÃO CORRETA! <span class="text-cyan fira-code">(Revisão: +0 XP)</span>`;
                expEl.innerHTML = `Excelente! Como você já havia dominado esta questão anteriormente, seu XP já estava garantido no servidor.<br><br><strong>Revisão técnica:</strong> ${explanation || "Conceito validado com sucesso."}`;
            } else {
                titleEl.innerHTML = `<span class="feedback-icon-badge success-badge"><i class="ph-bold ph-check-circle"></i></span> ACERTOU! <span class="text-cyan fira-code">+${xp} XP</span>`;
                expEl.innerHTML = `Excelente lógica de compilação!<br><br><strong>Nota técnica:</strong> ${explanation || "Avançando para a próxima instrução..."}`;
            }
            titleEl.style.color = "#00ffaa";
        } else {
            if (window.ArenaIHC) ArenaIHC.playSound("error");
            if (modalContent) {
                modalContent.classList.add("error");
                if (!window.ArenaIHC || ArenaIHC.getPrefs().shakeEnabled) {
                    modalContent.classList.add("shake");
                }
            }
            const penalidadeTxt = foiRevisaoSemXp ? "(Modo Revisão: 0 XP descontados)" : "-5 XP";
            titleEl.innerHTML = `<span class="feedback-icon-badge error-badge"><i class="ph-fill ph-bug-beetle"></i></span> BUG ENCONTRADO! <span style="color:#ff3366; font-family: monospace;">${penalidadeTxt}</span>`;
            titleEl.style.color = "#ff3366";
            expEl.innerHTML = explanation || "Você errou a sintaxe.";
        }
    }

    btnNextQuestion.addEventListener("click", (e) => {
        e.preventDefault();
        feedbackModal.classList.add("hidden");
        currentIndex++;

        if (currentIndex < questions.length) {
            renderQuestion();
        } else {
            mostrarResumoFinal();
        }
    });

    function mostrarResumoFinal() {
        clearInterval(timerInterval);

        const activeSection = document.getElementById("active-quiz-section");
        if (activeSection) activeSection.classList.add("hidden");

        const summary = document.getElementById("summary-section");
        if (!summary) return;
        summary.classList.remove("hidden");

        const totalModulo = allModuleQuestions.length;
        const acertosReais = allModuleQuestions.filter(q => q.statusQuestao === 20).length;
        const errosReais = allModuleQuestions.filter(q => q.statusQuestao === 10).length;
        const notaDeCorte = Math.ceil(totalModulo * 0.6);
        const percentual = totalModulo > 0 ? Math.round((acertosReais / totalModulo) * 100) : 0;
        const atingiu60 = acertosReais >= notaDeCorte;

        let xpExibido = earnedXP;
        if (xpExibido === 0 && acertosReais > 0) {
            const xpAcertos = allModuleQuestions.filter(q => q.statusQuestao === 20).reduce((acc, q) => acc + q.xpRecompensa, 0);
            xpExibido = Math.max(0, xpAcertos - (errosReais * 5));
        }

        document.getElementById("final-xp").innerText = (xpExibido >= 0 ? "+ " : "") + xpExibido;
        document.getElementById("final-correct").innerText = `${acertosReais}/${totalModulo}`;
        document.getElementById("final-errors").innerText = errosReais;

        const tituloResumo = summary.querySelector("h1, h2");
        const subtituloResumo = summary.querySelector("p");
        if (tituloResumo) {
            if (atingiu60) {
                tituloResumo.innerHTML = `<i class="ph-fill ph-trophy icon-gold"></i> Módulo Concluído!`;
                tituloResumo.style.color = "#00f3ff";
            } else {
                tituloResumo.innerHTML = `<i class="ph-fill ph-warning-octagon text-red"></i> Nota Insuficiente`;
                tituloResumo.style.color = "#ff3366";
            }
        }
        if (subtituloResumo) {
            subtituloResumo.innerText = `Aproveitamento atual no módulo: ${percentual}% (Mínimo exigido: 60% / ${notaDeCorte} acertos).`;
        }

        const ul = document.getElementById("improvement-list");
        if (ul) {
            ul.innerHTML = "";
            if (atingiu60) {
                ul.innerHTML += `<li style="color: #00ffaa; margin-bottom: 8px;"><i class="ph-fill ph-lock-key-open"></i> <strong>Próximo módulo desbloqueado!</strong> Você acertou ${acertosReais} de ${totalModulo} questões (${percentual}%), superando a meta de 60%!</li>`;
                if (errosReais === 0) {
                    ul.innerHTML += `<li style="color: #00f3ff;"><i class="ph-fill ph-seal-check"></i> <strong>Domínio Perfeito (100%):</strong> Nenhuma questão pendente neste módulo!</li>`;
                } else {
                    ul.innerHTML += `<li style="color: #ffd700;"><i class="ph-fill ph-wrench"></i> Você ainda deixou <strong>${errosReais} questão(ões) com erro</strong>. Você já pode avançar ou revisar as que errou para buscar os 100%!</li>`;
                }
            } else {
                const faltamAcertos = notaDeCorte - acertosReais;
                ul.innerHTML += `<li style="color: #ff3366; margin-bottom: 8px;"><i class="ph-fill ph-lock-key"></i> <strong>Próximo módulo bloqueado:</strong> Você acertou ${acertosReais} de ${totalModulo} questões (${percentual}%). É necessário atingir pelo menos <strong>60% (${notaDeCorte} acertos)</strong>.</li>`;
                ul.innerHTML += `<li style="color: #ffd700;"><i class="ph-bold ph-arrows-clockwise"></i> Clique em <em>"Revisar Questões que Errei"</em> abaixo para refazer as ${errosReais} perguntas incorretas (faltam +${faltamAcertos} acertos)!</li>`;
            }
        }

        let actionsDiv = document.getElementById("summary-actions-container");
        const btnOriginal = summary.querySelector(".summary-footer button");
        if (!actionsDiv) {
            actionsDiv = document.createElement("div");
            actionsDiv.id = "summary-actions-container";
            actionsDiv.style.display = "flex";
            actionsDiv.style.gap = "12px";
            actionsDiv.style.justifyContent = "center";
            actionsDiv.style.flexWrap = "wrap";
            actionsDiv.style.marginTop = "20px";
            if (btnOriginal) btnOriginal.style.display = "none";
            summary.appendChild(actionsDiv);
        }
        actionsDiv.innerHTML = "";

        if (errosReais > 0) {
            const btnRevisar = document.createElement("button");
            btnRevisar.type = "button";
            btnRevisar.className = atingiu60 ? "btn-alt" : "btn-run pulse-animation";
            btnRevisar.style.padding = "12px 22px";
            btnRevisar.innerHTML = `<i class="ph-bold ph-arrows-clockwise"></i> Revisar Questões que Errei (${errosReais})`;
            btnRevisar.onclick = () => iniciarRevisaoDeErros();
            actionsDiv.appendChild(btnRevisar);
        } else {
            const btnReverTudo = document.createElement("button");
            btnReverTudo.type = "button";
            btnReverTudo.className = "btn-alt";
            btnReverTudo.style.padding = "12px 22px";
            btnReverTudo.innerHTML = `<i class="ph-bold ph-arrows-clockwise"></i> Praticar Novamente (Modo Revisão)`;
            btnReverTudo.onclick = () => iniciarRevisaoCompletaModulo();
            actionsDiv.appendChild(btnReverTudo);
        }

        if (atingiu60 && moduloId < 10) {
            const btnProximo = document.createElement("button");
            btnProximo.type = "button";
            btnProximo.className = "btn-run pulse-animation";
            btnProximo.style.padding = "12px 24px";
            btnProximo.innerHTML = `<i class="ph-fill ph-play"></i> Seguir para o Módulo ${moduloId + 1}`;
            btnProximo.onclick = () => {
                window.location.href = `quiz.html?moduloId=${moduloId + 1}`;
            };
            actionsDiv.appendChild(btnProximo);
        }

        const btnTrilha = document.createElement("button");
        btnTrilha.type = "button";
        btnTrilha.className = "btn-alt";
        btnTrilha.style.padding = "12px 22px";
        btnTrilha.innerText = "Voltar para a Trilha";
        btnTrilha.onclick = () => {
            window.location.href = "trilha.html";
        };
        actionsDiv.appendChild(btnTrilha);
    }

    document.addEventListener("keydown", (event) => {
        const activeSection = document.getElementById("active-quiz-section");
        const quizVisivel = activeSection && !activeSection.classList.contains("hidden");
        const modalFeedbackFechado = feedbackModal.classList.contains("hidden");
        const modalSaidaAberto = exitConfirmModal && !exitConfirmModal.classList.contains("hidden");
        const modalHelpAberto = document.getElementById("ihc-help-modal") && !document.getElementById("ihc-help-modal").classList.contains("hidden");

        if (modalHelpAberto) return;

        if (modalSaidaAberto) {
            if (event.key === "Escape" || event.key === "Enter") {
                event.preventDefault();
                fecharModalSaida();
            }
            return;
        }

        if (quizVisivel && modalFeedbackFechado) {
            if (event.key === "Escape") {
                event.preventDefault();
                abrirModalSaida();
                return;
            }
            if (document.activeElement && document.activeElement.classList.contains("ide-input")) {
                if (event.key === "Enter" && !btnConfirm.disabled) {
                    event.preventDefault();
                    btnConfirm.click();
                }
                return;
            }
            if (['1', '2', '3', '4'].includes(event.key)) {
                const index = parseInt(event.key, 10) - 1;
                const options = document.querySelectorAll(".option-btn, .btn-alt");
                if (options[index]) options[index].click();
            }
            if (event.key === "Enter" && !btnConfirm.disabled) {
                event.preventDefault();
                btnConfirm.click();
            }
        } else if (!modalFeedbackFechado && event.key === "Enter") {
            event.preventDefault();
            btnNextQuestion.click();
        }
    });
});