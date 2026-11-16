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

    if (window.ArenaIHC) {
        ArenaIHC.bindCapsLockWarning(inputSenha, capsWarning);
    }

    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
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

            btnSubmit.disabled = true;
            btnSubmit.textContent = "Conectando ao Servidor...";

            fetch("https://arena-java-api.onrender.com/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                btnSubmit.disabled = false;
                btnSubmit.textContent = modoAtual === "login" ? "Executar Login" : "Cadastrar Calouro";

                if (data.sucesso) {
                    sessionStorage.clear();
                    sessionStorage.setItem("emailUsuario", data.email);
                    sessionStorage.setItem("nomeUsuario", data.nome);
                    sessionStorage.setItem("cargoUsuario", data.cargo);
                    sessionStorage.setItem("xpUsuario", data.xp);
                    sessionStorage.setItem("ofensivaUsuario", data.ofensiva || 0);
                    sessionStorage.setItem("avatarUsuario", data.avatar || data.nome);
                    window.location.href = "dashboard.html";
                } else {
                    feedbackMsg.textContent = data.mensagem || "Erro na autenticação.";
                    feedbackMsg.classList.remove("hidden");
                }
            })
            .catch(() => {
                btnSubmit.disabled = false;
                btnSubmit.textContent = modoAtual === "login" ? "Executar Login" : "Cadastrar Calouro";
                feedbackMsg.textContent = "Falha de conexão com o servidor Tomcat.";
                feedbackMsg.classList.remove("hidden");
            });
        });
    }
});