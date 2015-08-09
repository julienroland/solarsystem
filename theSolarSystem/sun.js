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
        this.sunMesh = Planets.Planets.createSun();
        this.sunMesh.rotation.y = 0;
        this.sunMesh.receiveShadow = true;
        this.sunMesh.castShadow = true;
        this.containerSun.add(this.sunMesh);
        this.registerAnimation(function (delta, now) {
            Sun.sunMesh.rotation.y += Sun.rotationPerSecond / 60;
        });
    },
    addLight: function (scene) {
        this.light = new THREE.PointLight(0xffffff, 1, this.lightDistance);
        this.light.position.set(0, 0, 0);
        this.light.scale.set(this.diameter, this.diameter, this.diameter);
        scene.add(this.light);
    },
    addParticules: function (scene) {
        var particleCount = 5000;
        var particles = new THREE.Geometry();
        var PI2 = Math.PI * 2;
        var pMaterial = new THREE.ParticleBasicMaterial({
            color: Math.random() * 0x808008 + 0x808080,
            program: function (context) {
                context.beginPath();
                context.arc(0, 0, 1, 0, PI2, true);
                context.closePath();
                context.fill();
            }
        });

        var particuleMaxDiameter = this.diameter + (this.diameter / 100);
        for (var p = 0; p < particleCount; p++) {

            var pX = Int.getRandom(-this.diameter / 2, this.diameter);
            var pY = Int.getRandom(-this.diameter / 2, this.diameter);
            var pZ = Int.getRandom(-this.diameter / 2, this.diameter);
            particle = new THREE.Vector3(pX, pY, pZ);

            particles.vertices.push(particle);
        }

        var particleSystem = new THREE.ParticleSystem(
            particles,
            pMaterial);

        scene.add(particleSystem);
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
