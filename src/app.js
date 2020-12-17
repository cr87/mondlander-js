PIXI.utils.sayHello()

var app = new PIXI.Application({
    width: APP_SCREEN_WIDTH,
    height: APP_SCREEN_HEIGHT,
    antialias: true,
    transparent: false,
    resolution: 1
  }
);

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);
PIXI.loader.load(setup);

function setup()
{
    gameInit();
    app.ticker.add(delta => gameLoop(delta));
}
