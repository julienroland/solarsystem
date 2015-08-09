//Dependencies
var Earth = require('./planets/earth');
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
//Lights
var light;
var shadowLight;

//Constants
const ENV = 'dev';
var HEIGHT;
var WIDTH;

//Global
var onRenderContainer = [];
var lastTimeMsec = null

function appendScene() {
    container.appendChild(renderer.domElement);
}
function addLights() {
    light = new THREE.AmbientLight(0xffffff)

    shadowLight = new THREE.DirectionalLight(0xffffff, .8);
    shadowLight.position.set(200, 200, 200);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = .2;
    shadowLight.shadowCameraNear = 0.01
    shadowLight.shadowCameraFar = 15
    shadowLight.shadowCameraFov = 45

    shadowLight.shadowCameraLeft = -1
    shadowLight.shadowCameraRight = 1
    shadowLight.shadowCameraTop = 1
    shadowLight.shadowCameraBottom = -1

    shadowLight.shadowBias = 0.001
    shadowLight.shadowDarkness = 0.2

    shadowLight.shadowMapWidth = 1024
    shadowLight.shadowMapHeight = 1024
    scene.add(shadowLight);
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
    camera.position.z = 500;
    camera.position.y = 300;
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
    controls.addEventListener('change', render);
}
function configureScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050505, 2000, 4000);

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 100;
    farPlane = 20000;
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    addCamera();
    if (isDev()) {
        addControls();
    }
    //addLights();


}
function animate(number) {
    render();
    if (typeof number == 'undefined') {
        number = 0;
    }
    lastTimeMsec = lastTimeMsec || number - 1000 / 60
    var deltaMsec = Math.min(200, number - lastTimeMsec)
    lastTimeMsec = number
    // call each update function
    onRenderContainer.forEach(function (onRenderContainer) {
        onRenderContainer(deltaMsec / 1000, number / 1000)
    })
    requestAnimationFrame(animate);
    controls.update();
}
function render() {
    renderer.render(scene, camera);
}
function gui() {
    gui = new dat.GUI();
    var params = {
        test: 1000
    };
    gui.add(params, 'test');
}
function addPlanets() {
    var earth = Earth.make(scene);
    var earthAnimations = earth.getAnimations();
    for (var animation in earthAnimations) {
        onRenderContainer.push(earthAnimations[animation]);
    }
}
function init() {
    configureScene();
    addPlanets();
    appendScene();
    if (isDev()) {
        gui();
    }
    animate();
}
init();
