// Confetti (apenas se estiver no index)
if (document.getElementById('confetti')) {
    const confettiSettings = {
        target: 'confetti',
        max: 150,
        size: 1.2,
        animate: true,
        props: ['circle', 'square'],
        colors: [[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126]]
    };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
}

(function () {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    function criarBalao() {
        const item = document.createElement("div");

        item.textContent = "🎈";
        item.style.position = "absolute";
        item.style.left = Math.random() * 100 + "vw";
        item.style.top = "-5vh"; // começa acima da tela
        item.style.fontSize = (24 + Math.random() * 10) + "px";
        item.style.opacity = "0.9";
        item.style.animation = "cairBalao 7s linear forwards";
        container.appendChild(item);

        setTimeout(() => item.remove(), 7000);
    }

    setInterval(criarBalao, 600);

    const estilo = document.createElement("style");
    estilo.textContent = `
    @keyframes cairBalao {
      to {
        transform: translateY(110vh);
        opacity: 0;
      }
    }
  `;
    document.head.appendChild(estilo);
})();



// Adiciona visualmente as estrelas no DOM
function criarEstrelasTentativas() {
    const container = document.querySelector('.contador-tentativas');
    if (!container) return;

    container.innerHTML = ''; // Limpa anteriores

    for (let i = 0; i < 20; i++) {
        const estrela = document.createElement('span');
        estrela.className = 'tentativa-estrela';
        estrela.textContent = '⭐';
        container.appendChild(estrela);
    }
}

// Atualiza visualmente após erro
function atualizarEstrelas() {
    const estrelas = document.querySelectorAll('.tentativa-estrela');
    if (estrelas[tentativasRestantes]) {
        estrelas[tentativasRestantes].style.visibility = 'hidden';
    }
}



// Index - botão START
function startGame() {
    window.location.href = "menu.html";
}

// Menu - botões
function startGameFromMenu() {
    window.location.href = "jogar.html";
}

function showCredits() {
    alert("Feito com amor pela Nana e meu amigo ChatGPT 💜");
}

function showOptions() {
    window.location.href = "opcoes.html";
}

function Back() {
    window.location.href = "inicial.html";
}

function voltarMenu() {
    window.location.href = "menu.html";
}


// Inicializar progresso se não existir
if (!localStorage.getItem('progressoAmor')) {
    localStorage.setItem('progressoAmor', JSON.stringify({
        mural: false,
        memoria: false,
        wordle: false,
        caminho: false
    }));
}

function atualizarBarraDeVida() {
    const progresso = JSON.parse(localStorage.getItem('progressoAmor'));
    const total = Object.keys(progresso).length;
    const completos = Object.values(progresso).filter(v => v).length;
    const porcentagem = (completos / total) * 100;

    const preenchimento = document.querySelector('.preenchimento');
    if (preenchimento) {
        preenchimento.style.width = `${porcentagem}%`;
    }

    // Desbloquear recompensa
    const recompensa = document.querySelector('.bloco-jogo.bloqueado');
    if (recompensa && completos === total) {
        recompensa.classList.remove('bloqueado');
        recompensa.innerHTML = '🎁<br><span>Recompensa<br>Desbloqueada!</span>';
    }
}

function marcarJogoComoConcluido(nomeDoJogo) {
    const progresso = JSON.parse(localStorage.getItem('progressoAmor'));
    progresso[nomeDoJogo] = true;
    localStorage.setItem('progressoAmor', JSON.stringify(progresso));
}

function resetarProgresso() {
    const confirmar = confirm("Tem certeza que quer resetar o progresso?");
    if (confirmar) {
        localStorage.removeItem("progressoAmor");
        localStorage.removeItem("progressoMemoria");
        localStorage.removeItem("progressoWordle");
        localStorage.removeItem("estadoCartasMemoria");

        alert("Progresso de todos os jogos resetado com sucesso!");
        location.reload(); // Recarrega a página para refletir as mudanças
    }
}

// JOGO DA MEMÓRIA //

const imagens = [
    'img/astra.png', 'img/brim.png', 'img/cypher.png', 'img/jett.jpeg', 'img/killjoy.png',
    'img/phoenix.jpeg', 'img/reyna.jpeg', 'img/sage.png', 'img/skye.png', 'img/viper.jpeg'
];

