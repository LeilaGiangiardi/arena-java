/* ==========================================================================
   MÓDULO COMPARTILHADO DE IHC (Puro DOM API - Zero HTML embutido)
   ========================================================================== */

window.ArenaIHC = (() => {
    const STORAGE_KEY = "arena_java_ihc_prefs";

    const defaultPrefs = {
        soundEnabled: true,
        timerEnabled: true,
        shakeEnabled: true,
        theme: "cyberpunk"
    };

    // Tabela única e padronizada das 6 Patentes (usada em todo o sistema)
    const PATENTES = [
        { match: "derrubador", nome: "Derrubador de Servidor",           minXp: 0,    icone: "ph-fill ph-lightning",       cor: "#ff3366" },
        { match: "criador",    nome: "Criador de bugs",                  minXp: 200,  icone: "ph-fill ph-bug-beetle",      cor: "#00ff73" },
        { match: "caçador",    nome: "Caçador de Ponto e Vírgula (;)",   minXp: 500,  icone: "ph-fill ph-crosshair",       cor: "#00f0ff" },
        { match: "refém",      nome: "Refém da Inteligência Artificial", minXp: 1500, icone: "ph-fill ph-robot",           cor: "#b84dff" },
        { match: "mestre",     nome: "Mestre do Stack Overflow",         minXp: 3000, icone: "ph-fill ph-terminal-window", cor: "#ff9900" },
        { match: "compilador", nome: "Compilador Humano",                minXp: 5000, icone: "ph-fill ph-cpu",             cor: "#ffd700" }
    ];

    function limparEmojis(texto) {
        if (!texto) return "";
        return String(texto)
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function obterMetaCargo(nomeCargo) {
        const limpo = limparEmojis(nomeCargo).toLowerCase();
        return PATENTES.find(c => limpo.includes(c.match)) || PATENTES[0];
    }

    // Cria o elemento DOM padronizado do Cargo (Caixa Neon + Ícone + Nome)
    function criarElementoCargo(nomeCargo, tamanhoCompacto = false) {
        const meta = obterMetaCargo(nomeCargo);

        const wrapper = document.createElement("span");
        wrapper.className = "cargo-inline";

        const badgeBox = document.createElement("span");
        badgeBox.className = tamanhoCompacto ? "rank-badge-icon rank-badge-sm" : "rank-badge-icon";
        badgeBox.style.setProperty("--badge-color", meta.cor);

        const icon = document.createElement("i");
        icon.className = meta.icone;
        badgeBox.appendChild(icon);

        const textSpan = document.createElement("span");
        textSpan.className = "cargo-name-text";
        textSpan.textContent = meta.nome;

        wrapper.appendChild(badgeBox);
        wrapper.appendChild(textSpan);
        return wrapper;
    }

    function renderizarCargo(containerEl, nomeCargo, tamanhoCompacto = false) {
        if (!containerEl) return;
        containerEl.textContent = "";
        containerEl.appendChild(criarElementoCargo(nomeCargo, tamanhoCompacto));
    }

    function getPrefs() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return { ...defaultPrefs, ...(saved || {}) };
        } catch (e) {
            return { ...defaultPrefs };
        }
    }

    function savePrefs(newPrefs) {
        const merged = { ...getPrefs(), ...newPrefs };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        applyThemeAndPrefs(merged);
        return merged;
    }

    function applyThemeAndPrefs(prefs = getPrefs()) {
        document.body.classList.toggle("theme-classic-ide", prefs.theme === "classic-ide");
        document.body.classList.toggle("no-shake", !prefs.shakeEnabled);

        const timerContainer = document.querySelector(".quiz-header .timer-container");
        const timerSeconds = document.getElementById("timer-seconds");
        if (timerContainer) timerContainer.style.display = prefs.timerEnabled ? "" : "none";
        if (timerSeconds) timerSeconds.style.display = prefs.timerEnabled ? "" : "none";
    }

    // =========================================================================
    // MOTOR DE ÁUDIO 8-BIT / 16-BIT GLOBAL (Sincronizado com Navegação)
    // =========================================================================
    let audioCtx = null;
    let lastHoverTime = 0;
    let lastHoveredElement = null;
    let lastSoundTime = 0;
    let suppressMinorSoundsUntil = 0;
    let activeSoundPromise = Promise.resolve();

    function getAudioContext() {
        if (!audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) audioCtx = new AudioCtx();
        }
        return audioCtx;
    }

    function scheduleNotes(notes) {
        if (!getPrefs().soundEnabled) return Promise.resolve();
        const ctx = getAudioContext();
        if (!ctx) return Promise.resolve();

        // Calcula a duração total do efeito para não cortar o som ao mudar de página
        const maxEndSec = notes.reduce((max, n) => Math.max(max, (n.delay || 0) + (n.duration || 0.05)), 0.05);
        const durationMs = Math.ceil(maxEndSec * 1000) + 25;

        const playAndWait = () => new Promise(resolve => {
            try {
                const now = ctx.currentTime + 0.005;
                notes.forEach(n => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = n.type || "triangle";
                    osc.frequency.setValueAtTime(n.freq, now + (n.delay || 0));
                    if (n.slideTo) {
                        osc.frequency.exponentialRampToValueAtTime(n.slideTo, now + (n.delay || 0) + n.duration);
                    }

                    const vol = n.vol || 0.18;
                    gain.gain.setValueAtTime(0.001, now + (n.delay || 0));
                    gain.gain.linearRampToValueAtTime(vol, now + (n.delay || 0) + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.0008, now + (n.delay || 0) + n.duration);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(now + (n.delay || 0));
                    osc.stop(now + (n.delay || 0) + n.duration + 0.015);
                });
            } catch (e) {}

            setTimeout(resolve, durationMs);
        });

        if (ctx.state === "suspended") {
            const resumePromise = ctx.resume().then(playAndWait).catch(() => {});
            // Trava de segurança de 240ms para nunca atrasar a navegação caso o navegador bloqueie áudio
            activeSoundPromise = Promise.race([
                resumePromise,
                new Promise(res => setTimeout(res, 240))
            ]);
        } else {
            activeSoundPromise = playAndWait();
        }

        return activeSoundPromise;
    }

    function playSound(effect) {
        if (!getPrefs().soundEnabled) return Promise.resolve();

        // Nunca cria ou força AudioContext durante hover se a página ainda não recebeu clique
        if (effect === "hover" && (!audioCtx || audioCtx.state !== "running")) {
            return Promise.resolve();
        }

        const nowMs = performance.now();
        const isMajorSound = (effect === "success" || effect === "error" || effect === "levelup" || effect === "logout");

        if (!isMajorSound && nowMs < suppressMinorSoundsUntil) return activeSoundPromise;

        // Trava global anti-duplicação: impede 2 sons de clique/abertura em menos de 110ms
        if (effect !== "type" && effect !== "hover" && !isMajorSound && (nowMs - lastSoundTime) < 110) {
            return activeSoundPromise;
        }

        if (effect !== "hover" && effect !== "type") {
            lastSoundTime = nowMs;
        }

        if (isMajorSound) {
            suppressMinorSoundsUntil = nowMs + 450;
        }

        switch (effect) {
            case "hover":
                return scheduleNotes([{ freq: 580, slideTo: 660, type: "sine", duration: 0.032, vol: 0.05 }]);
            case "click":
                return scheduleNotes([{ freq: 660, slideTo: 880, type: "triangle", duration: 0.055, vol: 0.16 }]);
            case "card":
            case "open":
                return scheduleNotes([
                    { freq: 523.25, type: "sine", delay: 0.00, duration: 0.055, vol: 0.18 },
                    { freq: 659.25, type: "triangle", delay: 0.045, duration: 0.085, vol: 0.20 }
                ]);
            case "close":
                return scheduleNotes([
                    { freq: 587.33, type: "triangle", delay: 0.00, duration: 0.05, vol: 0.15 },
                    { freq: 392.00, type: "triangle", delay: 0.04, duration: 0.08, vol: 0.15 }
                ]);
            case "logout":
                return scheduleNotes([
                    { freq: 659.25, type: "triangle", delay: 0.00, duration: 0.07, vol: 0.22 },
                    { freq: 493.88, type: "triangle", delay: 0.06, duration: 0.07, vol: 0.22 },
                    { freq: 329.63, slideTo: 246.94, type: "triangle", delay: 0.12, duration: 0.16, vol: 0.24 }
                ]);
            case "type":
                return scheduleNotes([{ freq: 920, slideTo: 480, type: "sine", duration: 0.022, vol: 0.06 }]);
            case "success":
                return scheduleNotes([
                    { freq: 523.25, type: "triangle", delay: 0.00, duration: 0.08, vol: 0.26 },
                    { freq: 659.25, type: "triangle", delay: 0.07, duration: 0.08, vol: 0.26 },
                    { freq: 783.99, type: "triangle", delay: 0.14, duration: 0.09, vol: 0.26 },
                    { freq: 1046.50, type: "triangle", delay: 0.21, duration: 0.22, vol: 0.30 }
                ]);
            case "error":
                return scheduleNotes([
                    { freq: 311.13, slideTo: 277.18, type: "sawtooth", delay: 0.00, duration: 0.13, vol: 0.24 },
                    { freq: 233.08, slideTo: 174.61, type: "sawtooth", delay: 0.14, duration: 0.26, vol: 0.26 }
                ]);
            case "levelup":
                return scheduleNotes([
                    { freq: 440.00, type: "square", delay: 0.00, duration: 0.08, vol: 0.18 },
                    { freq: 554.37, type: "square", delay: 0.08, duration: 0.08, vol: 0.18 },
                    { freq: 659.25, type: "square", delay: 0.16, duration: 0.08, vol: 0.18 },
                    { freq: 880.00, type: "square", delay: 0.24, duration: 0.26, vol: 0.22 }
                ]);
            default:
                return Promise.resolve();
        }
    }

    function setupQuizFeedbackObserver() {
        const feedbackModal = document.getElementById("feedback-modal");
        if (feedbackModal) {
            const observer = new MutationObserver(() => {
                if (!feedbackModal.classList.contains("hidden")) {
                    const content = feedbackModal.querySelector(".modal-content");
                    const titleText = (document.getElementById("feedback-title")?.textContent || "").toUpperCase();
                    if ((content && content.classList.contains("error")) || titleText.includes("BUG") || titleText.includes("ERRO")) {
                        playSound("error");
                    } else {
                        playSound("success");
                    }
                }
            });
            observer.observe(feedbackModal, { attributes: true, attributeFilter: ["class"] });
        }

        const exitModal = document.getElementById("exit-confirm-modal");
        if (exitModal) {
            const obsExit = new MutationObserver(() => {
                if (!exitModal.classList.contains("hidden")) {
                    playSound("logout");
                }
            });
            obsExit.observe(exitModal, { attributes: true, attributeFilter: ["class"] });
        }
    }

    function setupGlobalSoundListeners() {
        document.addEventListener("pointerdown", (e) => {
            const ctx = getAudioContext();
            if (ctx && ctx.state === "suspended") {
                ctx.resume().catch(() => {});
            }

            const target = e.target;
            if (!target || !target.closest) return;

            if (target.closest("#btn-confirm")) return;

            if (target.closest(".logout-icon, #btn-close-quiz, #btn-confirm-exit")) {
                playSound("logout");
                return;
            }

            if (target.closest(".btn-close, #btn-cancel-mission, #btn-cancel-edit")) {
                playSound("close");
                return;
            }

            if (target.closest(".module-card.locked, .disabled, :disabled")) {
                playSound("error");
                return;
            }

            if (target.closest(".btn-run, .btn-edit-profile, .module-card, .sidebar-icon")) {
                playSound("card");
                return;
            }

            if (target.closest("button, .tab-btn, .avatar-option, .option-btn, .btn-alt, .ihc-switch-row, .theme-card-btn, select")) {
                playSound("click");
            }
        }, { capture: true });

        document.addEventListener("mouseover", (e) => {
            // Só toca som de hover se o áudio já estiver destravado na página atual
            if (!audioCtx || audioCtx.state !== "running") return;

            const target = e.target;
            if (!target || !target.closest) return;

            const hoverable = target.closest(".module-card, .sidebar-icon, .btn-run, .btn-alt, .option-btn, .avatar-option, .tab-btn, .btn-submit, .btn-edit-profile, .theme-card-btn");
            if (hoverable && hoverable !== lastHoveredElement) {
                lastHoveredElement = hoverable;
                const now = performance.now();
                if (now - lastHoverTime > 70) {
                    lastHoverTime = now;
                    playSound("hover");
                }
            }
        }, { passive: true });

        document.addEventListener("keydown", (e) => {
            const ctx = getAudioContext();
            if (ctx && ctx.state === "suspended") {
                ctx.resume().catch(() => {});
            }

            if (e.key === "Escape") {
                playSound("logout");
                return;
            }

            const active = document.activeElement;
            if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
                if (e.key.length === 1 || e.key === "Backspace") {
                    playSound("type");
                }
            } else if (["1", "2", "3", "4"].includes(e.key)) {
                playSound("click");
            }
        }, { capture: true });
    }

    function setupSidebarAndSettingsModal() {
        // Pré-carrega as abas principais em segundo plano
        ["dashboard.html", "trilha.html", "perfil.html"].forEach(pagina => {
            const linkPrefetch = document.createElement("link");
            linkPrefetch.rel = "prefetch";
            linkPrefetch.href = pagina;
            document.head.appendChild(linkPrefetch);
        });

        // Intercepta todos os botões e ícones que mudam de página para esperar o som terminar antes de sair
        document.querySelectorAll("[onclick*='window.location.href']").forEach(el => {
            const rawOnClick = el.getAttribute("onclick");
            const match = rawOnClick && rawOnClick.match(/'([^']+)'/);
            if (match && match[1]) {
                const targetUrl = match[1];
                const isLogout = el.classList.contains("logout-icon");
                el.removeAttribute("onclick");

                el.addEventListener("click", (e) => {
                    e.preventDefault();
                    // Se clicar no ícone da aba que já está aberta, apenas toca o som sem recarregar à toa
                    if (el.classList.contains("sidebar-icon") && el.classList.contains("active")) {
                        playSound("card");
                        return;
                    }

                    if (isLogout) sessionStorage.clear();

                    // Garante que o som foi disparado (caso o navegador só tenha liberado o AudioContext no click)
                    const somPromise = playSound(isLogout ? "logout" : "card");
                    somPromise.then(() => {
                        window.location.href = targetUrl;
                    });
                });
            }
        });

        const sidebar = document.querySelector(".sidebar");
        if (sidebar) {
            const gearBtn = sidebar.querySelector(".sidebar-help-trigger");
            if (gearBtn) {
                gearBtn.addEventListener("click", openHelpModal);
            }
        }

        const modal = document.getElementById("ihc-help-modal");
        if (!modal) return;

        const closeBtn = document.getElementById("btn-close-ihc-help");
        const okBtn = document.getElementById("btn-ok-ihc-help");
        const chkSound = document.getElementById("pref-sound");
        const chkTimer = document.getElementById("pref-timer");
        const chkShake = document.getElementById("pref-shake");
        const btnCyber = document.getElementById("btn-theme-cyber");
        const btnClassic = document.getElementById("btn-theme-classic");

        const tabBtnSettings = document.getElementById("tab-btn-settings");
        const tabBtnGuide = document.getElementById("tab-btn-guide");
        const paneSettings = document.getElementById("ihc-pane-settings");
        const paneGuide = document.getElementById("ihc-pane-guide");

        if (tabBtnSettings && tabBtnGuide && paneSettings && paneGuide) {
            tabBtnSettings.addEventListener("click", () => {
                tabBtnSettings.classList.add("active");
                tabBtnGuide.classList.remove("active");
                paneSettings.classList.remove("hidden");
                paneGuide.classList.add("hidden");
            });

            tabBtnGuide.addEventListener("click", () => {
                tabBtnGuide.classList.add("active");
                tabBtnSettings.classList.remove("active");
                paneGuide.classList.remove("hidden");
                paneSettings.classList.add("hidden");
            });
        }

        const closeModal = () => modal.classList.add("hidden");
        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        if (okBtn) okBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        if (chkSound) {
            chkSound.addEventListener("change", () => {
                savePrefs({ soundEnabled: chkSound.checked });
                if (chkSound.checked) playSound("success");
            });
        }
        if (chkTimer) chkTimer.addEventListener("change", () => savePrefs({ timerEnabled: chkTimer.checked }));
        if (chkShake) chkShake.addEventListener("change", () => savePrefs({ shakeEnabled: chkShake.checked }));

        if (btnCyber) {
            btnCyber.addEventListener("click", () => {
                savePrefs({ theme: "cyberpunk" });
                syncModalControls();
            });
        }
        if (btnClassic) {
            btnClassic.addEventListener("click", () => {
                savePrefs({ theme: "classic-ide" });
                syncModalControls();
            });
        }

        document.addEventListener("keydown", (e) => {
            if ((e.ctrlKey && e.key === "/") || e.key === "F1") {
                e.preventDefault();
                playSound("card");
                openHelpModal();
            } else if (e.key === "Escape" && !modal.classList.contains("hidden")) {
                closeModal();
            }
        });
    }

    function syncModalControls() {
        const prefs = getPrefs();
        const chkSound = document.getElementById("pref-sound");
        const chkTimer = document.getElementById("pref-timer");
        const chkShake = document.getElementById("pref-shake");
        const btnCyber = document.getElementById("btn-theme-cyber");
        const btnClassic = document.getElementById("btn-theme-classic");

        if (chkSound) chkSound.checked = prefs.soundEnabled;
        if (chkTimer) chkTimer.checked = prefs.timerEnabled;
        if (chkShake) chkShake.checked = prefs.shakeEnabled;
        if (btnCyber) btnCyber.classList.toggle("selected", prefs.theme === "cyberpunk");
        if (btnClassic) btnClassic.classList.toggle("selected", prefs.theme === "classic-ide");
    }

    function openHelpModal() {
        syncModalControls();
        const modal = document.getElementById("ihc-help-modal");
        if (modal) modal.classList.remove("hidden");
    }

    function bindCapsLockWarning(inputEl, warningEl) {
        if (!inputEl || !warningEl) return;
        const checkCaps = (e) => {
            if (e.getModifierState && e.getModifierState("CapsLock")) {
                if (warningEl.classList.contains("hidden")) playSound("error");
                warningEl.classList.remove("hidden");
            } else {
                warningEl.classList.add("hidden");
            }
        };
        inputEl.addEventListener("keyup", checkCaps);
        inputEl.addEventListener("keydown", checkCaps);
        inputEl.addEventListener("blur", () => warningEl.classList.add("hidden"));
    }

    // Injeta a Xícara de Café 8-Bit como Favicon na aba de todas as páginas
    function injectRetroFavicon() {
        const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
            <path d="M6 1h1v2H6v1h1v2H6V5H5V3h1V1zm3 0h1v2H9v1h1v2H9V5H8V3h1V1z" fill="#f89820"/>
            <path d="M3 7h8v1h2v3h-2v1h-1v1H4v-1H3V7zm8 2v1h1V9h-1z" fill="#00a8ff"/>
            <rect x="4" y="8" width="6" height="3" fill="#5382a1"/>
            <rect x="2" y="14" width="10" height="1" fill="#00a8ff"/>
        </svg>`;

        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/svg+xml";
        link.href = `data:image/svg+xml,${encodeURIComponent(svgFavicon)}`;
        document.head.appendChild(link);
    }

    document.addEventListener("DOMContentLoaded", () => {
        injectRetroFavicon();
        setupSidebarAndSettingsModal();
        setupGlobalSoundListeners();
        setupQuizFeedbackObserver();
        applyThemeAndPrefs();
    });

    return {
        PATENTES,
        getPrefs,
        savePrefs,
        playSound,
        openHelpModal,
        bindCapsLockWarning,
        applyThemeAndPrefs,
        limparEmojis,
        obterMetaCargo,
        criarElementoCargo,
        renderizarCargo
    };
})();