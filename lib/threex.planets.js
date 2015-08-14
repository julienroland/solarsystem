var $ = require('jquery');
var THREEx = THREEx || {}
THREEx.Planets = {};

THREEx.Planets.baseURL = './lib/';

var sunTexture;
var sunColorLookupTexture;
var solarflareTexture;
var sunHaloTexture;
var sunHaloColorTexture;
var sunCoronaTexture;
var maxAniso = 1;
var shaderList = [THREEx.Planets.baseURL + 'shaders/starsurface', THREEx.Planets.baseURL + 'shaders/starhalo', THREEx.Planets.baseURL + 'shaders/starflare', THREEx.Planets.baseURL + 'shaders/corona'];


// from http://planetpixelemporium.com/

THREEx.Planets.createSun = function (callback, options) {
    //var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    //var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/sunmap.jpg')
    //var sunShaderMaterial = new THREE.ShaderMaterial( {
    //    uniforms: 		uniforms,
    //    vertexShader:   shaderList.starsurface.vertex,
    //    fragmentShader: shaderList.starsurface.fragment,
    //});
    //var material = new THREE.MeshPhongMaterial({
    //    map: texture,
    //    bumpMap: texture,
    //    bumpScale: 0.05,
    //});
    function map(value, istart, istop, ostart, ostop) {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    }

    function constrain(v, min, max) {
        if (v < min)
            v = min;
        else if (v > max)
            v = max;
        return v;
    }

    function wrap(value, min, rangeSize) {
        rangeSize -= min;
        while (value < min) {
            value += rangeSize;
        }
        return value % rangeSize;
    }

    var glowSpanTexture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/glowspan.png');
//	a small util to pre-fetch all shaders and put them in a data structure (replacing the list above)
    function loadShaders(list, callback) {
        var shaders = {};

        var expectedFiles = list.length * 2;
        var loadedFiles = 0;

        function makeCallback(name, type) {
            return function (data) {
                if (shaders[name] === undefined) {
                    shaders[name] = {};
                }

                shaders[name][type] = data;

                //	check if done
                loadedFiles++;
                if (loadedFiles == expectedFiles) {
                    callback(shaders);
                }

            };
        }

        for (var i = 0; i < list.length; i++) {
            var vertexShaderFile = list[i] + '.vsh';
            var fragmentShaderFile = list[i] + '.fsh';

            //	find the filename, use it as the identifier
            var splitted = list[i].split('/');
            var shaderName = splitted[splitted.length - 1];

            var xhr = new XMLHttpRequest();

            $(document).load(vertexShaderFile, makeCallback(shaderName, 'vertex'));
            $(document).load(fragmentShaderFile, makeCallback(shaderName, 'fragment'));
        }
    }

    function loadStarSurfaceTextures() {

        if (sunTexture === undefined) {
            sunTexture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + "images/sun_surface.png");
            sunTexture.anisotropy = maxAniso;
            sunTexture.wrapS = sunTexture.wrapT = THREE.RepeatWrapping;
        }

        if (sunColorLookupTexture === undefined) {
            sunColorLookupTexture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + "images/star_colorshift.png");
        }

        if (solarflareTexture === undefined) {
            solarflareTexture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + "images/solarflare.png");
        }

        if (sunHaloTexture === undefined) {
            sunHaloTexture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + "images/sun_halo.png");
        }

        if (sunHaloColorTexture === undefined) {
            sunHaloColorTexture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + "images/halo_colorshift.png");
        }

        if (sunCoronaTexture === undefined) {
            sunCoronaTexture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + "images/corona.png");
        }
    }

    var surfaceGeo = new THREE.SphereGeometry(7.35144e-8, 60, 30);

    function makeStarSurface(radius, uniforms) {
        console.log(shaderList);
        var sunShaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shaderList.starsurface.vertex,
            fragmentShader: shaderList.starsurface.fragment,
        });

        var sunSphere = new THREE.Mesh(surfaceGeo, sunShaderMaterial);
        return sunSphere;
    }

    var haloGeo = new THREE.PlaneGeometry(.00000022, .00000022);

    function makeStarHalo(uniforms) {
        var sunHaloMaterial = new THREE.ShaderMaterial(
            {
                uniforms: uniforms,
                vertexShader: shaderList.starhalo.vertex,
                fragmentShader: shaderList.starhalo.fragment,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false,
                color: 0xffffff,
                transparent: true,
                //	settings that prevent z fighting
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 100,
            }
        );

        var sunHalo = new THREE.Mesh(haloGeo, sunHaloMaterial);
        sunHalo.position.set(0, 0, 0);
        return sunHalo;
    }

    var glowGeo = new THREE.PlaneGeometry(.0000012, .0000012);

    function makeStarGlow(uniforms) {
        //	the bright glow surrounding everything
        var sunGlowMaterial = new THREE.ShaderMaterial(
            {
                //map: sunCoronaTexture,
                uniforms: uniforms,
                blending: THREE.AdditiveBlending,
                fragmentShader: shaderList.corona.fragment,
                vertexShader: shaderList.corona.vertex,
                color: 0xffffff,
                transparent: true,
                //	settings that prevent z fighting
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: 100,
                depthTest: true,
                depthWrite: true,
            }
        );

        var sunGlow = new THREE.Mesh(glowGeo, sunGlowMaterial);
        sunGlow.position.set(0, 0, 0);
        return sunGlow;
    }
    var textureFlare0 = THREE.ImageUtils.loadTexture( THREEx.Planets.baseURL+"images/lensflare0.png" );
    var textureFlare1 = THREE.ImageUtils.loadTexture( THREEx.Planets.baseURL+"images/lensflare1.png" );
    var textureFlare2 = THREE.ImageUtils.loadTexture( THREEx.Planets.baseURL+"images/lensflare2.png" );
    var textureFlare3 = THREE.ImageUtils.loadTexture( THREEx.Planets.baseURL+"images/lensflare3.png");


