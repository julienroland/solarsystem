(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Int = {
    getRandom: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = Int;

},{}],2:[function(require,module,exports){
var THREEx = THREEx || {}

/**
 * from http://stemkoski.blogspot.fr/2013/07/shaders-in-threejs-glow-and-halo.html
 * @return {[type]} [description]
 */
THREEx.createAtmosphereMaterial = function () {
    var vertexShader = [
        'varying vec3	vVertexWorldPosition;',
        'varying vec3	vVertexNormal;',

        'void main(){',
        '	vVertexNormal	= normalize(normalMatrix * normal);',

        '	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',

        '	// set gl_Position',
        '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}',

    ].join('\n')
    var fragmentShader = [
        'uniform vec3	glowColor;',
        'uniform float	coeficient;',
        'uniform float	power;',

        'varying vec3	vVertexNormal;',
        'varying vec3	vVertexWorldPosition;',

        'void main(){',
        '	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
        '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
        '	viewCameraToVertex	= normalize(viewCameraToVertex);',
        '	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
        '	gl_FragColor		= vec4(glowColor, intensity);',
        '}',
    ].join('\n')

    // create custom material from the shader code above
    //   that is within specially labeled script tags
    var material = new THREE.ShaderMaterial({
        uniforms: {
            coeficient: {
                type: "f",
                value: 1.0
            },
            power: {
                type: "f",
                value: 2
            },
            glowColor: {
                type: "c",
                value: new THREE.Color('pink')
            },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        //blending	: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
    });
    return material
}

module.exports = THREEx;

},{}],3:[function(require,module,exports){
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
    var sun = Sun.make(scene, isRealistic);
    var sunAnimations = sun.getAnimations();
    sunAnimations.forEach(function (animation) {
        onRenderContainer.push(animation);
    });
}
function addPlanets() {
    var earth = Earth.make(scene, isRealistic);
    var earthAnimations = earth.getAnimations();
    earthAnimations.forEach(function (animation) {
        onRenderContainer.push(animation);
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

},{"./theSolarSystem/earth":4,"./theSolarSystem/skybox":5,"./theSolarSystem/sun":6}],4:[function(require,module,exports){
var Atmospheres = require('../lib/threex.atmospherematerial');
const PATH = "./images/"
//@math var Degree = require('../lib/degreeInRadian');
var Earth = {
    //@math 60 * 60 * 23.5603 (23h56 03')
    timeToFullSelfRotation: 84817.4724,
    isRealistic: false,
    diameter: 3,
    nbpoly: 32,
    atmosphereRadius: undefined,
    atmosphereSize: undefined,
    axialTilt: 23.4,
    //@math return (Degree.convert(360) / this.timeToFullSelfRotation);
    rotationPerSecond: 0.000007393570389010043,
    orbitRadius: 35643,
    animations: [],

    make: function (scene, isRealistic) {
        this.manageRealism(isRealistic);
        this.init(scene);
        this.createMesh();
        this.createAtmosphere();
        this.createClouds();
        return this;
    },
    getAnimations: function () {
        return this.animations;
    },
    init: function (scene) {
        this.containerEarth = new THREE.Object3D();
        this.containerEarth.rotateZ(this.axialTilt * Math.PI / 180);
        //Sun diameter * 109 = radius of earth's orbit (149,597,870 km) (35643)
        this.containerEarth.position.x = this.orbitRadius;
        scene.add(this.containerEarth);
        this.atmosphereRadius = this.diameter;
    },
    createMesh: function () {
        //Earth is more or less 109 times smaller than sun
        var geometry = new THREE.SphereGeometry(this.diameter, this.nbpoly, this.nbpoly)
        var texture = THREE.ImageUtils.loadTexture(PATH + 'earthdiffuse.jpg');
        var material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: THREE.ImageUtils.loadTexture(PATH + 'earthbump1k.jpg'),
            bumpScale: 1,
            specularMap: THREE.ImageUtils.loadTexture(PATH + 'earthspec1k.jpg'),
            specular: new THREE.Color('0xffffff')
        });
        //texture.needsUpdate = true;
        //obj.mesh.material.uniforms.texture = THREE.ImageUtils.loadTexture(PATH+"earthnight.jpg");
        material.shininess = 60;
        material.map.minFilter = THREE.LinearFilter;
        material.bumpMap.minFilter = THREE.LinearFilter;
        material.specularMap.minFilter = THREE.LinearFilter;
        this.earthMesh = new THREE.Mesh(geometry, material)

        this.earthMesh.rotation.y = 0;
        this.earthMesh.receiveShadow = true;
        this.earthMesh.castShadow = true;
        this.containerEarth.add(this.earthMesh);
        this.registerAnimation(function (delta, now) {
            Earth.earthMesh.rotation.y += Earth.rotationPerSecond / 60;
        })
    },
    createClouds: function () {
        var geometry = new THREE.SphereGeometry(this.diameter, this.nbpoly, this.nbpoly)
        var material = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(PATH + 'earthclouds.png'),
            side: THREE.FrontSide,
            transparent: true
        })
        this.earthCloud = new THREE.Mesh(geometry, material)
        this.earthCloud.receiveShadow = true;
        this.earthCloud.castShadow = true;
        this.containerEarth.add(this.earthCloud);
        this.registerAnimation(function (delta, now) {
            Earth.earthCloud.rotation.y += (Earth.rotationPerSecond * 1.2) / 60;
        });
    },
    createAtmosphere: function () {
        var geometry = new THREE.SphereGeometry(this.diameter, this.nbpoly, this.nbpoly);
        var material = Atmospheres.createAtmosphereMaterial()
        material.uniforms.glowColor.value.set(0x00b3ff)
        material.uniforms.coeficient.value = 1
        material.uniforms.power.value = 6.5
        this.atmosphere1 = new THREE.Mesh(geometry, material);
        this.atmosphere1.scale.multiplyScalar(1.04);
        this.containerEarth.add(this.atmosphere1);
    },
    manageRealism: function (isRealistic) {
        if (typeof isRealistic != "undefined") {
            this.isRealistic = isRealistic;
        }

        if (!this.isRealistic) {
            this.diameter *= 10;
            this.orbitRadius /= 100;
            this.rotationPerSecond *= 600;
        }
    },
    registerAnimation: function (callable) {
        this.animations.push(callable);
    }
};

module.exports = Earth;

},{"../lib/threex.atmospherematerial":2}],5:[function(require,module,exports){
const PATH = "./images/"
var Skybox = {
    size: 1000000000,
    animations: [],
    make: function (scene, isRealistic) {
        this.manageRealism(isRealistic);
        this.init(scene);
        this.createBox(scene);

        return this;
    },
    getAnimations: function () {
        return this.animations;
    },
    init: function (scene) {
        this.skyboxContainer = new THREE.Object3D();
        scene.add(this.skyboxContainer);
    },
    createBox: function (scene) {
        var urls = [
            PATH + "px.jpg", PATH + "nx.jpg",
            PATH + "py.jpg", PATH + "ny.jpg",
            PATH + "pz.jpg", PATH + "nz.jpg"];

        var texture = THREE.ImageUtils.loadTextureCube(urls);
        var shader = THREE.ShaderLib["cube"];
        shader.uniforms['tCube'].value = texture;   // textureCube has been init before
        shader.uniforms['opacity'] = {value: 1.0, type: "f"};
        var material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: false
        });
        this.skyboxMesh = new THREE.Mesh(new THREE.BoxGeometry(this.size, this.size, this.size), material);
        scene.add(this.skyboxMesh);
    },
    registerAnimation: function (callable) {
        this.animations.push(callable);
    },
    manageRealism: function (isRealistic) {
        if (typeof isRealistic != "undefined") {
            this.isRealistic = isRealistic;
        }

        if (!this.isRealistic) {
            this.size /= 10;
        }
    }
};

