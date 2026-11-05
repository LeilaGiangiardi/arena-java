document.addEventListener("DOMContentLoaded", () => {
    // Referências aos elementos do DOM
    const btnRun = document.getElementById("btn-run");
    const modal = document.getElementById("auth-modal");
    const btnClose = document.getElementById("btn-close");
    
    const tabLogin = document.getElementById("tab-login");
    const tabCadastro = document.getElementById("tab-cadastro");
    const formLogin = document.getElementById("form-login");
    const formCadastro = document.getElementById("form-cadastro");

    // === FUNÇÕES DE ABRIR E FECHAR O MODAL ===
    const openModal = () => modal.classList.remove("hidden");
    const closeModal = () => modal.classList.add("hidden");

    btnRun.addEventListener("click", openModal);
    btnClose.addEventListener("click", closeModal);

    // Fechar clicando fora da caixa do modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Toque de IHM: Permitir abrir usando o atalho Shift + F10 do teclado
    document.addEventListener("keydown", (e) => {
        if (e.shiftKey && e.key === "F10") {
            e.preventDefault();
            openModal();
        }
        // Fechar com ESC
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
            closeModal();
        }
    });

    // === FUNÇÕES DE ALTERNAR ABAS (Login / Cadastro) ===
    tabLogin.addEventListener("click", () => {
        tabLogin.classList.add("active");
        tabCadastro.classList.remove("active");
        
        formLogin.classList.add("active-form");
        formLogin.classList.remove("hidden-form");
        
        formCadastro.classList.add("hidden-form");
        formCadastro.classList.remove("active-form");
    });

    tabCadastro.addEventListener("click", () => {
        tabCadastro.classList.add("active");
        tabLogin.classList.remove("active");
        
        formCadastro.classList.add("active-form");
        formCadastro.classList.remove("hidden-form");
        
        formLogin.classList.add("hidden-form");
        formLogin.classList.remove("active-form");
    });

    // === (FUTURO) CHAMADAS PARA O BACK-END ===
    /* 
      Aqui futuramente vamos capturar o evento de submit ('submit') 
      dos formulários e usar a API Fetch (fetch('/backend/api/login', {...}))
      para se comunicar com as Servlets Java.
    */
});