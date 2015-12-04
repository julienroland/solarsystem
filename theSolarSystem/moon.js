const PATH = "./images/";
var start = Date.now();
//@math var Degree = require('../lib/degreeInRadian');
var Moon = {
    isRealistic: false,
    orbitRadius: 4600,
    //@math 60 * 60 * 24 * 27 (27 days)
    timeToFullSelfRotation: 2332800,
    //@math return (Degree.convert(360) (6,28319) / this.timeToFullSelfRotation);
    rotationPerSecond: 0.000002693411,
    diameter: 1,
    orbitAngle: 0,
    nbPoly: 32,
    //6.68
    axialZTilt: 0.11658738,
    axialYTilt: 0.06658738,
    animations: [],
    make: function (options, callback) {
        this.setup(options);
        var self = this;
        this.load(function () {
            self.manageRealism(self.isRealistic);
            self.init(self.scene);
            self.createMesh();
            self.animate();
            callback(self.animations);
        });
    },
    setup: function (options) {
        this.scene = options.scene;
        this.isRealistic = options.isRealistic;
        this.earth = options.earth;
    },
    init: function (scene) {
        this.container = new THREE.Object3D();
        this.container.rotateZ(this.axialZTilt);
        this.container.rotateY(this.axialYTilt);
        this.container.position.x = this.earth.orbitRadius + this.orbitRadius;
        this.container.position.y = this.earth.diameter / 2;
        scene.add(this.container);
    },
    load: function (callback) {
        return callback();
    },
    createMesh: function () {
        this.moonGeometry = new THREE.SphereGeometry(this.diameter, this.nbPoly, this.nbPoly);
        this.moonMaterial = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(PATH + 'moonmap1k.jpg'),
            bumpMap: THREE.ImageUtils.loadTexture(PATH + 'moonbump1k.jpg'),
            bumpScale: 0.2
        })
        this.moonMesh = new THREE.Mesh(this.moonGeometry, this.moonMaterial);
        this.moonMesh.receiveShadow = true;
        this.moonMesh.castShadow = true;
        this.container.add(this.moonMesh);
    },
    animate: function () {
        this.animations.push(function (delta, now) {
            //Self rotation
            Moon.container.rotation.y += Moon.rotationPerSecond / 60;

            //Revolution
            Moon.orbitAngle -= 0.1;
            var orbitAngleInRadians = Moon.orbitAngle * Math.PI / 180;

            Moon.container.position.x = Moon.earth.container.position.x + Math.cos(orbitAngleInRadians) * Moon.orbitRadius;
            Moon.container.position.z = Moon.earth.container.position.z + Math.sin(orbitAngleInRadians) * Moon.orbitRadius * 2.25;
        });
    },
    manageRealism: function (isRealistic) {
        if (typeof isRealistic != "undefined") {
            this.isRealistic = isRealistic;
        }

        if (!this.isRealistic) {
            this.diameter *= 30;
            this.orbitRadius /= 20;
            this.rotationPerSecond *= 60000;
        }
    }
};

module.exports = Moon;