module.exports = Skybox;


},{}],6:[function(require,module,exports){
var Int = require('../lib/int');
const PATH = "./images/"
//@math var Degree = require('../lib/degreeInRadian');
var Sun = {
    timeToFullSelfRotation: 849817.4724,
    isRealistic: false,
    lightDistance: 1000000000,
    lightIntensity: 2,
    diameter: 3270,
    axialTilt: 7.25,
    //rotationPerSecond: 1.4604583484464283,
    rotationPerSecond: 0.000000014604583484464283,
    animations: [],
    make: function (scene, isRealistic) {
        this.manageRealism(isRealistic);
        this.init(scene);
        //this.createMesh();
        this.addLensFlare();
        this.addLight(scene);
        //this.addParticules(scene);

        return this;
    },
    getAnimations: function () {
        return this.animations;
    },
    init: function (scene) {
        this.containerSun = new THREE.Object3D();
        scene.add(this.containerSun);
        this.registerAnimation(function (delta, now) {
            Sun.containerSun.rotation.y += Sun.rotationPerSecond / 60;
        });
    },
    createMesh: function () {
        var geometry = new THREE.SphereGeometry(0.5, 40, 40);
        var texture = THREE.ImageUtils.loadTexture(PATH + 'sunmap.jpg');
        var material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: THREE.ImageUtils.loadTexture(PATH + 'sun_surface.png'),
            bumpScale: 1
        });
        this.sunMesh = new THREE.Mesh(geometry, material);
        this.sunMesh.rotateZ(this.axialTilt * Math.PI / 180);
        this.sunMesh.position.z = 0;
        this.sunMesh.receiveShadow = true;
        this.sunMesh.castShadow = true;
        this.sunMesh.scale.set(this.diameter, this.diameter, this.diameter);
        this.sunMesh.depthWrite = false;
        this.containerSun.add(this.sunMesh);
    },
    addLensFlare: function () {
        if (this.isRealistic) {
            var lensflaretexture0 = THREE.ImageUtils.loadTexture(PATH + 'lensflare0-white.png');
        } else {
            var lensflaretexture0 = THREE.ImageUtils.loadTexture(PATH + 'lensflare0.png');
        }
        var lensflaretexture1 = THREE.ImageUtils.loadTexture(PATH + 'lensflare1.png');
        var lensflaretexture2 = THREE.ImageUtils.loadTexture(PATH + 'lensflare2.png');
        var lensflaretexture3 = THREE.ImageUtils.loadTexture(PATH + 'lensflare3.png');
        var color = new THREE.Color(0xffffff);
        color.setHSL(0.55, 0.9, 1);
        this.lensflare = new THREE.LensFlare(lensflaretexture0, this.diameter * 2, 0.0, THREE.AdditiveBlending, color);
        this.lensflare.add(lensflaretexture1, this.diameter, 0.0, THREE.AdditiveBlending, color, 0.2);
        this.lensflare.add(lensflaretexture1, this.diameter / 2, 0.0, THREE.AdditiveBlending, color, 0.5);

        this.lensflare.add(lensflaretexture2, this.diameter / 2, 0.0, THREE.AdditiveBlending);

        //this.lensflare.add(lensflaretexture3, 40, -1, THREE.AdditiveBlending);
        //this.lensflare.add(lensflaretexture3, 100, -0.5, THREE.AdditiveBlending);
        //this.lensflare.add(lensflaretexture3, 80, -0.8, THREE.AdditiveBlending);

        this.containerSun.add(this.lensflare);

        this.registerAnimation(function (delta, camera) {
            Sun.lensflare.customUpdateCallback = function (obj) {
                var f, fl = obj.lensFlares.length;
                var flare;
                var vecX = -obj.positionScreen.x * 2;
                var vecY = -obj.positionScreen.y * 2;

                var camPosition = camera.position;
                var camRotation = camera.rotation;
                var camDistance = camPosition.length();
                for (f = 0; f < fl; f++) {

                    flare = obj.lensFlares[f];

                    flare.x = obj.positionScreen.x + vecX * flare.distance;
                    flare.y = obj.positionScreen.y + vecY * flare.distance;

                    flare.rotation = 0;

                    flare.scale = 1 / camDistance * 400;
                }
            };
        });
    },
    addLight: function (scene) {
        this.light = new THREE.PointLight(0xffffff, this.lightIntensity, this.lightDistance);
        this.light.position.set(0, 0, 0);
        this.light.scale.set(this.diameter, this.diameter, this.diameter);
        scene.add(this.light);
    },
    addParticules: function (scene) {
        this.particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('./images/particle1.jpeg'),
            maxAge: 5,
            hasPerspective: true,
            blending: THREE.AdditiveBlending,
            colorize: true
        });
        var particleEmitter = new SPE.Emitter({
            type: 'sphere',
            position: new THREE.Vector3(0, 0, 0),

            radius: this.diameter,
            radiusSpread: 2,
            radiusSpreadClamp: 2,
            radiusScale: new THREE.Vector3(0.51, 0.51, 0.51),

            speed: 1,
            speedSpread: 2,
            //colorStart: new THREE.Color('red'),
            //colorEnd: new THREE.Color('red'),


            sizeStart: 200,
            sizeMiddle: 100,
            sizeEnd: 50,
            opacityStart: 1,
            opacityMiddle: 0.8,
            opacityEnd: 0,
            //particlesPerSecond: 10,
            isStatic: 0,
            particleCount: 200
        });
        this.particleGroup.addEmitter(particleEmitter);
        scene.add(this.particleGroup.mesh);
        this.registerAnimation(function (delta) {
            Sun.particleGroup.tick(delta);
        });
    },
    registerAnimation: function (callable) {
        this.animations.push(callable);
    },
    manageRealism: function (isRealistic) {
        if (typeof isRealistic != "undefined") {
            this.isRealistic = isRealistic;
        }

        if (!this.isRealistic) {
            this.diameter /= 10;
            this.rotationPerSecond *= 60000;
            this.lightDistance /= 10;
            this.lightIntensity /= 2;
        }
    }
};

