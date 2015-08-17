//Dependencies
var Earth = require('./theSolarSystem/earth');
var Sun = require('./theSolarSystem/sun');
var Skybox = require('./theSolarSystem/skybox');
//Config
var container = document.getElementById('scene');
var scene;
var camera;
var fieldOfView;
var aspectRatio;
var renderer;
var nearPlane;
var farPlane;
var controls;
var gui;
var clock = new THREE.Clock();
var isRealistic = false;
//Lights
var light;

//Constants
const ENV = 'dev';
var HEIGHT;
var WIDTH;

//Global
var onRenderContainer = [];

//App
var sun;

function appendScene() {
    container.appendChild(renderer.domElement);
}
function addLights() {
    light = new THREE.AmbientLight(0xffffff)
    scene.add(light);
}
function isDev() {
    return ENV == 'dev';
}
function addCamera() {
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane);
    camera.position.z = -400;
    camera.lookAt(new THREE.Vector3(0, 200, 0));
}
function addControls() {
    controls = new THREE.TrackballControls(camera);
    controls.target.set(0, 0, 0);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [65, 83, 68];
    controls.addEventListener('change', function () {
        render(clock.getDelta());
    });
}
function configureScene() {
    scene = new THREE.Scene();

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = .1;
    farPlane = 1000000000;
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setClearColor(0x000000);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMapEnabled = true;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    addCamera();
    if (isDev()) {
        addControls();
    }
    //addLights();
}

function animate() {
    requestAnimationFrame(animate);
    render(clock.getDelta());
    controls.update();
}
function render(delta) {
    onRenderContainer.forEach(function (onRenderContainer) {
        onRenderContainer(delta, camera);
    });
    renderer.render(scene, camera);
}
function gui() {
    gui = new dat.GUI();
    var params = {
        test: 1000
    };
    gui.add(params, 'test');
}
function addSkybox() {
    Skybox.make(scene, isRealistic);
}
function addSolarSystem() {
    addSun();
    addPlanets();
}
function addSun() {
    sun = Sun.make(scene, isRealistic);
    var sunAnimations = sun.getAnimations();
    sunAnimations.forEach(function (animation) {
        onRenderContainer.push(animation);
    });
}
function addPlanets() {
    Earth.make({scene: scene, isRealistic: isRealistic, sun: sun}, function (animations) {
        animations.forEach(function (animation) {
            onRenderContainer.push(animation);
        });
    });
}
function init() {
    configureScene();
    addSkybox();
    addSolarSystem();
    appendScene();
    if (isDev()) {
        gui();
    }
    animate();
}
init();
