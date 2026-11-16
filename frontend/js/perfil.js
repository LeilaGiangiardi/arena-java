document.addEventListener("DOMContentLoaded", () => {
    const emailUsuario = sessionStorage.getItem("emailUsuario");
    if (!emailUsuario || emailUsuario === "undefined") {
        window.location.href = "index.html";
        return;
    }

    inicializarPerfil(emailUsuario);
});

const AVATARES_SERIOS = [
    "seed=Nebula&baseColor=8e24aa&eyes=eva&mouth=grill01&Top=bulb01",
    "seed=Vortex&baseColor=5e35b1&eyes=shade01&mouth=grill03&texture=camo01",
    "seed=Shadow&baseColor=311b92&eyes=robocop&mouth=grill02",
    "seed=CyberK&baseColor=00838f&eyes=eva&mouth=square01",
    "seed=Spectre&baseColor=263238&eyes=glow&mouth=grill03",
    "seed=Phantom&baseColor=4527a0&eyes=sensor&mouth=bite",
    "seed=Ronin&baseColor=b71c1c&eyes=robocop&mouth=grill01",
    "seed=Zero&baseColor=1a237e&eyes=shade01&mouth=square02",
    "seed=Titan&baseColor=37474f&eyes=eva&mouth=grill02",
    "seed=Nexus&baseColor=006064&eyes=robocop&mouth=grill03",
    "seed=Aegis&baseColor=4a148c&eyes=glow&mouth=square01",
    "seed=Wraith&baseColor=212121&eyes=shade01&mouth=grill01",
    "seed=Vector&baseColor=004d40&eyes=eva&mouth=grill03",
    "seed=Orion&baseColor=283593&eyes=sensor&mouth=grill02",
    "seed=Crimson&baseColor=880e4f&eyes=robocop&mouth=square01"
];

// Patentes 100% livres de Emojis, com Ícones Vetoriais Neon dedicados
const PATENTES = [
    { nome: "Derrubador de Servidor", minXp: 0, icone: "ph-fill ph-lightning", cor: "#ff3366" },
    { nome: "Criador de bugs", minXp: 200, icone: "ph-fill ph-bug-beetle", cor: "#00ff73" },
    { nome: "Caçador de Ponto e Vírgula (;)", minXp: 500, icone: "ph-fill ph-crosshair", cor: "#00f0ff" },
    { nome: "Refém da Inteligência Artificial", minXp: 1500, icone: "ph-fill ph-robot", cor: "#b84dff" },
    { nome: "Mestre do Stack Overflow", minXp: 3000, icone: "ph-fill ph-terminal-window", cor: "#ff9900" },
    { nome: "Compilador Humano", minXp: 5000, icone: "ph-fill ph-cpu", cor: "#ffd700" }
];

let avatarSelecionado = AVATARES_SERIOS[0];

