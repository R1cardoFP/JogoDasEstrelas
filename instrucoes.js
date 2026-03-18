class Instrucoes {
	constructor(largura, altura) {
		this.largura = largura;
		this.altura = altura;
	}

	desenhar() {
		fill(255);
		textAlign(CENTER, CENTER);

		textSize(26);
		text('Instruções', this.largura / 2, this.altura / 2 - 140);
			textSize(20);
			text('Objetivo: apanhar o maximo de frutas em 60 segundos.', this.largura / 2, this.altura / 2 - 110);

		textSize(18);
		text('1. Aproxima a mão da fruta para agarrar.', this.largura / 2, this.altura / 2 - 90);
		text('2. Arrasta a fruta com a mão até ao cesto.', this.largura / 2, this.altura / 2 - 55);
		text('3. Se a fruta entrar no cesto, conta como acerto.', this.largura / 2, this.altura / 2 - 20);
		text('4. Mantém a mão visível para não largar a fruta.', this.largura / 2, this.altura / 2 + 15);
	}
}
