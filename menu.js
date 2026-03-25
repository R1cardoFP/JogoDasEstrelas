class Menu {
  constructor(largura, altura) {
    this.largura = largura;
    this.altura = altura;
    this.instrucoes = new Instrucoes(largura, altura);
    this.ativo = true;
    this.estado = 'principal';
    this.botaoIniciar = { x: largura / 2, y: altura / 2 - 50, largura: 200, altura: 50 };
    this.botaoInstrucoes = { x: largura / 2, y: altura / 2 + 50, largura: 200, altura: 50 };
    this.botaoIniciarInstrucoes = { x: largura / 2, y: altura - 170, largura: 200, altura: 50 };
    this.botaoVoltar = { x: largura / 2, y: altura - 100, largura: 150, altura: 40 };
    this.tempoIniciar = 0;
    this.tempoInstrucoes = 0;
    this.tempoVoltar = 0;
    this.selecionado = null;
  }

  atualizarLayout() {
    const centroX = this.largura / 2;
    const centroY = this.altura / 2;

    this.painelPrincipal = {
      x: centroX,
      y: centroY,
      largura: 440,
      altura: 340,
      raio: 20,
    };

    this.tituloPrincipalY = this.painelPrincipal.y - 120;
    this.subtituloPrincipalY = this.tituloPrincipalY + 40;
    this.botaoIniciar = { x: centroX, y: this.painelPrincipal.y - 12, largura: 200, altura: 50 };
    this.botaoInstrucoes = { x: centroX, y: this.painelPrincipal.y + 78, largura: 200, altura: 50 };
    this.hintPrincipalY = this.altura - 44;

    this.botaoIniciarInstrucoes = { x: centroX, y: this.altura - 158, largura: 200, altura: 50 };
    this.botaoVoltar = { x: centroX, y: this.altura - 92, largura: 150, altura: 40 };
    this.hintInstrucoesY = this.altura - 44;
  }

  atualizar(hands) {
    if (!this.ativo) return;

    this.atualizarLayout();

    for (const hand of hands) {
      if (!hand.index_finger_tip) {
        continue;
      }

      const x = this.largura - hand.index_finger_tip.x;
      const y = hand.index_finger_tip.y;

      if (this.estado === 'principal') {
        if (this.atualizarBotao(x, y, this.botaoIniciar, 'tempoIniciar')) {
          this.selecionado = 'iniciar';
          this.ativo = false;
        }

        if (this.atualizarBotao(x, y, this.botaoInstrucoes, 'tempoInstrucoes')) {
          this.estado = 'instrucoes';
          this.tempoInstrucoes = 0;
        }
      } else if (this.estado === 'instrucoes') {
        if (this.atualizarBotao(x, y, this.botaoIniciarInstrucoes, 'tempoIniciar')) {
          this.selecionado = 'iniciar';
          this.ativo = false;
        }

        if (this.atualizarBotao(x, y, this.botaoVoltar, 'tempoVoltar')) {
          this.estado = 'principal';
          this.tempoVoltar = 0;
        }
      }
    }
  }

  atualizarBotao(x, y, botao, nomeTempo) {
    if (this.estaSobre(x, y, botao)) {
      this[nomeTempo] += deltaTime / 1000;
      return this[nomeTempo] >= 3;
    }

    this[nomeTempo] = 0;
    return false;
  }

  estaSobre(x, y, botao) {
    return x > botao.x - botao.largura / 2 && x < botao.x + botao.largura / 2 &&
           y > botao.y - botao.altura / 2 && y < botao.y + botao.altura / 2;
  }

  desenhar() {
    if (!this.ativo) return;

    this.atualizarLayout();

    textAlign(CENTER, CENTER);
    textStyle(NORMAL);

    if (this.estado === 'principal') {
      rectMode(CENTER);
      noStroke();
      fill(20, 20, 20, 165);
      rect(this.painelPrincipal.x, this.painelPrincipal.y, this.painelPrincipal.largura, this.painelPrincipal.altura, this.painelPrincipal.raio);
      stroke(255, 100);
      strokeWeight(1);
      noFill();
      rect(this.painelPrincipal.x, this.painelPrincipal.y, this.painelPrincipal.largura, this.painelPrincipal.altura, this.painelPrincipal.raio);
      noStroke();

      fill(255);
      textSize(40);
      text('Medicatch', this.largura / 2, this.tituloPrincipalY);
      fill(220);
      textSize(17);
      text('Apanha frutas com a tua mão', this.largura / 2, this.subtituloPrincipalY);

      this.desenharBotao(this.botaoIniciar, 'Iniciar', this.tempoIniciar);
      this.desenharBotao(this.botaoInstrucoes, 'Instruções', this.tempoInstrucoes);

      fill(0, 120);
      rect(this.largura / 2, this.hintPrincipalY, 500, 34, 8);
      fill(235);
      textSize(16);
      text('Aponte o dedo indicador para o botão durante 3 segundos', this.largura / 2, this.hintPrincipalY);
    } else if (this.estado === 'instrucoes') {
      this.instrucoes.desenhar();

      this.desenharBotao(this.botaoIniciarInstrucoes, 'Iniciar', this.tempoIniciar);
      this.desenharBotao(this.botaoVoltar, 'Voltar', this.tempoVoltar);

      fill(0, 120);
      rect(this.largura / 2, this.hintInstrucoesY, 500, 34, 8);
      fill(235);
      textSize(16);
      text('Aponte o dedo indicador para o botão durante 3 segundos', this.largura / 2, this.hintInstrucoesY);
    }
  }

  desenharBotao(botao, texto, tempo) {
    const progresso = constrain(tempo / 3, 0, 1);

    rectMode(CENTER);
    stroke(255, 120);
    strokeWeight(1);
    fill(255, 230);
    rect(botao.x, botao.y, botao.largura, botao.altura, 14);

    if (progresso > 0) {
      noStroke();
      fill(40, 170, 120, 150);
      rect(botao.x - botao.largura / 2 + (botao.largura * progresso) / 2, botao.y, botao.largura * progresso, botao.altura, 14);
    }

    noStroke();
    fill(35);
    textStyle(BOLD);
    textSize(19);
    text(texto, botao.x, botao.y);
    textStyle(NORMAL);
    noStroke();
  }
}