const MAX_TENTATIVAS = 16;
let tentativasRestantes = MAX_TENTATIVAS;
let cartas = [];
let primeiraCarta = null;
let travar = false;

// --------------------- Estado inicial ------------------------

function criarCartas() {
    const pares = [...imagens, ...imagens];
    const embaralhadas = pares.sort(() => Math.random() - 0.5);
    return embaralhadas.map((img, index) => ({
        id: index,
        imagem: img,
        estado: false
    }));
}

function salvarCartasLocalStorage() {
    localStorage.setItem("estadoCartasMemoria", JSON.stringify(cartas));
    const progresso = JSON.parse(localStorage.getItem('progressoAmor')) || {};
    progresso.memoria = true;
    localStorage.setItem('progressoAmor', JSON.stringify(progresso));
}

function carregarCartasSalvas() {
    const salvas = localStorage.getItem("estadoCartasMemoria");
    if (salvas) {
        cartas = JSON.parse(salvas);
        return true;
    }
    return false;
}

// --------------------- Renderização ------------------------

function renderizarTabuleiro() {
    const tabuleiro = document.querySelector('.tabuleiro-memoria');
    tabuleiro.innerHTML = '';

    cartas.forEach((carta, index) => {
        const divCarta = document.createElement('div');
        divCarta.className = 'carta';
        divCarta.innerHTML = `
      <div class="carta-inner ${carta.estado ? 'virada acertou' : ''}">
        <div class="carta-frente"></div>
        <div class="carta-verso" style="background-image: url('${carta.imagem}')"></div>
      </div>
    `;
        if (carta.estado) divCarta.classList.add('virada', 'acertou');
        if (!carta.estado) {
            divCarta.addEventListener('click', () => virarCarta(index, divCarta));
        }

        tabuleiro.appendChild(divCarta);
    });

    renderizarEstrelas();
}

function renderizarEstrelas() {
    const estrelasContainer = document.querySelector('.tentativas');
    estrelasContainer.innerHTML = '';
    for (let i = 0; i < MAX_TENTATIVAS; i++) {
        const estrela = document.createElement('span');
        estrela.textContent = '⭐️';
        estrela.className = 'tentativa-estrela';
        estrela.style.visibility = i < tentativasRestantes ? 'visible' : 'hidden';
        estrelasContainer.appendChild(estrela);
    }
}

// --------------------- Interação ------------------------

function virarCarta(index, divCarta) {
    if (travar || cartas[index].estado) return;

    divCarta.classList.add('virada');

    if (!primeiraCarta) {
        primeiraCarta = { index, imagem: cartas[index].imagem };
    } else {
        travar = true;
        const segundaImagem = cartas[index].imagem;

        if (primeiraCarta.imagem === segundaImagem) {
            cartas[primeiraCarta.index].estado = true;
            cartas[index].estado = true;

            setTimeout(() => {
                document.querySelectorAll('.carta')[primeiraCarta.index].classList.add('acertou');
                divCarta.classList.add('acertou');
                primeiraCarta = null;
                travar = false;
                verificarVitoria();
            }, 500);
        } else {
            tentativasRestantes--;
            renderizarEstrelas();

            setTimeout(() => {
                document.querySelectorAll('.carta')[primeiraCarta.index].classList.remove('virada');
                divCarta.classList.remove('virada');
                primeiraCarta = null;
                travar = false;

                if (tentativasRestantes === 0) {
                    alert("💔 Você perdeu! Tente novamente.");
                    resetarCartas();
                }
            }, 1000);
        }
    }
}


// --------------------- Vitória & Reset ------------------------

function verificarVitoria() {
    const venceu = cartas.every(c => c.estado);
    if (venceu && tentativasRestantes > 0) {
        alert("🎉 Você venceu o jogo da memória!");
        salvarCartasLocalStorage();
    }
}

function resetarCartas() {
    cartas = criarCartas();
    tentativasRestantes = MAX_TENTATIVAS;
    localStorage.removeItem("estadoCartasMemoria");

    const progresso = JSON.parse(localStorage.getItem('progressoAmor')) || {};
    progresso.memoria = false;
    localStorage.setItem('progressoAmor', JSON.stringify(progresso));

    renderizarTabuleiro();
}