function montarUrlAvatar(chaveAvatar) {
    if (!chaveAvatar) return `https://api.dicebear.com/7.x/bottts/svg?${AVATARES_SERIOS[0]}`;
    if (chaveAvatar.startsWith("http")) return chaveAvatar;
    if (chaveAvatar.includes("eyes=")) return `https://api.dicebear.com/7.x/bottts/svg?${chaveAvatar}`;
    const sementeLimpa = chaveAvatar.replace("bottts:", "");
    if (sementeLimpa === "Omega") return `https://api.dicebear.com/7.x/bottts/svg?${AVATARES_SERIOS[1]}`;
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sementeLimpa)}&eyes=eva,robocop,shade01&mouth=grill01,grill02,grill03`;
}

function inicializarPerfil(email) {
    const nome = sessionStorage.getItem("nomeUsuario") || "Jogador";
    const xp = parseInt(sessionStorage.getItem("xpUsuario") || "0", 10);
    const ofensiva = parseInt(sessionStorage.getItem("ofensivaUsuario") || "0", 10);
    const cargoSalvo = sessionStorage.getItem("cargoUsuario") || PATENTES[0].nome;
    const avatarSalvo = sessionStorage.getItem("avatarUsuario") || AVATARES_SERIOS[0];

    avatarSelecionado = AVATARES_SERIOS.includes(avatarSalvo) ? avatarSalvo : AVATARES_SERIOS[0];

    document.getElementById("profile-name").textContent = nome;
    document.getElementById("profile-email").textContent = email;

    const rankBadgeEl = document.getElementById("profile-current-rank");
    if (window.ArenaIHC) {
        ArenaIHC.renderizarCargo(rankBadgeEl, cargoSalvo, true);
    }

    document.getElementById("profile-avatar-img").src = montarUrlAvatar(avatarSalvo);
    document.getElementById("stat-xp").textContent = `${xp} XP`;
    document.getElementById("stat-streak").textContent = `${ofensiva} Dias`;

    renderizarPatentes(xp);
    carregarProgressoRealTrilha(email);
    configurarModalEdicao(email);
}

function carregarProgressoRealTrilha(email) {
    const url = `https://arena-java-api.onrender.com/api/trilha?email=${encodeURIComponent(email)}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.sucesso || !data.modulos) return;

            const totalModulos = data.modulos.length || 10;
            const modulosConcluidos = data.modulos.filter(m => m.concluido).length;
            const questoesAcertadas = data.modulos.reduce((acc, m) => acc + (m.questoesRespondidas || 0), 0);
            const totalQuestoes = data.modulos.reduce((acc, m) => acc + (m.totalQuestoes || 10), 0) || 100;
            const pctGeral = Math.min(100, Math.round((questoesAcertadas / totalQuestoes) * 100));

            document.getElementById("stat-questions").textContent = `${questoesAcertadas} / ${totalQuestoes}`;
            document.getElementById("stat-modules").textContent = `${modulosConcluidos} / ${totalModulos}`;

            document.getElementById("career-pct-badge").textContent = `${pctGeral}% Concluído`;
            document.getElementById("career-progress-bar").style.width = `${pctGeral}%`;

            const detailEl = document.getElementById("career-detail-text");
            if (modulosConcluidos === totalModulos) {
                detailEl.innerHTML = `<i class="ph-fill ph-trophy icon-gold"></i> Parabéns! Você concluiu todos os 10 módulos da Arena Java!`;
            } else {
                detailEl.textContent = `Você já concluiu ${modulosConcluidos} de ${totalModulos} módulos (${questoesAcertadas} questões dominadas).`;
            }
        })
        .catch(err => console.error("Erro ao buscar progresso:", err));
}

