const PLAYER_STATE =
{
    FLYING: 'flying',
    LANDED: 'landed',
    CRASHED: 'crashed'
};

const ENGINE_STATE =
{
    ENGAGED: 'engaged',
    DISENGAGED: 'disengaged'
};

function playerUpdate(playerState, terrain, dt)
{
    if (playerState.state != PLAYER_STATE.FLYING)
        return;

    if (true == playerCheckTerrainCollision(terrain, playerState))
    {
        let siteAngle = playerMaxLandingSiteAngle(terrain, playerState);
        let playerAngle = Math.abs(playerState.phi - Math.PI * 0.5);
        if (    (Math.abs(playerState.vy) <= GAME_MAX_LANDING_VELOCITY)
             && (Math.abs(playerState.vx) <= GAME_MAX_LANDING_VELOCITY)
             && (siteAngle < GAME_MAX_LANDING_ANGLE)
             && (playerAngle < GAME_MAX_LANDING_ANGLE))
        {
            playerState.state = PLAYER_STATE.LANDED;
            console.log("Landed at a landing site of angle " + siteAngle + " with vertical velocity " + playerState.vy);
        }
        else
        {
            playerState.state = PLAYER_STATE.CRASHED;
            console.log("Crashed at a landing site of angle " + siteAngle + " with vertical velocity " + playerState.vy);
        }
        return;
    }

    // Manage rotation
    if (keyLeft.isDown)
    {
        playerState.phi -= dt * PLAYER_ROTATION_SPEED;
    }
    if (keyRight.isDown)
    {
        playerState.phi += dt * PLAYER_ROTATION_SPEED;
    }

    // Manage thrust
    if (((keySpace.isDown == true) || (keyUp.isDown == true)) && (playerState.fuel > 0))
    {
        playerState.engine = ENGINE_STATE.ENGAGED;

        // Apply thrust
        let thrust = -1 * computeThrust(playerState) * dt;
        playerState.vx += Math.cos(playerState.phi) * thrust;
        playerState.vy += Math.sin(playerState.phi) * thrust;

        // Fuel burn
        playerState.fuel -= (dt * PLAYER_FUEL_BURN) / PLAYER_FUEL_PAYLOAD;
        playerState.fuel = Math.max(0, playerState.fuel);
    }
    else
    {
        playerState.engine = ENGINE_STATE.DISENGAGED;
    }

    // Apply gravity
    playerState.vy += WORLD_GRAVITY * dt;

    // Apply drag
    playerState.vx -= (playerState.vx * WORLD_DRAG * dt);
    playerState.vy -= (playerState.vy * WORLD_DRAG * dt);

    // Compute motion
    playerState.x += (playerState.vx / GAME_METERS_PER_PIXEL) * dt;
    playerState.y += (playerState.vy / GAME_METERS_PER_PIXEL) * dt;

    // Compute altitude
    playerState.altitude = playerComputeAltitude(terrain, playerState);
}

function playerComputeWorldBounds(x, y, phi)
{
    phi -= Math.PI * 0.5;
    const sin = Math.sin(phi);
    const cos = Math.cos(phi);

    // TODO: Replace these fixed values with the bounds of the shape
    return {
        'tl': rotateAddOffset(-4.5, -4.5, x, y, sin, cos),
        'tr': rotateAddOffset(4.5, -4.5, x, y, sin, cos),
        'bl': rotateAddOffset(-4.5, 9.5, x, y, sin, cos),
        'br': rotateAddOffset(4.5, 9.5, x, y, sin, cos)
    }
}

function playerCheckTerrainCollision(terrain, playerState)
{
    // Compute bounds in world coordinates (considering our rotation).
    // Player has collided if any of the outer points of the bounding
    // box collides with the terrain.
    const bounds = playerComputeWorldBounds(playerState.x, playerState.y, playerState.phi);
    const collided =
        terrainCheckCollision(terrain, bounds.tl[0], bounds.tl[1]) ||
        terrainCheckCollision(terrain, bounds.tr[0], bounds.tr[1]) ||
        terrainCheckCollision(terrain, bounds.bl[0], bounds.bl[1]) ||
        terrainCheckCollision(terrain, bounds.br[0], bounds.br[1]);

    return collided;
}

function playerMaxLandingSiteAngle(terrain, playerState)
{
    // Compute bounds in world coordinates (considering our rotation).
    // If all landing site segments are within the limit, the landing
    // site is valid.
    let bounds = playerComputeWorldBounds(playerState.x, playerState.y, playerState.phi);

    // Get segments for leftmost and rightmost points
    let segments =
    [
        terrainSegmentFor(terrain, bounds.tl[0]),
        terrainSegmentFor(terrain, bounds.tr[0]),
        terrainSegmentFor(terrain, bounds.bl[0]),
        terrainSegmentFor(terrain, bounds.br[0])
    ];

    // TODO what to do about being at the seam between repeating terrain segments?
    let min = Math.min(segments[0], segments[1], segments[2], segments[3]);
    let max = Math.max(segments[0], segments[1], segments[2], segments[3]);

    let maxAngle = 0;
    for (let i = min; i <= max; ++i)
    {
        maxAngle = Math.max(Math.abs(terrainComputeAngle(terrain, i)), maxAngle);
    }

    return maxAngle;
}

function playerComputeAltitude(terrain, playerState)
{
    // Compute bounds in world coordinates (considering our rotation).
    // Player altitude is the minimal altitude of any point.
    const bounds = playerComputeWorldBounds(playerState.x, playerState.y, playerState.phi);
    const altitude = [
        terrainComputeAltitude(terrain, bounds.tl[0], bounds.tl[1]),
        terrainComputeAltitude(terrain, bounds.tr[0], bounds.tr[1]),
        terrainComputeAltitude(terrain, bounds.bl[0], bounds.bl[1]),
        terrainComputeAltitude(terrain, bounds.br[0], bounds.br[1])
    ];

    return Math.min(altitude[0], altitude[1], altitude[2], altitude[3]);
}

function computeThrust(playerState)
{
    var mass = PLAYER_DRY_WEIGHT + (playerState.fuel * PLAYER_FUEL_PAYLOAD);
    return PLAYER_THRUST_FORCE / mass;
}

function rotateAddOffset(x, y, ox, oy, sin, cos)
{
    return [x * cos - y * sin + ox, x * sin + y * cos + oy];
}
