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

  atualizar(hands) {
    if (!this.ativo) return;

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

    fill(255);
    textAlign(CENTER, CENTER);

    if (this.estado === 'principal') {
      textSize(32);
      text('Medicatch', this.largura / 2, this.altura / 4);

      this.desenharBotao(this.botaoIniciar, 'Iniciar', this.tempoIniciar);
      this.desenharBotao(this.botaoInstrucoes, 'Instruções', this.tempoInstrucoes);

      textSize(16);
      text('Aponte o dedo indicador para o botão por 3 segundos', this.largura / 2, this.altura - 50);
    } else if (this.estado === 'instrucoes') {
      this.instrucoes.desenhar();

      this.desenharBotao(this.botaoIniciarInstrucoes, 'Iniciar', this.tempoIniciar);
      this.desenharBotao(this.botaoVoltar, 'Voltar', this.tempoVoltar);

      textSize(16);
      text('Aponte o dedo indicador para o botão por 3 segundos', this.largura / 2, this.altura - 35);
    }
  }

  desenharBotao(botao, texto, tempo) {
    const progresso = tempo / 3;
    fill(255);
    rectMode(CENTER);
    rect(botao.x, botao.y, botao.largura, botao.altura);
    if (progresso > 0) {
      fill(0, 255, 0);
      rect(botao.x - botao.largura / 2 + (botao.largura * progresso) / 2, botao.y, botao.largura * progresso, botao.altura);
    }
    fill(0);
    textSize(20);
    text(texto, botao.x, botao.y);
  }
}
