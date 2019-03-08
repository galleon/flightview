/* global window */
import { TripsLayer } from '../components/index'; 
import { ScenegraphLayer, MeshLayer } from '@deck.gl/mesh-layers';
import { CylinderGeometry } from '@luma.gl/core';

// import { ScenegraphLayer } from '../components/index';

// import { GLTFParser } from '@loaders.gl/gltf';

import * as dataSamples from '../data-samples';

// const LIGHT_SETTINGS = {
//   lightsPosition: [-122.45, 37.66, 8000, -122.0, 38.0, 8000],
//   ambientRatio: 0.3,
//   diffuseRatio: 0.6,
//   specularRatio: 0.4,
//   lightsStrength: [1, 0.0, 0.8, 0.0],
//   numberOfLights: 2
// };

const MeshLayerExample = {
  layer: MeshLayer,
  props: {
    id: 'mesh-layer',
    data: dataSamples.points,
    texture: 'data/texture.png',
    mesh: new CylinderGeometry({
      radius: 1,
      topRadius: 1,
      bottomRadius: 1,
      topCap: true,
      bottomCap: true,
      height: 5,
      nradial: 20,
      nvertical: 1
    }),
    sizeScale: 10,
    getPosition: d => d.COORDINATES,
    getColor: d => [0, d.RACKS * 50, d.SPACES * 20],
    getMatrix: d => [
      Math.random() * 2,
      Math.random() * 2,
      Math.random() * 2,
      0,
      Math.random() * 2,
      Math.random() * 2,
      Math.random() * 2,
      0,
      Math.random() * 2,
      Math.random() * 2,
      Math.random() * 2,
      0,
      Math.random() * 2,
      Math.random() * 2,
      Math.random() * 2,
      1
    ]
  }
};

// const ScenegraphLayerExample = {
//   layer: ScenegraphLayer,
//   initialize: () => {
//     const url =
//       'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
//     window
//       .fetch(url)
//       .then(res => res.arrayBuffer())
//       .then(data => {
//         const gltfParser = new GLTFParser();
//         ScenegraphLayerExample.props.gltf = gltfParser.parse(data);
//       });
//   },
//   props: {
//     id: 'scenegraph-layer',
//     data: dataSamples.points,
//     sizeScale: 1,
//     pickable: true,
//     getPosition: d => [d.COORDINATES[0], d.COORDINATES[1], Math.random() * 10000]
//   }
// };

/* eslint-disable quote-props */
export default {
  'Mesh Layers': {
    MeshLayer: MeshLayerExample,
    // ScenegraphLayer: ScenegraphLayerExample
  }
};