//	used for every star in star model view
    function addStarLensFlare(x,y,z, size, overrideImage, hueShift){
        var flareColor = new THREE.Color( 0xffffff );

        // flareColor.copy( 0xffffff );

        hueShift = 1.0 - hueShift;
        hueShift = constrain( hueShift, 0.0, 1.0 );

        //var lookupColor = gradientCanvas.getColor( hueShift );
        var lookupColor = [255* 255,255*255,255*255];
        flareColor.setRGB( lookupColor[0]/255, lookupColor[1]/255, lookupColor[2]/255 );

        var brightnessCalibration = 1.25 - Math.sqrt( Math.pow(lookupColor[0],2) + Math.pow(lookupColor[1],2) + Math.pow(lookupColor[2],2) )/255 * 1.25;

        flareColor.offsetHSL(/*0.25*/0.0, -0.15, brightnessCalibration );

        //flareColor.g *= 0.85;

        var lensFlare = new THREE.LensFlare( overrideImage ? overrideImage : textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );
        lensFlare.customUpdateCallback = lensFlareUpdateCallback;
        lensFlare.position = new THREE.Vector3(x,y,z);
        lensFlare.size = size ? size : 16000 ;

        lensFlare.add( textureFlare1, 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 40, 0.6, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 80, 0.7, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 60, 1.0, THREE.AdditiveBlending );

        // for( var i in lensFlarelensFlares ){
        // 	var flare = lensFlare.lensFlares[i];
        // }
        return lensFlare;
    }

    function lensFlareUpdateCallback( object ) {
        var f, fl = this.lensFlares.length;
        var flare;
        var vecX = -this.positionScreen.x * 2;
        var vecY = -this.positionScreen.y * 2;
        var size = object.size ? object.size : 16000;

        var camDistance = camera.position.length();

        var heatVisionValue = pSystem ? pSystem.shaderMaterial.uniforms.heatVision.value : 0.0;

        for( f = 0; f < fl; f ++ ) {

            flare = this.lensFlares[ f ];

            flare.x = this.positionScreen.x + vecX * flare.distance;
            flare.y = this.positionScreen.y + vecY * flare.distance;

            // flare.wantedRotation = flare.x * Math.PI * 0.25;
            // flare.rotation += ( flare.wantedRotation - flare.rotation ) * 0.25;

            flare.scale = size / camDistance;
            flare.rotation = 0;
            flare.opacity = 1.0 - heatVisionValue;
        }

        // object.lensFlares[ 2 ].y += 0.025;
        // object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5;
    }

    function makeStarLensflare(size, zextra, hueShift) {
        var sunLensFlare = addStarLensFlare(0, 0, zextra, size, undefined, hueShift);
        sunLensFlare.customUpdateCallback = function (object) {
            if (object.visible == false)
                return;
            var f, fl = this.lensFlares.length;
            var flare;
            var vecX = -this.positionScreen.x * 2;
            var vecY = -this.positionScreen.y * 2;
            var size = object.size ? object.size : 16000;

            //var camDistance = camera.position.length();
            var camDistance = 5;

            for (f = 0; f < fl; f++) {

                flare = this.lensFlares[f];

                flare.x = this.positionScreen.x + vecX * flare.distance;
                flare.y = this.positionScreen.y + vecY * flare.distance;

                flare.scale = size / Math.pow(camDistance, 2.0) * 2.0;

                //if (camDistance < 10.0) {
                //    flare.opacity = Math.pow(camDistance * 2.0, 2.0);
                //}
                //else {
                    flare.opacity = 1.0;
                //}

                flare.rotation = 0;


                //flare.rotation = this.positionScreen.x * 0.5;
                //flare.rotation = 0;
            }

            for (f = 2; f < fl; f++) {
                flare = this.lensFlares[f];
                var dist = Math.sqrt(Math.pow(flare.x, 2) + Math.pow(flare.y, 2));
                flare.opacity = constrain(dist, 0.0, 1.0);
                flare.wantedRotation = flare.x * Math.PI * 0.25;
                flare.rotation += ( flare.wantedRotation - flare.rotation ) * 0.25;
            }

        };
        return sunLensFlare;
    }

    var solarflareGeometry = new THREE.TorusGeometry(0.00000003, 0.000000001 + 0.000000002, 60, 90, 0.15 + Math.PI);

    function makeSolarflare(uniforms) {
        var solarflareMaterial = new THREE.ShaderMaterial(
            {
                uniforms: uniforms,
                vertexShader: shaderList.starflare.vertex,
                fragmentShader: shaderList.starflare.fragment,
                blending: THREE.AdditiveBlending,
                color: 0xffffff,
                transparent: true,
                depthTest: true,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -100,
                polygonOffsetUnits: 1000,
            }
        );

        var solarflareMesh = new THREE.Object3D();

        for (var i = 0; i < 6; i++) {
            var solarflare = new THREE.Mesh(solarflareGeometry, solarflareMaterial);
            solarflare.rotation.y = Math.PI / 2;
            solarflare.speed = Math.random() * 0.01 + 0.005;
            solarflare.rotation.z = Math.PI * Math.random() * 2;
            solarflare.rotation.x = -Math.PI + Math.PI * 2;
            solarflare.update = function () {
                this.rotation.z += this.speed;
            }
            var solarflareContainer = new THREE.Object3D();
            solarflareContainer.position.x = -1 + Math.random() * 2;
            solarflareContainer.position.y = -1 + Math.random() * 2;
            solarflareContainer.position.z = -1 + Math.random() * 2;
            solarflareContainer.position.multiplyScalar(7.35144e-8 * 0.8);
            solarflareContainer.lookAt(new THREE.Vector3(0, 0, 0));
            solarflareContainer.add(solarflare);

            solarflareMesh.add(solarflareContainer);
        }

        return solarflareMesh;
    }

    function makeSun(options) {
        var radius = options.radius;
        var spectral = options.spectral;

        // console.time("load sun textures");
        loadStarSurfaceTextures();
        // console.timeEnd("load sun textures");

        var sunUniforms = {
            texturePrimary: {type: "t", value: sunTexture},
            textureColor: {type: "t", value: sunColorLookupTexture},
            //textureSpectral: { type: "t", value: starColorGraph },
            time: {type: "f", value: 0},
            spectralLookup: {type: "f", value: 0},
        };

        var solarflareUniforms = {
            texturePrimary: {type: "t", value: solarflareTexture},
            time: {type: "f", value: 0},
            //textureSpectral: { type: "t", value: starColorGraph },
            spectralLookup: {type: "f", value: 0},
        };

        var haloUniforms = {
            texturePrimary: {type: "t", value: sunHaloTexture},
            textureColor: {type: "t", value: sunHaloColorTexture},
            time: {type: "f", value: 0},
            //textureSpectral: { type: "t", value: starColorGraph },
            spectralLookup: {type: "f", value: 0},
        };

        var coronaUniforms = {
            texturePrimary: {type: "t", value: sunCoronaTexture},
            //textureSpectral: { type: "t", value: starColorGraph },
            spectralLookup: {type: "f", value: 0},
        };

        //	container
        var sun = new THREE.Object3D();

        //	the actual glowy ball of fire
        // console.time("make sun surface");
        var starSurface = makeStarSurface(radius, sunUniforms);
        sun.add(starSurface);
        // console.timeEnd("make sun surface");

        // console.time("make sun solarflare");
        var solarflare = makeSolarflare(solarflareUniforms);
        sun.solarflare = solarflare;
        sun.add(solarflare);
        // console.timeEnd("make sun solarflare");

        //	2D overlay elements
        var gyro = new THREE.Gyroscope();
        sun.add(gyro);
        sun.gyro = gyro;

        // console.time("make sun lensflare");
        var starLensflare = makeStarLensflare(1.5, 0.0001, spectral);
        sun.lensflare = starLensflare;
        sun.lensflare.name == 'lensflare';
        gyro.add(starLensflare);
        // console.timeEnd("make sun lensflare");

        //	the corona that lines the edge of the sun sphere
        // console.time("make sun halo");
        var starHalo = makeStarHalo(haloUniforms);
        gyro.add(starHalo);
        // console.timeEnd("make sun halo");

        // console.time("make sun glow");
        var starGlow = makeStarGlow(coronaUniforms);
        gyro.add(starGlow);
        // console.timeEnd("make sun glow");


        var latticeMaterial = new THREE.MeshBasicMaterial({
            map: glowSpanTexture,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthTest: true,
            depthWrite: true,
            wireframe: true,
            opacity: 0.8,
        });

        var lattice = new THREE.Mesh(new THREE.IcosahedronGeometry(radius * 1.25, 2), latticeMaterial);
        lattice.update = function () {
            this.rotation.y += 0.001;
            this.rotation.z -= 0.0009;
            this.rotation.x -= 0.0004;
        }
        lattice.material.map.wrapS = THREE.RepeatWrapping;
        lattice.material.map.wrapT = THREE.RepeatWrapping;
        lattice.material.map.needsUpdate = true;
        lattice.material.map.onUpdate = function () {
            this.offset.y -= 0.01;
            this.needsUpdate = true;
        }

        sun.add(lattice);

        sun.sunUniforms = sunUniforms;
        sun.solarflareUniforms = solarflareUniforms;
        sun.haloUniforms = haloUniforms;
        sun.coronaUniforms = coronaUniforms;

        // sun.rotation.z = -0.93;
        // sun.rotation.y = 0.2;

        sun.setSpectralIndex = function (index) {
            var starColor = map(index, -0.3, 1.52, 0, 1);
            starColor = constrain(starColor, 0.0, 1.0);
            this.starColor = starColor;

            this.sunUniforms.spectralLookup.value = starColor;
            this.solarflareUniforms.spectralLookup.value = starColor;
            this.haloUniforms.spectralLookup.value = starColor;
            this.coronaUniforms.spectralLookup.value = starColor;
        }

        sun.setScale = function (index) {
            this.scale.setLength(index);

            //	remove old lensflare
            this.gyro.remove(this.lensflare);

            var lensflareSize = 4.0 + index * 0.5 + 0.1 * Math.pow(index, 2);
            if (lensflareSize < 1.5)
                lensflareSize = 1.5;
            this.lensflare = makeStarLensflare(lensflareSize, 0.0002 * index, this.starColor);
            this.lensflare.name = 'lensflare';
            this.gyro.add(this.lensflare);
        }

        sun.randomizeSolarFlare = function () {
            this.solarflare.rotation.x = Math.random() * Math.PI * 2;
            this.solarflare.rotation.y = Math.random() * Math.PI * 2;
        }

        sun.setSpectralIndex(spectral);

        //sun.update = function(){
        //    this.sunUniforms.time.value = shaderTiming;
        //    this.haloUniforms.time.value = shaderTiming + rotateYAccumulate;
        //    this.solarflareUniforms.time.value = shaderTiming;
        //
        //    //	ugly.. terrible hack
        //    //	no matter what I do I can't remove the lensflare visibility at a distance
        //    //	which was causing jittering on pixels when the lensflare was too small to be visible
        //    //	is this the only way?
        //
        //    if( camera.position.z > 400 ){
        //        var lensflareChild = this.gyro.getObjectByName('lensflare');
        //        if( lensflareChild !== undefined )
        //            this.gyro.remove(  lensflareChild );
        //    }
        //    else{
        //        if( this.gyro.getObjectByName('lensflare') === undefined ){
        //            this.gyro.add( this.lensflare );
        //        }
        //
        //    }
        //
        //}

        return sun;
    }


    //sunColorLookupTexture = THREE.ImageUtils.loadTexture("./images/star_colorshift.png");
    //solarflareTexture = THREE.ImageUtils.loadTexture("./images/solarflare.png", undefined);
    //sunHaloTexture = THREE.ImageUtils.loadTexture("./images/sun_halo.png", undefined);
    //sunHaloColorTexture = THREE.ImageUtils.loadTexture("./images/halo_colorshift.png");
    //sunCoronaTexture = THREE.ImageUtils.loadTexture("./images/corona.png", undefined);
    //var mesh = new THREE.Mesh(geometry, material)
    //return mesh
    loadShaders(shaderList, function (shaders) {
        shaderList = shaders;
        console.log();
        var sun = makeSun({radius: this.diameter, spectral: 0.656});
        callback(sun);
    });
}

