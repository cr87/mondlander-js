function terrainGenerator(screenWidth, screenHeight)
{
    terrain = [];

    // Maximum and minimum y values given by screen height
    const minY = screenHeight * WORLD_TERRAIN_MIN_HEIGHT;
    const maxY = screenHeight * WORLD_TERRAIN_MAX_HEIGHT;

    // Pixel step widths given by screen size
    const step_horizontal = screenWidth * WORLD_TERRAIN_STEP_HORIZONTAL_UNIT;
    const step_vertical = step_horizontal * WORLD_TERRAIN_STEP_VERTICAL_UNIT_MAX;

    // Minimum number of iterations to fill entire screen
    const min_iterations = Math.ceil(1.0 / WORLD_TERRAIN_STEP_HORIZONTAL_UNIT);

    // Continuously add randomly to an aggregate slope until we "close the loop",
    // i.e. we come back to our start height / y value. This allows repeating
    // the terrain seamlessly later on, as it starts the same way it ends.
    var done = false;
    var weening = false;
    var slope = 0.0;
    var lastY = minY;

    // First one is always (0, minY)
    terrain.push([0, screenHeight - minY]);
    var iteration = 1;

    // Continue adding until done
    while(!done)
    {
        // Increment slope randomly. If we are weening off towards the initial point,
        // every slope change shall be negative
        let random = (rng() * 2.0) - 1.0;
        let currentSlope = WORLD_TERRAIN_STEP_MAX_SLOPE_CHANGE * ((weening == true) ? -Math.abs(random) : random);
        slope += currentSlope;

        // Clamp to [-STEP_WIDTH_VERTICAL_MAX, STEP_WIDTH_VERTICAL_MAX]
        slope = Math.min(step_vertical, Math.max(-step_vertical, slope));

        // Assemble terrain point
        let x = (iteration * step_horizontal);
        let y = lastY + slope;

        // If the minimum number of iterations has been performed, and
        // we are within stitching distance of our initial Y value, we can
        // stop the generation.
        if (iteration > min_iterations)
        {
            // Start weening off period, i.e. go towards initial point
            weening = true;

            // Check for being done
            if ((y - minY) < WORLD_TERRAIN_STEP_STITCHING_TOLERANCE)
            {
                done = true;
                y = minY;
            }
        }

        // If we reach the height bounds, we just invert the slope to create
        // the opposite feature, i.e. go from valley to mountain or from
        // mountain to valley.
        if ((y > maxY) || (y < minY))
        {
            currentSlope = -currentSlope;
            continue;
        }

        terrain.push([x, screenHeight - y]);
        lastY = y;
        ++iteration;
    }

    // Make sure we have some flat areas
    addLandingSites(terrain,
                    WORLD_TERRAIN_LANDING_SITE_COUNT,
                    WORLD_TERRAIN_LANDING_SITE_RADIUS,
                    WORLD_TERRAIN_LANDING_SITE_SPACING);

    return terrain;
}

function terrainGenerateStarfield(terrain, averageDistance)
{
    // Compute number of stars that should be shown
    const numStars = Math.ceil(1.0 / (averageDistance * averageDistance));
    const width = terrainWidth(terrain);

    stars = []
    for (var i = 0; i < numStars; ++i)
    {
        let x = rng() * width;
        let y = rng() * APP_SCREEN_HEIGHT;

        // Check whether above or below the terrain
        if (terrainComputeAltitude(terrain, x, y) < 10.0)
            continue;
        else
            stars.push([x, y]);
    }

    return stars;
}

function terrainComputeAltitude(terrain, x, y)
{
    // Get matching terrain segment
    x = terrainMapX(terrain, x);
    var i = terrainSegmentFor(terrain, x);
    if (i <= 0 || i > terrain.length)
        return NaN;

    let x1 = terrain[i-1][0];
    let y1 = terrain[i-1][1];
    let x2 = terrain[i][0];
    let y2 = terrain[i][1];

    // If the segment is not vertical, compute the y intercept of the segment at player pos
    if (x1 != x2)
    {
        let slope = (y2 - y1) / (x2 - x1);
        surface = (y1 + slope * (x - x1));
    }
    else
    {
        surface = Math.max(y1, y2); // although this shouldn't happen
    }

    // Since coordinate system starts at the top, we need to invert this computation
    return (surface - y) * GAME_METERS_PER_PIXEL;
}

function terrainCheckCollision(terrain, x, y)
{
    // Get matching terrain segment
    x = terrainMapX(terrain, x);
    var i = terrainSegmentFor(terrain, x);
    if (i <= 0 || i > terrain.length)
        return;

    let x1 = terrain[i-1][0];
    let y1 = terrain[i-1][1];
    let x2 = terrain[i][0];
    let y2 = terrain[i][1];

    return lineCheckSide(x1, y1, x2, y2, x, y);
}

function terrainSegmentFor(terrain, x)
{
    // Wrap x to our terrain range
    x = terrainMapX(terrain, x);

    // Get matching terrain segment. Could be done with binary search of course.
    for (var i = 1; i < terrain.length; ++i)
    {
        if ((x >= terrain[i-1][0]) && (x <= terrain[i][0]))
            return i;
    }

    return 0;
}

function terrainWidth(terrain)
{
    return ((terrain.length - 1) * WORLD_TERRAIN_STEP_HORIZONTAL_UNIT * APP_SCREEN_WIDTH);
}

function terrainMapX(terrain, x)
{
    const width = terrainWidth(terrain);

    // Since we keep repeating the same terrain,
    // we can just map it back to the original
    while (x < 0) { x += width; }
    while (x > width) { x -= width; }
    return x;
}

function lineCheckSide(x1, y1, x2, y2, x, y)
{
    var crossproduct = (((x2 - x1) * (y - y1)) - ((y2 - y1) * (x - x1)));
    return (crossproduct > 0);
}

function terrainComputeAngle(terrain, index)
{
    if ((index <= 0) || (index >= terrain.length))
        return NaN;

    let p1 = terrain[index - 1];
    let p2 = terrain[index];
    return Math.atan2(p2[1]-p1[1], p2[0]-p1[0]);
}

function addLandingSites(terrain, numSites, siteRadius, siteMinSpacing)
{
    sites = []
    while (sites.length <= numSites)
    {
        let idx = Math.floor(rng() * terrain.length);
        if ((idx < siteRadius) || (idx >= (terrain.length - siteRadius)))
            continue;

        // Check against existing sites
        let valid = true;
        for (let j = 0; j < sites.length; ++j)
        {
            if (Math.abs(idx - sites[j]) <= siteMinSpacing)
            {
                valid = false;
                break;
            }
        }

        if (false == valid)
            continue;

        // Add the site by making the y values equal
        for (let j = (-siteRadius + 1); j <= siteRadius; ++j)
        {
            terrain[idx + j][1] = terrain[idx + j - 1][1];
        }

        sites.push(idx);
    }
}
