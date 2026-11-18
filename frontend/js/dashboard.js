document.addEventListener("DOMContentLoaded", () => {
    const hora = new Date().getHours();
    let textoSaudacao = "Boa noite";
    if (hora >= 5 && hora < 12) textoSaudacao = "Bom dia";
    else if (hora >= 12 && hora < 18) textoSaudacao = "Boa tarde";

    const saudacaoEl = document.getElementById("saudacao");
    if (saudacaoEl) saudacaoEl.innerText = textoSaudacao;

    const emailUsuario = sessionStorage.getItem("emailUsuario");
    if (!emailUsuario || emailUsuario === "undefined" || emailUsuario === "null") {
        window.location.href = "index.html"; 
        return;
    }

    // Preenche o cabeçalho imediatamente com o que já está na memória (Zero espera)
    atualizarEstatisticaHeader({
        nome: sessionStorage.getItem("nomeUsuario") || "Aluno",
        xp: sessionStorage.getItem("xpUsuario") || 0,
        cargo: sessionStorage.getItem("cargoUsuario") || "Derrubador de Servidor",
        ofensiva: sessionStorage.getItem("ofensivaUsuario") || 0,
        questoesAcertadas: sessionStorage.getItem("acertosUsuario") || 0,
        totalQuestoes: sessionStorage.getItem("totalQuestoesArena") || 100,
        dominio: sessionStorage.getItem("dominioUsuario") || "Iniciante"
    });

    carregarDashboard(emailUsuario);
    carregarUltimoModuloAtivo(emailUsuario);
});

let rankingGlobal = [];
let nomeUsuarioAtual = sessionStorage.getItem("nomeUsuario") || "";

function montarUrlAvatarRanking(avatar, nomeFallback) {
    const valor = (avatar && avatar !== "null" && avatar !== "undefined") ? avatar : (nomeFallback || "Java");
    if (valor.startsWith("http")) return valor;
    if (valor.includes("eyes=")) return `https://api.dicebear.com/7.x/bottts/svg?${valor}`;
    const sementeLimpa = valor.replace("bottts:", "");
    if (sementeLimpa === "Omega") {
        return "https://api.dicebear.com/7.x/bottts/svg?seed=Vortex&baseColor=5e35b1&eyes=shade01&mouth=grill03&texture=camo01";
    }
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sementeLimpa)}&eyes=eva,robocop,shade01&mouth=grill01,grill02,grill03`;
}

function aplicarDadosDashboard(data) {
    // Filtra o Admin Arena no frontend também por segurança
    rankingGlobal = (data.ranking || []).filter(u => 
        u.nome && !["admin", "administrador", "admin arena"].includes(u.nome.trim().toLowerCase())
    );
    nomeUsuarioAtual = data.estatisticas.nome;

    const cargoLimpo = window.ArenaIHC ? ArenaIHC.limparEmojis(data.estatisticas.cargo) : data.estatisticas.cargo;

    sessionStorage.setItem("nomeUsuario", data.estatisticas.nome);
    sessionStorage.setItem("xpUsuario", data.estatisticas.xp);
    sessionStorage.setItem("cargoUsuario", cargoLimpo);
    sessionStorage.setItem("ofensivaUsuario", data.estatisticas.ofensiva);
    sessionStorage.setItem("avatarUsuario", data.estatisticas.avatar || data.estatisticas.nome);
    sessionStorage.setItem("acertosUsuario", data.estatisticas.questoesAcertadas);
    sessionStorage.setItem("totalQuestoesArena", data.estatisticas.totalQuestoes);
    sessionStorage.setItem("dominioUsuario", data.estatisticas.dominio);

    atualizarEstatisticaHeader(data.estatisticas);

    const top4 = rankingGlobal.slice(0, 5);
    atualizarRanking(top4, nomeUsuarioAtual, "ranking-list");
}

function carregarDashboard(email) {
    // 1. Se já tem no cache da sessão, mostra na tela instantaneamente!
    const cacheSalvo = sessionStorage.getItem("cache_dashboard");
    if (cacheSalvo) {
        try {
            aplicarDadosDashboard(JSON.parse(cacheSalvo));
            return; // Não precisa buscar tudo de novo ao apenas trocar de aba
        } catch (e) {
            sessionStorage.removeItem("cache_dashboard");
        }
    }

    // 2. Se for a primeira vez (ou após responder quiz), busca no servidor e salva
    const url = `https://arena-java-api.onrender.com/api/dashboard?email=${encodeURIComponent(email)}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                sessionStorage.setItem("cache_dashboard", JSON.stringify(data));
                aplicarDadosDashboard(data);
            }
        })
        .catch(error => console.error("Erro ao carregar o Dashboard:", error));
}