// --------------------- Inicialização ------------------------

function iniciarJogoMemoria() {
    const ganhouAntes = carregarCartasSalvas();
    if (!ganhouAntes) {
        cartas = criarCartas();
    }

    tentativasRestantes = MAX_TENTATIVAS;
    renderizarTabuleiro();
}

document.addEventListener('DOMContentLoaded', iniciarJogoMemoria);



// ---------------------wordle.js---------------------//

// script.js

let jogoFinalizado = false;
localStorage.setItem("jogoFinalizado", JSON.stringify(jogoFinalizado));

const fases = ["dormir", "arvores", "covinha"];
const maxTentativas = [6, 7, 8];

let faseAtual = 0;
let palavraAtual = "";
let inputUsuario = "";
let tentativas = [];

let tentativasPorFase = [[], [], []]; // uma para cada fase

const progressoFases = fases.map(palavra => ({ palavra, vencido: false }));

// 🧠 Carrega o progresso e atualiza a palavra atual
carregarProgresso();

function criarGrid() {
    const grid = document.getElementById("grade-wordle");
    grid.innerHTML = "";

    if (faseAtual >= fases.length) {
        atualizarMedalhas();
        // mostrar a última fase como memória visual
        tentativas = tentativasPorFase[fases.length - 1] || [];
        palavraAtual = fases[fases.length - 1];
    }



    tentativas = tentativasPorFase[faseAtual] || [];

    for (let i = 0; i < maxTentativas[faseAtual]; i++) {
        const linha = document.createElement("div");
        linha.className = "linha-wordle";

        for (let j = 0; j < fases[faseAtual].length; j++) {
            const letra = document.createElement("div");
            letra.className = "bloco-letra";
            linha.appendChild(letra);
        }

        grid.appendChild(linha);
    }

    atualizarLinha();
    atualizarMedalhas();
}




function atualizarLinha() {
    const linhas = document.querySelectorAll(".linha-wordle");

    linhas.forEach((linha, i) => {
        const letras = linha.querySelectorAll(".bloco-letra");
        const tentativa = tentativas[i] || "";

        letras.forEach((bloco, j) => {
            const char = tentativa[j] || (i === tentativas.length ? inputUsuario[j] || "" : "");
            bloco.textContent = char || "";
            bloco.className = "bloco-letra";

            if (i < tentativas.length) {
                const letraTentada = tentativa[j];
                if (palavraAtual[j] === letraTentada) {
                    bloco.classList.add("correto");
                } else if (palavraAtual.includes(letraTentada)) {
                    bloco.classList.add("parcial");
                } else {
                    bloco.classList.add("errado");
                }
            }
        });

        linha.classList.toggle("linha-atual", i === tentativas.length && faseAtual < fases.length);

    });

    atualizarTeclado();
}

function processarTentativa() {
  if (inputUsuario.length !== palavraAtual.length) return;

  tentativas.push(inputUsuario);
  tentativasPorFase[faseAtual] = [...tentativas];

  if (inputUsuario === palavraAtual) {
    mostrarMedalha(["bronze", "prata", "ouro"][faseAtual]);

    const nomeFase = ["primeira", "segunda", "terceira"][faseAtual];

    if (faseAtual === fases.length - 1) {
      // ✅ Acertou a última fase → finalizar jogo
      alert("✨ Você completou todas as fases! Te amo, mozão! ✨");

      const progresso = JSON.parse(localStorage.getItem("progressoAmor")) || {};
      progresso.wordle = true;
      localStorage.setItem("progressoAmor", JSON.stringify(progresso));

      salvarProgresso();
      atualizarStepper();
      criarGrid();

      jogoFinalizado = true;
      localStorage.setItem("jogoFinalizado", JSON.stringify(jogoFinalizado));
      return;
    }

    // ✅ Ainda não é a última fase → passar para a próxima
    setTimeout(() => {
      alert(`✅ Parabéns! Você passou da ${nomeFase} fase. Vamos para a próxima!`);

      faseAtual++;
      palavraAtual = fases[faseAtual];
      inputUsuario = "";
      tentativas = [];

      salvarProgresso();
      atualizarStepper();
      criarGrid();
    }, 300);

    return;
  }

  // ❌ Errou a palavra
  if (tentativas.length >= maxTentativas[faseAtual]) {
    alert("😢 Você perdeu essa fase. Tente novamente!");
    inputUsuario = "";
    tentativas = [];
  } else {
    inputUsuario = "";
  }

  atualizarLinha();
}


