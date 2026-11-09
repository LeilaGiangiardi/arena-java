document.addEventListener("DOMContentLoaded", () => {
    const emailUsuario = sessionStorage.getItem("emailUsuario");
    document.getElementById("user-xp").innerText = sessionStorage.getItem("xpUsuario") || 0;

    if (!emailUsuario || emailUsuario === "undefined") {
        window.location.href = "index.html"; 
        return;
    }

    carregarTrilha(emailUsuario);
});

let modulosGlobais = [];

function carregarTrilha(email) {
    const url = `http://localhost:8080/backend/api/trilha?email=${encodeURIComponent(email)}`;
    
    // Adicione este console.log para vermos o que o Java está respondendo:
    console.log("Buscando módulos na URL:", url);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error("Erro HTTP:", response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Resposta da API:", data); // Isso vai mostrar se os módulos vieram
            if (data.sucesso) {
                modulosGlobais = data.modulos;
                renderizarCards(modulosGlobais);
            } else {
                console.error("A API retornou sucesso: false");
            }
        })
        .catch(error => console.error("Erro na requisição Fetch:", error));
}

function renderizarCards(modulos) {
    const container = document.getElementById("modules-container");
    container.innerHTML = "";

    modulos.forEach(mod => {
        const card = document.createElement("div");
        card.className = `module-card ${mod.bloqueado ? 'locked' : ''} ${mod.concluido ? 'completed' : ''}`;
        
        let overlayHTML = "";
        if (mod.bloqueado) {
            overlayHTML = `<div class="card-overlay"><i class="ph ph-lock-key"></i><span>Restrito</span></div>`;
        } else if (mod.concluido) {
            overlayHTML = `<div class="card-overlay-success"><i class="ph ph-check-circle"></i></div>`;
        }

        // Para as imagens do card, usamos um placeholder cyberpunk genérico baseado no ID para dar o visual "Steam"
        card.innerHTML = `
            <img src="https://picsum.photos/seed/${mod.id + 100}/300/400" alt="Capa" class="card-cover">
            ${overlayHTML}
            <div class="card-info">
                <h3>${mod.nome}</h3>
                <div class="card-progress">
                    <div class="timer-container" style="height: 6px;">
                        <div class="timer-bar" style="width: ${(mod.questoesRespondidas / (mod.totalQuestoes || 1)) * 100}%;"></div>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener("click", () => abrirPainelModulo(mod));
        container.appendChild(card);
    });
}

// Controle do Painel Lateral
const sidePanel = document.getElementById("module-side-panel");
const overlay = document.getElementById("panel-overlay");
const btnClosePanel = document.getElementById("btn-close-panel");

function abrirPainelModulo(mod) {
    document.getElementById("panel-title").innerText = mod.nome;
    document.getElementById("panel-desc").innerText = mod.descricao || "Sem descrição nos registros do sistema.";
    document.getElementById("panel-xp-bonus").innerText = mod.xpBonus;
    
    const porcentagem = (mod.questoesRespondidas / (mod.totalQuestoes || 1)) * 100;
    document.getElementById("panel-progress-text").innerText = `${mod.questoesRespondidas}/${mod.totalQuestoes}`;
    document.getElementById("panel-progress-bar").style.width = `${porcentagem}%`;

    const badge = document.getElementById("panel-status-badge");
    const btnStart = document.getElementById("btn-start-module");

    if (mod.bloqueado) {
        badge.innerText = "BLOQUEADO";
        badge.className = "badge bg-red";
        btnStart.innerText = "ACESSO NEGADO";
        btnStart.disabled = true;
        btnStart.className = "btn-alt disabled";
    } else if (mod.concluido) {
        badge.innerText = "CONCLUÍDO";
        badge.className = "badge bg-green";
        btnStart.innerText = "REVISAR MISSÃO";
        btnStart.disabled = false;
        btnStart.className = "btn-alt";
    } else {
        badge.innerText = "EM ANDAMENTO";
        badge.className = "badge xp-badge";
        btnStart.innerText = mod.questoesRespondidas > 0 ? "CONTINUAR MISSÃO" : "INICIAR MISSÃO";
        btnStart.disabled = false;
        btnStart.className = "btn-run pulse-animation";
    }

    // Ação do Botão
    btnStart.onclick = () => {
        if (!mod.bloqueado) window.location.href = `quiz.html?moduloId=${mod.id}`;
    };

    sidePanel.classList.remove("closed");
    overlay.classList.remove("hidden");
}

function fecharPainel() {
    sidePanel.classList.add("closed");
    overlay.classList.add("hidden");
}

btnClosePanel.addEventListener("click", fecharPainel);
overlay.addEventListener("click", fecharPainel);