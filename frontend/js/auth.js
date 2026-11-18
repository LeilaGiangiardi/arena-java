document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("auth-modal");
    const btnOpen = document.getElementById("btn-open-modal");
    const btnClose = document.getElementById("btn-close-modal");
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const nomeGroup = document.getElementById("nome-group");
    const btnSubmit = document.getElementById("btn-submit-auth");
    const authForm = document.getElementById("auth-form");
    const feedbackMsg = document.getElementById("feedback-msg");

    const inputNome = document.getElementById("nome");
    const inputEmail = document.getElementById("email");
    const inputSenha = document.getElementById("senha");
    const capsWarning = document.getElementById("caps-warning-login");

    const creditsModal = document.getElementById("credits-modal");
    const btnOpenCredits = document.getElementById("btn-open-credits");
    const btnCloseCredits = document.getElementById("btn-close-credits");
    const btnOkCredits = document.getElementById("btn-ok-credits");

    let modoAtual = "login";
    let loadingInterval = null;
    let slowServerTimeout = null;
    let abortControllerAtual = null;
    let bancoAquecido = false;

    // Acorda tanto o Render quanto o banco Neon assim que a página abre
    function aquecerServidorEBanco() {
        if (bancoAquecido) return;
        bancoAquecido = true;

        fetch("https://arena-java-api.onrender.com/api/dashboard?email=warmup@arenajava.local", {
            method: "GET",
            mode: "cors",
            cache: "no-store"
        }).catch(() => {
            bancoAquecido = false;
        });
    }

    aquecerServidorEBanco();

    if (window.ArenaIHC) {
        ArenaIHC.bindCapsLockWarning(inputSenha, capsWarning);
    }

    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
            aquecerServidorEBanco();
            modal.classList.remove("hidden");
            setTimeout(() => {
                if (modoAtual === "cadastrar" && inputNome) inputNome.focus();
                else if (inputEmail) inputEmail.focus();
            }, 60);
        });
    }

    if (btnClose) {
        btnClose.addEventListener("click", () => modal.classList.add("hidden"));
    }

    const fecharCreditos = () => {
        if (creditsModal) creditsModal.classList.add("hidden");
    };

    if (btnOpenCredits && creditsModal) {
        btnOpenCredits.addEventListener("click", () => {
            creditsModal.classList.remove("hidden");
        });
    }
    if (btnCloseCredits) btnCloseCredits.addEventListener("click", fecharCreditos);
    if (btnOkCredits) btnOkCredits.addEventListener("click", fecharCreditos);

    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
        if (e.target === creditsModal) fecharCreditos();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (modal && !modal.classList.contains("hidden")) modal.classList.add("hidden");
            if (creditsModal && !creditsModal.classList.contains("hidden")) fecharCreditos();
        }
    });

    function iniciarAnimacaoBotao() {
        pararAnimacaoBotao();
        let passo = 1;
        let textoBase = "Conectando ao Servidor";
        btnSubmit.disabled = true;

        // Se o servidor estiver acordando de hibernação (> 6s), avisa o usuário para não achar que travou
        slowServerTimeout = setTimeout(() => {
            textoBase = "Acordando servidor (aguarde)";
        }, 6000);

        const renderizarFrame = () => {
            const pontos = ".".repeat(passo);
            btnSubmit.innerHTML = `<i class="ph-bold ph-circle-notch arena-spinner-icon"></i>${textoBase}<span class="arena-dots">${pontos}</span>`;
            passo = (passo % 3) + 1;
        };

        renderizarFrame();
        loadingInterval = setInterval(renderizarFrame, 380);
    }

    function pararAnimacaoBotao() {
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }
        if (slowServerTimeout) {
            clearTimeout(slowServerTimeout);
            slowServerTimeout = null;
        }
        btnSubmit.disabled = false;
        btnSubmit.textContent = modoAtual === "login" ? "Executar Login" : "Cadastrar Calouro";
    }

    if (tabLogin && tabRegister) {
        tabLogin.addEventListener("click", () => {
            if (abortControllerAtual) abortControllerAtual.abort();
            modoAtual = "login";
            pararAnimacaoBotao();
            tabLogin.classList.add("active");
            tabRegister.classList.remove("active");
            nomeGroup.classList.add("hidden");
            if (inputNome) inputNome.required = false;
            feedbackMsg.classList.add("hidden");
            setTimeout(() => inputEmail && inputEmail.focus(), 50);
        });

        tabRegister.addEventListener("click", () => {
            if (abortControllerAtual) abortControllerAtual.abort();
            modoAtual = "cadastrar";
            pararAnimacaoBotao();
            tabRegister.classList.add("active");
            tabLogin.classList.remove("active");
            nomeGroup.classList.remove("hidden");
            if (inputNome) inputNome.required = true;
            feedbackMsg.classList.add("hidden");
            setTimeout(() => inputNome && inputNome.focus(), 50);
        });
    }

    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            feedbackMsg.classList.add("hidden");

            // Remove espaços invisíveis colocados por corretores de celular (Chrome/Safari)
            const emailLimpo = (inputEmail.value || "").trim();
            const senhaValor = inputSenha.value || "";
            const nomeLimpo = inputNome ? inputNome.value.trim() : "";

            if (modoAtual === "cadastrar" && !nomeLimpo) {
                feedbackMsg.textContent = "Por favor, informe seu Nome ou Nickname.";
                feedbackMsg.classList.remove("hidden");
                return;
            }

            const payload = {
                acao: modoAtual,
                email: emailLimpo,
                senha: senhaValor,
                nome: nomeLimpo
            };

            if (abortControllerAtual) abortControllerAtual.abort();
            abortControllerAtual = new AbortController();

            iniciarAnimacaoBotao();

            fetch("https://arena-java-api.onrender.com/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: abortControllerAtual.signal
            })
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) {
                    if (loadingInterval) clearInterval(loadingInterval);
                    if (slowServerTimeout) clearTimeout(slowServerTimeout);
                    btnSubmit.innerHTML = `<i class="ph-bold ph-check-circle" style="margin-right: 6px;"></i>Acesso Liberado!`;

                    sessionStorage.clear();
                    sessionStorage.setItem("emailUsuario", data.email);
                    sessionStorage.setItem("nomeUsuario", data.nome);
                    sessionStorage.setItem("cargoUsuario", data.cargo);
                    sessionStorage.setItem("xpUsuario", data.xp);
                    sessionStorage.setItem("ofensivaUsuario", data.ofensiva || 0);
                    sessionStorage.setItem("avatarUsuario", data.avatar || data.nome);
                    window.location.href = "dashboard.html";
                } else {
                    pararAnimacaoBotao();
                    if (modoAtual === "login" && data.mensagem === "Credenciais inválidas.") {
                        feedbackMsg.textContent = "E-mail ou senha incorretos. Se for seu primeiro acesso, clique na aba 'Criar Conta' acima!";
                    } else {
                        feedbackMsg.textContent = data.mensagem || "Erro na autenticação.";
                    }
                    feedbackMsg.classList.remove("hidden");
                }
            })
            .catch((err) => {
                if (err.name === "AbortError") return;
                pararAnimacaoBotao();
                feedbackMsg.textContent = "O servidor estava hibernando e levou mais tempo para responder. Clique novamente para entrar!";
                feedbackMsg.classList.remove("hidden");
            });
        });
    }
});