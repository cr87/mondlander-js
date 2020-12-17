function createTerrainObject(terrain, starfield)
{
    let line = new PIXI.Graphics();
    line.lineStyle(1, 0xFFFFFF, 1);
    line.moveTo(terrain[0][0], terrain[0][1]);
    for(var i = 0; i < terrain.length; ++i)
    {
        line.lineTo(terrain[i][0], terrain[i][1]);
    }

    let sf = new PIXI.Graphics();
    sf.lineStyle(1, 0xFFFFFF, 1);
    for(let i = 0; i < starfield.length; ++i)
    {
        sf.drawCircle(starfield[i][0], starfield[i][1], 0.25);
    }

    let container = new PIXI.Container();
    container.addChild(sf);
    container.addChild(line);
    return container;
}

function createPlayerObject()
{
    let player = new PIXI.Graphics();
    player.name = 'player';
    player.lineStyle(1, 0xFFFFFF, 1);
    player.beginFill(0x000000, 1);
    player.drawCircle(0, 0, 4)
    player.drawRect(-4, 4, 8, 2);
    // Legs
    player.moveTo(-2, 6);
    player.lineTo(-4, 9);
    player.moveTo(2, 6);
    player.lineTo(4, 9);
    // Engine
    player.moveTo(-1, 6);
    player.lineTo(-2, 8);
    player.lineTo(2, 8);
    player.lineTo(1, 6);
    player.endFill();
    player.pivot.set(0,0);

    //Exhaust
    let exhaust = new PIXI.Graphics();
    exhaust.name = 'exhaust';
    exhaust.lineStyle(1, 0xFFFFFF, 1);
    exhaust.beginFill(0x000000, 1);
    exhaust.moveTo(-1, 8);
    exhaust.lineTo(-2, 10);
    exhaust.lineTo(0, 14);
    exhaust.lineTo(2, 10);
    exhaust.lineTo(1, 8);
    exhaust.endFill();
    exhaust.pivot.set(0,0)
    exhaust.visible = false;

    let container = new PIXI.Container();
    container.addChild(player);
    container.addChild(exhaust);
    return container;
}

function createGuiObject()
{
    let stateText = new PIXI.Text();
    stateText.name = "state";
    stateText.style.fill = 'white';
    stateText.style.fontFamily = "Courier";
    stateText.style.fontSize = 14;
    stateText.style.align = 'left';

    let centerText = new PIXI.Text();
    centerText.name = "center";
    centerText.style.fill = 'white';
    centerText.style.fontFamily = "Courier";
    centerText.style.fontSize = 20;
    centerText.style.align = 'center';

    let aboutText = new PIXI.Text();
    aboutText.name = "about";
    aboutText.style.fill = 'white';
    aboutText.style.fontFamily = "Courier";
    aboutText.style.fontSize = 12;
    aboutText.style.align = 'right';
    aboutText.text = 'Mondlander, a covid project by cr87';

    let container = new PIXI.Container();
    container.addChild(stateText);
    container.addChild(centerText);
    container.addChild(aboutText);
    return container;
}