THREEx.Planets.createMercury = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/mercurymap.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/mercurybump.jpg'),
        bumpScale: 0.005,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createVenus = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/venusmap.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/venusbump.jpg'),
        bumpScale: 0.005,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createEarth = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/earthmap1k.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/earthbump1k.jpg'),
        bumpScale: 0.05,
        specularMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/earthspec1k.jpg'),
        specular: new THREE.Color('grey')
    })
    material.map.minFilter = THREE.LinearFilter;
    material.bumpMap.minFilter = THREE.LinearFilter;
    material.specularMap.minFilter = THREE.LinearFilter;
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createEarthCloud = function () {
    // create destination canvas
    var canvasResult = document.createElement('canvas')
    canvasResult.width = 1024
    canvasResult.height = 512
    var contextResult = canvasResult.getContext('2d')

    // load earthcloudmap
    var imageMap = new Image();
    imageMap.addEventListener("load", function () {

        // create dataMap ImageData for earthcloudmap
        var canvasMap = document.createElement('canvas')
        canvasMap.width = imageMap.width
        canvasMap.height = imageMap.height
        var contextMap = canvasMap.getContext('2d')
        contextMap.drawImage(imageMap, 0, 0)
        var dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

        // load earthcloudmaptrans
        var imageTrans = new Image();
        imageTrans.addEventListener("load", function () {
            // create dataTrans ImageData for earthcloudmaptrans
            var canvasTrans = document.createElement('canvas')
            canvasTrans.width = imageTrans.width
            canvasTrans.height = imageTrans.height
            var contextTrans = canvasTrans.getContext('2d')
            contextTrans.drawImage(imageTrans, 0, 0)
            var dataTrans = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
            // merge dataMap + dataTrans into dataResult
            var dataResult = contextMap.createImageData(canvasMap.width, canvasMap.height)
            for (var y = 0, offset = 0; y < imageMap.height; y++) {
                for (var x = 0; x < imageMap.width; x++, offset += 4) {
                    dataResult.data[offset + 0] = dataMap.data[offset + 0]
                    dataResult.data[offset + 1] = dataMap.data[offset + 1]
                    dataResult.data[offset + 2] = dataMap.data[offset + 2]
                    dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0]
                }
            }
            // update texture with result
            contextResult.putImageData(dataResult, 0, 0)
            material.map.needsUpdate = true;
        })
        imageTrans.src = THREEx.Planets.baseURL + 'images/earthcloudmaptrans.jpg';
    }, false);
    imageMap.src = THREEx.Planets.baseURL + 'images/earthcloudmap.jpg';

    var geometry = new THREE.SphereGeometry(0.51, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: new THREE.Texture(canvasResult),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}


