// Graphics objects
var objPlayer;
var objGui;
var objTerrain;
var objScene;
var objStarfield;

// Game state
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    FINISHED: 'finished'
};
var _game = GAME_STATE.MENU;

// Player state
var _player = {
    'x': PLAYER_START_X * APP_SCREEN_WIDTH,     // horizontal position in pixels
    'y': PLAYER_START_X * APP_SCREEN_HEIGHT,    // vertical position in pixels
    'phi': PLAYER_START_PHI,                    // heading in radians
    'vx': PLAYER_START_VX,                      // horizontal velocity in m/s
    'vy': PLAYER_START_VY,                      // vertical velocity in m/s
    'fuel': 1.0,                                // percentage of total payload
    'state': PLAYER_STATE.FLYING,               // Current player state
    'engine': ENGINE_STATE.DISENGAGED,          // Current engine state
    'altitude': 0.0                             // Altitude above ground in meters
};

// Camera pos
var _camera = 0;

function gameLoop(delta)
{
    // Compute elapsed time
    const dt = 0.06 * delta;

    if (_game == GAME_STATE.PLAYING)
    {
        // Update player physics
        playerUpdate(_player, _terrain, dt);

        // Manage zooming
        handleZooming(_player);

        // Manage scrolling
        handleScrolling(_player, _terrain, dt)

        // Check whether we are done
        checkGameFinished(_player);
    }
    else if ((_game == GAME_STATE.MENU) || (_game == GAME_STATE.FINISHED))
    {
        if (keySpace.isDown)
        {
            resetState();
            _game = GAME_STATE.PLAYING;
        }
    }

    // Always update GUI
    updateGuiObjects(_player);
}

function gameInit(seed)
{
    let terrain = terrainGenerator(APP_SCREEN_WIDTH, APP_SCREEN_HEIGHT);
    let starfield = terrainGenerateStarfield(terrain, GAME_STARFIELD_SPREAD);

    // Create graphics objects
    objTerrain = [
        createTerrainObject(terrain, starfield),
        createTerrainObject(terrain, starfield),
        createTerrainObject(terrain, starfield)
    ];
    objPlayer = createPlayerObject();
    objGui = createGuiObject();

    // Add everything to the scene
    objScene = new PIXI.Container();
    objScene.addChild(objTerrain[0]);
    objScene.addChild(objTerrain[1]);
    objScene.addChild(objTerrain[2]);
    objScene.addChild(objPlayer);
    app.stage.addChild(objScene);
    app.stage.addChild(objGui);

    // XXX
    _terrain = terrain;
}

function resetState()
{
    _player.x = PLAYER_START_X * APP_SCREEN_WIDTH;
    _player.y = PLAYER_START_X * APP_SCREEN_HEIGHT;
    _player.phi = PLAYER_START_PHI;
    _player.vx = PLAYER_START_VX;
    _player.vy = PLAYER_START_VY;
    _player.fuel = 1.0;
    _player.state = PLAYER_STATE.FLYING;
    _player.engine = ENGINE_STATE.DISENGAGED;
    _player.altitude = 0.0;
    _camera = 0;
}