function renderizarPatentes(xpAtual) {
    let indiceAtual = 0;
    for (let i = 0; i < PATENTES.length; i++) {
        if (xpAtual >= PATENTES[i].minXp) indiceAtual = i;
    }

    const proxIndice = indiceAtual + 1;
    const nextRankName = document.getElementById("next-rank-name");
    const xpMissingBadge = document.getElementById("xp-missing-text");
    const progressBar = document.getElementById("rank-progress-bar");
    const labelAtual = document.getElementById("label-xp-atual");
    const labelMeta = document.getElementById("label-xp-meta");

    if (proxIndice < PATENTES.length) {
        const proxPatente = PATENTES[proxIndice];
        const xpBase = PATENTES[indiceAtual].minXp;
        const faltam = proxPatente.minXp - xpAtual;
        const pct = Math.min(100, Math.max(0, Math.round(((xpAtual - xpBase) / (proxPatente.minXp - xpBase)) * 100)));

        if (window.ArenaIHC) {
            ArenaIHC.renderizarCargo(nextRankName, proxPatente.nome, false);
        }
        xpMissingBadge.textContent = `Faltam ${faltam} XP`;
        progressBar.style.width = `${pct}%`;
        labelAtual.textContent = `${xpAtual} XP`;
        labelMeta.textContent = `${proxPatente.minXp} XP`;
    } else {
        if (window.ArenaIHC) {
            ArenaIHC.renderizarCargo(nextRankName, "Compilador Humano", false);
        }
        xpMissingBadge.textContent = "Topo da Arena";
        progressBar.style.width = "100%";
        labelAtual.textContent = `${xpAtual} XP`;
        labelMeta.textContent = "MAX";
    }

    const container = document.getElementById("ranks-accordion");
    container.textContent = "";

    PATENTES.forEach((pat, idx) => {
        const item = document.createElement("div");
        let statusClass = "rank-locked";
        let statusIconClass = "ph-fill ph-lock-key rank-status-icon";

        if (idx < indiceAtual) {
            statusClass = "rank-past";
            statusIconClass = "ph-bold ph-check rank-status-icon text-green";
        } else if (idx === indiceAtual) {
            statusClass = "rank-current";
            statusIconClass = "ph-fill ph-navigation-arrow rank-status-icon text-cyan";
        }

        item.className = `rank-compact-row ${statusClass}`;

        const leftGroup = document.createElement("div");
        leftGroup.className = "rank-title-group";

        const statusIcon = document.createElement("i");
        statusIcon.className = statusIconClass;
        leftGroup.appendChild(statusIcon);

        if (window.ArenaIHC) {
            leftGroup.appendChild(ArenaIHC.criarElementoCargo(pat.nome, false));
        }

        const xpTag = document.createElement("span");
        xpTag.className = "rank-xp-tag";
        xpTag.textContent = `${pat.minXp} XP`;

        item.appendChild(leftGroup);
        item.appendChild(xpTag);
        container.appendChild(item);
    });
}

function configurarModalEdicao(email) {
    const modal = document.getElementById("edit-profile-modal");
    const btnOpen = document.getElementById("btn-open-edit");
    const btnClose = document.getElementById("btn-close-edit");
    const btnCancel = document.getElementById("btn-cancel-edit");
    const btnSave = document.getElementById("btn-save-profile");
    const inputName = document.getElementById("input-edit-name");
    const grid = document.getElementById("avatar-picker-grid");

    function renderizarGridAvatares() {
        grid.textContent = "";
        AVATARES_SERIOS.forEach(chave => {
            const img = document.createElement("img");
            img.src = montarUrlAvatar(chave);
            img.alt = "Avatar";
            img.className = `avatar-option ${chave === avatarSelecionado ? "selected" : ""}`;
            img.addEventListener("click", () => {
                avatarSelecionado = chave;
                grid.querySelectorAll(".avatar-option").forEach(el => el.classList.remove("selected"));
                img.classList.add("selected");
                if (window.ArenaIHC) ArenaIHC.playSound("click");
            });
            grid.appendChild(img);
        });
    }

    btnOpen.addEventListener("click", () => {
        inputName.value = sessionStorage.getItem("nomeUsuario") || "";
        renderizarGridAvatares();
        modal.classList.remove("hidden");
        setTimeout(() => inputName.focus(), 50);
    });

    const fechar = () => modal.classList.add("hidden");
    btnClose.addEventListener("click", fechar);
    btnCancel.addEventListener("click", fechar);

    btnSave.addEventListener("click", () => {
        const novoNome = inputName.value.trim();
        if (!novoNome) return;

        fetch("https://arena-java-api.onrender.com/api/perfil", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                nome: novoNome,
                avatar: avatarSelecionado
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) {
                    sessionStorage.setItem("nomeUsuario", novoNome);
                    sessionStorage.setItem("avatarUsuario", avatarSelecionado);
                    document.getElementById("profile-name").textContent = novoNome;
                    document.getElementById("profile-avatar-img").src = montarUrlAvatar(avatarSelecionado);
                    if (window.ArenaIHC) ArenaIHC.playSound("success");
                    fechar();
                }
            })
            .catch(err => console.error("Erro ao atualizar perfil:", err));
    });
}