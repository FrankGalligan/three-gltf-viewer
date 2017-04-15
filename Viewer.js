const THREE = window.THREE = require('three');
const Stats = require('./lib/stats.min.js');
const GLTF2Loader = require('./lib/GLTF2Loader');
const OrbitControls = require('./lib/OrbitControls');

module.exports = class Viewer {

  constructor (el) {
    this.el = el;
    this.disposable = [];

    this.stats = new Stats();
    this.el.appendChild( this.stats.dom );

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    this.camera = new THREE.PerspectiveCamera( 60, el.clientWidth / el.clientHeight, 1, 1000 );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setClearColor( this.scene.fog.color );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( el.clientWidth, el.clientHeight );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.el.appendChild(this.renderer.domElement);

    this.addLights();

    this.animate = this.animate.bind(this);
    requestAnimationFrame( this.animate );
    window.addEventListener('resize', this.resize.bind(this), false);
  }

  animate () {

    requestAnimationFrame( this.animate );

    this.controls.update();
    this.stats.update();
    this.render();

  }

  render () {

    this.renderer.render( this.scene, this.camera );

  }

  resize () {

    this.camera.aspect = this.el.clientWidth / this.el.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.el.clientWidth, this.el.clientHeight);

  }

  setAsset ( url, assetMap ) {

    var self = this;

    return new Promise(function (resolve, reject) {

      const loader = new GLTF2Loader();
      const exportSet = new Set();

      loader.setPathTransform(function (url, path) {

        const normalizedURL = '/' + url.replace(/^(\.?\/)/, '');
        if (assetMap.has(normalizedURL)) {
          const blob = assetMap.get(normalizedURL);
          exportSet.add(blob);
          return URL.createObjectURL(blob);
        }

        return (path || '') + url;

      });

      loader.load(url, function (gltf) {

        self.clear();

        const node = gltf.scene || gltf.scenes[0];
        self.scene.add( node );
        self.disposable.push( node );

        exportSet.forEach((blob) => URL.revokeObjectURL(blob));

        resolve();

      }, undefined, reject);

    });

  }

  addLights () {

    let light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    this.scene.add( light );

    light = new THREE.DirectionalLight( 0x002288 );
    light.position.set( -1, -1, -1 );
    this.scene.add( light );

    light = new THREE.AmbientLight( 0x222222 );
    this.scene.add( light );

  }

  clear () {

    this.disposable.forEach((node) => this.scene.remove(node));

  }

};