function handleKey(e) {
    if (jogoFinalizado) return;

    const letra = e.key.toLowerCase();
    if (/^[a-záàâãéêíóôõúç]$/.test(letra)) {
        if (inputUsuario.length < palavraAtual.length) {
            inputUsuario += letra;
        }
    } else if (e.key === "Backspace") {
        inputUsuario = inputUsuario.slice(0, -1);
    } else if (e.key === "Enter") {
        processarTentativa();
    }
    atualizarLinha();
}


function clicarLetra(letra) {
    if (faseAtual >= fases.length) return;
    if (letra === "⌫") {
        inputUsuario = inputUsuario.slice(0, -1);
    } else if (letra === "↵") {
        processarTentativa();
        return;
    } else {
        if (inputUsuario.length < palavraAtual.length) {
            inputUsuario += letra.toLowerCase();
        }
    }
    atualizarLinha();
}

function mostrarMedalha(tipo) {
    const medalha = document.querySelector(`.medalha-${tipo}`);
    if (medalha) medalha.style.display = "inline-block";
}

function atualizarMedalhas() {
    if (faseAtual >= 1) mostrarMedalha("bronze");
    if (faseAtual >= 2) mostrarMedalha("prata");
    if (faseAtual >= 3) mostrarMedalha("ouro");
}

function atualizarStepper() {
    const stepElements = document.querySelectorAll(".step");

    stepElements.forEach((step, index) => {
        const label = step.querySelector(".label");
        step.classList.remove("locked");

        if (index > faseAtual) {
            step.classList.add("locked");
            label.innerHTML = "🔒";
        } else {
            const medalha = ["🥉", "🥈", "🥇"][index] || "";
            const palavra = (tentativasPorFase[index]?.includes(fases[index])) ? fases[index].toUpperCase() : "???";
            label.innerHTML = `${medalha} <span class="word">${palavra}</span>`;
        }
    });
}

function salvarProgresso() {
    const progresso = {
        faseAtual,
        tentativasPorFase,
    };
    localStorage.setItem("progressoWordle", JSON.stringify(progresso));
}


function carregarProgresso() {
    const salvo = localStorage.getItem("progressoWordle");
    const jogoFimStatus = localStorage.getItem("jogoFinalizado");

    if (salvo) {
        const dados = JSON.parse(salvo);
        faseAtual = dados.faseAtual || 0;
        jogoFinalizado = jogoFimStatus;
        tentativasPorFase = dados.tentativasPorFase || [[], [], []];
        tentativas = tentativasPorFase[faseAtual] || [];
    }

    if (faseAtual < fases.length) {
        palavraAtual = fases[faseAtual];
        tentativas = tentativasPorFase[faseAtual] || [];
    } else {
        // jogo vencido: exibe última fase como recordação
        palavraAtual = fases[fases.length - 1];
        tentativas = tentativasPorFase[fases.length - 1] || [];
    }



    atualizarLinha();
    atualizarMedalhas();
    atualizarStepper();

    criarGrid();// ← ESSENCIAL para preencher o grid com as tentativas

}


function resetarWordle() {
    localStorage.removeItem("progressoWordle");
    const progresso = JSON.parse(localStorage.getItem("progressoAmor")) || {};
    delete progresso.wordle;
    localStorage.setItem("progressoAmor", JSON.stringify(progresso));

    faseAtual = 0;
    palavraAtual = fases[0];
    inputUsuario = "";
    tentativas = [];
    tentativasPorFase = [[], [], []];
    atualizarStepper();


    document.querySelectorAll(".medalha").forEach((m) => (m.style.display = "none"));
    criarGrid();
    jogoFinalizado = false;
}


function voltarAoMenu() {
    window.location.href = "jogar.html";
}

function atualizarTeclado() {
    // se desejar implementar o teclado virtual interativo com cores, adicione aqui
}

document.addEventListener("keydown", handleKey);

