// --- camera e deteccao de mao
let video;
let handPose;
let hands = [];

// --- objetos e recursos do jogo
let cestoImg;
let cesto;
let mao;
let frutaImg;
let frutas = [];
let frutaAgarrada = null;
let menu;
let somScore;

// --- estado de jogo
let pontos = 0;
let tempoInicioJogo = 0;
let jogoIniciado = false;
let jogoTerminado = false;
let tempoRepetir = 0;

// --- configuracao geral
const LARGURA_CANVAS = 960;
const ALTURA_CANVAS = 720;
const DURACAO_JOGO_MS = 60000;
const TEMPO_HOVER_REPETIR = 3;
const QUANTIDADE_FRUTAS = 4;
const botaoRepetir = { x: LARGURA_CANVAS / 2, y: ALTURA_CANVAS / 2 + 120, largura: 220, altura: 55 };

function estaSobreBotao(x, y, botao) {
  // --- verifica se um ponto esta dentro de um botao
  return x > botao.x - botao.largura / 2 &&
         x < botao.x + botao.largura / 2 &&
         y > botao.y - botao.altura / 2 &&
         y < botao.y + botao.altura / 2;
}

function iniciarJogo() {
  // --- inicia/reinicia variaveis principais de jogo
  pontos = 0;
  tempoInicioJogo = millis();
  jogoTerminado = false;
  frutaAgarrada = null;
  tempoRepetir = 0;

  for (let i = 0; i < frutas.length; i++) {
    resetarFruta(frutas[i]);
  }
}

function resetarFruta(frutaAtual) {
  // --- volta a fruta para cima para cair novamente
  frutaAtual.y = -20;
  frutaAtual.x = random(20, width - 20);
  frutaAtual.velocidadeY = random(1, 3);
  frutaAtual.ativa = true;
}

function preload() {
  // --- carrega imagens e modelo de detecao da mao
  cestoImg = loadImage('assets/cesto.png');
  frutaImg = loadImage('assets/estrela.png');
  somScore = loadSound('assets/som/score.mp3');
  handPose = ml5.handPose({ maxHands: 2, flipped: false });
}

function gotHands(results) {
  // --- guarda as maos detetadas em cada frame
  hands = results;
}

function setup() {
  // --- cria canvas e configura a camera
  pixelDensity(1);
  createCanvas(LARGURA_CANVAS, ALTURA_CANVAS);

  video = createCapture({
    video: {
      width: LARGURA_CANVAS,
      height: ALTURA_CANVAS,
      facingMode: 'user',
    },
    audio: false,
  }); 

  video.size(width, height);
  video.hide();

  // --- cria objetos do jogo
  cesto = new Cesto(cestoImg, width, height);
  mao = new Mao();
  menu = new Menu(width, height);
  handPose.detectStart(video, gotHands);

  for (let i = 0; i < QUANTIDADE_FRUTAS; i++) {
    frutas.push(new Fruta(frutaImg, width, height));
  }
}