function aplicarAtalhoModulo(modulos) {
    if (!modulos || modulos.length === 0) return;

    const totalRespondidasNaConta = modulos.reduce((acc, m) => acc + (m.questoesRespondidas || 0), 0);
    const ehContaRecemCriada = (totalRespondidasNaConta === 0);

    let modAlvo = modulos.find(m => !m.bloqueado && !m.concluido);
    if (!modAlvo) {
        const desbloqueados = modulos.filter(m => !m.bloqueado);
        modAlvo = desbloqueados[desbloqueados.length - 1] || modulos[0];
    }

    const total = modAlvo.totalQuestoes || 10;
    const resp = modAlvo.questoesRespondidas || 0;
    const pct = Math.min(100, Math.round((resp / total) * 100));

    document.getElementById("quick-stage-badge").textContent = ehContaRecemCriada
        ? `PRIMEIRA MISSÃO • ESTÁGIO 01`
        : `MISSÃO ATUAL • ESTÁGIO 0${modAlvo.id}`;
    document.getElementById("quick-progress-text").textContent = `${resp}/${total}`;
    document.getElementById("quick-module-title").textContent = modAlvo.nome;
    document.getElementById("quick-progress-bar").style.width = `${pct}%`;

    const btnPlay = document.getElementById("btn-quick-play");
    const btnPlayText = document.getElementById("btn-quick-play-text");

    if (ehContaRecemCriada) {
        if (btnPlayText) btnPlayText.textContent = "Jogar Agora";
    } else if (modAlvo.concluido) {
        if (btnPlayText) btnPlayText.textContent = "Revisar";
    } else {
        if (btnPlayText) btnPlayText.textContent = "Continuar";
    }

    btnPlay.onclick = () => {
        setTimeout(() => {
            window.location.href = `quiz.html?moduloId=${modAlvo.id}`;
        }, 140);
    };
}

