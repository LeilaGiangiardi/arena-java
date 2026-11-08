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

        const payload = {
            acao: isLogin ? "login" : "cadastrar",
            email: document.getElementById("email").value,
            senha: document.getElementById("senha").value
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
            // Garante que o Front-end entenda se o Java der erro de servidor
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

                window.location.href = "dashboard.html";
            } else {
                // AQUI ESTAVA O PROBLEMA: 
                // Se der erro, mostre o erro e PARE.
                errorMsg.innerText = "⚠️ " + data.mensagem;
                errorMsg.classList.remove("hidden");
            }
        })
        .catch(error => {
            // Captura de falhas gerais de rede
            errorMsg.innerText = "⚠️ Falha ao tentar conectar. O Tomcat está ligado?";
            errorMsg.classList.remove("hidden");
            console.error("Detalhes do erro:", error);
        });

    });
});