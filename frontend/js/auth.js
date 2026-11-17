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

    // Elementos do Modal de Créditos
    const creditsModal = document.getElementById("credits-modal");
    const btnOpenCredits = document.getElementById("btn-open-credits");
    const btnCloseCredits = document.getElementById("btn-close-credits");
    const btnOkCredits = document.getElementById("btn-ok-credits");

    let modoAtual = "login";
    let loadingInterval = null;

    // Garante que a animação de giro funcione mesmo sem depender do style.css
    if (!document.getElementById("arena-spin-style")) {
        const style = document.createElement("style");
        style.id = "arena-spin-style";
        style.textContent = `
            @keyframes arenaSpin { to { transform: rotate(360deg); } }
            .arena-spinner-icon {
                display: inline-block;
                animation: arenaSpin 0.75s linear infinite;
                margin-right: 8px;
                vertical-align: -2px;
                font-size: 1.1em;
            }
            .arena-dots {
                display: inline-block;
                width: 1.6ch;
                text-align: left;
            }
        `;
        document.head.appendChild(style);
    }

    // PRÉ-AQUECIMENTO: Acorda o Render e o banco em segundo plano assim que a página abre
    function aquecerServidor() {
        fetch("https://arena-java-api.onrender.com/api/auth", {
            method: "OPTIONS",
            mode: "cors"
        }).catch(() => {});
    }
    aquecerServidor();

    if (window.ArenaIHC) {
        ArenaIHC.bindCapsLockWarning(inputSenha, capsWarning);
    }

    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
            aquecerServidor(); // Reforça o aquecimento quando o usuário abre o modal
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

    if (tabLogin && tabRegister) {
        tabLogin.addEventListener("click", () => {
            modoAtual = "login";
            tabLogin.classList.add("active");
            tabRegister.classList.remove("active");
            nomeGroup.classList.add("hidden");
            if (inputNome) inputNome.required = false;
            btnSubmit.textContent = "Executar Login";
            feedbackMsg.classList.add("hidden");
            setTimeout(() => inputEmail && inputEmail.focus(), 50);
        });

        tabRegister.addEventListener("click", () => {
            modoAtual = "cadastrar";
            tabRegister.classList.add("active");
            tabLogin.classList.remove("active");
            nomeGroup.classList.remove("hidden");
            if (inputNome) inputNome.required = true;
            btnSubmit.textContent = "Cadastrar Calouro";
            feedbackMsg.classList.add("hidden");
            setTimeout(() => inputNome && inputNome.focus(), 50);
        });
    }

    function iniciarAnimacaoBotao() {
        let passo = 1;
        btnSubmit.disabled = true;

        const renderizarFrame = () => {
            const pontos = ".".repeat(passo);
            btnSubmit.innerHTML = `<i class="ph-bold ph-circle-notch arena-spinner-icon"></i>Conectando ao Servidor<span class="arena-dots">${pontos}</span>`;
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
        btnSubmit.disabled = false;
        btnSubmit.textContent = modoAtual === "login" ? "Executar Login" : "Cadastrar Calouro";
    }

    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            feedbackMsg.classList.add("hidden");

            const payload = {
                acao: modoAtual,
                email: inputEmail.value.trim(),
                senha: inputSenha.value,
                nome: inputNome ? inputNome.value.trim() : ""
            };

            iniciarAnimacaoBotao();

            fetch("https://arena-java-api.onrender.com/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) {
                    if (loadingInterval) clearInterval(loadingInterval);
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
                    feedbackMsg.textContent = data.mensagem || "Erro na autenticação.";
                    feedbackMsg.classList.remove("hidden");
                }
            })
            .catch(() => {
                pararAnimacaoBotao();
                feedbackMsg.textContent = "Falha de conexão com o servidor Tomcat.";
                feedbackMsg.classList.remove("hidden");
            });
        });
    }
});