function updateGuiObjects(playerState)
{
    const playText = "Press SPACE to play.";

    playerObj = objPlayer.getChildByName("player");
    exhaustObj = objPlayer.getChildByName("exhaust");
    stateText = objGui.getChildByName("state");
    centerText = objGui.getChildByName("center");
    aboutText = objGui.getChildByName("about");

    if (_game == GAME_STATE.PLAYING)
    {
        playerObj.visible = true;
        stateText.visible = true;
        centerText.visible = false;

        // Update player
        exhaustObj.visible = (playerState.engine == ENGINE_STATE.ENGAGED);
        playerObj.x = playerState.x;
        playerObj.y = playerState.y;
        playerObj.rotation = (playerState.phi - Math.PI * 0.5);
        exhaustObj.x = playerState.x;
        exhaustObj.y = playerState.y;
        exhaustObj.rotation = playerObj.rotation;

        // Wrap to -180,180 for prettiness
        let heading = (((playerState.phi * 180.0 / Math.PI) - 90.0).toFixed(0) % 360);
        if (heading > 180)
            heading -= 360

        // Should be 0m at least, for display purposes
        let altitude = Math.max(0, playerState.altitude).toFixed(0)

        // Convert percentage to kg of max payload
        let fuel = Math.floor(playerState.fuel * PLAYER_FUEL_PAYLOAD).toFixed(0)

        // Update status text
        stateText.text =
            "FUEL:       " + fuel + " kg\n" +
            "ALTITUDE:   " + altitude + " m\n" +
            "HEADING:    " + heading + " deg\n" +
            "HORZ SPEED: " + playerState.vx.toFixed(0) + " m/s\n" +
            "VERT SPEED: " + playerState.vy.toFixed(0) + " m/s\n";

        stateText.x = APP_SCREEN_WIDTH - stateText.width - GUI_MARGIN;
        stateText.y = GUI_MARGIN;
    }
    else if (_game == GAME_STATE.FINISHED)
    {
        exhaustObj.visible = false;
        centerText.visible = true;

        if (playerState.state == PLAYER_STATE.CRASHED)
            setCenterText(centerText, "You have crashed.\n\n" + playText);
        else if (playerState.state == PLAYER_STATE.LANDED)
            setCenterText(centerText, "You have landed.\n\n" + playText);
        else
            setCenterText(centerText, "");
    }
    else if (_game == GAME_STATE.MENU)
    {
        playerObj.visible = false;
        exhaustObj.visible = false;
        stateText.visible = false;
        centerText.visible = true;

        setCenterText(centerText, playText);
    }

    aboutText.x = APP_SCREEN_WIDTH - aboutText.width - GUI_MARGIN;
    aboutText.y = APP_SCREEN_HEIGHT - aboutText.height - GUI_MARGIN;
}

function handleScrolling(playerState, terrain, dt)
{
    // Compute the position of the three terrain tiles so that the player
    // is always on the center one
    const width = terrainWidth(terrain);
    const idx = Math.floor(playerState.x / width);
    objTerrain[0].x = (idx - 1) * width;
    objTerrain[1].x = idx * width;
    objTerrain[2].x = (idx + 1) * width;

    // Compute scroll speed in pixels per timestep
    let scrollSpeed = Math.ceil((Math.abs(playerState.vx) / GAME_METERS_PER_PIXEL) * dt);

    // Handle camera movement
    const threshold = APP_SCREEN_WIDTH * GAME_SCROLL_THRESHOLD;
    const pos = (playerState.x - _camera);
    if ((pos < threshold) && (playerState.vx <= 0))
    {
        // Scroll left
        _camera -= scrollSpeed;
    }
    else if ((pos > (APP_SCREEN_WIDTH - threshold)) && (playerState.vx >= 0))
    {
        // Scroll right
        _camera += scrollSpeed;
    }
}

function handleZooming(playerState)
{
    if (playerState.altitude < GAME_ZOOM_ALTITUDE)
    {
        objScene.scale.x = GAME_ZOOM_SCALE;
        objScene.scale.y = GAME_ZOOM_SCALE;
        objScene.pivot.x = playerState.x - 0.5 * (APP_SCREEN_WIDTH / GAME_ZOOM_SCALE);
        objScene.pivot.y = playerState.y - 0.5 * (APP_SCREEN_HEIGHT / GAME_ZOOM_SCALE);
    }
    else
    {
        objScene.scale.x = 1.0;
        objScene.scale.y = 1.0;
        objScene.pivot.x = _camera;
        objScene.pivot.y = 0;
    }
}

function setCenterText(centerTextObj, text)
{
    centerTextObj.text = text;
    centerTextObj.x = (APP_SCREEN_WIDTH - centerTextObj.width) * 0.5;
    centerTextObj.y = APP_SCREEN_HEIGHT * 0.25 - centerTextObj.height * 0.5;
}

function checkGameFinished(playerState)
{
    if ((playerState.state == PLAYER_STATE.LANDED) || (playerState.state == PLAYER_STATE.CRASHED))
    {
        _game = GAME_STATE.FINISHED;
    }
}
