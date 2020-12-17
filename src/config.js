// General app parameters
const APP_SCREEN_WIDTH      = document.body.clientWidth;
const APP_SCREEN_HEIGHT     = document.documentElement.clientHeight;
const APP_RANDOM_SEED       = 0x1234F;

// Parameters for the world we play on
const WORLD_TERRAIN_MIN_HEIGHT                  = 0.1; // percentage of screen height
const WORLD_TERRAIN_MAX_HEIGHT                  = 0.5; // percentage of screen height
const WORLD_TERRAIN_STEP_MAX_SLOPE_CHANGE       = 10.0; // max slope step in pixels
const WORLD_TERRAIN_STEP_HORIZONTAL_UNIT        = 0.01; // percentage of screen width
const WORLD_TERRAIN_STEP_VERTICAL_UNIT_MAX      = 5.0; // in relation to horizontal width
const WORLD_TERRAIN_STEP_STITCHING_TOLERANCE    = 10; // maximum pixel difference to start value permissible for stitching
const WORLD_TERRAIN_LANDING_SITE_COUNT          = 4; // How many flat areas will be created
const WORLD_TERRAIN_LANDING_SITE_RADIUS         = 2; // How many segments will the landing site extend left and right
const WORLD_TERRAIN_LANDING_SITE_SPACING        = 10; // How many segments should landing sites be away from others at least

// Parameters for player
const PLAYER_ROTATION_SPEED     = 0.2; // rad/s
const PLAYER_FUEL_BURN          = 50; // kg/s, a total guess
const PLAYER_THRUST_FORCE       = 16000; // thrust of APS in Newton
const PLAYER_DRY_WEIGHT         = 2444; // Lunar lander dry weight in kg
const PLAYER_FUEL_PAYLOAD       = 2376; // Lunar lander initial fuel payload in kg
const PLAYER_START_X            = 0.1; // Starting position in percentage of screen width
const PLAYER_START_Y            = 0.1; // Starting position in percentage of screen height
const PLAYER_START_PHI          = Math.PI; // Starting orientation wrt the x axis
const PLAYER_START_VX           = 40.0; // Starting horziontal velocity
const PLAYER_START_VY           = 0.0; // Starting vertical velocity

// Parameters for the world
const WORLD_GRAVITY     = 1.62; // Moon gravity
const WORLD_DRAG        = 0.01; // Some atmospheric drag in m/s^2

// General game parameters
const GAME_METERS_PER_PIXEL         = 5; // Scales the screen to real world values
const GAME_MAX_LANDING_VELOCITY     = 5.0; // Maximum permissible vy in m/s
const GAME_MAX_LANDING_ANGLE        = 10.0 * Math.PI / 180.0; // Maximum angle of landing site surface in radian
const GAME_ZOOM_ALTITUDE            = 300.0; // Zoom in when player is lower than this altitude
const GAME_ZOOM_SCALE               = 4.0; // How much to zoom in when player passes altitude threshold
const GAME_SCROLL_THRESHOLD         = 0.2; // Percentage of screen width
const GAME_STARFIELD_SPREAD         = 0.04; // percentage of screen width between two stars on average

// GUI parameters
const GUI_MARGIN = 10; // pixel distance from border

// Global variables :(
var rng = new Math.seedrandom(APP_RANDOM_SEED);
