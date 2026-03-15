let video;

function setup() {
  createCanvas(640, 480);

  video = createCapture({
    video: true,
    audio: false,
  });

  video.size(width, height);
  video.hide();
}

function draw() {
  background(0);

  
  image(video, 0, 0, width, height);

  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text("Camera ativa", 12, 12);
}