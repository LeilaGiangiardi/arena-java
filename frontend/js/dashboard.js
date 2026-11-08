document.addEventListener("DOMContentLoaded", () => {
    // 1. Lógica da saudação baseada na hora do sistema
    const hora = new Date().getHours();
    let textoSaudacao = "Boa noite";
    
    if (hora >= 5 && hora < 12) {
        textoSaudacao = "Bom dia";
    } else if (hora >= 12 && hora < 18) {
        textoSaudacao = "Boa tarde";
    }
    document.getElementById("saudacao").innerText = textoSaudacao;

    // 2. Validação de Login e Chamada da API
    const emailUsuario = sessionStorage.getItem("emailUsuario");

    if (!emailUsuario || emailUsuario === "undefined") {
        window.location.href = "index.html"; // Redireciona se não estiver logado
        return;
    }

    carregarDashboard(emailUsuario);
});

function carregarDashboard(email) {
    const url = `http://localhost:8080/backend/api/dashboard?email=${encodeURIComponent(email)}`;
    
    console.log("Tentando buscar dados na URL:", url);

    fetch(url)
        .then(async response => {
            // Se o Tomcat retornar uma página de erro (404 ou 500) em vez de JSON
            if (!response.ok) {
                const erroTexto = await response.text();
                throw new Error(`Erro do Servidor HTTP ${response.status}. O Java não respondeu corretamente.`);
            }
            return response.json();
        })
        .then(data => {
            if (data.sucesso) {
                atualizarEstatisticaHeader(data.estatisticas);
                atualizarRanking(data.ranking, data.estatisticas.nome);
            } else {
                document.getElementById("user-nome").innerText = "Usuário não encontrado";
                console.error("O Java rodou, mas retornou {sucesso: false}. Verifique o email no banco.");
            }
        })
        .catch(error => {
            document.getElementById("user-nome").innerText = "Erro de Conexão";
            console.error("A ponte quebrou! Motivo:", error);
        });
}

function atualizarEstatisticaHeader(stats) {
    document.getElementById("user-nome").innerText = stats.nome;
    document.getElementById("user-xp").innerText = stats.xp;
    document.getElementById("user-cargo").innerText = stats.cargo;

    document.getElementById("stat-ofensiva").innerText = `${stats.ofensiva} Dias`;
    document.getElementById("stat-acertos").innerText = `${stats.questoesAcertadas} / ${stats.totalQuestoes}`;
    document.getElementById("stat-dominio").innerText = stats.dominio;
}

function atualizarRanking(listaAlunos, nomeUsuarioLogado) {
    const rankingContainer = document.getElementById("ranking-list");
    rankingContainer.innerHTML = ""; 

    listaAlunos.forEach((aluno, index) => {
        const posicao = index + 1;
        let estiloPos = posicao === 1 ? "top-1" : posicao === 2 ? "top-2" : posicao === 3 ? "top-3" : "";
        let isCurrentUser = (aluno.nome === nomeUsuarioLogado);
        let currentClass = isCurrentUser ? "current-user" : "";

        const li = document.createElement("li");
        li.className = `ranking-item ${estiloPos} ${currentClass}`;
        
        li.innerHTML = `
            <div class="rank-pos">${posicao}</div>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${aluno.nome}" alt="Avatar" class="avatar">
            <div class="rank-info">
                <strong>${aluno.nome} ${isCurrentUser ? '(Você)' : ''}</strong>
                <span>${aluno.cargo}</span>
            </div>
            <div class="rank-score">🏅 ${aluno.xp}</div>
        `;
        rankingContainer.appendChild(li);
    });
}