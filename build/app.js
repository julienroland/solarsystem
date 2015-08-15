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
            specular: new THREE.Color('grey')
        });
        //texture.needsUpdate = true;
        //obj.mesh.material.uniforms.texture = THREE.ImageUtils.loadTexture(PATH+"earthnight.jpg");
        material.shininess = 20;
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
            transparent: true,
            opacity:0.7
        });
        this.earthCloud = new THREE.Mesh(geometry, material)
        this.earthCloud.receiveShadow = true;
        this.earthCloud.castShadow = true;
        this.earthCloud.scale.multiplyScalar(1.01);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW50LmpzIiwibGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwuanMiLCJzY3JpcHQuanMiLCJ0aGVTb2xhclN5c3RlbS9lYXJ0aC5qcyIsInRoZVNvbGFyU3lzdGVtL3NreWJveC5qcyIsInRoZVNvbGFyU3lzdGVtL3N1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgSW50ID0ge1xuICAgIGdldFJhbmRvbTogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnQ7XG4iLCJ2YXIgVEhSRUV4ID0gVEhSRUV4IHx8IHt9XG5cbi8qKlxuICogZnJvbSBodHRwOi8vc3RlbWtvc2tpLmJsb2dzcG90LmZyLzIwMTMvMDcvc2hhZGVycy1pbi10aHJlZWpzLWdsb3ctYW5kLWhhbG8uaHRtbFxuICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG4gKi9cblRIUkVFeC5jcmVhdGVBdG1vc3BoZXJlTWF0ZXJpYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZlcnRleFNoYWRlciA9IFtcbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleFdvcmxkUG9zaXRpb247JyxcbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleE5vcm1hbDsnLFxuXG4gICAgICAgICd2b2lkIG1haW4oKXsnLFxuICAgICAgICAnXHR2VmVydGV4Tm9ybWFsXHQ9IG5vcm1hbGl6ZShub3JtYWxNYXRyaXggKiBub3JtYWwpOycsXG5cbiAgICAgICAgJ1x0dlZlcnRleFdvcmxkUG9zaXRpb25cdD0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycsXG5cbiAgICAgICAgJ1x0Ly8gc2V0IGdsX1Bvc2l0aW9uJyxcbiAgICAgICAgJ1x0Z2xfUG9zaXRpb25cdD0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7JyxcbiAgICAgICAgJ30nLFxuXG4gICAgXS5qb2luKCdcXG4nKVxuICAgIHZhciBmcmFnbWVudFNoYWRlciA9IFtcbiAgICAgICAgJ3VuaWZvcm0gdmVjM1x0Z2xvd0NvbG9yOycsXG4gICAgICAgICd1bmlmb3JtIGZsb2F0XHRjb2VmaWNpZW50OycsXG4gICAgICAgICd1bmlmb3JtIGZsb2F0XHRwb3dlcjsnLFxuXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhOb3JtYWw7JyxcbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleFdvcmxkUG9zaXRpb247JyxcblxuICAgICAgICAndm9pZCBtYWluKCl7JyxcbiAgICAgICAgJ1x0dmVjMyB3b3JsZENhbWVyYVRvVmVydGV4PSB2VmVydGV4V29ybGRQb3NpdGlvbiAtIGNhbWVyYVBvc2l0aW9uOycsXG4gICAgICAgICdcdHZlYzMgdmlld0NhbWVyYVRvVmVydGV4XHQ9ICh2aWV3TWF0cml4ICogdmVjNCh3b3JsZENhbWVyYVRvVmVydGV4LCAwLjApKS54eXo7JyxcbiAgICAgICAgJ1x0dmlld0NhbWVyYVRvVmVydGV4XHQ9IG5vcm1hbGl6ZSh2aWV3Q2FtZXJhVG9WZXJ0ZXgpOycsXG4gICAgICAgICdcdGZsb2F0IGludGVuc2l0eVx0XHQ9IHBvdyhjb2VmaWNpZW50ICsgZG90KHZWZXJ0ZXhOb3JtYWwsIHZpZXdDYW1lcmFUb1ZlcnRleCksIHBvd2VyKTsnLFxuICAgICAgICAnXHRnbF9GcmFnQ29sb3JcdFx0PSB2ZWM0KGdsb3dDb2xvciwgaW50ZW5zaXR5KTsnLFxuICAgICAgICAnfScsXG4gICAgXS5qb2luKCdcXG4nKVxuXG4gICAgLy8gY3JlYXRlIGN1c3RvbSBtYXRlcmlhbCBmcm9tIHRoZSBzaGFkZXIgY29kZSBhYm92ZVxuICAgIC8vICAgdGhhdCBpcyB3aXRoaW4gc3BlY2lhbGx5IGxhYmVsZWQgc2NyaXB0IHRhZ3NcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xuICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgY29lZmljaWVudDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZlwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAxLjBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3dlcjoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZlwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2xvd0NvbG9yOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJjXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcigncGluaycpXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB2ZXJ0ZXhTaGFkZXI6IHZlcnRleFNoYWRlcixcbiAgICAgICAgZnJhZ21lbnRTaGFkZXI6IGZyYWdtZW50U2hhZGVyLFxuICAgICAgICAvL2JsZW5kaW5nXHQ6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICB9KTtcbiAgICByZXR1cm4gbWF0ZXJpYWxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRXg7XG4iLCIvL0RlcGVuZGVuY2llc1xudmFyIEVhcnRoID0gcmVxdWlyZSgnLi90aGVTb2xhclN5c3RlbS9lYXJ0aCcpO1xudmFyIFN1biA9IHJlcXVpcmUoJy4vdGhlU29sYXJTeXN0ZW0vc3VuJyk7XG52YXIgU2t5Ym94ID0gcmVxdWlyZSgnLi90aGVTb2xhclN5c3RlbS9za3lib3gnKTtcbi8vQ29uZmlnXG52YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjZW5lJyk7XG52YXIgc2NlbmU7XG52YXIgY2FtZXJhO1xudmFyIGZpZWxkT2ZWaWV3O1xudmFyIGFzcGVjdFJhdGlvO1xudmFyIHJlbmRlcmVyO1xudmFyIG5lYXJQbGFuZTtcbnZhciBmYXJQbGFuZTtcbnZhciBjb250cm9scztcbnZhciBndWk7XG52YXIgY2xvY2sgPSBuZXcgVEhSRUUuQ2xvY2soKTtcbnZhciBpc1JlYWxpc3RpYyA9IGZhbHNlO1xuLy9MaWdodHNcbnZhciBsaWdodDtcblxuLy9Db25zdGFudHNcbmNvbnN0IEVOViA9ICdkZXYnO1xudmFyIEhFSUdIVDtcbnZhciBXSURUSDtcblxuLy9HbG9iYWxcbnZhciBvblJlbmRlckNvbnRhaW5lciA9IFtdO1xuXG5mdW5jdGlvbiBhcHBlbmRTY2VuZSgpIHtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XG59XG5mdW5jdGlvbiBhZGRMaWdodHMoKSB7XG4gICAgbGlnaHQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKVxuICAgIHNjZW5lLmFkZChsaWdodCk7XG59XG5mdW5jdGlvbiBpc0RldigpIHtcbiAgICByZXR1cm4gRU5WID09ICdkZXYnO1xufVxuZnVuY3Rpb24gYWRkQ2FtZXJhKCkge1xuICAgIGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShcbiAgICAgICAgZmllbGRPZlZpZXcsXG4gICAgICAgIGFzcGVjdFJhdGlvLFxuICAgICAgICBuZWFyUGxhbmUsXG4gICAgICAgIGZhclBsYW5lKTtcbiAgICBjYW1lcmEucG9zaXRpb24ueiA9IC00MDA7XG4gICAgY2FtZXJhLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLCAyMDAsIDApKTtcbn1cbmZ1bmN0aW9uIGFkZENvbnRyb2xzKCkge1xuICAgIGNvbnRyb2xzID0gbmV3IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzKGNhbWVyYSk7XG4gICAgY29udHJvbHMudGFyZ2V0LnNldCgwLCAwLCAwKTtcbiAgICBjb250cm9scy5yb3RhdGVTcGVlZCA9IDEuMDtcbiAgICBjb250cm9scy56b29tU3BlZWQgPSAxLjI7XG4gICAgY29udHJvbHMucGFuU3BlZWQgPSAwLjg7XG5cbiAgICBjb250cm9scy5ub1pvb20gPSBmYWxzZTtcbiAgICBjb250cm9scy5ub1BhbiA9IGZhbHNlO1xuXG4gICAgY29udHJvbHMuc3RhdGljTW92aW5nID0gdHJ1ZTtcbiAgICBjb250cm9scy5keW5hbWljRGFtcGluZ0ZhY3RvciA9IDAuMztcblxuICAgIGNvbnRyb2xzLmtleXMgPSBbNjUsIDgzLCA2OF07XG4gICAgY29udHJvbHMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZW5kZXIoY2xvY2suZ2V0RGVsdGEoKSk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBjb25maWd1cmVTY2VuZSgpIHtcbiAgICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gICAgSEVJR0hUID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIFdJRFRIID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgYXNwZWN0UmF0aW8gPSBXSURUSCAvIEhFSUdIVDtcbiAgICBmaWVsZE9mVmlldyA9IDYwO1xuICAgIG5lYXJQbGFuZSA9IC4xO1xuICAgIGZhclBsYW5lID0gMTAwMDAwMDAwMDtcbiAgICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbHBoYTogdHJ1ZSwgYW50aWFsaWFzOiB0cnVlfSk7XG4gICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweDAwMDAwMCk7XG4gICAgcmVuZGVyZXIuc2V0U2l6ZShXSURUSCwgSEVJR0hUKTtcbiAgICByZW5kZXJlci5zaGFkb3dNYXBFbmFibGVkID0gdHJ1ZTtcbiAgICByZW5kZXJlci5nYW1tYUlucHV0ID0gdHJ1ZTtcbiAgICByZW5kZXJlci5nYW1tYU91dHB1dCA9IHRydWU7XG4gICAgYWRkQ2FtZXJhKCk7XG4gICAgaWYgKGlzRGV2KCkpIHtcbiAgICAgICAgYWRkQ29udHJvbHMoKTtcbiAgICB9XG4gICAgLy9hZGRMaWdodHMoKTtcbn1cblxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gICAgcmVuZGVyKGNsb2NrLmdldERlbHRhKCkpO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xufVxuZnVuY3Rpb24gcmVuZGVyKGRlbHRhKSB7XG4gICAgb25SZW5kZXJDb250YWluZXIuZm9yRWFjaChmdW5jdGlvbiAob25SZW5kZXJDb250YWluZXIpIHtcbiAgICAgICAgb25SZW5kZXJDb250YWluZXIoZGVsdGEsIGNhbWVyYSk7XG4gICAgfSk7XG4gICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xufVxuZnVuY3Rpb24gZ3VpKCkge1xuICAgIGd1aSA9IG5ldyBkYXQuR1VJKCk7XG4gICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgICAgdGVzdDogMTAwMFxuICAgIH07XG4gICAgZ3VpLmFkZChwYXJhbXMsICd0ZXN0Jyk7XG59XG5mdW5jdGlvbiBhZGRTa3lib3goKSB7XG4gICAgU2t5Ym94Lm1ha2Uoc2NlbmUsIGlzUmVhbGlzdGljKTtcbn1cbmZ1bmN0aW9uIGFkZFNvbGFyU3lzdGVtKCkge1xuICAgIGFkZFN1bigpO1xuICAgIGFkZFBsYW5ldHMoKTtcbn1cbmZ1bmN0aW9uIGFkZFN1bigpIHtcbiAgICB2YXIgc3VuID0gU3VuLm1ha2Uoc2NlbmUsIGlzUmVhbGlzdGljKTtcbiAgICB2YXIgc3VuQW5pbWF0aW9ucyA9IHN1bi5nZXRBbmltYXRpb25zKCk7XG4gICAgc3VuQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhbmltYXRpb24pIHtcbiAgICAgICAgb25SZW5kZXJDb250YWluZXIucHVzaChhbmltYXRpb24pO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gYWRkUGxhbmV0cygpIHtcbiAgICB2YXIgZWFydGggPSBFYXJ0aC5tYWtlKHNjZW5lLCBpc1JlYWxpc3RpYyk7XG4gICAgdmFyIGVhcnRoQW5pbWF0aW9ucyA9IGVhcnRoLmdldEFuaW1hdGlvbnMoKTtcbiAgICBlYXJ0aEFuaW1hdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYW5pbWF0aW9uKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyLnB1c2goYW5pbWF0aW9uKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgY29uZmlndXJlU2NlbmUoKTtcbiAgICBhZGRTa3lib3goKTtcbiAgICBhZGRTb2xhclN5c3RlbSgpO1xuICAgIGFwcGVuZFNjZW5lKCk7XG4gICAgaWYgKGlzRGV2KCkpIHtcbiAgICAgICAgZ3VpKCk7XG4gICAgfVxuICAgIGFuaW1hdGUoKTtcbn1cbmluaXQoKTtcbiIsInZhciBBdG1vc3BoZXJlcyA9IHJlcXVpcmUoJy4uL2xpYi90aHJlZXguYXRtb3NwaGVyZW1hdGVyaWFsJyk7XG5jb25zdCBQQVRIID0gXCIuL2ltYWdlcy9cIlxuLy9AbWF0aCB2YXIgRGVncmVlID0gcmVxdWlyZSgnLi4vbGliL2RlZ3JlZUluUmFkaWFuJyk7XG52YXIgRWFydGggPSB7XG4gICAgLy9AbWF0aCA2MCAqIDYwICogMjMuNTYwMyAoMjNoNTYgMDMnKVxuICAgIHRpbWVUb0Z1bGxTZWxmUm90YXRpb246IDg0ODE3LjQ3MjQsXG4gICAgaXNSZWFsaXN0aWM6IGZhbHNlLFxuICAgIGRpYW1ldGVyOiAzLFxuICAgIG5icG9seTogMzIsXG4gICAgYXRtb3NwaGVyZVJhZGl1czogdW5kZWZpbmVkLFxuICAgIGF0bW9zcGhlcmVTaXplOiB1bmRlZmluZWQsXG4gICAgYXhpYWxUaWx0OiAyMy40LFxuICAgIC8vQG1hdGggcmV0dXJuIChEZWdyZWUuY29udmVydCgzNjApIC8gdGhpcy50aW1lVG9GdWxsU2VsZlJvdGF0aW9uKTtcbiAgICByb3RhdGlvblBlclNlY29uZDogMC4wMDAwMDczOTM1NzAzODkwMTAwNDMsXG4gICAgb3JiaXRSYWRpdXM6IDM1NjQzLFxuICAgIGFuaW1hdGlvbnM6IFtdLFxuXG4gICAgbWFrZTogZnVuY3Rpb24gKHNjZW5lLCBpc1JlYWxpc3RpYykge1xuICAgICAgICB0aGlzLm1hbmFnZVJlYWxpc20oaXNSZWFsaXN0aWMpO1xuICAgICAgICB0aGlzLmluaXQoc2NlbmUpO1xuICAgICAgICB0aGlzLmNyZWF0ZU1lc2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdG1vc3BoZXJlKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlQ2xvdWRzKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZ2V0QW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25zO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGggPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5yb3RhdGVaKHRoaXMuYXhpYWxUaWx0ICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgIC8vU3VuIGRpYW1ldGVyICogMTA5ID0gcmFkaXVzIG9mIGVhcnRoJ3Mgb3JiaXQgKDE0OSw1OTcsODcwIGttKSAoMzU2NDMpXG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGgucG9zaXRpb24ueCA9IHRoaXMub3JiaXRSYWRpdXM7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLmNvbnRhaW5lckVhcnRoKTtcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlUmFkaXVzID0gdGhpcy5kaWFtZXRlcjtcbiAgICB9LFxuICAgIGNyZWF0ZU1lc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9FYXJ0aCBpcyBtb3JlIG9yIGxlc3MgMTA5IHRpbWVzIHNtYWxsZXIgdGhhbiBzdW5cbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHRoaXMuZGlhbWV0ZXIsIHRoaXMubmJwb2x5LCB0aGlzLm5icG9seSlcbiAgICAgICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnZWFydGhkaWZmdXNlLmpwZycpO1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2VhcnRoYnVtcDFrLmpwZycpLFxuICAgICAgICAgICAgYnVtcFNjYWxlOiAxLFxuICAgICAgICAgICAgc3BlY3VsYXJNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdlYXJ0aHNwZWMxay5qcGcnKSxcbiAgICAgICAgICAgIHNwZWN1bGFyOiBuZXcgVEhSRUUuQ29sb3IoJ2dyZXknKVxuICAgICAgICB9KTtcbiAgICAgICAgLy90ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgLy9vYmoubWVzaC5tYXRlcmlhbC51bmlmb3Jtcy50ZXh0dXJlID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIK1wiZWFydGhuaWdodC5qcGdcIik7XG4gICAgICAgIG1hdGVyaWFsLnNoaW5pbmVzcyA9IDIwO1xuICAgICAgICBtYXRlcmlhbC5tYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgICAgICBtYXRlcmlhbC5idW1wTWFwLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgICAgICAgbWF0ZXJpYWwuc3BlY3VsYXJNYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgICAgICB0aGlzLmVhcnRoTWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcblxuICAgICAgICB0aGlzLmVhcnRoTWVzaC5yb3RhdGlvbi55ID0gMDtcbiAgICAgICAgdGhpcy5lYXJ0aE1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuZWFydGhNZXNoLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmVhcnRoTWVzaCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhLCBub3cpIHtcbiAgICAgICAgICAgIEVhcnRoLmVhcnRoTWVzaC5yb3RhdGlvbi55ICs9IEVhcnRoLnJvdGF0aW9uUGVyU2Vjb25kIC8gNjA7XG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBjcmVhdGVDbG91ZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHRoaXMuZGlhbWV0ZXIsIHRoaXMubmJwb2x5LCB0aGlzLm5icG9seSlcbiAgICAgICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2VhcnRoY2xvdWRzLnBuZycpLFxuICAgICAgICAgICAgc2lkZTogVEhSRUUuRnJvbnRTaWRlLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICAgICAgICBvcGFjaXR5OjAuN1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lYXJ0aENsb3VkID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICAgICAgICB0aGlzLmVhcnRoQ2xvdWQucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuZWFydGhDbG91ZC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lYXJ0aENsb3VkLnNjYWxlLm11bHRpcGx5U2NhbGFyKDEuMDEpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmVhcnRoQ2xvdWQpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQW5pbWF0aW9uKGZ1bmN0aW9uIChkZWx0YSwgbm93KSB7XG4gICAgICAgICAgICBFYXJ0aC5lYXJ0aENsb3VkLnJvdGF0aW9uLnkgKz0gKEVhcnRoLnJvdGF0aW9uUGVyU2Vjb25kICogMS4yKSAvIDYwO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGNyZWF0ZUF0bW9zcGhlcmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHRoaXMuZGlhbWV0ZXIsIHRoaXMubmJwb2x5LCB0aGlzLm5icG9seSk7XG4gICAgICAgIHZhciBtYXRlcmlhbCA9IEF0bW9zcGhlcmVzLmNyZWF0ZUF0bW9zcGhlcmVNYXRlcmlhbCgpXG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmdsb3dDb2xvci52YWx1ZS5zZXQoMHgwMGIzZmYpXG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmNvZWZpY2llbnQudmFsdWUgPSAxXG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLnBvd2VyLnZhbHVlID0gNi41XG4gICAgICAgIHRoaXMuYXRtb3NwaGVyZTEgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICB0aGlzLmF0bW9zcGhlcmUxLnNjYWxlLm11bHRpcGx5U2NhbGFyKDEuMDQpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmF0bW9zcGhlcmUxKTtcbiAgICB9LFxuICAgIG1hbmFnZVJlYWxpc206IGZ1bmN0aW9uIChpc1JlYWxpc3RpYykge1xuICAgICAgICBpZiAodHlwZW9mIGlzUmVhbGlzdGljICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHRoaXMuaXNSZWFsaXN0aWMgPSBpc1JlYWxpc3RpYztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc1JlYWxpc3RpYykge1xuICAgICAgICAgICAgdGhpcy5kaWFtZXRlciAqPSAxMDtcbiAgICAgICAgICAgIHRoaXMub3JiaXRSYWRpdXMgLz0gMTAwO1xuICAgICAgICAgICAgdGhpcy5yb3RhdGlvblBlclNlY29uZCAqPSA2MDA7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlZ2lzdGVyQW5pbWF0aW9uOiBmdW5jdGlvbiAoY2FsbGFibGUpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnB1c2goY2FsbGFibGUpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWFydGg7XG4iLCJjb25zdCBQQVRIID0gXCIuL2ltYWdlcy9cIlxudmFyIFNreWJveCA9IHtcbiAgICBzaXplOiAxMDAwMDAwMDAwLFxuICAgIGFuaW1hdGlvbnM6IFtdLFxuICAgIG1ha2U6IGZ1bmN0aW9uIChzY2VuZSwgaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgdGhpcy5tYW5hZ2VSZWFsaXNtKGlzUmVhbGlzdGljKTtcbiAgICAgICAgdGhpcy5pbml0KHNjZW5lKTtcbiAgICAgICAgdGhpcy5jcmVhdGVCb3goc2NlbmUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZ2V0QW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25zO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMuc2t5Ym94Q29udGFpbmVyID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLnNreWJveENvbnRhaW5lcik7XG4gICAgfSxcbiAgICBjcmVhdGVCb3g6IGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgICB2YXIgdXJscyA9IFtcbiAgICAgICAgICAgIFBBVEggKyBcInB4LmpwZ1wiLCBQQVRIICsgXCJueC5qcGdcIixcbiAgICAgICAgICAgIFBBVEggKyBcInB5LmpwZ1wiLCBQQVRIICsgXCJueS5qcGdcIixcbiAgICAgICAgICAgIFBBVEggKyBcInB6LmpwZ1wiLCBQQVRIICsgXCJuei5qcGdcIl07XG5cbiAgICAgICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlQ3ViZSh1cmxzKTtcbiAgICAgICAgdmFyIHNoYWRlciA9IFRIUkVFLlNoYWRlckxpYltcImN1YmVcIl07XG4gICAgICAgIHNoYWRlci51bmlmb3Jtc1sndEN1YmUnXS52YWx1ZSA9IHRleHR1cmU7ICAgLy8gdGV4dHVyZUN1YmUgaGFzIGJlZW4gaW5pdCBiZWZvcmVcbiAgICAgICAgc2hhZGVyLnVuaWZvcm1zWydvcGFjaXR5J10gPSB7dmFsdWU6IDEuMCwgdHlwZTogXCJmXCJ9O1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xuICAgICAgICAgICAgZnJhZ21lbnRTaGFkZXI6IHNoYWRlci5mcmFnbWVudFNoYWRlcixcbiAgICAgICAgICAgIHZlcnRleFNoYWRlcjogc2hhZGVyLnZlcnRleFNoYWRlcixcbiAgICAgICAgICAgIHVuaWZvcm1zOiBzaGFkZXIudW5pZm9ybXMsXG4gICAgICAgICAgICBzaWRlOiBUSFJFRS5CYWNrU2lkZSxcbiAgICAgICAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgICAgICAgICAgZGVwdGhUZXN0OiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5za3lib3hNZXNoID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkJveEdlb21ldHJ5KHRoaXMuc2l6ZSwgdGhpcy5zaXplLCB0aGlzLnNpemUpLCBtYXRlcmlhbCk7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLnNreWJveE1lc2gpO1xuICAgIH0sXG4gICAgcmVnaXN0ZXJBbmltYXRpb246IGZ1bmN0aW9uIChjYWxsYWJsZSkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaChjYWxsYWJsZSk7XG4gICAgfSxcbiAgICBtYW5hZ2VSZWFsaXNtOiBmdW5jdGlvbiAoaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpc1JlYWxpc3RpYyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0aGlzLmlzUmVhbGlzdGljID0gaXNSZWFsaXN0aWM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgICAgIHRoaXMuc2l6ZSAvPSAxMDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2t5Ym94O1xuXG4iLCJ2YXIgSW50ID0gcmVxdWlyZSgnLi4vbGliL2ludCcpO1xuY29uc3QgUEFUSCA9IFwiLi9pbWFnZXMvXCJcbi8vQG1hdGggdmFyIERlZ3JlZSA9IHJlcXVpcmUoJy4uL2xpYi9kZWdyZWVJblJhZGlhbicpO1xudmFyIFN1biA9IHtcbiAgICB0aW1lVG9GdWxsU2VsZlJvdGF0aW9uOiA4NDk4MTcuNDcyNCxcbiAgICBpc1JlYWxpc3RpYzogZmFsc2UsXG4gICAgbGlnaHREaXN0YW5jZTogMTAwMDAwMDAwMCxcbiAgICBsaWdodEludGVuc2l0eTogMixcbiAgICBkaWFtZXRlcjogMzI3MCxcbiAgICBheGlhbFRpbHQ6IDcuMjUsXG4gICAgLy9yb3RhdGlvblBlclNlY29uZDogMS40NjA0NTgzNDg0NDY0MjgzLFxuICAgIHJvdGF0aW9uUGVyU2Vjb25kOiAwLjAwMDAwMDAxNDYwNDU4MzQ4NDQ2NDI4MyxcbiAgICBhbmltYXRpb25zOiBbXSxcbiAgICBtYWtlOiBmdW5jdGlvbiAoc2NlbmUsIGlzUmVhbGlzdGljKSB7XG4gICAgICAgIHRoaXMubWFuYWdlUmVhbGlzbShpc1JlYWxpc3RpYyk7XG4gICAgICAgIHRoaXMuaW5pdChzY2VuZSk7XG4gICAgICAgIC8vdGhpcy5jcmVhdGVNZXNoKCk7XG4gICAgICAgIHRoaXMuYWRkTGVuc0ZsYXJlKCk7XG4gICAgICAgIHRoaXMuYWRkTGlnaHQoc2NlbmUpO1xuICAgICAgICAvL3RoaXMuYWRkUGFydGljdWxlcyhzY2VuZSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBnZXRBbmltYXRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbnM7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJTdW4gPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgICAgICAgc2NlbmUuYWRkKHRoaXMuY29udGFpbmVyU3VuKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIG5vdykge1xuICAgICAgICAgICAgU3VuLmNvbnRhaW5lclN1bi5yb3RhdGlvbi55ICs9IFN1bi5yb3RhdGlvblBlclNlY29uZCAvIDYwO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGNyZWF0ZU1lc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgNDAsIDQwKTtcbiAgICAgICAgdmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnc3VubWFwLmpwZycpO1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICAgICAgbWFwOiB0ZXh0dXJlLFxuICAgICAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ3N1bl9zdXJmYWNlLnBuZycpLFxuICAgICAgICAgICAgYnVtcFNjYWxlOiAxXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN1bk1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICB0aGlzLnN1bk1lc2gucm90YXRlWih0aGlzLmF4aWFsVGlsdCAqIE1hdGguUEkgLyAxODApO1xuICAgICAgICB0aGlzLnN1bk1lc2gucG9zaXRpb24ueiA9IDA7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdW5NZXNoLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLnN1bk1lc2guc2NhbGUuc2V0KHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICB0aGlzLnN1bk1lc2guZGVwdGhXcml0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1bi5hZGQodGhpcy5zdW5NZXNoKTtcbiAgICB9LFxuICAgIGFkZExlbnNGbGFyZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5pc1JlYWxpc3RpYykge1xuICAgICAgICAgICAgdmFyIGxlbnNmbGFyZXRleHR1cmUwID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2xlbnNmbGFyZTAtd2hpdGUucG5nJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgbGVuc2ZsYXJldGV4dHVyZTAgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnbGVuc2ZsYXJlMC5wbmcnKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGVuc2ZsYXJldGV4dHVyZTEgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnbGVuc2ZsYXJlMS5wbmcnKTtcbiAgICAgICAgdmFyIGxlbnNmbGFyZXRleHR1cmUyID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2xlbnNmbGFyZTIucG5nJyk7XG4gICAgICAgIHZhciBsZW5zZmxhcmV0ZXh0dXJlMyA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdsZW5zZmxhcmUzLnBuZycpO1xuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoMHhmZmZmZmYpO1xuICAgICAgICBjb2xvci5zZXRIU0woMC41NSwgMC45LCAxKTtcbiAgICAgICAgdGhpcy5sZW5zZmxhcmUgPSBuZXcgVEhSRUUuTGVuc0ZsYXJlKGxlbnNmbGFyZXRleHR1cmUwLCB0aGlzLmRpYW1ldGVyICogMiwgMC4wLCBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLCBjb2xvcik7XG4gICAgICAgIHRoaXMubGVuc2ZsYXJlLmFkZChsZW5zZmxhcmV0ZXh0dXJlMSwgdGhpcy5kaWFtZXRlciwgMC4wLCBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLCBjb2xvciwgMC4yKTtcbiAgICAgICAgdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUxLCB0aGlzLmRpYW1ldGVyIC8gMiwgMC4wLCBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLCBjb2xvciwgMC41KTtcblxuICAgICAgICB0aGlzLmxlbnNmbGFyZS5hZGQobGVuc2ZsYXJldGV4dHVyZTIsIHRoaXMuZGlhbWV0ZXIgLyAyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcpO1xuXG4gICAgICAgIC8vdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUzLCA0MCwgLTEsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcpO1xuICAgICAgICAvL3RoaXMubGVuc2ZsYXJlLmFkZChsZW5zZmxhcmV0ZXh0dXJlMywgMTAwLCAtMC41LCBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nKTtcbiAgICAgICAgLy90aGlzLmxlbnNmbGFyZS5hZGQobGVuc2ZsYXJldGV4dHVyZTMsIDgwLCAtMC44LCBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nKTtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lclN1bi5hZGQodGhpcy5sZW5zZmxhcmUpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhLCBjYW1lcmEpIHtcbiAgICAgICAgICAgIFN1bi5sZW5zZmxhcmUuY3VzdG9tVXBkYXRlQ2FsbGJhY2sgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICAgICAgdmFyIGYsIGZsID0gb2JqLmxlbnNGbGFyZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHZhciBmbGFyZTtcbiAgICAgICAgICAgICAgICB2YXIgdmVjWCA9IC1vYmoucG9zaXRpb25TY3JlZW4ueCAqIDI7XG4gICAgICAgICAgICAgICAgdmFyIHZlY1kgPSAtb2JqLnBvc2l0aW9uU2NyZWVuLnkgKiAyO1xuXG4gICAgICAgICAgICAgICAgdmFyIGNhbVBvc2l0aW9uID0gY2FtZXJhLnBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHZhciBjYW1Sb3RhdGlvbiA9IGNhbWVyYS5yb3RhdGlvbjtcbiAgICAgICAgICAgICAgICB2YXIgY2FtRGlzdGFuY2UgPSBjYW1Qb3NpdGlvbi5sZW5ndGgoKTtcbiAgICAgICAgICAgICAgICBmb3IgKGYgPSAwOyBmIDwgZmw7IGYrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIGZsYXJlID0gb2JqLmxlbnNGbGFyZXNbZl07XG5cbiAgICAgICAgICAgICAgICAgICAgZmxhcmUueCA9IG9iai5wb3NpdGlvblNjcmVlbi54ICsgdmVjWCAqIGZsYXJlLmRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICBmbGFyZS55ID0gb2JqLnBvc2l0aW9uU2NyZWVuLnkgKyB2ZWNZICogZmxhcmUuZGlzdGFuY2U7XG5cbiAgICAgICAgICAgICAgICAgICAgZmxhcmUucm90YXRpb24gPSAwO1xuXG4gICAgICAgICAgICAgICAgICAgIGZsYXJlLnNjYWxlID0gMSAvIGNhbURpc3RhbmNlICogNDAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgYWRkTGlnaHQ6IGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgICB0aGlzLmxpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmZmZmZmYsIHRoaXMubGlnaHRJbnRlbnNpdHksIHRoaXMubGlnaHREaXN0YW5jZSk7XG4gICAgICAgIHRoaXMubGlnaHQucG9zaXRpb24uc2V0KDAsIDAsIDApO1xuICAgICAgICB0aGlzLmxpZ2h0LnNjYWxlLnNldCh0aGlzLmRpYW1ldGVyLCB0aGlzLmRpYW1ldGVyLCB0aGlzLmRpYW1ldGVyKTtcbiAgICAgICAgc2NlbmUuYWRkKHRoaXMubGlnaHQpO1xuICAgIH0sXG4gICAgYWRkUGFydGljdWxlczogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMucGFydGljbGVHcm91cCA9IG5ldyBTUEUuR3JvdXAoe1xuICAgICAgICAgICAgdGV4dHVyZTogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnLi9pbWFnZXMvcGFydGljbGUxLmpwZWcnKSxcbiAgICAgICAgICAgIG1heEFnZTogNSxcbiAgICAgICAgICAgIGhhc1BlcnNwZWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICAgICAgICBjb2xvcml6ZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHBhcnRpY2xlRW1pdHRlciA9IG5ldyBTUEUuRW1pdHRlcih7XG4gICAgICAgICAgICB0eXBlOiAnc3BoZXJlJyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSxcblxuICAgICAgICAgICAgcmFkaXVzOiB0aGlzLmRpYW1ldGVyLFxuICAgICAgICAgICAgcmFkaXVzU3ByZWFkOiAyLFxuICAgICAgICAgICAgcmFkaXVzU3ByZWFkQ2xhbXA6IDIsXG4gICAgICAgICAgICByYWRpdXNTY2FsZTogbmV3IFRIUkVFLlZlY3RvcjMoMC41MSwgMC41MSwgMC41MSksXG5cbiAgICAgICAgICAgIHNwZWVkOiAxLFxuICAgICAgICAgICAgc3BlZWRTcHJlYWQ6IDIsXG4gICAgICAgICAgICAvL2NvbG9yU3RhcnQ6IG5ldyBUSFJFRS5Db2xvcigncmVkJyksXG4gICAgICAgICAgICAvL2NvbG9yRW5kOiBuZXcgVEhSRUUuQ29sb3IoJ3JlZCcpLFxuXG5cbiAgICAgICAgICAgIHNpemVTdGFydDogMjAwLFxuICAgICAgICAgICAgc2l6ZU1pZGRsZTogMTAwLFxuICAgICAgICAgICAgc2l6ZUVuZDogNTAsXG4gICAgICAgICAgICBvcGFjaXR5U3RhcnQ6IDEsXG4gICAgICAgICAgICBvcGFjaXR5TWlkZGxlOiAwLjgsXG4gICAgICAgICAgICBvcGFjaXR5RW5kOiAwLFxuICAgICAgICAgICAgLy9wYXJ0aWNsZXNQZXJTZWNvbmQ6IDEwLFxuICAgICAgICAgICAgaXNTdGF0aWM6IDAsXG4gICAgICAgICAgICBwYXJ0aWNsZUNvdW50OiAyMDBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGFydGljbGVHcm91cC5hZGRFbWl0dGVyKHBhcnRpY2xlRW1pdHRlcik7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLnBhcnRpY2xlR3JvdXAubWVzaCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhKSB7XG4gICAgICAgICAgICBTdW4ucGFydGljbGVHcm91cC50aWNrKGRlbHRhKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICByZWdpc3RlckFuaW1hdGlvbjogZnVuY3Rpb24gKGNhbGxhYmxlKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKGNhbGxhYmxlKTtcbiAgICB9LFxuICAgIG1hbmFnZVJlYWxpc206IGZ1bmN0aW9uIChpc1JlYWxpc3RpYykge1xuICAgICAgICBpZiAodHlwZW9mIGlzUmVhbGlzdGljICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHRoaXMuaXNSZWFsaXN0aWMgPSBpc1JlYWxpc3RpYztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc1JlYWxpc3RpYykge1xuICAgICAgICAgICAgdGhpcy5kaWFtZXRlciAvPSAxMDtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb25QZXJTZWNvbmQgKj0gNjAwMDA7XG4gICAgICAgICAgICB0aGlzLmxpZ2h0RGlzdGFuY2UgLz0gMTA7XG4gICAgICAgICAgICB0aGlzLmxpZ2h0SW50ZW5zaXR5IC89IDI7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN1bjtcbiJdfQ==
