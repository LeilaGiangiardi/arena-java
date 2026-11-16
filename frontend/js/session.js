document.addEventListener("DOMContentLoaded", () => {
    const nome = sessionStorage.getItem("nomeUsuario");
    const cargo = sessionStorage.getItem("cargoUsuario");
    const xp = sessionStorage.getItem("xpUsuario");

    // Trava: se acessar a página sem logar, devolve para o index
    if (!nome || nome === "undefined" || nome === "null") {
        window.location.href = "index.html";
        return;
    }

    // Preenche cabeçalho
    const elNome = document.getElementById("user-nome");
    const elCargo = document.getElementById("user-cargo");
    const elXp = document.getElementById("user-xp");

    if (elNome) elNome.innerText = nome + "!";
    if (elCargo) elCargo.innerText = cargo;
    if (elXp) elXp.innerText = xp;

    // Se estiver no Dashboard, puxa o ranking
    if (document.getElementById("ranking-list")) {
        carregarDashboard();
    }
});

function carregarDashboard() {
    // Busca do seu novo DashboardServlet
    fetch("http://localhost:8080/backend/api/dashboard")
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            atualizarRanking(data.ranking);
            atualizarEstatisticas(data.estatisticas);
        } else {
            document.getElementById("ranking-list").innerHTML = `<li style="text-align:center;color:red;">Falha ao carregar ranking.</li>`;
        }
    })
    .catch(error => {
        console.error(error);
    });
}

function atualizarRanking(listaAlunos) {
    const rankingContainer = document.getElementById("ranking-list");
    rankingContainer.innerHTML = ""; 
    
    listaAlunos.forEach((aluno, index) => {
        const posicao = index + 1;
        let estiloPos = posicao === 1 ? "top-1" : posicao === 2 ? "top-2" : posicao === 3 ? "top-3" : "";
        let currentClass = (aluno.nome === sessionStorage.getItem("nomeUsuario")) ? "current-user" : "";

        const li = document.createElement("li");
        li.className = `ranking-item ${estiloPos} ${currentClass}`;
        li.innerHTML = `
            <div class="rank-pos">${posicao}</div>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${aluno.nome}" alt="Avatar" class="avatar">
            <div class="rank-info">
                <strong>${aluno.nome}</strong>
                <span>${aluno.cargo}</span>
            </div>
            <div class="rank-score">🏅 ${aluno.xp}</div>
        `;
        rankingContainer.appendChild(li);
    });
}

function atualizarEstatisticas(stats) {
    const elOfensiva = document.getElementById("stat-ofensiva");
    const elAcertos = document.getElementById("stat-acertos");
    const elDominio = document.getElementById("stat-dominio");

    if(elOfensiva) elOfensiva.innerText = `${stats.diasOfensiva} Dias`;
    if(elAcertos) elAcertos.innerText = `${stats.acertos} / ${stats.total}`;
    if(elDominio) elDominio.innerText = stats.dominio;
}