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
    controls.addEventListener('change', function(){
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
    farPlane = 10000;
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
function addPlanets() {
    var earth = Earth.make(scene);
    var earthAnimations = earth.getAnimations();
    earthAnimations.forEach(function (animation) {
        onRenderContainer.push(animation);
    });

    var sun = Sun.make(scene);
    var sunAnimations = sun.getAnimations();
    sunAnimations.forEach(function (animation) {
        onRenderContainer.push(animation);
    });
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

},{"./theSolarSystem/earth":4,"./theSolarSystem/sun":5}],4:[function(require,module,exports){
var Atmospheres = require('../lib/threex.atmospherematerial');
const PATH = "./images/"
//@math var Degree = require('../lib/degreeInRadian');
var Earth = {
    //@math 60 * 60 * 23.5603 (23h56 03')
    timeToFullSelfRotation: 84817.4724,
    isRealistic: false,
    diameter: 3,
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
        //Earth is more or less 109 times smaller than sun
        this.containerEarth.scale.set(this.diameter, this.diameter, this.diameter);
        scene.add(this.containerEarth);

        this.atmosphereRadius = this.diameter + (this.diameter / 2);
        this.atmosphereSize = this.diameter / 60;
    },
    createMesh: function () {
        var geometry = new THREE.SphereGeometry(0.5, 32, 32)
        var material = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(PATH + 'earthdiffuse.jpg'),
            bumpMap: THREE.ImageUtils.loadTexture(PATH + 'earthbump1k.jpg'),
            bumpScale: 1,
            specularMap: THREE.ImageUtils.loadTexture(PATH + 'earthspec1k.jpg'),
            specular: new THREE.Color('grey')
        })
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
    createAtmosphere: function () {
        var geometry = new THREE.SphereGeometry(this.atmosphereSize, this.atmosphereRadius, this.atmosphereRadius);
        var material = Atmospheres.createAtmosphereMaterial()
        material.uniforms.glowColor.value.set(0x00b3ff)
        material.uniforms.coeficient.value = 0.8
        material.uniforms.power.value = 2.0
        this.atmosphere1 = new THREE.Mesh(geometry, material);
        this.atmosphere1.scale.multiplyScalar(1.01);
        this.containerEarth.add(this.atmosphere1);

        var geometry = new THREE.SphereGeometry(this.atmosphereSize, this.atmosphereRadius, this.atmosphereRadius);
        var material = Atmospheres.createAtmosphereMaterial()
        material.side = THREE.BackSide
        material.uniforms.glowColor.value.set(0x00b3ff)
        material.uniforms.coeficient.value = 0.5
        material.uniforms.power.value = 4.0
        this.atmosphere2 = new THREE.Mesh(geometry, material);
        this.atmosphere2.scale.multiplyScalar(1.15);
        this.containerEarth.add(this.atmosphere2);
    },

    createClouds: function () {
        var geometry = new THREE.SphereGeometry(0.51, 32, 32)
        var material = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(PATH + 'earthclouds.png'),
            side: THREE.DoubleSide,
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
var Int = require('../lib/int');
var Atmospheres = require('../lib/threex.atmospherematerial');
const PATH = "./images/"
//@math var Degree = require('../lib/degreeInRadian');
var Sun = {
    timeToFullSelfRotation: 849817.4724,
    isRealistic: false,
    lightDistance: 10000,
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
        this.light = new THREE.PointLight(0xffffff, 1, this.lightDistance);
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
        }
    }
};

module.exports = Sun;

},{"../lib/int":1,"../lib/threex.atmospherematerial":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW50LmpzIiwibGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwuanMiLCJzY3JpcHQuanMiLCJ0aGVTb2xhclN5c3RlbS9lYXJ0aC5qcyIsInRoZVNvbGFyU3lzdGVtL3N1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgSW50ID0ge1xuICAgIGdldFJhbmRvbTogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnQ7XG4iLCJ2YXIgVEhSRUV4ID0gVEhSRUV4IHx8IHt9XG5cbi8qKlxuICogZnJvbSBodHRwOi8vc3RlbWtvc2tpLmJsb2dzcG90LmZyLzIwMTMvMDcvc2hhZGVycy1pbi10aHJlZWpzLWdsb3ctYW5kLWhhbG8uaHRtbFxuICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG4gKi9cblRIUkVFeC5jcmVhdGVBdG1vc3BoZXJlTWF0ZXJpYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZlcnRleFNoYWRlciA9IFtcbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleFdvcmxkUG9zaXRpb247JyxcbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleE5vcm1hbDsnLFxuXG4gICAgICAgICd2b2lkIG1haW4oKXsnLFxuICAgICAgICAnXHR2VmVydGV4Tm9ybWFsXHQ9IG5vcm1hbGl6ZShub3JtYWxNYXRyaXggKiBub3JtYWwpOycsXG5cbiAgICAgICAgJ1x0dlZlcnRleFdvcmxkUG9zaXRpb25cdD0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycsXG5cbiAgICAgICAgJ1x0Ly8gc2V0IGdsX1Bvc2l0aW9uJyxcbiAgICAgICAgJ1x0Z2xfUG9zaXRpb25cdD0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7JyxcbiAgICAgICAgJ30nLFxuXG4gICAgXS5qb2luKCdcXG4nKVxuICAgIHZhciBmcmFnbWVudFNoYWRlciA9IFtcbiAgICAgICAgJ3VuaWZvcm0gdmVjM1x0Z2xvd0NvbG9yOycsXG4gICAgICAgICd1bmlmb3JtIGZsb2F0XHRjb2VmaWNpZW50OycsXG4gICAgICAgICd1bmlmb3JtIGZsb2F0XHRwb3dlcjsnLFxuXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhOb3JtYWw7JyxcbiAgICAgICAgJ3ZhcnlpbmcgdmVjM1x0dlZlcnRleFdvcmxkUG9zaXRpb247JyxcblxuICAgICAgICAndm9pZCBtYWluKCl7JyxcbiAgICAgICAgJ1x0dmVjMyB3b3JsZENhbWVyYVRvVmVydGV4PSB2VmVydGV4V29ybGRQb3NpdGlvbiAtIGNhbWVyYVBvc2l0aW9uOycsXG4gICAgICAgICdcdHZlYzMgdmlld0NhbWVyYVRvVmVydGV4XHQ9ICh2aWV3TWF0cml4ICogdmVjNCh3b3JsZENhbWVyYVRvVmVydGV4LCAwLjApKS54eXo7JyxcbiAgICAgICAgJ1x0dmlld0NhbWVyYVRvVmVydGV4XHQ9IG5vcm1hbGl6ZSh2aWV3Q2FtZXJhVG9WZXJ0ZXgpOycsXG4gICAgICAgICdcdGZsb2F0IGludGVuc2l0eVx0XHQ9IHBvdyhjb2VmaWNpZW50ICsgZG90KHZWZXJ0ZXhOb3JtYWwsIHZpZXdDYW1lcmFUb1ZlcnRleCksIHBvd2VyKTsnLFxuICAgICAgICAnXHRnbF9GcmFnQ29sb3JcdFx0PSB2ZWM0KGdsb3dDb2xvciwgaW50ZW5zaXR5KTsnLFxuICAgICAgICAnfScsXG4gICAgXS5qb2luKCdcXG4nKVxuXG4gICAgLy8gY3JlYXRlIGN1c3RvbSBtYXRlcmlhbCBmcm9tIHRoZSBzaGFkZXIgY29kZSBhYm92ZVxuICAgIC8vICAgdGhhdCBpcyB3aXRoaW4gc3BlY2lhbGx5IGxhYmVsZWQgc2NyaXB0IHRhZ3NcbiAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xuICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgY29lZmljaWVudDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZlwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAxLjBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3dlcjoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZlwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2xvd0NvbG9yOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJjXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcigncGluaycpXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB2ZXJ0ZXhTaGFkZXI6IHZlcnRleFNoYWRlcixcbiAgICAgICAgZnJhZ21lbnRTaGFkZXI6IGZyYWdtZW50U2hhZGVyLFxuICAgICAgICAvL2JsZW5kaW5nXHQ6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICB9KTtcbiAgICByZXR1cm4gbWF0ZXJpYWxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRXg7XG4iLCIvL0RlcGVuZGVuY2llc1xudmFyIEVhcnRoID0gcmVxdWlyZSgnLi90aGVTb2xhclN5c3RlbS9lYXJ0aCcpO1xudmFyIFN1biA9IHJlcXVpcmUoJy4vdGhlU29sYXJTeXN0ZW0vc3VuJyk7XG4vL0NvbmZpZ1xudmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY2VuZScpO1xudmFyIHNjZW5lO1xudmFyIGNhbWVyYTtcbnZhciBmaWVsZE9mVmlldztcbnZhciBhc3BlY3RSYXRpbztcbnZhciByZW5kZXJlcjtcbnZhciBuZWFyUGxhbmU7XG52YXIgZmFyUGxhbmU7XG52YXIgY29udHJvbHM7XG52YXIgZ3VpO1xudmFyIGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKCk7XG4vL0xpZ2h0c1xudmFyIGxpZ2h0O1xuXG4vL0NvbnN0YW50c1xuY29uc3QgRU5WID0gJ2Rldic7XG52YXIgSEVJR0hUO1xudmFyIFdJRFRIO1xuXG4vL0dsb2JhbFxudmFyIG9uUmVuZGVyQ29udGFpbmVyID0gW107XG5cbmZ1bmN0aW9uIGFwcGVuZFNjZW5lKCkge1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbn1cbmZ1bmN0aW9uIGFkZExpZ2h0cygpIHtcbiAgICBsaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpXG4gICAgc2NlbmUuYWRkKGxpZ2h0KTtcbn1cbmZ1bmN0aW9uIGlzRGV2KCkge1xuICAgIHJldHVybiBFTlYgPT0gJ2Rldic7XG59XG5mdW5jdGlvbiBhZGRDYW1lcmEoKSB7XG4gICAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuICAgICAgICBmaWVsZE9mVmlldyxcbiAgICAgICAgYXNwZWN0UmF0aW8sXG4gICAgICAgIG5lYXJQbGFuZSxcbiAgICAgICAgZmFyUGxhbmUpO1xuICAgIGNhbWVyYS5wb3NpdGlvbi56ID0gLTQwMDtcbiAgICBjYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDIwMCwgMCkpO1xufVxuZnVuY3Rpb24gYWRkQ29udHJvbHMoKSB7XG4gICAgY29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoY2FtZXJhKTtcbiAgICBjb250cm9scy50YXJnZXQuc2V0KDAsIDAsIDApO1xuICAgIGNvbnRyb2xzLnJvdGF0ZVNwZWVkID0gMS4wO1xuICAgIGNvbnRyb2xzLnpvb21TcGVlZCA9IDEuMjtcbiAgICBjb250cm9scy5wYW5TcGVlZCA9IDAuODtcblxuICAgIGNvbnRyb2xzLm5vWm9vbSA9IGZhbHNlO1xuICAgIGNvbnRyb2xzLm5vUGFuID0gZmFsc2U7XG5cbiAgICBjb250cm9scy5zdGF0aWNNb3ZpbmcgPSB0cnVlO1xuICAgIGNvbnRyb2xzLmR5bmFtaWNEYW1waW5nRmFjdG9yID0gMC4zO1xuXG4gICAgY29udHJvbHMua2V5cyA9IFs2NSwgODMsIDY4XTtcbiAgICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgICByZW5kZXIoY2xvY2suZ2V0RGVsdGEoKSk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBjb25maWd1cmVTY2VuZSgpIHtcbiAgICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gICAgSEVJR0hUID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIFdJRFRIID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgYXNwZWN0UmF0aW8gPSBXSURUSCAvIEhFSUdIVDtcbiAgICBmaWVsZE9mVmlldyA9IDYwO1xuICAgIG5lYXJQbGFuZSA9IC4xO1xuICAgIGZhclBsYW5lID0gMTAwMDA7XG4gICAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YWxwaGE6IHRydWUsIGFudGlhbGlhczogdHJ1ZX0pO1xuICAgIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDApO1xuICAgIHJlbmRlcmVyLnNldFNpemUoV0lEVEgsIEhFSUdIVCk7XG4gICAgcmVuZGVyZXIuc2hhZG93TWFwRW5hYmxlZCA9IHRydWU7XG4gICAgcmVuZGVyZXIuZ2FtbWFJbnB1dCA9IHRydWU7XG4gICAgcmVuZGVyZXIuZ2FtbWFPdXRwdXQgPSB0cnVlO1xuICAgIGFkZENhbWVyYSgpO1xuICAgIGlmIChpc0RldigpKSB7XG4gICAgICAgIGFkZENvbnRyb2xzKCk7XG4gICAgfVxuICAgIC8vYWRkTGlnaHRzKCk7XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICAgIHJlbmRlcihjbG9jay5nZXREZWx0YSgpKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbn1cbmZ1bmN0aW9uIHJlbmRlcihkZWx0YSkge1xuICAgIG9uUmVuZGVyQ29udGFpbmVyLmZvckVhY2goZnVuY3Rpb24gKG9uUmVuZGVyQ29udGFpbmVyKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyKGRlbHRhLCBjYW1lcmEpO1xuICAgIH0pO1xuICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbn1cbmZ1bmN0aW9uIGd1aSgpIHtcbiAgICBndWkgPSBuZXcgZGF0LkdVSSgpO1xuICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIHRlc3Q6IDEwMDBcbiAgICB9O1xuICAgIGd1aS5hZGQocGFyYW1zLCAndGVzdCcpO1xufVxuZnVuY3Rpb24gYWRkUGxhbmV0cygpIHtcbiAgICB2YXIgZWFydGggPSBFYXJ0aC5tYWtlKHNjZW5lKTtcbiAgICB2YXIgZWFydGhBbmltYXRpb25zID0gZWFydGguZ2V0QW5pbWF0aW9ucygpO1xuICAgIGVhcnRoQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhbmltYXRpb24pIHtcbiAgICAgICAgb25SZW5kZXJDb250YWluZXIucHVzaChhbmltYXRpb24pO1xuICAgIH0pO1xuXG4gICAgdmFyIHN1biA9IFN1bi5tYWtlKHNjZW5lKTtcbiAgICB2YXIgc3VuQW5pbWF0aW9ucyA9IHN1bi5nZXRBbmltYXRpb25zKCk7XG4gICAgc3VuQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhbmltYXRpb24pIHtcbiAgICAgICAgb25SZW5kZXJDb250YWluZXIucHVzaChhbmltYXRpb24pO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBjb25maWd1cmVTY2VuZSgpO1xuICAgIGFkZFBsYW5ldHMoKTtcbiAgICBhcHBlbmRTY2VuZSgpO1xuICAgIGlmIChpc0RldigpKSB7XG4gICAgICAgIGd1aSgpO1xuICAgIH1cbiAgICBhbmltYXRlKCk7XG59XG5pbml0KCk7XG4iLCJ2YXIgQXRtb3NwaGVyZXMgPSByZXF1aXJlKCcuLi9saWIvdGhyZWV4LmF0bW9zcGhlcmVtYXRlcmlhbCcpO1xuY29uc3QgUEFUSCA9IFwiLi9pbWFnZXMvXCJcbi8vQG1hdGggdmFyIERlZ3JlZSA9IHJlcXVpcmUoJy4uL2xpYi9kZWdyZWVJblJhZGlhbicpO1xudmFyIEVhcnRoID0ge1xuICAgIC8vQG1hdGggNjAgKiA2MCAqIDIzLjU2MDMgKDIzaDU2IDAzJylcbiAgICB0aW1lVG9GdWxsU2VsZlJvdGF0aW9uOiA4NDgxNy40NzI0LFxuICAgIGlzUmVhbGlzdGljOiBmYWxzZSxcbiAgICBkaWFtZXRlcjogMyxcbiAgICBhdG1vc3BoZXJlUmFkaXVzOiB1bmRlZmluZWQsXG4gICAgYXRtb3NwaGVyZVNpemU6IHVuZGVmaW5lZCxcbiAgICBheGlhbFRpbHQ6IDIzLjQsXG4gICAgLy9AbWF0aCByZXR1cm4gKERlZ3JlZS5jb252ZXJ0KDM2MCkgLyB0aGlzLnRpbWVUb0Z1bGxTZWxmUm90YXRpb24pO1xuICAgIHJvdGF0aW9uUGVyU2Vjb25kOiAwLjAwMDAwNzM5MzU3MDM4OTAxMDA0MyxcbiAgICBvcmJpdFJhZGl1czogMzU2NDMsXG4gICAgYW5pbWF0aW9uczogW10sXG5cbiAgICBtYWtlOiBmdW5jdGlvbiAoc2NlbmUsIGlzUmVhbGlzdGljKSB7XG4gICAgICAgIHRoaXMubWFuYWdlUmVhbGlzbShpc1JlYWxpc3RpYyk7XG4gICAgICAgIHRoaXMuaW5pdChzY2VuZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlTWVzaCgpO1xuICAgICAgICB0aGlzLmNyZWF0ZUF0bW9zcGhlcmUoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVDbG91ZHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBnZXRBbmltYXRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbnM7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLnJvdGF0ZVoodGhpcy5heGlhbFRpbHQgKiBNYXRoLlBJIC8gMTgwKTtcbiAgICAgICAgLy9TdW4gZGlhbWV0ZXIgKiAxMDkgPSByYWRpdXMgb2YgZWFydGgncyBvcmJpdCAoMTQ5LDU5Nyw4NzAga20pICgzNTY0MylcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5wb3NpdGlvbi54ID0gdGhpcy5vcmJpdFJhZGl1cztcbiAgICAgICAgLy9FYXJ0aCBpcyBtb3JlIG9yIGxlc3MgMTA5IHRpbWVzIHNtYWxsZXIgdGhhbiBzdW5cbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5zY2FsZS5zZXQodGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlcik7XG4gICAgICAgIHNjZW5lLmFkZCh0aGlzLmNvbnRhaW5lckVhcnRoKTtcblxuICAgICAgICB0aGlzLmF0bW9zcGhlcmVSYWRpdXMgPSB0aGlzLmRpYW1ldGVyICsgKHRoaXMuZGlhbWV0ZXIgLyAyKTtcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlU2l6ZSA9IHRoaXMuZGlhbWV0ZXIgLyA2MDtcbiAgICB9LFxuICAgIGNyZWF0ZU1lc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgMzIsIDMyKVxuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnZWFydGhkaWZmdXNlLmpwZycpLFxuICAgICAgICAgICAgYnVtcE1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2VhcnRoYnVtcDFrLmpwZycpLFxuICAgICAgICAgICAgYnVtcFNjYWxlOiAxLFxuICAgICAgICAgICAgc3BlY3VsYXJNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdlYXJ0aHNwZWMxay5qcGcnKSxcbiAgICAgICAgICAgIHNwZWN1bGFyOiBuZXcgVEhSRUUuQ29sb3IoJ2dyZXknKVxuICAgICAgICB9KVxuICAgICAgICBtYXRlcmlhbC5tYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgICAgICBtYXRlcmlhbC5idW1wTWFwLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgICAgICAgbWF0ZXJpYWwuc3BlY3VsYXJNYXAubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgICAgICB0aGlzLmVhcnRoTWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcblxuICAgICAgICB0aGlzLmVhcnRoTWVzaC5yb3RhdGlvbi55ID0gMDtcbiAgICAgICAgdGhpcy5lYXJ0aE1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuZWFydGhNZXNoLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmVhcnRoTWVzaCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBbmltYXRpb24oZnVuY3Rpb24gKGRlbHRhLCBub3cpIHtcbiAgICAgICAgICAgIEVhcnRoLmVhcnRoTWVzaC5yb3RhdGlvbi55ICs9IEVhcnRoLnJvdGF0aW9uUGVyU2Vjb25kIC8gNjA7XG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBjcmVhdGVBdG1vc3BoZXJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSh0aGlzLmF0bW9zcGhlcmVTaXplLCB0aGlzLmF0bW9zcGhlcmVSYWRpdXMsIHRoaXMuYXRtb3NwaGVyZVJhZGl1cyk7XG4gICAgICAgIHZhciBtYXRlcmlhbCA9IEF0bW9zcGhlcmVzLmNyZWF0ZUF0bW9zcGhlcmVNYXRlcmlhbCgpXG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmdsb3dDb2xvci52YWx1ZS5zZXQoMHgwMGIzZmYpXG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmNvZWZpY2llbnQudmFsdWUgPSAwLjhcbiAgICAgICAgbWF0ZXJpYWwudW5pZm9ybXMucG93ZXIudmFsdWUgPSAyLjBcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlMSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgICAgIHRoaXMuYXRtb3NwaGVyZTEuc2NhbGUubXVsdGlwbHlTY2FsYXIoMS4wMSk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGguYWRkKHRoaXMuYXRtb3NwaGVyZTEpO1xuXG4gICAgICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSh0aGlzLmF0bW9zcGhlcmVTaXplLCB0aGlzLmF0bW9zcGhlcmVSYWRpdXMsIHRoaXMuYXRtb3NwaGVyZVJhZGl1cyk7XG4gICAgICAgIHZhciBtYXRlcmlhbCA9IEF0bW9zcGhlcmVzLmNyZWF0ZUF0bW9zcGhlcmVNYXRlcmlhbCgpXG4gICAgICAgIG1hdGVyaWFsLnNpZGUgPSBUSFJFRS5CYWNrU2lkZVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5nbG93Q29sb3IudmFsdWUuc2V0KDB4MDBiM2ZmKVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5jb2VmaWNpZW50LnZhbHVlID0gMC41XG4gICAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLnBvd2VyLnZhbHVlID0gNC4wXG4gICAgICAgIHRoaXMuYXRtb3NwaGVyZTIgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICB0aGlzLmF0bW9zcGhlcmUyLnNjYWxlLm11bHRpcGx5U2NhbGFyKDEuMTUpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmF0bW9zcGhlcmUyKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlQ2xvdWRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUxLCAzMiwgMzIpXG4gICAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdlYXJ0aGNsb3Vkcy5wbmcnKSxcbiAgICAgICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVhcnRoQ2xvdWQgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgICAgIHRoaXMuZWFydGhDbG91ZC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lYXJ0aENsb3VkLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmVhcnRoQ2xvdWQpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQW5pbWF0aW9uKGZ1bmN0aW9uIChkZWx0YSwgbm93KSB7XG4gICAgICAgICAgICBFYXJ0aC5lYXJ0aENsb3VkLnJvdGF0aW9uLnkgKz0gKEVhcnRoLnJvdGF0aW9uUGVyU2Vjb25kICogMS4yKSAvIDYwO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG1hbmFnZVJlYWxpc206IGZ1bmN0aW9uIChpc1JlYWxpc3RpYykge1xuICAgICAgICBpZiAodHlwZW9mIGlzUmVhbGlzdGljICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHRoaXMuaXNSZWFsaXN0aWMgPSBpc1JlYWxpc3RpYztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc1JlYWxpc3RpYykge1xuICAgICAgICAgICAgdGhpcy5kaWFtZXRlciAqPSAxMDtcbiAgICAgICAgICAgIHRoaXMub3JiaXRSYWRpdXMgLz0gMTAwO1xuICAgICAgICAgICAgdGhpcy5yb3RhdGlvblBlclNlY29uZCAqPSA2MDA7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlZ2lzdGVyQW5pbWF0aW9uOiBmdW5jdGlvbiAoY2FsbGFibGUpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnB1c2goY2FsbGFibGUpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWFydGg7XG4iLCJ2YXIgSW50ID0gcmVxdWlyZSgnLi4vbGliL2ludCcpO1xudmFyIEF0bW9zcGhlcmVzID0gcmVxdWlyZSgnLi4vbGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwnKTtcbmNvbnN0IFBBVEggPSBcIi4vaW1hZ2VzL1wiXG4vL0BtYXRoIHZhciBEZWdyZWUgPSByZXF1aXJlKCcuLi9saWIvZGVncmVlSW5SYWRpYW4nKTtcbnZhciBTdW4gPSB7XG4gICAgdGltZVRvRnVsbFNlbGZSb3RhdGlvbjogODQ5ODE3LjQ3MjQsXG4gICAgaXNSZWFsaXN0aWM6IGZhbHNlLFxuICAgIGxpZ2h0RGlzdGFuY2U6IDEwMDAwLFxuICAgIGRpYW1ldGVyOiAzMjcwLFxuICAgIGF4aWFsVGlsdDogNy4yNSxcbiAgICAvL3JvdGF0aW9uUGVyU2Vjb25kOiAxLjQ2MDQ1ODM0ODQ0NjQyODMsXG4gICAgcm90YXRpb25QZXJTZWNvbmQ6IDAuMDAwMDAwMDE0NjA0NTgzNDg0NDY0MjgzLFxuICAgIGFuaW1hdGlvbnM6IFtdLFxuICAgIG1ha2U6IGZ1bmN0aW9uIChzY2VuZSwgaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgdGhpcy5tYW5hZ2VSZWFsaXNtKGlzUmVhbGlzdGljKTtcbiAgICAgICAgdGhpcy5pbml0KHNjZW5lKTtcbiAgICAgICAgLy90aGlzLmNyZWF0ZU1lc2goKTtcbiAgICAgICAgdGhpcy5hZGRMZW5zRmxhcmUoKTtcbiAgICAgICAgdGhpcy5hZGRMaWdodChzY2VuZSk7XG4gICAgICAgIC8vdGhpcy5hZGRQYXJ0aWN1bGVzKHNjZW5lKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGdldEFuaW1hdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9ucztcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1biA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5jb250YWluZXJTdW4pO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQW5pbWF0aW9uKGZ1bmN0aW9uIChkZWx0YSwgbm93KSB7XG4gICAgICAgICAgICBTdW4uY29udGFpbmVyU3VuLnJvdGF0aW9uLnkgKz0gU3VuLnJvdGF0aW9uUGVyU2Vjb25kIC8gNjA7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3JlYXRlTWVzaDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCA0MCwgNDApO1xuICAgICAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdzdW5tYXAuanBnJyk7XG4gICAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnc3VuX3N1cmZhY2UucG5nJyksXG4gICAgICAgICAgICBidW1wU2NhbGU6IDFcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3VuTWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5yb3RhdGVaKHRoaXMuYXhpYWxUaWx0ICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5wb3NpdGlvbi56ID0gMDtcbiAgICAgICAgdGhpcy5zdW5NZXNoLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLnN1bk1lc2guY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5zY2FsZS5zZXQodGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlcik7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5kZXB0aFdyaXRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuLmFkZCh0aGlzLnN1bk1lc2gpO1xuICAgIH0sXG4gICAgYWRkTGVuc0ZsYXJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVhbGlzdGljKSB7XG4gICAgICAgICAgICB2YXIgbGVuc2ZsYXJldGV4dHVyZTAgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnbGVuc2ZsYXJlMC13aGl0ZS5wbmcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBsZW5zZmxhcmV0ZXh0dXJlMCA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdsZW5zZmxhcmUwLnBuZycpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsZW5zZmxhcmV0ZXh0dXJlMSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdsZW5zZmxhcmUxLnBuZycpO1xuICAgICAgICB2YXIgbGVuc2ZsYXJldGV4dHVyZTIgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnbGVuc2ZsYXJlMi5wbmcnKTtcbiAgICAgICAgdmFyIGxlbnNmbGFyZXRleHR1cmUzID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2xlbnNmbGFyZTMucG5nJyk7XG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigweGZmZmZmZik7XG4gICAgICAgIGNvbG9yLnNldEhTTCgwLjU1LCAwLjksIDEpO1xuICAgICAgICB0aGlzLmxlbnNmbGFyZSA9IG5ldyBUSFJFRS5MZW5zRmxhcmUobGVuc2ZsYXJldGV4dHVyZTAsIHRoaXMuZGlhbWV0ZXIgKiAyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsIGNvbG9yKTtcbiAgICAgICAgdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUxLCB0aGlzLmRpYW1ldGVyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsIGNvbG9yLCAwLjIpO1xuICAgICAgICB0aGlzLmxlbnNmbGFyZS5hZGQobGVuc2ZsYXJldGV4dHVyZTEsIHRoaXMuZGlhbWV0ZXIgLyAyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsIGNvbG9yLCAwLjUpO1xuXG4gICAgICAgIHRoaXMubGVuc2ZsYXJlLmFkZChsZW5zZmxhcmV0ZXh0dXJlMiwgdGhpcy5kaWFtZXRlciAvIDIsIDAuMCwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyk7XG5cbiAgICAgICAgLy90aGlzLmxlbnNmbGFyZS5hZGQobGVuc2ZsYXJldGV4dHVyZTMsIDQwLCAtMSwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyk7XG4gICAgICAgIC8vdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUzLCAxMDAsIC0wLjUsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcpO1xuICAgICAgICAvL3RoaXMubGVuc2ZsYXJlLmFkZChsZW5zZmxhcmV0ZXh0dXJlMywgODAsIC0wLjgsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcpO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuLmFkZCh0aGlzLmxlbnNmbGFyZSk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIGNhbWVyYSkge1xuICAgICAgICAgICAgU3VuLmxlbnNmbGFyZS5jdXN0b21VcGRhdGVDYWxsYmFjayA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgICAgICB2YXIgZiwgZmwgPSBvYmoubGVuc0ZsYXJlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIGZsYXJlO1xuICAgICAgICAgICAgICAgIHZhciB2ZWNYID0gLW9iai5wb3NpdGlvblNjcmVlbi54ICogMjtcbiAgICAgICAgICAgICAgICB2YXIgdmVjWSA9IC1vYmoucG9zaXRpb25TY3JlZW4ueSAqIDI7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2FtUG9zaXRpb24gPSBjYW1lcmEucG9zaXRpb247XG4gICAgICAgICAgICAgICAgdmFyIGNhbVJvdGF0aW9uID0gY2FtZXJhLnJvdGF0aW9uO1xuICAgICAgICAgICAgICAgIHZhciBjYW1EaXN0YW5jZSA9IGNhbVBvc2l0aW9uLmxlbmd0aCgpO1xuICAgICAgICAgICAgICAgIGZvciAoZiA9IDA7IGYgPCBmbDsgZisrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZmxhcmUgPSBvYmoubGVuc0ZsYXJlc1tmXTtcblxuICAgICAgICAgICAgICAgICAgICBmbGFyZS54ID0gb2JqLnBvc2l0aW9uU2NyZWVuLnggKyB2ZWNYICogZmxhcmUuZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAgIGZsYXJlLnkgPSBvYmoucG9zaXRpb25TY3JlZW4ueSArIHZlY1kgKiBmbGFyZS5kaXN0YW5jZTtcblxuICAgICAgICAgICAgICAgICAgICBmbGFyZS5yb3RhdGlvbiA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgZmxhcmUuc2NhbGUgPSAxIC8gY2FtRGlzdGFuY2UgKiA0MDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBhZGRMaWdodDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgdGhpcy5saWdodERpc3RhbmNlKTtcbiAgICAgICAgdGhpcy5saWdodC5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMubGlnaHQuc2NhbGUuc2V0KHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5saWdodCk7XG4gICAgfSxcbiAgICBhZGRQYXJ0aWN1bGVzOiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUdyb3VwID0gbmV3IFNQRS5Hcm91cCh7XG4gICAgICAgICAgICB0ZXh0dXJlOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCcuL2ltYWdlcy9wYXJ0aWNsZTEuanBlZycpLFxuICAgICAgICAgICAgbWF4QWdlOiA1LFxuICAgICAgICAgICAgaGFzUGVyc3BlY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgICAgICAgIGNvbG9yaXplOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgcGFydGljbGVFbWl0dGVyID0gbmV3IFNQRS5FbWl0dGVyKHtcbiAgICAgICAgICAgIHR5cGU6ICdzcGhlcmUnLFxuICAgICAgICAgICAgcG9zaXRpb246IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApLFxuXG4gICAgICAgICAgICByYWRpdXM6IHRoaXMuZGlhbWV0ZXIsXG4gICAgICAgICAgICByYWRpdXNTcHJlYWQ6IDIsXG4gICAgICAgICAgICByYWRpdXNTcHJlYWRDbGFtcDogMixcbiAgICAgICAgICAgIHJhZGl1c1NjYWxlOiBuZXcgVEhSRUUuVmVjdG9yMygwLjUxLCAwLjUxLCAwLjUxKSxcblxuICAgICAgICAgICAgc3BlZWQ6IDEsXG4gICAgICAgICAgICBzcGVlZFNwcmVhZDogMixcbiAgICAgICAgICAgIC8vY29sb3JTdGFydDogbmV3IFRIUkVFLkNvbG9yKCdyZWQnKSxcbiAgICAgICAgICAgIC8vY29sb3JFbmQ6IG5ldyBUSFJFRS5Db2xvcigncmVkJyksXG5cblxuICAgICAgICAgICAgc2l6ZVN0YXJ0OiAyMDAsXG4gICAgICAgICAgICBzaXplTWlkZGxlOiAxMDAsXG4gICAgICAgICAgICBzaXplRW5kOiA1MCxcbiAgICAgICAgICAgIG9wYWNpdHlTdGFydDogMSxcbiAgICAgICAgICAgIG9wYWNpdHlNaWRkbGU6IDAuOCxcbiAgICAgICAgICAgIG9wYWNpdHlFbmQ6IDAsXG4gICAgICAgICAgICAvL3BhcnRpY2xlc1BlclNlY29uZDogMTAsXG4gICAgICAgICAgICBpc1N0YXRpYzogMCxcbiAgICAgICAgICAgIHBhcnRpY2xlQ291bnQ6IDIwMFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUdyb3VwLmFkZEVtaXR0ZXIocGFydGljbGVFbWl0dGVyKTtcbiAgICAgICAgc2NlbmUuYWRkKHRoaXMucGFydGljbGVHcm91cC5tZXNoKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEpIHtcbiAgICAgICAgICAgIFN1bi5wYXJ0aWNsZUdyb3VwLnRpY2soZGVsdGEpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHJlZ2lzdGVyQW5pbWF0aW9uOiBmdW5jdGlvbiAoY2FsbGFibGUpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnB1c2goY2FsbGFibGUpO1xuICAgIH0sXG4gICAgbWFuYWdlUmVhbGlzbTogZnVuY3Rpb24gKGlzUmVhbGlzdGljKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXNSZWFsaXN0aWMgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdGhpcy5pc1JlYWxpc3RpYyA9IGlzUmVhbGlzdGljO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbGlzdGljKSB7XG4gICAgICAgICAgICB0aGlzLmRpYW1ldGVyIC89IDEwO1xuICAgICAgICAgICAgdGhpcy5yb3RhdGlvblBlclNlY29uZCAqPSA2MDAwMDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3VuO1xuIl19
