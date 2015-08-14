var Planets = require('../lib/threex.planets');
var Int = require('../lib/int');
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
        this.createMesh();
        this.addLight(scene);
        this.addParticules(scene);

        return this;
    },
    getAnimations: function () {
        return this.animations;
    },
    init: function (scene) {
        this.containerSun = new THREE.Object3D();
        this.containerSun.rotateZ(this.axialTilt * Math.PI / 180);
        this.containerSun.position.z = 0;
        this.containerSun.scale.set(this.diameter, this.diameter, this.diameter);
        scene.add(this.containerSun);
    },
    createMesh: function () {
        var options = {radius: this.diameter, spectral: 0.656};
        Planets.Planets.createSun(function (sun) {
            Sun.sunMesh = sun;
            Sun.sunMesh.rotation.y = 0;
            Sun.sunMesh.receiveShadow = true;
            Sun.sunMesh.castShadow = true;
            Sun.containerSun.add(Sun.sunMesh);
            Sun.registerAnimation(function (delta, now) {
                Sun.sunMesh.rotation.y += Sun.rotationPerSecond / 60;
            });
        }, options);
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
            radiusScale: new THREE.Vector3(0.50, 0.50, 0.50),
            speed: 1,
            speedSpread: 2,
            sizeStart: 100,
            sizeMiddle: 50,
            sizeEnd: 25,
            opacityStart: 1,
            opacityMiddle: 0.8,
            opacityEnd: 0,
            isStatic: 0,
            particleCount: 100
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
