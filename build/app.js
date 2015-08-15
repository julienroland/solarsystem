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
        material.uniforms.coeficient.value = 1
        material.uniforms.power.value = 6.5
        this.atmosphere1 = new THREE.Mesh(geometry, material);
        this.atmosphere1.scale.multiplyScalar(1.1);
        this.containerEarth.add(this.atmosphere1);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW50LmpzIiwibGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwuanMiLCJzY3JpcHQuanMiLCJ0aGVTb2xhclN5c3RlbS9lYXJ0aC5qcyIsInRoZVNvbGFyU3lzdGVtL3N1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEludCA9IHtcbiAgICBnZXRSYW5kb206IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW50O1xuIiwidmFyIFRIUkVFeCA9IFRIUkVFeCB8fCB7fVxuXG4vKipcbiAqIGZyb20gaHR0cDovL3N0ZW1rb3NraS5ibG9nc3BvdC5mci8yMDEzLzA3L3NoYWRlcnMtaW4tdGhyZWVqcy1nbG93LWFuZC1oYWxvLmh0bWxcbiAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICovXG5USFJFRXguY3JlYXRlQXRtb3NwaGVyZU1hdGVyaWFsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB2ZXJ0ZXhTaGFkZXIgPSBbXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhXb3JsZFBvc2l0aW9uOycsXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhOb3JtYWw7JyxcblxuICAgICAgICAndm9pZCBtYWluKCl7JyxcbiAgICAgICAgJ1x0dlZlcnRleE5vcm1hbFx0PSBub3JtYWxpemUobm9ybWFsTWF0cml4ICogbm9ybWFsKTsnLFxuXG4gICAgICAgICdcdHZWZXJ0ZXhXb3JsZFBvc2l0aW9uXHQ9IChtb2RlbE1hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCkpLnh5ejsnLFxuXG4gICAgICAgICdcdC8vIHNldCBnbF9Qb3NpdGlvbicsXG4gICAgICAgICdcdGdsX1Bvc2l0aW9uXHQ9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApOycsXG4gICAgICAgICd9JyxcblxuICAgIF0uam9pbignXFxuJylcbiAgICB2YXIgZnJhZ21lbnRTaGFkZXIgPSBbXG4gICAgICAgICd1bmlmb3JtIHZlYzNcdGdsb3dDb2xvcjsnLFxuICAgICAgICAndW5pZm9ybSBmbG9hdFx0Y29lZmljaWVudDsnLFxuICAgICAgICAndW5pZm9ybSBmbG9hdFx0cG93ZXI7JyxcblxuICAgICAgICAndmFyeWluZyB2ZWMzXHR2VmVydGV4Tm9ybWFsOycsXG4gICAgICAgICd2YXJ5aW5nIHZlYzNcdHZWZXJ0ZXhXb3JsZFBvc2l0aW9uOycsXG5cbiAgICAgICAgJ3ZvaWQgbWFpbigpeycsXG4gICAgICAgICdcdHZlYzMgd29ybGRDYW1lcmFUb1ZlcnRleD0gdlZlcnRleFdvcmxkUG9zaXRpb24gLSBjYW1lcmFQb3NpdGlvbjsnLFxuICAgICAgICAnXHR2ZWMzIHZpZXdDYW1lcmFUb1ZlcnRleFx0PSAodmlld01hdHJpeCAqIHZlYzQod29ybGRDYW1lcmFUb1ZlcnRleCwgMC4wKSkueHl6OycsXG4gICAgICAgICdcdHZpZXdDYW1lcmFUb1ZlcnRleFx0PSBub3JtYWxpemUodmlld0NhbWVyYVRvVmVydGV4KTsnLFxuICAgICAgICAnXHRmbG9hdCBpbnRlbnNpdHlcdFx0PSBwb3coY29lZmljaWVudCArIGRvdCh2VmVydGV4Tm9ybWFsLCB2aWV3Q2FtZXJhVG9WZXJ0ZXgpLCBwb3dlcik7JyxcbiAgICAgICAgJ1x0Z2xfRnJhZ0NvbG9yXHRcdD0gdmVjNChnbG93Q29sb3IsIGludGVuc2l0eSk7JyxcbiAgICAgICAgJ30nLFxuICAgIF0uam9pbignXFxuJylcblxuICAgIC8vIGNyZWF0ZSBjdXN0b20gbWF0ZXJpYWwgZnJvbSB0aGUgc2hhZGVyIGNvZGUgYWJvdmVcbiAgICAvLyAgIHRoYXQgaXMgd2l0aGluIHNwZWNpYWxseSBsYWJlbGVkIHNjcmlwdCB0YWdzXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcbiAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgIGNvZWZpY2llbnQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImZcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogMS4wXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG93ZXI6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImZcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogMlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdsb3dDb2xvcjoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiY1wiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJ3BpbmsnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdmVydGV4U2hhZGVyOiB2ZXJ0ZXhTaGFkZXIsXG4gICAgICAgIGZyYWdtZW50U2hhZGVyOiBmcmFnbWVudFNoYWRlcixcbiAgICAgICAgLy9ibGVuZGluZ1x0OiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgICAgZGVwdGhXcml0ZTogZmFsc2UsXG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGVyaWFsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUV4O1xuIiwiLy9EZXBlbmRlbmNpZXNcbnZhciBFYXJ0aCA9IHJlcXVpcmUoJy4vdGhlU29sYXJTeXN0ZW0vZWFydGgnKTtcbnZhciBTdW4gPSByZXF1aXJlKCcuL3RoZVNvbGFyU3lzdGVtL3N1bicpO1xuLy9Db25maWdcbnZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NlbmUnKTtcbnZhciBzY2VuZTtcbnZhciBjYW1lcmE7XG52YXIgZmllbGRPZlZpZXc7XG52YXIgYXNwZWN0UmF0aW87XG52YXIgcmVuZGVyZXI7XG52YXIgbmVhclBsYW5lO1xudmFyIGZhclBsYW5lO1xudmFyIGNvbnRyb2xzO1xudmFyIGd1aTtcbnZhciBjbG9jayA9IG5ldyBUSFJFRS5DbG9jaygpO1xuLy9MaWdodHNcbnZhciBsaWdodDtcblxuLy9Db25zdGFudHNcbmNvbnN0IEVOViA9ICdkZXYnO1xudmFyIEhFSUdIVDtcbnZhciBXSURUSDtcblxuLy9HbG9iYWxcbnZhciBvblJlbmRlckNvbnRhaW5lciA9IFtdO1xuXG5mdW5jdGlvbiBhcHBlbmRTY2VuZSgpIHtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XG59XG5mdW5jdGlvbiBhZGRMaWdodHMoKSB7XG4gICAgbGlnaHQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmKVxuICAgIHNjZW5lLmFkZChsaWdodCk7XG59XG5mdW5jdGlvbiBpc0RldigpIHtcbiAgICByZXR1cm4gRU5WID09ICdkZXYnO1xufVxuZnVuY3Rpb24gYWRkQ2FtZXJhKCkge1xuICAgIGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYShcbiAgICAgICAgZmllbGRPZlZpZXcsXG4gICAgICAgIGFzcGVjdFJhdGlvLFxuICAgICAgICBuZWFyUGxhbmUsXG4gICAgICAgIGZhclBsYW5lKTtcbiAgICBjYW1lcmEucG9zaXRpb24ueiA9IC00MDA7XG4gICAgY2FtZXJhLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLCAyMDAsIDApKTtcbn1cbmZ1bmN0aW9uIGFkZENvbnRyb2xzKCkge1xuICAgIGNvbnRyb2xzID0gbmV3IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzKGNhbWVyYSk7XG4gICAgY29udHJvbHMudGFyZ2V0LnNldCgwLCAwLCAwKTtcbiAgICBjb250cm9scy5yb3RhdGVTcGVlZCA9IDEuMDtcbiAgICBjb250cm9scy56b29tU3BlZWQgPSAxLjI7XG4gICAgY29udHJvbHMucGFuU3BlZWQgPSAwLjg7XG5cbiAgICBjb250cm9scy5ub1pvb20gPSBmYWxzZTtcbiAgICBjb250cm9scy5ub1BhbiA9IGZhbHNlO1xuXG4gICAgY29udHJvbHMuc3RhdGljTW92aW5nID0gdHJ1ZTtcbiAgICBjb250cm9scy5keW5hbWljRGFtcGluZ0ZhY3RvciA9IDAuMztcblxuICAgIGNvbnRyb2xzLmtleXMgPSBbNjUsIDgzLCA2OF07XG4gICAgY29udHJvbHMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgcmVuZGVyKGNsb2NrLmdldERlbHRhKCkpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gY29uZmlndXJlU2NlbmUoKSB7XG4gICAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuICAgIEhFSUdIVCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBXSURUSCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIGFzcGVjdFJhdGlvID0gV0lEVEggLyBIRUlHSFQ7XG4gICAgZmllbGRPZlZpZXcgPSA2MDtcbiAgICBuZWFyUGxhbmUgPSAuMTtcbiAgICBmYXJQbGFuZSA9IDEwMDAwO1xuICAgIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FscGhhOiB0cnVlLCBhbnRpYWxpYXM6IHRydWV9KTtcbiAgICByZW5kZXJlci5zZXRDbGVhckNvbG9yKDB4MDAwMDAwKTtcbiAgICByZW5kZXJlci5zZXRTaXplKFdJRFRILCBIRUlHSFQpO1xuICAgIHJlbmRlcmVyLnNoYWRvd01hcEVuYWJsZWQgPSB0cnVlO1xuICAgIHJlbmRlcmVyLmdhbW1hSW5wdXQgPSB0cnVlO1xuICAgIHJlbmRlcmVyLmdhbW1hT3V0cHV0ID0gdHJ1ZTtcbiAgICBhZGRDYW1lcmEoKTtcbiAgICBpZiAoaXNEZXYoKSkge1xuICAgICAgICBhZGRDb250cm9scygpO1xuICAgIH1cbiAgICAvL2FkZExpZ2h0cygpO1xufVxuXG5mdW5jdGlvbiBhbmltYXRlKCkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICByZW5kZXIoY2xvY2suZ2V0RGVsdGEoKSk7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG59XG5mdW5jdGlvbiByZW5kZXIoZGVsdGEpIHtcbiAgICBvblJlbmRlckNvbnRhaW5lci5mb3JFYWNoKGZ1bmN0aW9uIChvblJlbmRlckNvbnRhaW5lcikge1xuICAgICAgICBvblJlbmRlckNvbnRhaW5lcihkZWx0YSwgY2FtZXJhKTtcbiAgICB9KTtcbiAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59XG5mdW5jdGlvbiBndWkoKSB7XG4gICAgZ3VpID0gbmV3IGRhdC5HVUkoKTtcbiAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICB0ZXN0OiAxMDAwXG4gICAgfTtcbiAgICBndWkuYWRkKHBhcmFtcywgJ3Rlc3QnKTtcbn1cbmZ1bmN0aW9uIGFkZFBsYW5ldHMoKSB7XG4gICAgdmFyIGVhcnRoID0gRWFydGgubWFrZShzY2VuZSk7XG4gICAgdmFyIGVhcnRoQW5pbWF0aW9ucyA9IGVhcnRoLmdldEFuaW1hdGlvbnMoKTtcbiAgICBlYXJ0aEFuaW1hdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYW5pbWF0aW9uKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyLnB1c2goYW5pbWF0aW9uKTtcbiAgICB9KTtcblxuICAgIHZhciBzdW4gPSBTdW4ubWFrZShzY2VuZSk7XG4gICAgdmFyIHN1bkFuaW1hdGlvbnMgPSBzdW4uZ2V0QW5pbWF0aW9ucygpO1xuICAgIHN1bkFuaW1hdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYW5pbWF0aW9uKSB7XG4gICAgICAgIG9uUmVuZGVyQ29udGFpbmVyLnB1c2goYW5pbWF0aW9uKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgY29uZmlndXJlU2NlbmUoKTtcbiAgICBhZGRQbGFuZXRzKCk7XG4gICAgYXBwZW5kU2NlbmUoKTtcbiAgICBpZiAoaXNEZXYoKSkge1xuICAgICAgICBndWkoKTtcbiAgICB9XG4gICAgYW5pbWF0ZSgpO1xufVxuaW5pdCgpO1xuIiwidmFyIEF0bW9zcGhlcmVzID0gcmVxdWlyZSgnLi4vbGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwnKTtcbmNvbnN0IFBBVEggPSBcIi4vaW1hZ2VzL1wiXG4vL0BtYXRoIHZhciBEZWdyZWUgPSByZXF1aXJlKCcuLi9saWIvZGVncmVlSW5SYWRpYW4nKTtcbnZhciBFYXJ0aCA9IHtcbiAgICAvL0BtYXRoIDYwICogNjAgKiAyMy41NjAzICgyM2g1NiAwMycpXG4gICAgdGltZVRvRnVsbFNlbGZSb3RhdGlvbjogODQ4MTcuNDcyNCxcbiAgICBpc1JlYWxpc3RpYzogZmFsc2UsXG4gICAgZGlhbWV0ZXI6IDMsXG4gICAgYXRtb3NwaGVyZVJhZGl1czogdW5kZWZpbmVkLFxuICAgIGF0bW9zcGhlcmVTaXplOiB1bmRlZmluZWQsXG4gICAgYXhpYWxUaWx0OiAyMy40LFxuICAgIC8vQG1hdGggcmV0dXJuIChEZWdyZWUuY29udmVydCgzNjApIC8gdGhpcy50aW1lVG9GdWxsU2VsZlJvdGF0aW9uKTtcbiAgICByb3RhdGlvblBlclNlY29uZDogMC4wMDAwMDczOTM1NzAzODkwMTAwNDMsXG4gICAgb3JiaXRSYWRpdXM6IDM1NjQzLFxuICAgIGFuaW1hdGlvbnM6IFtdLFxuXG4gICAgbWFrZTogZnVuY3Rpb24gKHNjZW5lLCBpc1JlYWxpc3RpYykge1xuICAgICAgICB0aGlzLm1hbmFnZVJlYWxpc20oaXNSZWFsaXN0aWMpO1xuICAgICAgICB0aGlzLmluaXQoc2NlbmUpO1xuICAgICAgICB0aGlzLmNyZWF0ZU1lc2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdG1vc3BoZXJlKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlQ2xvdWRzKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZ2V0QW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25zO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGggPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5yb3RhdGVaKHRoaXMuYXhpYWxUaWx0ICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgIC8vU3VuIGRpYW1ldGVyICogMTA5ID0gcmFkaXVzIG9mIGVhcnRoJ3Mgb3JiaXQgKDE0OSw1OTcsODcwIGttKSAoMzU2NDMpXG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGgucG9zaXRpb24ueCA9IHRoaXMub3JiaXRSYWRpdXM7XG4gICAgICAgIC8vRWFydGggaXMgbW9yZSBvciBsZXNzIDEwOSB0aW1lcyBzbWFsbGVyIHRoYW4gc3VuXG4gICAgICAgIHRoaXMuY29udGFpbmVyRWFydGguc2NhbGUuc2V0KHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5jb250YWluZXJFYXJ0aCk7XG5cbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlUmFkaXVzID0gdGhpcy5kaWFtZXRlciArICh0aGlzLmRpYW1ldGVyIC8gMik7XG4gICAgICAgIHRoaXMuYXRtb3NwaGVyZVNpemUgPSB0aGlzLmRpYW1ldGVyIC8gNjA7XG4gICAgfSxcbiAgICBjcmVhdGVNZXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUsIDMyLCAzMilcbiAgICAgICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgICAgIG1hcDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2VhcnRoZGlmZnVzZS5qcGcnKSxcbiAgICAgICAgICAgIGJ1bXBNYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdlYXJ0aGJ1bXAxay5qcGcnKSxcbiAgICAgICAgICAgIGJ1bXBTY2FsZTogMSxcbiAgICAgICAgICAgIHNwZWN1bGFyTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnZWFydGhzcGVjMWsuanBnJyksXG4gICAgICAgICAgICBzcGVjdWxhcjogbmV3IFRIUkVFLkNvbG9yKCdncmV5JylcbiAgICAgICAgfSlcbiAgICAgICAgbWF0ZXJpYWwubWFwLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgICAgICAgbWF0ZXJpYWwuYnVtcE1hcC5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG4gICAgICAgIG1hdGVyaWFsLnNwZWN1bGFyTWFwLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgICAgICAgdGhpcy5lYXJ0aE1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG5cbiAgICAgICAgdGhpcy5lYXJ0aE1lc2gucm90YXRpb24ueSA9IDA7XG4gICAgICAgIHRoaXMuZWFydGhNZXNoLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmVhcnRoTWVzaC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250YWluZXJFYXJ0aC5hZGQodGhpcy5lYXJ0aE1lc2gpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQW5pbWF0aW9uKGZ1bmN0aW9uIChkZWx0YSwgbm93KSB7XG4gICAgICAgICAgICBFYXJ0aC5lYXJ0aE1lc2gucm90YXRpb24ueSArPSBFYXJ0aC5yb3RhdGlvblBlclNlY29uZCAvIDYwO1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgY3JlYXRlQXRtb3NwaGVyZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkodGhpcy5hdG1vc3BoZXJlU2l6ZSwgdGhpcy5hdG1vc3BoZXJlUmFkaXVzLCB0aGlzLmF0bW9zcGhlcmVSYWRpdXMpO1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBBdG1vc3BoZXJlcy5jcmVhdGVBdG1vc3BoZXJlTWF0ZXJpYWwoKVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5nbG93Q29sb3IudmFsdWUuc2V0KDB4MDBiM2ZmKVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5jb2VmaWNpZW50LnZhbHVlID0gMVxuICAgICAgICBtYXRlcmlhbC51bmlmb3Jtcy5wb3dlci52YWx1ZSA9IDYuNVxuICAgICAgICB0aGlzLmF0bW9zcGhlcmUxID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5hdG1vc3BoZXJlMS5zY2FsZS5tdWx0aXBseVNjYWxhcigxLjEpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmF0bW9zcGhlcmUxKTtcbiAgICB9LFxuXG4gICAgY3JlYXRlQ2xvdWRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjUxLCAzMiwgMzIpXG4gICAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgICAgICBtYXA6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdlYXJ0aGNsb3Vkcy5wbmcnKSxcbiAgICAgICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVhcnRoQ2xvdWQgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpXG4gICAgICAgIHRoaXMuZWFydGhDbG91ZC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lYXJ0aENsb3VkLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckVhcnRoLmFkZCh0aGlzLmVhcnRoQ2xvdWQpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQW5pbWF0aW9uKGZ1bmN0aW9uIChkZWx0YSwgbm93KSB7XG4gICAgICAgICAgICBFYXJ0aC5lYXJ0aENsb3VkLnJvdGF0aW9uLnkgKz0gKEVhcnRoLnJvdGF0aW9uUGVyU2Vjb25kICogMS4yKSAvIDYwO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG1hbmFnZVJlYWxpc206IGZ1bmN0aW9uIChpc1JlYWxpc3RpYykge1xuICAgICAgICBpZiAodHlwZW9mIGlzUmVhbGlzdGljICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHRoaXMuaXNSZWFsaXN0aWMgPSBpc1JlYWxpc3RpYztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc1JlYWxpc3RpYykge1xuICAgICAgICAgICAgdGhpcy5kaWFtZXRlciAqPSAxMDtcbiAgICAgICAgICAgIHRoaXMub3JiaXRSYWRpdXMgLz0gMTAwO1xuICAgICAgICAgICAgdGhpcy5yb3RhdGlvblBlclNlY29uZCAqPSA2MDA7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlZ2lzdGVyQW5pbWF0aW9uOiBmdW5jdGlvbiAoY2FsbGFibGUpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnB1c2goY2FsbGFibGUpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWFydGg7XG4iLCJ2YXIgSW50ID0gcmVxdWlyZSgnLi4vbGliL2ludCcpO1xudmFyIEF0bW9zcGhlcmVzID0gcmVxdWlyZSgnLi4vbGliL3RocmVleC5hdG1vc3BoZXJlbWF0ZXJpYWwnKTtcbmNvbnN0IFBBVEggPSBcIi4vaW1hZ2VzL1wiXG4vL0BtYXRoIHZhciBEZWdyZWUgPSByZXF1aXJlKCcuLi9saWIvZGVncmVlSW5SYWRpYW4nKTtcbnZhciBTdW4gPSB7XG4gICAgdGltZVRvRnVsbFNlbGZSb3RhdGlvbjogODQ5ODE3LjQ3MjQsXG4gICAgaXNSZWFsaXN0aWM6IGZhbHNlLFxuICAgIGxpZ2h0RGlzdGFuY2U6IDEwMDAwLFxuICAgIGRpYW1ldGVyOiAzMjcwLFxuICAgIGF4aWFsVGlsdDogNy4yNSxcbiAgICAvL3JvdGF0aW9uUGVyU2Vjb25kOiAxLjQ2MDQ1ODM0ODQ0NjQyODMsXG4gICAgcm90YXRpb25QZXJTZWNvbmQ6IDAuMDAwMDAwMDE0NjA0NTgzNDg0NDY0MjgzLFxuICAgIGFuaW1hdGlvbnM6IFtdLFxuICAgIG1ha2U6IGZ1bmN0aW9uIChzY2VuZSwgaXNSZWFsaXN0aWMpIHtcbiAgICAgICAgdGhpcy5tYW5hZ2VSZWFsaXNtKGlzUmVhbGlzdGljKTtcbiAgICAgICAgdGhpcy5pbml0KHNjZW5lKTtcbiAgICAgICAgLy90aGlzLmNyZWF0ZU1lc2goKTtcbiAgICAgICAgdGhpcy5hZGRMZW5zRmxhcmUoKTtcbiAgICAgICAgdGhpcy5hZGRMaWdodChzY2VuZSk7XG4gICAgICAgIC8vdGhpcy5hZGRQYXJ0aWN1bGVzKHNjZW5lKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGdldEFuaW1hdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9ucztcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIChzY2VuZSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lclN1biA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5jb250YWluZXJTdW4pO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQW5pbWF0aW9uKGZ1bmN0aW9uIChkZWx0YSwgbm93KSB7XG4gICAgICAgICAgICBTdW4uY29udGFpbmVyU3VuLnJvdGF0aW9uLnkgKz0gU3VuLnJvdGF0aW9uUGVyU2Vjb25kIC8gNjA7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3JlYXRlTWVzaDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCA0MCwgNDApO1xuICAgICAgICB2YXIgdGV4dHVyZSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdzdW5tYXAuanBnJyk7XG4gICAgICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgICAgICBtYXA6IHRleHR1cmUsXG4gICAgICAgICAgICBidW1wTWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnc3VuX3N1cmZhY2UucG5nJyksXG4gICAgICAgICAgICBidW1wU2NhbGU6IDFcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3VuTWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5yb3RhdGVaKHRoaXMuYXhpYWxUaWx0ICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5wb3NpdGlvbi56ID0gMDtcbiAgICAgICAgdGhpcy5zdW5NZXNoLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgICAgICB0aGlzLnN1bk1lc2guY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5zY2FsZS5zZXQodGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlciwgdGhpcy5kaWFtZXRlcik7XG4gICAgICAgIHRoaXMuc3VuTWVzaC5kZXB0aFdyaXRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuLmFkZCh0aGlzLnN1bk1lc2gpO1xuICAgIH0sXG4gICAgYWRkTGVuc0ZsYXJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVhbGlzdGljKSB7XG4gICAgICAgICAgICB2YXIgbGVuc2ZsYXJldGV4dHVyZTAgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnbGVuc2ZsYXJlMC13aGl0ZS5wbmcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBsZW5zZmxhcmV0ZXh0dXJlMCA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdsZW5zZmxhcmUwLnBuZycpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsZW5zZmxhcmV0ZXh0dXJlMSA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoUEFUSCArICdsZW5zZmxhcmUxLnBuZycpO1xuICAgICAgICB2YXIgbGVuc2ZsYXJldGV4dHVyZTIgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFBBVEggKyAnbGVuc2ZsYXJlMi5wbmcnKTtcbiAgICAgICAgdmFyIGxlbnNmbGFyZXRleHR1cmUzID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShQQVRIICsgJ2xlbnNmbGFyZTMucG5nJyk7XG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigweGZmZmZmZik7XG4gICAgICAgIGNvbG9yLnNldEhTTCgwLjU1LCAwLjksIDEpO1xuICAgICAgICB0aGlzLmxlbnNmbGFyZSA9IG5ldyBUSFJFRS5MZW5zRmxhcmUobGVuc2ZsYXJldGV4dHVyZTAsIHRoaXMuZGlhbWV0ZXIgKiAyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsIGNvbG9yKTtcbiAgICAgICAgdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUxLCB0aGlzLmRpYW1ldGVyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsIGNvbG9yLCAwLjIpO1xuICAgICAgICB0aGlzLmxlbnNmbGFyZS5hZGQobGVuc2ZsYXJldGV4dHVyZTEsIHRoaXMuZGlhbWV0ZXIgLyAyLCAwLjAsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsIGNvbG9yLCAwLjUpO1xuXG4gICAgICAgIHRoaXMubGVuc2ZsYXJlLmFkZChsZW5zZmxhcmV0ZXh0dXJlMiwgdGhpcy5kaWFtZXRlciAvIDIsIDAuMCwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyk7XG5cbiAgICAgICAgLy90aGlzLmxlbnNmbGFyZS5hZGQobGVuc2ZsYXJldGV4dHVyZTMsIDQwLCAtMSwgVEhSRUUuQWRkaXRpdmVCbGVuZGluZyk7XG4gICAgICAgIC8vdGhpcy5sZW5zZmxhcmUuYWRkKGxlbnNmbGFyZXRleHR1cmUzLCAxMDAsIC0wLjUsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcpO1xuICAgICAgICAvL3RoaXMubGVuc2ZsYXJlLmFkZChsZW5zZmxhcmV0ZXh0dXJlMywgODAsIC0wLjgsIFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcpO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyU3VuLmFkZCh0aGlzLmxlbnNmbGFyZSk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEsIGNhbWVyYSkge1xuICAgICAgICAgICAgU3VuLmxlbnNmbGFyZS5jdXN0b21VcGRhdGVDYWxsYmFjayA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgICAgICB2YXIgZiwgZmwgPSBvYmoubGVuc0ZsYXJlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIGZsYXJlO1xuICAgICAgICAgICAgICAgIHZhciB2ZWNYID0gLW9iai5wb3NpdGlvblNjcmVlbi54ICogMjtcbiAgICAgICAgICAgICAgICB2YXIgdmVjWSA9IC1vYmoucG9zaXRpb25TY3JlZW4ueSAqIDI7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2FtUG9zaXRpb24gPSBjYW1lcmEucG9zaXRpb247XG4gICAgICAgICAgICAgICAgdmFyIGNhbVJvdGF0aW9uID0gY2FtZXJhLnJvdGF0aW9uO1xuICAgICAgICAgICAgICAgIHZhciBjYW1EaXN0YW5jZSA9IGNhbVBvc2l0aW9uLmxlbmd0aCgpO1xuICAgICAgICAgICAgICAgIGZvciAoZiA9IDA7IGYgPCBmbDsgZisrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZmxhcmUgPSBvYmoubGVuc0ZsYXJlc1tmXTtcblxuICAgICAgICAgICAgICAgICAgICBmbGFyZS54ID0gb2JqLnBvc2l0aW9uU2NyZWVuLnggKyB2ZWNYICogZmxhcmUuZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAgIGZsYXJlLnkgPSBvYmoucG9zaXRpb25TY3JlZW4ueSArIHZlY1kgKiBmbGFyZS5kaXN0YW5jZTtcblxuICAgICAgICAgICAgICAgICAgICBmbGFyZS5yb3RhdGlvbiA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgZmxhcmUuc2NhbGUgPSAxIC8gY2FtRGlzdGFuY2UgKiA0MDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBhZGRMaWdodDogZnVuY3Rpb24gKHNjZW5lKSB7XG4gICAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgdGhpcy5saWdodERpc3RhbmNlKTtcbiAgICAgICAgdGhpcy5saWdodC5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMubGlnaHQuc2NhbGUuc2V0KHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIsIHRoaXMuZGlhbWV0ZXIpO1xuICAgICAgICBzY2VuZS5hZGQodGhpcy5saWdodCk7XG4gICAgfSxcbiAgICBhZGRQYXJ0aWN1bGVzOiBmdW5jdGlvbiAoc2NlbmUpIHtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUdyb3VwID0gbmV3IFNQRS5Hcm91cCh7XG4gICAgICAgICAgICB0ZXh0dXJlOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCcuL2ltYWdlcy9wYXJ0aWNsZTEuanBlZycpLFxuICAgICAgICAgICAgbWF4QWdlOiA1LFxuICAgICAgICAgICAgaGFzUGVyc3BlY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgICAgICAgIGNvbG9yaXplOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgcGFydGljbGVFbWl0dGVyID0gbmV3IFNQRS5FbWl0dGVyKHtcbiAgICAgICAgICAgIHR5cGU6ICdzcGhlcmUnLFxuICAgICAgICAgICAgcG9zaXRpb246IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApLFxuXG4gICAgICAgICAgICByYWRpdXM6IHRoaXMuZGlhbWV0ZXIsXG4gICAgICAgICAgICByYWRpdXNTcHJlYWQ6IDIsXG4gICAgICAgICAgICByYWRpdXNTcHJlYWRDbGFtcDogMixcbiAgICAgICAgICAgIHJhZGl1c1NjYWxlOiBuZXcgVEhSRUUuVmVjdG9yMygwLjUxLCAwLjUxLCAwLjUxKSxcblxuICAgICAgICAgICAgc3BlZWQ6IDEsXG4gICAgICAgICAgICBzcGVlZFNwcmVhZDogMixcbiAgICAgICAgICAgIC8vY29sb3JTdGFydDogbmV3IFRIUkVFLkNvbG9yKCdyZWQnKSxcbiAgICAgICAgICAgIC8vY29sb3JFbmQ6IG5ldyBUSFJFRS5Db2xvcigncmVkJyksXG5cblxuICAgICAgICAgICAgc2l6ZVN0YXJ0OiAyMDAsXG4gICAgICAgICAgICBzaXplTWlkZGxlOiAxMDAsXG4gICAgICAgICAgICBzaXplRW5kOiA1MCxcbiAgICAgICAgICAgIG9wYWNpdHlTdGFydDogMSxcbiAgICAgICAgICAgIG9wYWNpdHlNaWRkbGU6IDAuOCxcbiAgICAgICAgICAgIG9wYWNpdHlFbmQ6IDAsXG4gICAgICAgICAgICAvL3BhcnRpY2xlc1BlclNlY29uZDogMTAsXG4gICAgICAgICAgICBpc1N0YXRpYzogMCxcbiAgICAgICAgICAgIHBhcnRpY2xlQ291bnQ6IDIwMFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUdyb3VwLmFkZEVtaXR0ZXIocGFydGljbGVFbWl0dGVyKTtcbiAgICAgICAgc2NlbmUuYWRkKHRoaXMucGFydGljbGVHcm91cC5tZXNoKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFuaW1hdGlvbihmdW5jdGlvbiAoZGVsdGEpIHtcbiAgICAgICAgICAgIFN1bi5wYXJ0aWNsZUdyb3VwLnRpY2soZGVsdGEpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHJlZ2lzdGVyQW5pbWF0aW9uOiBmdW5jdGlvbiAoY2FsbGFibGUpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnB1c2goY2FsbGFibGUpO1xuICAgIH0sXG4gICAgbWFuYWdlUmVhbGlzbTogZnVuY3Rpb24gKGlzUmVhbGlzdGljKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXNSZWFsaXN0aWMgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdGhpcy5pc1JlYWxpc3RpYyA9IGlzUmVhbGlzdGljO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbGlzdGljKSB7XG4gICAgICAgICAgICB0aGlzLmRpYW1ldGVyIC89IDEwO1xuICAgICAgICAgICAgdGhpcy5yb3RhdGlvblBlclNlY29uZCAqPSA2MDAwMDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3VuO1xuIl19