THREEx.Planets.createMoon = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/moonmap1k.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/moonbump1k.jpg'),
        bumpScale: 0.002,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createMars = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/marsmap1k.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/marsbump1k.jpg'),
        bumpScale: 0.05,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createJupiter = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/jupitermap.jpg')
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.02,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}


THREEx.Planets.createSaturn = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/saturnmap.jpg')
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}


THREEx.Planets.createSaturnRing = function () {
    // create destination canvas
    var canvasResult = document.createElement('canvas')
    canvasResult.width = 915
    canvasResult.height = 64
    var contextResult = canvasResult.getContext('2d')

    // load earthcloudmap
    var imageMap = new Image();
    imageMap.addEventListener("load", function () {

        // create dataMap ImageData for earthcloudmap
        var canvasMap = document.createElement('canvas')
        canvasMap.width = imageMap.width
        canvasMap.height = imageMap.height
        var contextMap = canvasMap.getContext('2d')
        contextMap.drawImage(imageMap, 0, 0)
        var dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

        // load earthcloudmaptrans
        var imageTrans = new Image();
        imageTrans.addEventListener("load", function () {
            // create dataTrans ImageData for earthcloudmaptrans
            var canvasTrans = document.createElement('canvas')
            canvasTrans.width = imageTrans.width
            canvasTrans.height = imageTrans.height
            var contextTrans = canvasTrans.getContext('2d')
            contextTrans.drawImage(imageTrans, 0, 0)
            var dataTrans = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
            // merge dataMap + dataTrans into dataResult
            var dataResult = contextMap.createImageData(canvasResult.width, canvasResult.height)
            for (var y = 0, offset = 0; y < imageMap.height; y++) {
                for (var x = 0; x < imageMap.width; x++, offset += 4) {
                    dataResult.data[offset + 0] = dataMap.data[offset + 0]
                    dataResult.data[offset + 1] = dataMap.data[offset + 1]
                    dataResult.data[offset + 2] = dataMap.data[offset + 2]
                    dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0] / 4
                }
            }
            // update texture with result
            contextResult.putImageData(dataResult, 0, 0)
            material.map.needsUpdate = true;
        })
        imageTrans.src = THREEx.Planets.baseURL + 'images/saturnringpattern.gif';
    }, false);
    imageMap.src = THREEx.Planets.baseURL + 'images/saturnringcolor.jpg';

    var geometry = new THREEx.Planets._RingGeometry(0.55, 0.75, 64);
    var material = new THREE.MeshPhongMaterial({
        map: new THREE.Texture(canvasResult),
        // map		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/ash_uvgrid01.jpg'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
    })
    var mesh = new THREE.Mesh(geometry, material)
    mesh.lookAt(new THREE.Vector3(0.5, -4, 1))
    return mesh
}


