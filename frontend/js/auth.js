document.addEventListener("DOMContentLoaded", () => {
    // Referências da Tela Inicial
    const btnRun = document.getElementById("btn-run");
    const modal = document.getElementById("auth-modal");
    const btnClose = document.getElementById("btn-close");

    // Referências das Abas e Formulário
    const tabLogin = document.getElementById("tab-login");
    const tabCadastro = document.getElementById("tab-cadastro");
    const authForm = document.getElementById("auth-form");
    const nomeGroup = document.getElementById("nome-group");
    const nomeInput = document.getElementById("nome");
    const btnSubmit = document.getElementById("btn-submit");
    const errorMsg = document.getElementById("error-msg");

    let isLogin = true;
    const API_URL = "http://localhost:8080/backend/api/auth";

    // === FUNÇÕES DE ABRIR/FECHAR O MODAL ===
    const openModal = () => {
        modal.classList.remove("hidden");
        errorMsg.classList.add("hidden"); // Limpa erros antigos
    };
    const closeModal = () => modal.classList.add("hidden");

    if (btnRun) btnRun.addEventListener("click", openModal);
    if (btnClose) btnClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

    // Atalhos de teclado originais
    document.addEventListener("keydown", (e) => {
        if (e.shiftKey && e.key === "F10") {
            e.preventDefault();
            openModal();
        }
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
            closeModal();
        }
    });

    // === FUNÇÕES DE ALTERNAR ABAS ===
    const switchToLogin = () => {
        isLogin = true;
        tabLogin.classList.add("active");
        tabCadastro.classList.remove("active");
        nomeGroup.classList.add("hidden");
        nomeInput.removeAttribute("required");
        btnSubmit.innerText = "ENTRAR";
        errorMsg.classList.add("hidden");
    };

    const switchToCadastro = () => {
        isLogin = false;
        tabCadastro.classList.add("active");
        tabLogin.classList.remove("active");
        nomeGroup.classList.remove("hidden");
        nomeInput.setAttribute("required", "true");
        btnSubmit.innerText = "CADASTRAR";
        errorMsg.classList.add("hidden");
    };

    tabLogin.addEventListener("click", switchToLogin);
    tabCadastro.addEventListener("click", switchToCadastro);

    // === ENVIO DOS DADOS PARA O JAVA (API) ===
    authForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const emailValue = document.getElementById("email").value;
        const senhaValue = document.getElementById("senha").value;

        // Se o usuário clicar em Entrar sem digitar nada, bloqueia aqui mesmo e mostra o erro curto
        if (isLogin && (!emailValue || !senhaValue)) {
            errorMsg.innerText = "⚠️ Credenciais inválidas.";
            errorMsg.style.color = "var(--error)"; 
            errorMsg.classList.remove("hidden");
            return; 
        }
        // Se o usuário tentar Cadastrar com campos em branco, bloqueia
        if (!isLogin && (!emailValue || !senhaValue || !nomeInput.value.trim())) {
            errorMsg.innerText = "⚠️ Preencha todos os campos para cadastrar.";
            errorMsg.style.color = "var(--error)"; 
            errorMsg.classList.remove("hidden");
            return; 
        }

        const payload = {
            acao: isLogin ? "login" : "cadastrar",
            email: emailValue,
            senha: senhaValue
        };

        if (!isLogin) {
            payload.nome = nomeInput.value;
        }

        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro HTTP: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.sucesso) {
                sessionStorage.setItem("emailUsuario", data.email);
                sessionStorage.setItem("nomeUsuario", data.nome);
                sessionStorage.setItem("cargoUsuario", data.cargo);
                sessionStorage.setItem("xpUsuario", data.xp);

                // Mostra a mensagem de sucesso (verde/azul) vinda do Java
                errorMsg.innerText = "✅ " + data.mensagem;
                errorMsg.style.color = "var(--cyan)"; 
                errorMsg.classList.remove("hidden");

                // Espera 1.5 segundos antes de jogar pra Dashboard para o usuário ver a mensagem
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1500);

            } else {
                // Força o texto para ser simples e direto, conforme pedido
                if (isLogin) {
                    errorMsg.innerText = "⚠️ Credenciais inválidas.";
                } else {
                    errorMsg.innerText = "⚠️ " + data.mensagem; // Mantém a mensagem do Java pro cadastro
                }
                
                errorMsg.style.color = "var(--error)"; 
                errorMsg.classList.remove("hidden");
            }
        })
        .catch(error => {
            // Captura de falhas gerais de rede
            errorMsg.innerText = "⚠️ Falha ao tentar conectar. O Tomcat está ligado?";
            errorMsg.style.color = "var(--error)";
            errorMsg.classList.remove("hidden");
            console.error("Detalhes do erro:", error);
        });

    });
});