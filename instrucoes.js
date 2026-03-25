class Instrucoes {
	constructor(largura, altura) {
		this.largura = largura;
		this.altura = altura;
	}

	desenhar() {
		const painelX = this.largura / 2;
		const painelY = this.altura / 2 - 80;
		const painelLargura = 700;
		const painelAltura = 320;

		rectMode(CENTER);
		noStroke();
		fill(20, 20, 20, 180);
		rect(painelX, painelY, painelLargura, painelAltura, 24);
		stroke(255, 100);
		strokeWeight(1);
		noFill();
		rect(painelX, painelY, painelLargura, painelAltura, 24);

		fill(255);
		textAlign(CENTER, CENTER);
		textSize(32);
		text('Instruções', painelX, painelY - 90);

		fill(220);
		textSize(19);
		text('Objetivo: apanhar o máximo de frutas em 60 segundos.', painelX, painelY - 54);

		textAlign(CENTER, CENTER);
		fill(245);
		textSize(18);
		text('1. Aproxima a mão da fruta para agarrar.', painelX, painelY - 16);
		text('2. Arrasta a fruta com a mão até ao cesto.', painelX, painelY + 28);
		text('3. Se a fruta entrar no cesto, conta como êxito.', painelX, painelY + 72);
		text('4. Mantém a mão visível para não largar a fruta.', painelX, painelY + 116);
		noStroke();
	}
}
