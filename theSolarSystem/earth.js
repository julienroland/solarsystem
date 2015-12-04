var Atmospheres = require('../lib/threex.atmospherematerial');
var ShaderLoader = require('../lib/shaderLoader');
const PATH = "./images/";
const SHADERS = "./theSolarSystem/earthShaders/";
//@math var Degree = require('../lib/degreeInRadian');
//rim lighting
var Earth = {
    //@math 60 * 60 * 23.5603 (23h56 03')
    timeToFullSelfRotation: 84817.4724,
    isRealistic: false,
    diameter: 3,
    nbpoly: 50,
    atmosphereRadius: undefined,
    atmosphereSize: undefined,
    //23.44 degrees
    axialTilt: 0.40840704497,
    //@math return (Degree.convert(360) / this.timeToFullSelfRotation);
    rotationPerSecond: 0.000007393570389010043,
    orbitRadius: 35643,
    orbitAngle: 0,
    properties: {
        //kg (5.98 * 10e24)
        mass: 5980000000000000000000000,
        //meters (6.279 * 10e6)
        radius: 6378000,
        //seconds
        rotationTime: 84817.4724,
        //km/h
        rotationSpeed: 1180,
        //km/h
        revolutionSpeed: 1800,
        //degree
        axialTilt: 23.4
    },
    shaders: [],
    animations: [],
    make: function (options, callback) {
        this.setup(options);
        var self = this;
        this.load(function (shaders) {
            self.shaders = shaders;
            self.manageRealism(self.isRealistic);
            self.init(self.scene);
            self.createMesh();
            self.createAtmosphere();
            self.createClouds();
            self.animate();
            callback(self.animations);
        });
    },
    setup: function (options) {
        this.scene = options.scene;
        this.isRealistic = options.isRealistic;
        this.sun = options.sun;
    },
    init: function (scene) {
        this.container = new THREE.Object3D();
        this.container.rotateZ(this.axialTilt);
        //Sun diameter * 109 = radius of earth's orbit (149,597,870 km) (35643)
        this.container.position.x = this.orbitRadius;
        scene.add(this.container);
        this.atmosphereRadius = this.diameter;
    },
    load: function (callback) {
        ShaderLoader.load([SHADERS + 'earth'], callback);
    },
    createMesh: function () {
        //Earth is more or less 109 times smaller than sun
        var geometry = new THREE.SphereGeometry(this.diameter, this.nbpoly, this.nbpoly)
        var texture = THREE.ImageUtils.loadTexture(PATH + 'earthdiffuse.jpg');
        var nightTexture = THREE.ImageUtils.loadTexture(PATH + "earthnight-3.png");
        var normalMap = THREE.ImageUtils.loadTexture(PATH + 'earthnormal.png');
        var uniforms = {
            sunDirection: {type: "v3", value: this.sun.container.position.normalize()},
            sunLightIntensity: {type: "f", value: this.sun.lightIntensity},
            dayTexture: {type: "t", value: texture},
            nightTexture: {type: "t", value: nightTexture},
            normalMap: {type: "t", value: normalMap}
        };
        uniforms.dayTexture.value.wrapS = uniforms.dayTexture.value.wrapT = THREE.RepeatWrapping;
        uniforms.dayTexture.value.minFilter = THREE.LinearFilter;
        uniforms.dayTexture.value.anisotropy = 2;

        uniforms.nightTexture.value.wrapS = uniforms.nightTexture.value.wrapT = THREE.RepeatWrapping;
        uniforms.nightTexture.value.minFilter = THREE.LinearFilter;
        uniforms.nightTexture.value.anisotropy = 2;

        uniforms.normalMap.value.wrapS = uniforms.normalMap.value.wrapT = THREE.RepeatWrapping;
        uniforms.normalMap.value.minFilter = THREE.LinearFilter;
        uniforms.normalMap.value.anisotropy = 2;
        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: this.shaders.earth.vertex,
            fragmentShader: this.shaders.earth.fragment
        });
        this.earthMesh = new THREE.Mesh(geometry, material)

        this.earthMesh.geometry.computeTangents();
        this.earthMesh.rotation.y = 0;
        this.earthMesh.receiveShadow = true;
        this.earthMesh.castShadow = true;
        this.container.add(this.earthMesh);
    },
    createClouds: function () {
        var geometry = new THREE.SphereGeometry(this.diameter, this.nbpoly, this.nbpoly)
        var material = new THREE.MeshPhongMaterial({
            map: new THREE.ImageUtils.loadTexture(PATH + 'earthclouds.png'),
            side: THREE.FrontSide,
            transparent: true,
            opacity: 0.6
        });
        material.map.minFilter = THREE.LinearFilter;
        material.map.anisotropy = 2;
        this.earthCloud = new THREE.Mesh(geometry, material)
        this.earthCloud.receiveShadow = true;
        this.earthCloud.castShadow = true;
        this.earthCloud.scale.multiplyScalar(1.01);
        this.container.add(this.earthCloud);

    },
    createAtmosphere: function () {
        var geometry = new THREE.SphereGeometry(this.diameter, this.nbpoly, this.nbpoly);
        var material = Atmospheres.createAtmosphereMaterial();
        material.uniforms.glowColor.value.set(0x00b3ff);
        material.uniforms.coeficient.value = 1;
        material.uniforms.power.value = 6.5;
        this.atmosphere1 = new THREE.Mesh(geometry, material);
        this.atmosphere1.scale.multiplyScalar(1.02);
        this.container.add(this.atmosphere1);
    },
    animate: function () {
        this.animations.push(function (delta, now) {
            //Self rotation
            Earth.earthMesh.rotation.y += Earth.rotationPerSecond / 60;
            Earth.earthCloud.rotation.y += (Earth.rotationPerSecond * 1.2) / 60;

            //Revolution
            Earth.orbitAngle += 0.01;
            var orbitAngleInRadians = Earth.orbitAngle * Math.PI / 180;

            Earth.container.position.x = Math.cos(orbitAngleInRadians) * Earth.orbitRadius;
            Earth.container.position.z = Math.sin(orbitAngleInRadians) * Earth.orbitRadius * 1.25;
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

module.exports = Earth;
