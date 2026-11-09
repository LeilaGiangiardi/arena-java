document.addEventListener("DOMContentLoaded", () => {
    // 1. Lógica da saudação baseada na hora do sistema
    const hora = new Date().getHours();
    let textoSaudacao = "Boa noite";
    
    if (hora >= 5 && hora < 12) {
        textoSaudacao = "Bom dia";
    } else if (hora >= 12 && hora < 18) {
        textoSaudacao = "Boa tarde";
    }
    const saudacaoEl = document.getElementById("saudacao");
    if (saudacaoEl) saudacaoEl.innerText = textoSaudacao;

    // 2. Validação de Login e Chamada da API
    const emailUsuario = sessionStorage.getItem("emailUsuario");

    if (!emailUsuario || emailUsuario === "undefined" || emailUsuario === "null") {
        window.location.href = "index.html"; 
        return;
    }

    carregarDashboard(emailUsuario);
});

// Variável global para armazenar todos os alunos do banco
let rankingGlobal = [];

function carregarDashboard(email) {
    const url = `http://localhost:8080/backend/api/dashboard?email=${encodeURIComponent(email)}`;
    
    fetch(url)
        .then(async response => {
            if (!response.ok) {
                throw new Error(`Erro do Servidor HTTP ${response.status}. O Java não respondeu corretamente.`);
            }
            return response.json();
        })
        .then(data => {
            if (data.sucesso) {
                // Guarda a lista COMPLETA na memória
                rankingGlobal = data.ranking;
                
                atualizarEstatisticaHeader(data.estatisticas);
                
                // Renderiza APENAS OS 4 PRIMEIROS no painel fixo do Dashboard
                const top4 = rankingGlobal.slice(0, 4);
                atualizarRanking(top4, data.estatisticas.nome, "ranking-list");
                
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

// 3. Função Unificada para renderizar a lista
function atualizarRanking(listaAlunos, nomeUsuarioLogado, idContainer) {
    const rankingContainer = document.getElementById(idContainer);
    if (!rankingContainer) return;
    
    rankingContainer.innerHTML = ""; 

    if (listaAlunos.length === 0) {
        rankingContainer.innerHTML = `<li style="text-align:center; padding:20px; color:#a0a5b5;">Nenhum programador encontrado.</li>`;
        return;
    }

    listaAlunos.forEach((aluno) => {
        // Encontra a posição verdadeira dele no ranking global baseado no índice geral
        const posicaoOriginal = rankingGlobal.findIndex(a => a.nome === aluno.nome) + 1;
        
        let estiloPos = posicaoOriginal === 1 ? "top-1" : posicaoOriginal === 2 ? "top-2" : posicaoOriginal === 3 ? "top-3" : "";
        let isCurrentUser = (aluno.nome === nomeUsuarioLogado);
        let currentClass = isCurrentUser ? "current-user" : "";

        const li = document.createElement("li");
        li.className = `ranking-item ${estiloPos} ${currentClass}`;
        
        li.innerHTML = `
            <div class="rank-pos">${posicaoOriginal}</div>
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

// ==========================================
// 4. LÓGICA DO POP-UP E PESQUISA RÁPIDA
// ==========================================
const rankingModal = document.getElementById("ranking-modal");
const btnVerTodos = document.getElementById("btn-ver-todos");
const btnCloseRanking = document.getElementById("btn-close-ranking");
const searchInput = document.getElementById("search-ranking");
const nomeDoUsuario = sessionStorage.getItem("nomeUsuario");

// Abrir Modal
if (btnVerTodos) {
    btnVerTodos.addEventListener("click", () => {
        rankingModal.classList.remove("hidden");
        if (searchInput) searchInput.value = ""; 
        // Puxa e desenha a lista COMPLETA no pop-up
        atualizarRanking(rankingGlobal, nomeDoUsuario, "full-ranking-list");
    });
}

// Fechar Modal (botão X)
if (btnCloseRanking) {
    btnCloseRanking.addEventListener("click", () => {
        rankingModal.classList.add("hidden");
    });
}

// Fechar Modal clicando fora dele
window.addEventListener("click", (e) => {
    if (e.target === rankingModal) {
        rankingModal.classList.add("hidden");
    }
});

// Pesquisa Instantânea
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const termoBusca = e.target.value.toLowerCase(); 
        
        // Substituído de .includes() para .startsWith() para buscar apenas pelas iniciais
        const alunosFiltrados = rankingGlobal.filter(aluno => 
            aluno.nome.toLowerCase().startsWith(termoBusca) || 
            aluno.cargo.toLowerCase().startsWith(termoBusca) ||
            aluno.xp.toString().startsWith(termoBusca)
        );
        
        atualizarRanking(alunosFiltrados, nomeDoUsuario, "full-ranking-list");
    });
}