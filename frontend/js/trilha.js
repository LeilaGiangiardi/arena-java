document.addEventListener("DOMContentLoaded", () => {
    const emailUsuario = sessionStorage.getItem("emailUsuario");
    document.getElementById("user-xp").textContent = sessionStorage.getItem("xpUsuario") || 0;

    const elCargo = document.getElementById("user-cargo");
    if (elCargo) {
        const cargoSalvo = sessionStorage.getItem("cargoUsuario") || "Derrubador de Servidor";
        ArenaIHC.renderizarCargo(elCargo, cargoSalvo, true);
    }

    if (!emailUsuario || emailUsuario === "undefined") {
        window.location.href = "index.html";
        return;
    }

    carregarTrilha(emailUsuario);
});

const EMAIL_ADMIN = "admin@java.com";

const CARTUCHOS_CONFIG = {
    1:  { stage: "STAGE 01",   sub: "CPU & JVM",          tema: "cyan" },
    2:  { stage: "STAGE 02",   sub: "IF / ELSE",          tema: "pink" },
    3:  { stage: "STAGE 03",   sub: "LOOPS",              tema: "green" },
    4:  { stage: "STAGE 04",   sub: "STRINGS & FN",       tema: "gold" },
    5:  { stage: "STAGE 05",   sub: "CLASSES POO",        tema: "cyan" },
    6:  { stage: "STAGE 06",   sub: "ENCAPSULAMENTO",     tema: "orange" },
    7:  { stage: "STAGE 07",   sub: "DATE & ENUM",        tema: "teal" },
    8:  { stage: "STAGE 08",   sub: "HERANCA",            tema: "purple" },
    9:  { stage: "STAGE 09",   sub: "EXCEPTIONS",         tema: "red" },
    10: { stage: "FINAL BOSS", sub: "FILES & INTERFACES", tema: "cyan" }
};

function carregarTrilha(email) {
    const url = `http://localhost:8080/backend/api/trilha?email=${encodeURIComponent(email)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                const isAdmin = (email.trim().toLowerCase() === EMAIL_ADMIN);
                const modulos = data.modulos.map(mod => ({
                    ...mod,
                    bloqueado: isAdmin ? false : mod.bloqueado
                }));
                renderizarCards(modulos);
            }
        })
        .catch(error => console.error("Erro na requisição Fetch:", error));
}

function renderizarCards(modulos) {
    const container = document.getElementById("modules-container");
    const template = document.getElementById("module-card-template");
    container.textContent = "";

    modulos.forEach(mod => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector(".module-card");
        const cfg = CARTUCHOS_CONFIG[mod.id] || CARTUCHOS_CONFIG[1];

        const total = mod.totalQuestoes || 10;
        const respondidas = mod.questoesRespondidas || 0;
        const pct = Math.min(100, Math.round((respondidas / total) * 100));

        card.dataset.theme = cfg.tema;
        card.title = mod.nome;
        if (mod.bloqueado) card.classList.add("locked");
        if (mod.concluido) card.classList.add("completed");

        clone.querySelector(".retro-stage-banner").textContent = cfg.stage;
        clone.querySelector(".retro-pixel-art use").setAttribute("href", `#pixel-mod-${mod.id}`);
        clone.querySelector(".retro-sub-box").textContent = cfg.sub;

        clone.querySelector(".card-progress-num").textContent = `${respondidas}/${total}`;
        clone.querySelector(".card-bar-fill").style.setProperty("--progress", `${pct}%`);

        card.addEventListener("click", () => {
            if (window.ArenaIHC) ArenaIHC.playSound("click");
            abrirModalModulo(mod, cfg, pct);
        });
        container.appendChild(clone);
    });
}

const moduleModal = document.getElementById("module-modal");
const btnClosePanel = document.getElementById("btn-close-panel");
const btnCancelMission = document.getElementById("btn-cancel-mission");

function abrirModalModulo(mod, cfg, pct) {
    const modalCartridge = document.getElementById("modal-cartridge");
    modalCartridge.dataset.theme = cfg.tema;

    document.getElementById("panel-stage-tag").textContent = cfg.stage;
    document.getElementById("panel-pixel-use").setAttribute("href", `#pixel-mod-${mod.id}`);
    document.getElementById("panel-sub-tag").textContent = cfg.sub;

    document.getElementById("panel-title").textContent = mod.nome;
    document.getElementById("panel-desc").textContent = mod.descricao;
    document.getElementById("panel-xp-bonus").textContent = mod.xpBonus;
    document.getElementById("panel-progress-text").textContent = `${mod.questoesRespondidas} / ${mod.totalQuestoes}`;
    document.getElementById("panel-progress-bar").style.setProperty("--progress", `${pct}%`);

    const badge = document.getElementById("panel-status-badge");
    const btnStart = document.getElementById("btn-start-module");

    if (mod.bloqueado) {
        badge.innerHTML = `<i class="ph-fill ph-lock-key"></i> BLOQUEADO`;
        badge.className = "badge bg-red";
        btnStart.innerHTML = `<i class="ph-fill ph-lock-key"></i> ACESSO NEGADO`;
        btnStart.disabled = true;
        btnStart.className = "btn-alt disabled";
    } else if (mod.concluido) {
        badge.innerHTML = `<i class="ph-bold ph-check-circle"></i> CONCLUÍDO`;
        badge.className = "badge bg-green";
        btnStart.innerHTML = `<i class="ph-fill ph-arrows-clockwise"></i> REVISAR MISSÃO`;
        btnStart.disabled = false;
        btnStart.className = "btn-run";
    } else {
        badge.innerHTML = `<i class="ph-fill ph-lightning"></i> EM ANDAMENTO`;
        badge.className = "badge xp-badge";
        btnStart.innerHTML = mod.questoesRespondidas > 0
            ? `<i class="ph-fill ph-play"></i> CONTINUAR MISSÃO`
            : `<i class="ph-fill ph-play"></i> INICIAR MISSÃO`;
        btnStart.disabled = false;
        btnStart.className = "btn-run";
    }

    btnStart.onclick = () => {
        if (!mod.bloqueado) window.location.href = `quiz.html?moduloId=${mod.id}`;
    };

    moduleModal.classList.remove("hidden");
}

function fecharModal() {
    moduleModal.classList.add("hidden");
}

btnClosePanel.addEventListener("click", fecharModal);
btnCancelMission.addEventListener("click", fecharModal);
moduleModal.addEventListener("click", (e) => {
    if (e.target === moduleModal) fecharModal();
});

document.addEventListener("keydown", (e) => {
    if (!moduleModal.classList.contains("hidden")) {
        if (e.key === "Escape") fecharModal();
        if (e.key === "Enter") {
            const btnStart = document.getElementById("btn-start-module");
            if (btnStart && !btnStart.disabled) btnStart.click();
        }
    }
});