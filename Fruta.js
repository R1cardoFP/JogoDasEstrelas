class Fruta {
	constructor(imagem, larguraCanvas, alturaCanvas) {
		this.imagem = imagem;
		this.larguraCanvas = larguraCanvas;
		this.alturaCanvas = alturaCanvas;
		this.x = random(20, larguraCanvas - 20);
		this.y = -20;
		this.velocidadeY = random(1, 3);
		this.ativa = true;
	}

	atualizar() {
		this.y += this.velocidadeY;
		if (this.y > this.alturaCanvas + 20) {
			this.ativa = false;
		}
	}

	desenhar() {
		imageMode(CENTER);
		image(this.imagem, this.x, this.y, 40, 40);
	}
}