module.exports = Sun;

},{"../lib/int":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW50LmpzIiwibGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwuanMiLCJzY3JpcHQuanMiLCJ0aGVTb2xhclN5c3RlbS9lYXJ0aC5qcyIsInRoZVNvbGFyU3lzdGVtL3NreWJveC5qcyIsInRoZVNvbGFyU3lzdGVtL3N1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBJbnQgPSB7XG4gICAgZ2V0UmFuZG9tOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludDtcbiIsInZhciBUSFJFRXggPSBUSFJFRXggfHwge31cblxuLyoqXG4gKiBmcm9tIGh0dHA6Ly9zdGVta29za2kuYmxvZ3Nwb3QuZnIvMjAxMy8wNy9zaGFkZXJzLWluLXRocmVlanMtZ2xvdy1hbmQtaGFsby5odG1sXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cbiAqL1xuVEhSRUV4LmNyZWF0ZUF0bW9zcGhlcmVNYXRlcmlhbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdmVydGV4U2hhZGVyID0gW1xuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4V29ybGRQb3NpdGlvbjsnLFxuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4Tm9ybWFsOycsXG5cbiAgICAgICAgJ3ZvaWQgbWFpbigpeycsXG4gICAgICAgICdcdHZWZXJ0ZXhOb3JtYWxcdD0gbm9ybWFsaXplKG5vcm1hbE1hdHJpeCAqIG5vcm1hbCk7JyxcblxuICAgICAgICAnXHR2VmVydGV4V29ybGRQb3NpdGlvblx0PSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54eXo7JyxcblxuICAgICAgICAnXHQvLyBzZXQgZ2xfUG9zaXRpb24nLFxuICAgICAgICAnXHRnbF9Qb3NpdGlvblx0PSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTsnLFxuICAgICAgICAnfScsXG5cbiAgICBdLmpvaW4oJ1xcbicpXG4gICAgdmFyIGZyYWdtZW50U2hhZGVyID0gW1xuICAgICAgICAndW5pZm9ybSB2ZWMzXHRnbG93Q29sb3I7JyxcbiAgICAgICAgJ3VuaWZvcm0gZmxvYXRcdGNvZWZpY2llbnQ7JyxcbiAgICAgICAgJ3VuaWZvcm0gZmxvYXRcdHBvd2VyOycsXG5cbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleE5vcm1hbDsnLFxuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4V29ybGRQb3NpdGlvbjsnLFxuXG4gICAgICAgICd2b2lkIG1haW4oKXsnLFxuICAgICAgICAnXHR2ZWMzIHdvcmxkQ2FtZXJhVG9WZXJ0ZXg9IHZWZXJ0ZXhXb3JsZFBvc2l0aW9uIC0gY2FtZXJhUG9zaXRpb247JyxcbiAgICAgICAgJ1x0dmVjMyB2aWV3Q2FtZXJhVG9WZXJ0ZXhcdD0gKHZpZXdNYXRyaXggKiB2ZWM0KHdvcmxkQ2FtZXJhVG9WZXJ0ZXgsIDAuMCkpLnh5ejsnLFxuICAgICAgICAnXHR2aWV3Q2FtZXJhVG9WZXJ0ZXhcdD0gbm9ybWFsaXplKHZpZXdDYW1lcmFUb1ZlcnRleCk7JyxcbiAgICAgICAgJ1x0ZmxvYXQgaW50ZW5zaXR5XHRcdD0gcG93KGNvZWZpY2llbnQgKyBkb3QodlZlcnRleE5vcm1hbCwgdmlld0NhbWVyYVRvVmVydGV4KSwgcG93ZXIpOycsXG4gICAgICAgICdcdGdsX0ZyYWdDb2xvclx0XHQ9IHZlYzQoZ2xvd0NvbG9yLCBpbnRlbnNpdHkpOycsXG4gICAgICAgICd9JyxcbiAgICBdLmpvaW4oJ1xcbicpXG5cbiAgICAvLyBjcmVhdGUgY3VzdG9tIG1hdGVyaWFsIGZyb20gdGhlIHNoYWRlciBjb2RlIGFib3ZlXG4gICAgLy8gICB0aGF0IGlzIHdpdGhpbiBzcGVjaWFsbHkgbGFiZWxlZCBzY3JpcHQgdGFnc1xuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XG4gICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICBjb2VmaWNpZW50OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJmXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IDEuMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvd2VyOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJmXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IDJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnbG93Q29sb3I6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImNcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCdwaW5rJylcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHZlcnRleFNoYWRlcjogdmVydGV4U2hhZGVyLFxuICAgICAgICBmcmFnbWVudFNoYWRlcjogZnJhZ21lbnRTaGFkZXIsXG4gICAgICAgIC8vYmxlbmRpbmdcdDogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgIH0pO1xuICAgIHJldHVybiBtYXRlcmlhbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFeDtcbiIsIi8vRGVwZW5kZW5jaWVzXG52YXIgRWFydGggPSByZXF1aXJlKCcuL3RoZVNvbGFyU3lzdGVtL2VhcnRoJyk7XG52YXIgU3VuID0gcmVxdWlyZSgnLi90aGVTb2xhclN5c3RlbS9zdW4nKTtcbnZhciBTa3lib3ggPSByZXF1aXJlKCcuL3RoZVNvbGFyU3lzdGVtL3NreWJveCcpO1xuLy9Db25maWdcbnZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NlbmUnKTtcbnZhciBzY2VuZTtcbnZhciBjYW1lcmE7XG52YXIgZmllbGRPZlZpZXc7XG52YXIgYXNwZWN0UmF0aW87XG52YXIgcmVuZGVyZXI7XG52YXIgbmVhclBsYW5lO1xudmFyIGZhclBsYW5lO1xudmFyIGNvbnRyb2xzO1xudmFyIGd1aTtcbnZhciBjbG9jayA9IG5ldyBUSFJFRS5DbG9jaygpO1xudmFyIGlzUmVhbGlzdGljID0gZmFsc2U7XG4vL0xpZ2h0c1xudmFyIGxpZ2h0O1xuXG4vL0NvbnN0YW50c1xuY29uc3QgRU5WID0gJ2Rldic7XG52YXIgSEVJR0hUO1xudmFyIFdJRFRIO1xuXG4vL0dsb2JhbFxudmFyIG9uUmVuZGVyQ29udGFpbmVyID0gW107XG5cbmZ1bmN0aW9uIGFwcGVuZFNjZW5lKCkge1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbn1cbmZ1bmN0aW9uIGFkZExpZ2h0cygpIHtcbiAgICBsaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpXG4gICAgc2NlbmUuYWRkKGxpZ2h0KTtcbn1cbmZ1bmN0aW9uIGlzRGV2KCkge1xuICAgIHJldHVybiBFTlYgPT0gJ2Rldic7XG59XG5mdW5jdGlvbiBhZGRDYW1lcmEoKSB7XG4gICAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuICAgICAgICBmaWVsZE9mVmlldyxcbiAgICAgICAgYXNwZWN0UmF0aW8sXG4gICAgICAgIG5lYXJQbGFuZSxcbiAgICAgICAgZmFyUGxhbmUpO1xuICAgIGNhbWVyYS5wb3NpdGlvbi56ID0gLTQwMDtcbiAgICBjYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDIwMCwgMCkpO1xufVxuZnVuY3Rpb24gYWRkQ29udHJvbHMoKSB7XG4gICAgY29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoY2FtZXJhKTtcbiAgICBjb250cm9scy50YXJnZXQuc2V0KDAsIDAsIDApO1xuICAgIGNvbnRyb2xzLnJvdGF0ZVNwZWVkID0gMS4wO1xuICAgIGNvbnRyb2xzLnpvb21TcGVlZCA9IDEuMjtcbiAgICBjb250cm9scy5wYW5TcGVlZCA9IDAuODtcblxuICAgIGNvbnRyb2xzLm5vWm9vbSA9IGZhbHNlO1xuICAgIGNvbnRyb2xzLm5vUGFuID0gZmFsc2U7XG5cbiAgICBjb250cm9scy5zdGF0aWNNb3ZpbmcgPSB0cnVlO1xuICAgIGNvbnRyb2xzLmR5bmFtaWNEYW1waW5nRmFjdG9yID0gMC4zO1xuXG4gICAgY29udHJvbHMua2V5cyA9IFs2NSwgODMsIDY4XTtcbiAgICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlbmRlcihjbG9jay5nZXREZWx0YSgpKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGNvbmZpZ3VyZVNjZW5lKCkge1xuICAgIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgICBIRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBhc3BlY3RSYXRpbyA9IFdJRFRIIC8gSEVJR0hUO1xuICAgIGZpZWxkT2ZWaWV3ID0gNjA7XG4gICAgbmVhclBsYW5lID0gLjE7XG4gICAgZmFyUGxhbmUgPSAxMDAwMDAwMDAwO1xuICAgIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FscGhhOiB0cnVlLCBhbnRpYWxpYXM6IHRydWV9KTtcbiAgICByZW5kZXJlci5zZXRDbGVhckNvbG9yKDB4MDAwMDAwKTtcbiAgICByZW5kZXJlci5zZXRTaXplKFdJRFRILCBIRUlHSFQpO1xuICAgIHJlbmRlcmVyLnNoYWRvd01hcEVuYWJsZWQgPSB0cnVlO1xuICAgIHJlbmRlcmVyLmdhbW1hSW5wdXQgPSB0cnVlO1xuICAgIHJlbmRlcmVyLmdhbW1hT3V0cHV0ID0gdHJ1ZTtcbiAgICBhZGRDYW1lcmEoKTtcbiAgICBpZiAoaXNEZXYoKSkge1xuICAgICAgICBhZGRDb250cm9scygpO1xuICAgIH1cbiAgICAvL2FkZExpZ2h0cygpO1xufVxuXG5mdW5jdGlvbiBhbmltYXRlKCkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICByZW5kZXIoY2xvY2suZ2V0RGVsdGEoKSk7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG59XG5mdW5jdGlvbiByZW5kZXIoZGVsdGEpIHtcbiAgICBvblJlbmRlckNvbnRhaW5lci5mb3JFYWNoKGZ1bmN0aW9uIChvblJlbmRlckNvbnRhaW5lcikge1xuICAgICAgICBvblJlbmRlckNvbnRhaW5lcihkZWx0YSwgY2FtZXJhKTtcbiAgICB9KTtcbiAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59XG5mdW5jdGlvbiBndWkoKSB7XG4gICAgZ3VpID0gbmV3IGRhdC5HVUkoKTtcbiAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICB0ZXN0OiAxMDAwXG4gICAgfTtcbiAgICBndWkuYWRkKHBhcmFtcywgJ3Rlc3QnKTtcbn1cbmZ1bmN0aW9uIGFkZFNreWJveCgpIHtcbiAgICBTa3lib3gubWFrZShzY2VuZSwgaXNSZWFsaXN0aWMpO1xufVxuZnVuY3Rpb24gYWRkU29sYXJTeXN0ZW0oKSB7XG4gICAgYWRkU3VuKCk7XG4gICAgYWRkUGxhbmV0cygpO1xufVxuZnVuY3Rpb24gYWRkU3VuKCkge1xuICAgIHZhciBzdW4gPSBTdW4ubWFrZShzY2VuZSwgaXNSZWFsaXN0aWMpO1xuICAgIHZhciBzdW5BbmltYXRpb25zID0gc3VuLmdldEFuaW1hdGlvbnMoKTtcbiAgICBzdW5BbmltYXRpb25zLmZvckVhY2goZnVuY3Rpb24gKGFuaW1hdGlvbikge1xuICAgICAgICBvblJlbmRlckNvbnRhaW5lci5wdXNoKGFuaW1hdGlvbik7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBhZGRQbGFuZXRzKCkge1xuICAgIHZhciBlYXJ0aCA9IEVhcnRoLm1ha2Uoc2NlbmUsIGlzUmVhbGlzdGljKTtcbiAgICB2YXIgZWFydGhBbmltYXRpb25zID0gZWFydGguZ2V0QW5pbWF0aW9ucygpO1xuICAgIGVhcnRoQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhbmltYXRpb24pIHtcbiAgICAgICAgb25SZW5kZXJDb250YWluZXIucHVzaChhbmltYXRpb24pO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBjb25maWd1cmVTY2VuZSgpO1xuICAgIGFkZFNreWJveCgpO1xuICAgIGFkZFNvbGFyU3lzdGVtKCk7XG4gICAgYXBwZW5kU2NlbmUoKTtcbiAgICBpZiAoaXNEZXYoKSkge1xuICAgICAgICBndWkoKTtcbiAgICB9XG4gICAgYW5pbWF0ZSgpO1xufVxuaW5pdCgpO1xuIiwidmFyIEF0bW9zcGhlcmVzID0gcmVxdWlyZSgnLi4vbGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwnKTtcbmNvbnN0IFBBVEggPSBcIi4vaW1hZ2VzL1wiXG4vL0BtYXRoIHZhciBEZWdyZWUgPSByZXF1aXJlKCcuLi9saWIvZGVncmVlSW5SYWRpYW4nKTtcbnZhciBFYXJ0aCA9IHtcbiAgICAvL0BtYXRoIDYwICogNjAgKiAyMy41NjAzICgyM2g1NiAwMycpXG4gICAgdGltZVRvRnVsbFNlbGZSb3RhdGlvbjogODQ4MTcuNDcyNCxcbiAgICBpc1JlYWxpc3RpYzogZmFsc2UsXG4gICAgZGlhbWV0ZXI6IDMsXG4gICAgbmJwb2x5OiAzMixcbiAgICBhdG1vc3BoZXJlUmFkaXVzOiB1bmRlZmluZWQsXG4gICAgYXRtb3NwaGVyZVNpemU6IHVuZGVmaW5lZCxcbiAgICBheGlhbFRpbHQ6IDIzLjQsXG4gICAgLy9AbWF0aCByZXR1cm4gKERlZ3JlZS5jb252ZXJ0KDM2MCkgLyB0aGlzLnRpbWVUb0Z1bGxTZWxmUm90YXRpb24pO1xuICAgIHJvdGF0aW9uUGVyU2Vjb25kOiAwLjAwMDAwNzM5MzU3MDM4OTAxMDA0MyxcbiAgICBvcmJpdFJhZGl1czogMzU2NDMsXG4gICAgYW5pbWF0aW9uczogW10sXG5cbiAgICBtYWtlOiBmdW5jdGlvbiAoc2NlbmUsIGlzUmVhbGlzdGljKSB7XG4gICAgICAgIHRoaXMubWFuYWdlUmVhbGlzbShpc1JlYWxpc3RpYyk7XG4gICAgICAgIHRoaXMuaW5pdChzY2VuZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlTWVzaCgpO1xuICAgICAgICB0aGlzLmNyZWF0ZUF0bW9zcGhlcmUoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVDbG91ZHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBnZXRBbmltYXRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbnM7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLnJvdGF0ZVoodGhpcy5heGlhbFRpbHQgKiBNYXRoLlBJIC8gMTgwKTtcbiAgICAgICAgLy9TdW4gZGlhbWV0ZXIgKiAxMDkgPSByYWRpdXMgb2YgZWFydGgncyBvcmJpdCAoMTQ5LDU5Nyw4NzAga20pICgzNTY0MylcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5wb3NpdGlvbi54ID0gdGhpcy5vcmJpdFJhZGl1cztcbiAgICAgICAgc2NlbmUuYWRkKHRoaXMuY29udGFpbmVyRWFydGgpO1xuICAgICAgICB0aGlzLmF0bW9zcGhlcmVSYWRpdXMgPSB0aGlzLmRpYW1ldGVyO1xuICAgIH0sXG4gICAgY3JlYXRlTWVzaDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvL0VhcnRoIGlzIG1vcmUgb3IgbGVzcyAxMDkgdGltZXMgc21hbGxlciB0aGFuIHN1blxuICAgICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkodGhpcy5kaWFtZXRlciwgdGhpcy5uYnBvbHksIHRoaXMubmJwb2x5KVxuICAgICAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdlYXJ0aGRpZmZ1c2UuanBnJyk7XG4gICAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnZWFydGhidW1wMWsuanBnJyksXG4gICAgICAgICAgICBidW1wU2NhbGU6IDEsXG4gICAgICAgICAgICBzcGVjdWxhck1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2VhcnRoc3BlYzFrLmpwZycpLFxuICAgICAgICAgICAgc3BlY3VsYXI6IG5ldyBUSFJFRS5Db2xvcignMHhmZmZmZmYnKVxuICAgICAgICB9KTtcbiAgICAgICAgLy90ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgLy9vYmoubWVzaC5tYXRlcmlhbC51bmlmb3Jtcy50ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIK1wiZWFydGhuaWdodC5qcGdcIik7XG4gICAgICAgIG1hdGVyaWFsLnNoaW5pbmVzcyA9IDYwO1xuICAgICAgICBtYXRlcmlhbC5tYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgICAgICBtYXRlcmlhbC5idW1wTWFwLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgICAgICAgbWF0ZXJpYWwuc3BlY3VsYXJNYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgICAgICB0aGlzLmVhcnRoTWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcblxuICAgICAgICB0aGlzLmVhcnRoTWVzaC5yb3RhdGlvbi55ID0gMDtcbiAgICAgICAgdGhpcy5lYXJ0aE1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuZWFydGhNZXNoLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmVhcnRoTWVzaCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhLCBub3cpIHtcbiAgICAgICAgICAgIEVhcnRoLmVhcnRoTWVzaC5yb3RhdGlvbi55ICs9IEVhcnRoLnJvdGF0aW9uUGVyU2Vjb25kIC8gNjA7XG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBjcmVhdGVDbG91ZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHRoaXMuZGlhbWV0ZXIsIHRoaXMubmJwb2x5LCB0aGlzLm5icG9seSlcbiAgICAgICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2VhcnRoY2xvdWRzLnBuZycpLFxuICAgICAgICAgICAgc2lkZTogVEhSRUUuRnJvbnRTaWRlLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lYXJ0aENsb3VkID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgICAgICB0aGlzLmVhcnRoQ2xvdWQucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuZWFydGhDbG91ZC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5lYXJ0aENsb3VkKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIG5vdykge1xuICAgICAgICAgICAgRWFydGguZWFydGhDbG91ZC5yb3RhdGlvbi55ICs9IChFYXJ0aC5yb3RhdGlvblBlclNlY29uZCAqIDEuMikgLyA2MDtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBjcmVhdGVBdG1vc3BoZXJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSh0aGlzLmRpYW1ldGVyLCB0aGlzLm5icG9seSwgdGhpcy5uYnBvbHkpO1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBBdG1vc3BoZXJlcy5jcmVhdGVBdG1vc3BoZXJlTWF0ZXJpYWwoKVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5nbG93Q29sb3IudmFsdWUuc2V0KDB4MDBiM2ZmKVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5jb2VmaWNpZW50LnZhbHVlID0gMVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5wb3dlci52YWx1ZSA9IDYuNVxuICAgICAgICB0aGlzLmF0bW9zcGhlcmUxID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlMS5zY2FsZS5tdWx0aXBseVNjYWxhcigxLjA0KTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5hdG1vc3BoZXJlMSk7XG4gICAgfSxcbiAgICBtYW5hZ2VSZWFsaXNtOiBmdW5jdGlvbiAoaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpc1JlYWxpc3RpYyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0aGlzLmlzUmVhbGlzdGljID0gaXNSZWFsaXN0aWM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlhbWV0ZXIgKj0gMTA7XG4gICAgICAgICAgICB0aGlzLm9yYml0UmFkaXVzIC89IDEwMDtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb25QZXJTZWNvbmQgKj0gNjAwO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZWdpc3RlckFuaW1hdGlvbjogZnVuY3Rpb24gKGNhbGxhYmxlKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKGNhbGxhYmxlKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVhcnRoO1xuIiwiY29uc3QgUEFUSCA9IFwiLi9pbWFnZXMvXCJcbnZhciBTa3lib3ggPSB7XG4gICAgc2l6ZTogMTAwMDAwMDAwMCxcbiAgICBhbmltYXRpb25zOiBbXSxcbiAgICBtYWtlOiBmdW5jdGlvbiAoc2NlbmUsIGlzUmVhbGlzdGljKSB7XG4gICAgICAgIHRoaXMubWFuYWdlUmVhbGlzbShpc1JlYWxpc3RpYyk7XG4gICAgICAgIHRoaXMuaW5pdChzY2VuZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlQm94KHNjZW5lKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGdldEFuaW1hdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9ucztcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgICB0aGlzLnNreWJveENvbnRhaW5lciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5za3lib3hDb250YWluZXIpO1xuICAgIH0sXG4gICAgY3JlYXRlQm94OiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdmFyIHVybHMgPSBbXG4gICAgICAgICAgICBQQVRIICsgXCJweC5qcGdcIiwgUEFUSCArIFwibnguanBnXCIsXG4gICAgICAgICAgICBQQVRIICsgXCJweS5qcGdcIiwgUEFUSCArIFwibnkuanBnXCIsXG4gICAgICAgICAgICBQQVRIICsgXCJwei5qcGdcIiwgUEFUSCArIFwibnouanBnXCJdO1xuXG4gICAgICAgIHZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZUN1YmUodXJscyk7XG4gICAgICAgIHZhciBzaGFkZXIgPSBUSFJFRS5TaGFkZXJMaWJbXCJjdWJlXCJdO1xuICAgICAgICBzaGFkZXIudW5pZm9ybXNbJ3RDdWJlJ10udmFsdWUgPSB0ZXh0dXJlOyAgIC8vIHRleHR1cmVDdWJlIGhhcyBiZWVuIGluaXQgYmVmb3JlXG4gICAgICAgIHNoYWRlci51bmlmb3Jtc1snb3BhY2l0eSddID0ge3ZhbHVlOiAxLjAsIHR5cGU6IFwiZlwifTtcbiAgICAgICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcbiAgICAgICAgICAgIGZyYWdtZW50U2hhZGVyOiBzaGFkZXIuZnJhZ21lbnRTaGFkZXIsXG4gICAgICAgICAgICB2ZXJ0ZXhTaGFkZXI6IHNoYWRlci52ZXJ0ZXhTaGFkZXIsXG4gICAgICAgICAgICB1bmlmb3Jtczogc2hhZGVyLnVuaWZvcm1zLFxuICAgICAgICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGUsXG4gICAgICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2t5Ym94TWVzaCA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSh0aGlzLnNpemUsIHRoaXMuc2l6ZSwgdGhpcy5zaXplKSwgbWF0ZXJpYWwpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5za3lib3hNZXNoKTtcbiAgICB9LFxuICAgIHJlZ2lzdGVyQW5pbWF0aW9uOiBmdW5jdGlvbiAoY2FsbGFibGUpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnB1c2goY2FsbGFibGUpO1xuICAgIH0sXG4gICAgbWFuYWdlUmVhbGlzbTogZnVuY3Rpb24gKGlzUmVhbGlzdGljKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXNSZWFsaXN0aWMgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdGhpcy5pc1JlYWxpc3RpYyA9IGlzUmVhbGlzdGljO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbGlzdGljKSB7XG4gICAgICAgICAgICB0aGlzLnNpemUgLz0gMTA7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNreWJveDtcblxuIiwidmFyIEludCA9IHJlcXVpcmUoJy4uL2xpYi9pbnQnKTtcbmNvbnN0IFBBVEggPSBcIi4vaW1hZ2VzL1wiXG4vL0BtYXRoIHZhciBEZWdyZWUgPSByZXF1aXJlKCcuLi9saWIvZGVncmVlSW5SYWRpYW4nKTtcbnZhciBTdW4gPSB7XG4gICAgdGltZVRvRnVsbFNlbGZSb3RhdGlvbjogODQ5ODE3LjQ3MjQsXG4gICAgaXNSZWFsaXN0aWM6IGZhbHNlLFxuICAgIGxpZ2h0RGlzdGFuY2U6IDEwMDAwMDAwMDAsXG4gICAgbGlnaHRJbnRlbnNpdHk6IDIsXG4gICAgZGlhbWV0ZXI6IDMyNzAsXG4gICAgYXhpYWxUaWx0OiA3LjI1LFxuICAgIC8vcm90YXRpb25QZXJTZWNvbmQ6IDEuNDYwNDU4MzQ4NDQ2NDI4MyxcbiAgICByb3RhdGlvblBlclNlY29uZDogMC4wMDAwMDAwMTQ2MDQ1ODM0ODQ0NjQyODMsXG4gICAgYW5pbWF0aW9uczogW10sXG4gICAgbWFrZTogZnVuY3Rpb24gKHNjZW5lLCBpc1JlYWxpc3RpYykge1xuICAgICAgICB0aGlzLm1hbmFnZVJlYWxpc20oaXNSZWFsaXN0aWMpO1xuICAgICAgICB0aGlzLmluaXQoc2NlbmUpO1xuICAgICAgICAvL3RoaXMuY3JlYXRlTWVzaCgpO1xuICAgICAgICB0aGlzLmFkZExlbnNGbGFyZSgpO1xuICAgICAgICB0aGlzLmFkZExpZ2h0KHNjZW5lKTtcbiAgICAgICAgLy90aGlzLmFkZFBhcnRpY3VsZXMoc2NlbmUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZ2V0QW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25zO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLmNvbnRhaW5lclN1bik7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhLCBub3cpIHtcbiAgICAgICAgICAgIFN1bi5jb250YWluZXJTdW4ucm90YXRpb24ueSArPSBTdW4ucm90YXRpb25QZXJTZWNvbmQgLyA2MDtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBjcmVhdGVNZXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDQwLCA0MCk7XG4gICAgICAgIHZhciB0ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ3N1bm1hcC5qcGcnKTtcbiAgICAgICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdzdW5fc3VyZmFjZS5wbmcnKSxcbiAgICAgICAgICAgIGJ1bXBTY2FsZTogMVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdW5NZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5zdW5NZXNoLnJvdGF0ZVoodGhpcy5heGlhbFRpbHQgKiBNYXRoLlBJIC8gMTgwKTtcbiAgICAgICAgdGhpcy5zdW5NZXNoLnBvc2l0aW9uLnogPSAwO1xuICAgICAgICB0aGlzLnN1bk1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdW5NZXNoLnNjYWxlLnNldCh0aGlzLmRpYW1ldGVyLCB0aGlzLmRpYW1ldGVyLCB0aGlzLmRpYW1ldGVyKTtcbiAgICAgICAgdGhpcy5zdW5NZXNoLmRlcHRoV3JpdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb250YWluZXJTdW4uYWRkKHRoaXMuc3VuTWVzaCk7XG4gICAgfSxcbiAgICBhZGRMZW5zRmxhcmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgICAgIHZhciBsZW5zZmxhcmV0ZXh0dXJlMCA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdsZW5zZmxhcmUwLXdoaXRlLnBuZycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGxlbnNmbGFyZXRleHR1cmUwID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2xlbnNmbGFyZTAucG5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxlbnNmbGFyZXRleHR1cmUxID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2xlbnNmbGFyZTEucG5nJyk7XG4gICAgICAgIHZhciBsZW5zZmxhcmV0ZXh0dXJlMiA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdsZW5zZmxhcmUyLnBuZycpO1xuICAgICAgICB2YXIgbGVuc2ZsYXJldGV4dHVyZTMgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnbGVuc2ZsYXJlMy5wbmcnKTtcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKDB4ZmZmZmZmKTtcbiAgICAgICAgY29sb3Iuc2V0SFNMKDAuNTUsIDAuOSwgMSk7XG4gICAgICAgIHRoaXMubGVuc2ZsYXJlID0gbmV3IFRIUkVFLkxlbnNGbGFyZShsZW5zZmxhcmV0ZXh0dXJlMCwgdGhpcy5kaWFtZXRlciAqIDIsIDAuMCwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZywgY29sb3IpO1xuICAgICAgICB0aGlzLmxlbnNmbGFyZS5hZGQobGVuc2ZsYXJldGV4dHVyZTEsIHRoaXMuZGlhbWV0ZXIsIDAuMCwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZywgY29sb3IsIDAuMik7XG4gICAgICAgIHRoaXMubGVuc2ZsYXJlLmFkZChsZW5zZmxhcmV0ZXh0dXJlMSwgdGhpcy5kaWFtZXRlciAvIDIsIDAuMCwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZywgY29sb3IsIDAuNSk7XG5cbiAgICAgICAgdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUyLCB0aGlzLmRpYW1ldGVyIC8gMiwgMC4wLCBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nKTtcblxuICAgICAgICAvL3RoaXMubGVuc2ZsYXJlLmFkZChsZW5zZmxhcmV0ZXh0dXJlMywgNDAsIC0xLCBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nKTtcbiAgICAgICAgLy90aGlzLmxlbnNmbGFyZS5hZGQobGVuc2ZsYXJldGV4dHVyZTMsIDEwMCwgLTAuNSwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyk7XG4gICAgICAgIC8vdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUzLCA4MCwgLTAuOCwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyk7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJTdW4uYWRkKHRoaXMubGVuc2ZsYXJlKTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyQW5pbWF0aW9uKGZ1bmN0aW9uIChkZWx0YSwgY2FtZXJhKSB7XG4gICAgICAgICAgICBTdW4ubGVuc2ZsYXJlLmN1c3RvbVVwZGF0ZUNhbGxiYWNrID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgICAgIHZhciBmLCBmbCA9IG9iai5sZW5zRmxhcmVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB2YXIgZmxhcmU7XG4gICAgICAgICAgICAgICAgdmFyIHZlY1ggPSAtb2JqLnBvc2l0aW9uU2NyZWVuLnggKiAyO1xuICAgICAgICAgICAgICAgIHZhciB2ZWNZID0gLW9iai5wb3NpdGlvblNjcmVlbi55ICogMjtcblxuICAgICAgICAgICAgICAgIHZhciBjYW1Qb3NpdGlvbiA9IGNhbWVyYS5wb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB2YXIgY2FtUm90YXRpb24gPSBjYW1lcmEucm90YXRpb247XG4gICAgICAgICAgICAgICAgdmFyIGNhbURpc3RhbmNlID0gY2FtUG9zaXRpb24ubGVuZ3RoKCk7XG4gICAgICAgICAgICAgICAgZm9yIChmID0gMDsgZiA8IGZsOyBmKyspIHtcblxuICAgICAgICAgICAgICAgICAgICBmbGFyZSA9IG9iai5sZW5zRmxhcmVzW2ZdO1xuXG4gICAgICAgICAgICAgICAgICAgIGZsYXJlLnggPSBvYmoucG9zaXRpb25TY3JlZW4ueCArIHZlY1ggKiBmbGFyZS5kaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgZmxhcmUueSA9IG9iai5wb3NpdGlvblNjcmVlbi55ICsgdmVjWSAqIGZsYXJlLmRpc3RhbmNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZsYXJlLnJvdGF0aW9uID0gMDtcblxuICAgICAgICAgICAgICAgICAgICBmbGFyZS5zY2FsZSA9IDEgLyBjYW1EaXN0YW5jZSAqIDQwMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGFkZExpZ2h0OiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdGhpcy5saWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmZmZmZmLCB0aGlzLmxpZ2h0SW50ZW5zaXR5LCB0aGlzLmxpZ2h0RGlzdGFuY2UpO1xuICAgICAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnNldCgwLCAwLCAwKTtcbiAgICAgICAgdGhpcy5saWdodC5zY2FsZS5zZXQodGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlcik7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLmxpZ2h0KTtcbiAgICB9LFxuICAgIGFkZFBhcnRpY3VsZXM6IGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgICB0aGlzLnBhcnRpY2xlR3JvdXAgPSBuZXcgU1BFLkdyb3VwKHtcbiAgICAgICAgICAgIHRleHR1cmU6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJy4vaW1hZ2VzL3BhcnRpY2xlMS5qcGVnJyksXG4gICAgICAgICAgICBtYXhBZ2U6IDUsXG4gICAgICAgICAgICBoYXNQZXJzcGVjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgICAgICAgICAgY29sb3JpemU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBwYXJ0aWNsZUVtaXR0ZXIgPSBuZXcgU1BFLkVtaXR0ZXIoe1xuICAgICAgICAgICAgdHlwZTogJ3NwaGVyZScsXG4gICAgICAgICAgICBwb3NpdGlvbjogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCksXG5cbiAgICAgICAgICAgIHJhZGl1czogdGhpcy5kaWFtZXRlcixcbiAgICAgICAgICAgIHJhZGl1c1NwcmVhZDogMixcbiAgICAgICAgICAgIHJhZGl1c1NwcmVhZENsYW1wOiAyLFxuICAgICAgICAgICAgcmFkaXVzU2NhbGU6IG5ldyBUSFJFRS5WZWN0b3IzKDAuNTEsIDAuNTEsIDAuNTEpLFxuXG4gICAgICAgICAgICBzcGVlZDogMSxcbiAgICAgICAgICAgIHNwZWVkU3ByZWFkOiAyLFxuICAgICAgICAgICAgLy9jb2xvclN0YXJ0OiBuZXcgVEhSRUUuQ29sb3IoJ3JlZCcpLFxuICAgICAgICAgICAgLy9jb2xvckVuZDogbmV3IFRIUkVFLkNvbG9yKCdyZWQnKSxcblxuXG4gICAgICAgICAgICBzaXplU3RhcnQ6IDIwMCxcbiAgICAgICAgICAgIHNpemVNaWRkbGU6IDEwMCxcbiAgICAgICAgICAgIHNpemVFbmQ6IDUwLFxuICAgICAgICAgICAgb3BhY2l0eVN0YXJ0OiAxLFxuICAgICAgICAgICAgb3BhY2l0eU1pZGRsZTogMC44LFxuICAgICAgICAgICAgb3BhY2l0eUVuZDogMCxcbiAgICAgICAgICAgIC8vcGFydGljbGVzUGVyU2Vjb25kOiAxMCxcbiAgICAgICAgICAgIGlzU3RhdGljOiAwLFxuICAgICAgICAgICAgcGFydGljbGVDb3VudDogMjAwXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBhcnRpY2xlR3JvdXAuYWRkRW1pdHRlcihwYXJ0aWNsZUVtaXR0ZXIpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5wYXJ0aWNsZUdyb3VwLm1lc2gpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQW5pbWF0aW9uKGZ1bmN0aW9uIChkZWx0YSkge1xuICAgICAgICAgICAgU3VuLnBhcnRpY2xlR3JvdXAudGljayhkZWx0YSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVnaXN0ZXJBbmltYXRpb246IGZ1bmN0aW9uIChjYWxsYWJsZSkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaChjYWxsYWJsZSk7XG4gICAgfSxcbiAgICBtYW5hZ2VSZWFsaXNtOiBmdW5jdGlvbiAoaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpc1JlYWxpc3RpYyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0aGlzLmlzUmVhbGlzdGljID0gaXNSZWFsaXN0aWM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlhbWV0ZXIgLz0gMTA7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uUGVyU2Vjb25kICo9IDYwMDAwO1xuICAgICAgICAgICAgdGhpcy5saWdodERpc3RhbmNlIC89IDEwO1xuICAgICAgICAgICAgdGhpcy5saWdodEludGVuc2l0eSAvPSAyO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdW47XG4iXX0=