THREEx.Planets.createUranus = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/uranusmap.jpg')
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createUranusRing = function () {
    // create destination canvas
    var canvasResult = document.createElement('canvas')
    canvasResult.width = 1024
    canvasResult.height = 72
    var contextResult = canvasResult.getContext('2d')

    // load earthcloudmap
    var imageMap = new Image();
    imageMap.addEventListener("load", function () {

        // create dataMap ImageData for earthcloudmap
        var canvasMap = document.createElement('canvas')
        canvasMap.width = imageMap.width
        canvasMap.height = imageMap.height
        var contextMap = canvasMap.getContext('2d')
        contextMap.drawImage(imageMap, 0, 0)
        var dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

        // load earthcloudmaptrans
        var imageTrans = new Image();
        imageTrans.addEventListener("load", function () {
            // create dataTrans ImageData for earthcloudmaptrans
            var canvasTrans = document.createElement('canvas')
            canvasTrans.width = imageTrans.width
            canvasTrans.height = imageTrans.height
            var contextTrans = canvasTrans.getContext('2d')
            contextTrans.drawImage(imageTrans, 0, 0)
            var dataTrans = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
            // merge dataMap + dataTrans into dataResult
            var dataResult = contextMap.createImageData(canvasResult.width, canvasResult.height)
            for (var y = 0, offset = 0; y < imageMap.height; y++) {
                for (var x = 0; x < imageMap.width; x++, offset += 4) {
                    dataResult.data[offset + 0] = dataMap.data[offset + 0]
                    dataResult.data[offset + 1] = dataMap.data[offset + 1]
                    dataResult.data[offset + 2] = dataMap.data[offset + 2]
                    dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0] / 2
                }
            }
            // update texture with result
            contextResult.putImageData(dataResult, 0, 0)
            material.map.needsUpdate = true;
        })
        imageTrans.src = THREEx.Planets.baseURL + 'images/uranusringtrans.gif';
    }, false);
    imageMap.src = THREEx.Planets.baseURL + 'images/uranusringcolour.jpg';

    var geometry = new THREEx.Planets._RingGeometry(0.55, 0.75, 64);
    var material = new THREE.MeshPhongMaterial({
        map: new THREE.Texture(canvasResult),
        // map		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/ash_uvgrid01.jpg'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
    })
    var mesh = new THREE.Mesh(geometry, material)
    mesh.lookAt(new THREE.Vector3(0.5, -4, 1))
    return mesh
}