function carregarUltimoModuloAtivo(email) {
    // 1. Se a trilha já está salva na sessão, carrega instantaneamente!
    const cacheTrilha = sessionStorage.getItem("cache_trilha");
    if (cacheTrilha) {
        try {
            aplicarAtalhoModulo(JSON.parse(cacheTrilha));
            return;
        } catch (e) {
            sessionStorage.removeItem("cache_trilha");
        }
    }

    // 2. Se não estiver no cache, busca na API e salva para as outras abas usarem
    const url = `https://arena-java-api.onrender.com/api/trilha?email=${encodeURIComponent(email)}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.sucesso || !data.modulos || data.modulos.length === 0) return;
            sessionStorage.setItem("cache_trilha", JSON.stringify(data.modulos));
            aplicarAtalhoModulo(data.modulos);
        })
        .catch(err => console.error("Erro ao carregar atalho de módulo:", err));
}

function atualizarEstatisticaHeader(stats) {
    const elNome = document.getElementById("user-nome");
    const elXp = document.getElementById("user-xp");
    const elCargo = document.getElementById("user-cargo");
    const elOfensiva = document.getElementById("stat-ofensiva");
    const elAcertos = document.getElementById("stat-acertos");
    const elDominio = document.getElementById("stat-dominio");

    if (elNome && stats.nome !== undefined) elNome.innerText = stats.nome;
    if (elXp && stats.xp !== undefined) elXp.innerText = stats.xp;
    if (elCargo && window.ArenaIHC && stats.cargo) {
        ArenaIHC.renderizarCargo(elCargo, stats.cargo, true);
    }
    if (elOfensiva && stats.ofensiva !== undefined) elOfensiva.innerText = `${stats.ofensiva} Dias`;
    if (elAcertos && stats.questoesAcertadas !== undefined) elAcertos.innerText = `${stats.questoesAcertadas} / ${stats.totalQuestoes}`;
    if (elDominio && stats.dominio !== undefined) elDominio.innerText = stats.dominio;
}

function atualizarRanking(listaAlunos, nomeUsuarioLogado, idContainer) {
    const rankingContainer = document.getElementById(idContainer);
    if (!rankingContainer) return;
    
    rankingContainer.textContent = "";

    if (!listaAlunos || listaAlunos.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.style.textAlign = "center";
        emptyLi.style.padding = "20px";
        emptyLi.style.color = "#b0a4c2";
        emptyLi.textContent = "Nenhum programador encontrado.";
        rankingContainer.appendChild(emptyLi);
        return;
    }

    listaAlunos.forEach((aluno) => {
        const posicaoOriginal = rankingGlobal.findIndex(a => a.nome === aluno.nome) + 1;
        let estiloPos = posicaoOriginal === 1 ? "top-1" : posicaoOriginal === 2 ? "top-2" : posicaoOriginal === 3 ? "top-3" : "";
        let isCurrentUser = (aluno.nome === nomeUsuarioLogado);
        let currentClass = isCurrentUser ? "current-user" : "";

        const li = document.createElement("li");
        li.className = `ranking-item ${estiloPos} ${currentClass}`.trim();
        if (isCurrentUser && idContainer === "full-ranking-list") {
            li.id = "my-ranking-row";
        }

        const posDiv = document.createElement("div");
        posDiv.className = "rank-pos";
        posDiv.textContent = posicaoOriginal;

        const img = document.createElement("img");
        img.src = montarUrlAvatarRanking(aluno.avatar, aluno.nome);
        img.alt = "Avatar";
        img.className = "avatar";

        const infoDiv = document.createElement("div");
        infoDiv.className = "rank-info";

        const strong = document.createElement("strong");
        strong.textContent = `${aluno.nome}${isCurrentUser ? " (Você)" : ""}`;

        const cargoSpan = document.createElement("span");
        if (window.ArenaIHC) {
            cargoSpan.appendChild(ArenaIHC.criarElementoCargo(aluno.cargo, true));
        } else {
            cargoSpan.textContent = aluno.cargo;
        }

        infoDiv.appendChild(strong);
        infoDiv.appendChild(cargoSpan);

        const scoreDiv = document.createElement("div");
        scoreDiv.className = "rank-score";
        const medalIcon = document.createElement("i");
        medalIcon.className = "ph-fill ph-medal icon-gold";
        scoreDiv.appendChild(medalIcon);
        scoreDiv.appendChild(document.createTextNode(` ${aluno.xp}`));

        li.appendChild(posDiv);
        li.appendChild(img);
        li.appendChild(infoDiv);
        li.appendChild(scoreDiv);

        rankingContainer.appendChild(li);
    });
}

const rankingModal = document.getElementById("ranking-modal");
const btnVerTodos = document.getElementById("btn-ver-todos");
const btnCloseRanking = document.getElementById("btn-close-ranking");
const searchInput = document.getElementById("search-ranking");
const selectCargo = document.getElementById("filter-rank-cargo");
const btnFindMe = document.getElementById("btn-find-me");

function filtrarRankingCompleto() {
    const termoBusca = (searchInput ? searchInput.value : "").toLowerCase().trim();
    const cargoFiltro = (selectCargo ? selectCargo.value : "").toLowerCase().trim();

    const filtrados = rankingGlobal.filter(aluno => {
        const matchTexto = !termoBusca ||
            aluno.nome.toLowerCase().includes(termoBusca) ||
            aluno.xp.toString().startsWith(termoBusca);
        const matchCargo = !cargoFiltro ||
            (aluno.cargo && aluno.cargo.toLowerCase().includes(cargoFiltro));
        return matchTexto && matchCargo;
    });

    atualizarRanking(filtrados, nomeUsuarioAtual, "full-ranking-list");
}

if (btnVerTodos) {
    btnVerTodos.addEventListener("click", () => {
        rankingModal.classList.remove("hidden");
        if (searchInput) searchInput.value = "";
        if (selectCargo) selectCargo.value = "";
        atualizarRanking(rankingGlobal, nomeUsuarioAtual, "full-ranking-list");
        setTimeout(() => searchInput && searchInput.focus(), 50);
    });
}

if (btnCloseRanking) {
    btnCloseRanking.addEventListener("click", () => rankingModal.classList.add("hidden"));
}

window.addEventListener("click", (e) => {
    if (e.target === rankingModal) rankingModal.classList.add("hidden");
});

if (searchInput) searchInput.addEventListener("input", filtrarRankingCompleto);
if (selectCargo) selectCargo.addEventListener("change", filtrarRankingCompleto);

if (btnFindMe) {
    btnFindMe.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (selectCargo) selectCargo.value = "";
        atualizarRanking(rankingGlobal, nomeUsuarioAtual, "full-ranking-list");
        const myRow = document.getElementById("my-ranking-row");
        if (myRow) myRow.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}