function draw() {
  if (menu.ativo) {
    // --- fase de menu/instrucoes
    if (menu.estado === 'instrucoes') {
      background(15, 20, 30);
    } else {
      imageMode(CORNER);
      translate(width, 0);
      scale(-1, 1);
      image(video, 0, 0, width, height);
      resetMatrix();
    }

    menu.atualizar(hands);
    menu.desenhar();

    for (let i = 0; i < hands.length && i < 2; i++) {
      mao.desenhar(hands[i], width, true);
    }
  } else {
    // --- fase de jogo
    if (!jogoIniciado) {
      iniciarJogo();
      jogoIniciado = true;
    }

    // --- limpa o ecra a cada frame
    background(0);

    // --- desenha o video espelhado
    imageMode(CORNER);
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    resetMatrix();

    const tempoPassado = millis() - tempoInicioJogo;
    let tempoRestanteMs = DURACAO_JOGO_MS - tempoPassado;
    if (tempoRestanteMs < 0) {
      tempoRestanteMs = 0;
    }

    if (tempoRestanteMs === 0) {
      jogoTerminado = true;
      frutaAgarrada = null;
    }

    // --- atualiza o cesto apenas se o jogo ainda estiver ativo
    if (!jogoTerminado) {
      cesto.atualizar();
    }
    cesto.desenhar();

    if (!jogoTerminado) {
      // --- usa apenas a primeira mao detetada
      const hand = hands.length > 0 ? hands[0] : null;
      let centroMao = null;

      if (hand) {
        // --- calcula o centro da mao e verifica se tocou em alguma fruta
        let somaX = 0;
        let somaY = 0;
        let total = 0;
        let frutaTocada = null;

        for (const nomePonto in hand) {
          const ponto = hand[nomePonto];
          if (ponto && typeof ponto.x === 'number' && typeof ponto.y === 'number') {
            const x = width - ponto.x;
            const y = ponto.y;

            somaX += x;
            somaY += y;
            total++;

            if (!frutaTocada) {
              for (let i = 0; i < frutas.length; i++) {
                if (dist(x, y, frutas[i].x, frutas[i].y) < 40) {
                  frutaTocada = frutas[i];
                  break;
                }
              }
            }
          }
        }

        if (total > 0) {
          centroMao = {
            x: somaX / total,
            y: somaY / total,
          };
        }

        if (!frutaAgarrada && frutaTocada) {
          // --- quando toca na fruta, fica agarrada
          frutaAgarrada = frutaTocada;
        }
      } else {
        // --- sem mao no ecran, larga a fruta
        frutaAgarrada = null;
      }

      // --- limites do cesto para detetar entrada da fruta
      const esquerda = cesto.x - cesto.largura / 2;
      const direita = cesto.x + cesto.largura / 2;
      const topo = cesto.y - cesto.altura / 2;
      const base = cesto.y + cesto.altura / 2;

      // --- atualiza cada fruta e verifica colisao com cesto
      for (let i = 0; i < frutas.length; i++) {
        const frutaAtual = frutas[i];

        if (frutaAgarrada === frutaAtual && centroMao) {
          // --- com fruta agarrada, arrasta com a mao
          frutaAtual.x = centroMao.x;
          frutaAtual.y = centroMao.y;
        } else {
          // --- sem agarrar, fruta cai normalmente
          frutaAtual.atualizar();
        }

        const entrouNoCesto =
          frutaAtual.x >= esquerda &&
          frutaAtual.x <= direita &&
          frutaAtual.y >= topo &&
          frutaAtual.y <= base;

        if (entrouNoCesto) {
          // --- ao entrar no cesto, soma ponto e reinicia a fruta
          pontos++;
          if (somScore) {
            somScore.play();
          }
          if (frutaAgarrada === frutaAtual) {
            frutaAgarrada = null;
          }
          resetarFruta(frutaAtual);
        }

        if (!frutaAtual.ativa) {
          // --- se sair do ecran, reinicia a fruta
          if (frutaAgarrada === frutaAtual) {
            frutaAgarrada = null;
          }
          resetarFruta(frutaAtual);
        }
      }
    }

    // --- desenha as frutas
    for (let i = 0; i < frutas.length; i++) {
      frutas[i].desenhar();
    }

    // --- mostra pontuacao e tempo em tempo real com painel de HUD
    if (!jogoTerminado) {
      const tempoRestanteSegundos = ceil(tempoRestanteMs / 1000);
      const hudX = 18;
      const hudY = 14;
      const hudLargura = 220;
      const hudAltura = 92;

      rectMode(CORNER);
      noStroke();
      fill(15, 18, 24, 165);
      rect(hudX, hudY, hudLargura, hudAltura, 12);

      fill(255, 170, 90);
      rect(hudX + 10, hudY + 12, 5, hudAltura - 24, 3);

      textAlign(LEFT, TOP);
      textStyle(NORMAL);
      fill(215);
      textSize(15);
      text('Pontuação', hudX + 24, hudY + 12);
      fill(255);
      textSize(30);
      text(pontos, hudX + 24, hudY + 30);

      fill(215);
      textSize(15);
      text('Tempo', hudX + 120, hudY + 12);
      fill(255);
      textSize(30);
      text(tempoRestanteSegundos + 's', hudX + 120, hudY + 30);
    }

    // --- desenha a luva/pontos da mao por cima do video durante o jogo
    if (!jogoTerminado) {
      for (let i = 0; i < hands.length && i < 2; i++) {
        mao.desenhar(hands[i], width, true);
      }
    }

    if (jogoTerminado) {
      // --- hover com dedo indicador para repetir o jogo
      let dedoSobreRepetir = false;

      if (hands.length > 0 && hands[0].index_finger_tip) {
        const dedo = hands[0].index_finger_tip;
        const dedoX = width - dedo.x;
        const dedoY = dedo.y;
        dedoSobreRepetir = estaSobreBotao(dedoX, dedoY, botaoRepetir);
      }

      if (dedoSobreRepetir) {
        tempoRepetir += deltaTime / 1000;
        if (tempoRepetir >= TEMPO_HOVER_REPETIR) {
          // --- reinicia jogo quando completa 3 segundos no botao
          iniciarJogo();
        }
      } else {
        tempoRepetir = 0;
      }

      // --- ecran final ao terminar o tempo
      fill(0, 155);
      rectMode(CORNER);
      rect(0, 0, width, height);

      rectMode(CENTER);
      noStroke();
      fill(20, 20, 20, 190);
      rect(width / 2, height / 2 + 20, 660, 400, 24);
      stroke(255, 100);
      strokeWeight(1);
      noFill();
      rect(width / 2, height / 2 + 20, 660, 400, 24);

      fill(255);
      textAlign(CENTER, CENTER);
      textSize(44);
      text('Tempo esgotado', width / 2, height / 2 - 95);
      textSize(30);
      text('Pontuação final: ' + pontos, width / 2, height / 2 - 35);

      let desempenho = 'Fraco';
      if (pontos >= 12) {
        desempenho = 'Muito Bom';
      } else if (pontos >= 8) {
        desempenho = 'Bom';
      } else if (pontos >= 4) {
        desempenho = 'Regular';
      }

      textSize(26);
      text('Desempenho: ' + desempenho, width / 2, height / 2 + 10);

      const progresso = tempoRepetir / TEMPO_HOVER_REPETIR;
      noStroke();
      fill(255, 230);
      rectMode(CENTER);
      rect(botaoRepetir.x, botaoRepetir.y, botaoRepetir.largura, botaoRepetir.altura, 14);
      if (progresso > 0) {
        fill(40, 170, 120, 150);
        rect(
          botaoRepetir.x - botaoRepetir.largura / 2 + (botaoRepetir.largura * progresso) / 2,
          botaoRepetir.y,
          botaoRepetir.largura * progresso,
          botaoRepetir.altura,
          14
        );
      }

      fill(35);
      textSize(22);
      text('Repetir', botaoRepetir.x, botaoRepetir.y);

      fill(230);
      textSize(18);
      text('Mantém o dedo no botão durante 3 segundos', width / 2, botaoRepetir.y + 74);

      // --- desenha a mao por cima do ecran final para facilitar o hover
      for (let i = 0; i < hands.length && i < 2; i++) {
        mao.desenhar(hands[i], width, true);
      }
    }
  }
}