THREEx.Planets.createNeptune = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/neptunemap.jpg')
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}


THREEx.Planets.createPluto = function () {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/plutomap1k.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/plutobump1k.jpg'),
        bumpScale: 0.005,
    })
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}

THREEx.Planets.createStarfield = function () {
    var texture = THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL + 'images/galaxy_starfield.png')
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
    })
    var geometry = new THREE.SphereGeometry(100, 32, 32)
    var mesh = new THREE.Mesh(geometry, material)
    return mesh
}


//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * change the original from three.js because i needed different UV
 *
 * @author Kaleb Murphy
 * @author jerome etienne
 */
THREEx.Planets._RingGeometry = function (innerRadius, outerRadius, thetaSegments) {

    THREE.Geometry.call(this)

    innerRadius = innerRadius || 0
    outerRadius = outerRadius || 50
    thetaSegments = thetaSegments || 8

    var normal = new THREE.Vector3(0, 0, 1)

    for (var i = 0; i < thetaSegments; i++) {
        var angleLo = (i / thetaSegments) * Math.PI * 2
        var angleHi = ((i + 1) / thetaSegments) * Math.PI * 2

        var vertex1 = new THREE.Vector3(innerRadius * Math.cos(angleLo), innerRadius * Math.sin(angleLo), 0);
        var vertex2 = new THREE.Vector3(outerRadius * Math.cos(angleLo), outerRadius * Math.sin(angleLo), 0);
        var vertex3 = new THREE.Vector3(innerRadius * Math.cos(angleHi), innerRadius * Math.sin(angleHi), 0);
        var vertex4 = new THREE.Vector3(outerRadius * Math.cos(angleHi), outerRadius * Math.sin(angleHi), 0);

        this.vertices.push(vertex1);
        this.vertices.push(vertex2);
        this.vertices.push(vertex3);
        this.vertices.push(vertex4);


        var vertexIdx = i * 4;

        // Create the first triangle
        var face = new THREE.Face3(vertexIdx + 0, vertexIdx + 1, vertexIdx + 2, normal);
        var uvs = []

        var uv = new THREE.Vector2(0, 0)
        uvs.push(uv)
        var uv = new THREE.Vector2(1, 0)
        uvs.push(uv)
        var uv = new THREE.Vector2(0, 1)
        uvs.push(uv)

        this.faces.push(face);
        this.faceVertexUvs[0].push(uvs);

        // Create the second triangle
        var face = new THREE.Face3(vertexIdx + 2, vertexIdx + 1, vertexIdx + 3, normal);
        var uvs = []

        var uv = new THREE.Vector2(0, 1)
        uvs.push(uv)
        var uv = new THREE.Vector2(1, 0)
        uvs.push(uv)
        var uv = new THREE.Vector2(1, 1)
        uvs.push(uv)

        this.faces.push(face);
        this.faceVertexUvs[0].push(uvs);
    }

    this.computeCentroids();
    this.computeFaceNormals();

    this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), outerRadius);

};
THREEx.Planets._RingGeometry.prototype = Object.create(THREE.Geometry.prototype);


module.exports = THREEx;
