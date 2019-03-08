import React, { PureComponent } from 'react';

// Imports from the charts library
import { StaticMap } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { COORDINATE_SYSTEM, FirstPersonView, MapController, MapView, View } from '@deck.gl/core';
import { LineLayer, PolygonLayer, PathLayer } from '@deck.gl/layers';
import { MeshLayer } from '@deck.gl/mesh-layers';
import { TripsLayer } from './components/index';

// import { CubeGeometry, Geometry } from '@luma.gl/core'
// import { GLBLoader } from '@loaders.gl/gltf';

import { CubeGeometry, Geometry } from '@luma.gl/core'
// import { GLBLoader } from 'loaders.gl/gltf';

import { Matrix4 } from 'math.gl';

import LayerInfo from './components/layer-info';
import LayerSelector from './components/layer-selector';
import LayerControls from './components/layer-controls';

import LAYER_CATEGORIES from './examples';

// import a350 from './assets/a350.obj';
import { autobind } from '@deck.gl/react';

import './App.css';

// const OBJ = require('webgl-obj-loader');

// const object = new OBJ.Mesh(a350);

// const geometry = new Geometry({
//     id: 'a350',
//     attributes: {
//         positions: new Float32Array(object.vertices),
//         normals: new Float32Array(object.vertexNormals),
//         texCoords: new Float32Array(object.textures),
//         indices: new Uint16Array(object.indices)
//     }
// })


// Set your mapbox token here
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2FsbGVvbiIsImEiOiJjanJ2NDlndWsxOTR4NGJtc3V2ZXFsY3c4In0.Z10zuPi4U9IbSjGqBvUdPA';
//'pk.eyJ1IjoiZ2FsbGVvbiIsImEiOiJjanJ2NDlndWsxOTR4NGJtc3V2ZXFsY3c4In0.Z10zuPi4U9IbSjGqBvUdPA';
// // eslint-disable-line

// const LIGHT_SETTINGS = {
//     lightsPosition: [43, 1.3, 8000, 44, 1.4, 5000],
//     ambientRatio: 0.05,
//     diffuseRatio: 0.6,
//     specularRatio: 0.8,
//     lightsStrength: [2.0, 0.0, 0.0, 0.0],
//     numberOfLights: 2
// };

// const INITIAL_VIEW_STATE = {
//     longitude: 1.3677,
//     latitude: 43.6294,
//     zoom: 15,
//     maxZoom: 18,
//     pitch: 45,
//     bearing: 0
// };

// Source data CSV
const DATA_URL = {
    BUILDINGS:
        'https://raw.githubusercontent.com/galleon/ThreeMapLayer/master/examples/data/buildings.json', // eslint-disable-line
    TRIPS:
        'https://raw.githubusercontent.com/galleon/ThreeMapLayer/master/examples/data/trips.json', // eslint-disable-line
    PATHS:
        'https://raw.githubusercontent.com/galleon/ThreeMapLayer/master/examples/data/paths.json' // eslint-disable-line
};

const VIEW_LABEL_STYLES = {
    zIndex: 10,
    // position: 'relative',
    padding: 5,
    margin: 20,
    fontSize: 12,
    backgroundColor: '#282727',
    color: '#FFFFFF'
};

const ViewportLabel = props => (
    <div style={{ position: 'absolute' }}>
        <div style={{ ...VIEW_LABEL_STYLES, display: '' }}>{props.children}</div>
    </div>
);

// const stereoViews = [
//         new View({
//           id: 'left-eye',
//           width: '50%',
//           viewMatrix: leftViewMatrix,
//           projection: () => leftProjectionMatrix
//         }),
//         new View({
//           id: 'right-eye',
//           x: '50%',
//           width: '50%',
//           viewMatrix: rightViewMatrix,
//           projection: () => rightProjectionMatrix
//         })
// ]

export default class App extends PureComponent {

    constructor(props) {
        super(props);
        autobind(this);

        this.state = props.state || {
            time: 0,
            mapViewState: {
                // latitude: 43.6294,
                // longitude: 1.3677,
                latitude: 37.751537058389985,
                longitude: -122.42694203247012,
                zoom: 11.5,
                pitch: 0,
                bearing: 0
            },
            orbitViewState: {
                lookAt: [0, 0, 0],
                distance: 3,
                rotationX: -30,
                rotationOrbit: 30,
                orbitAxis: 'Y',
                fov: 50,
                minDistance: 1,
                maxDistance: 20
            },
            activeLayers: {
                ScatterplotLayer: true
            },
            settings: {
                orthographic: false,
                multiview: true,
                infovis: false,
                useDevicePixels: true,
                pickingRadius: 0,
                // Model matrix manipulation
                separation: 0,
                rotationZ: 0,
                rotationX: 0
            },
            hoveredItem: null,
            clickedItem: null,
            queriedItems: null,

            enableDepthPickOnClick: true
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState !== this.state) {
          this.props.onStateChange(this.state);
        }
    }
        
    componentDidMount() {
        this._animate();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._onResize);

        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
        }
    }

    _animate() {
        const {
            loopLength = 3800, // unit corresponds to the timestamp in source data
            animationSpeed = 50 // unit time per second
        } = this.props;

        const timestamp = Date.now() / 1000;
        // console.log(timestamp);
        const loopTime = loopLength / animationSpeed;

        this.setState({
            time: ((timestamp % loopTime) / loopTime) * loopLength
        });
        this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
    }

    _getSize() {
        return { width: window.innerWidth, height: window.innerHeight };
    }

    _onViewStateChange({viewState}) {
        if (viewState.pitch > 60) {
          viewState.pitch = 60;
        }
        this.setState({mapViewState: viewState});
    }

    _onToggleLayer(layerName, source) {
        const activeLayers = {...this.state.activeLayers};
        activeLayers[layerName] = !activeLayers[layerName];
        this.setState({activeLayers});
    }
    
    _onUpdateLayerSettings(layerName, settings) {
        const activeLayers = {...this.state.activeLayers};
        activeLayers[layerName] = {
          ...activeLayers[layerName],
          ...settings
        };
        this.setState({activeLayers});
    }
    
    _onUpdateContainerSettings(settings) {
        this.setState({settings});
    }
    
    _onHover(info) {
        this.setState({hoveredItem: info});
    }
    
    _onClick(info) {
        if (this.state.enableDepthPickOnClick && info) {
          this._multiDepthPick(info.x, info.y);
        } else {
          console.log('onClick', info); // eslint-disable-line
          this.setState({clickedItem: info});
        }
    }
    
    _onPickObjects() {
        const {width, height} = this._getSize();
        const infos = this.refs.deckgl.pickObjects({x: 0, y: 0, width, height});
        console.log(infos); // eslint-disable-line
        this.setState({queriedItems: infos});
    }
    
    _multiDepthPick(x, y) {
        const infos = this.refs.deckgl.pickMultipleObjects({x, y});
        console.log(infos); // eslint-disable-line
        this.setState({queriedItems: infos});
    }
    
    _getModelMatrix(index, coordinateSystem) {
        const {
            settings: { separation }
        } = this.state;
        const modelMatrix = new Matrix4().translate([0, 0, 5 * index * separation]);

        switch (coordinateSystem) {
            case COORDINATE_SYSTEM.METER_OFFSETS:
            case COORDINATE_SYSTEM.IDENTITY:
                const {
                    settings: { rotationZ, rotationX }
                } = this.state;
                modelMatrix.rotateZ(index * rotationZ * Math.PI);
                modelMatrix.rotateX(index * rotationX * Math.PI);
                break;
            default:
            // Rotations don't work well for layers in lng lat coordinates
            // since the origin is far away.
            // We could rotate around current view point...
        }

        return modelMatrix;
    }

    _getViews() {
        const {
            settings: { infovis, multiview, orthographic }
        } = this.state;

        if (multiview) {
            return [
                new FirstPersonView({
                    id: "1st-person",
                    height: '50%'
                }),
                new MapView({
                    id: 'basemap',
                    controller: MapController,
                    y: '50%',
                    height: '50%'
                })
            ]
        }

        return new MapView({ id: 'basemap', controller: MapController, orthographic })
    }

    _initialize(gl) {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }

    _getLayerSettings(props) {
        const settings = {};
        for (const key in props) {
            settings[key] = props[key];
        }
        return settings;
    }

    _renderLayers() {
        let index = 1;
        const layers = [];
        const { activeLayers } = this.state;

        for (const categoryName of Object.keys(LAYER_CATEGORIES)) {
            for (const layerName of Object.keys(LAYER_CATEGORIES[categoryName])) {
                const settings = activeLayers[layerName];
                // A source is a function that returns a DeckGL layer instance
                if (settings) {
                    const source = LAYER_CATEGORIES[categoryName][layerName];
                    const layer = this._renderLayer(source, settings, index++);

                    if (typeof settings !== 'object') {
                        activeLayers[layerName] = this._getLayerSettings(layer.props);
                    }

                    layers.push(layer);
                }
            }
        }
        return layers;
    }

    _renderLayer(source, settings, index) {
        const { layer: Layer, props, getData, initialize, isInitialized } = source;

        if (getData && !props.data) {
            props.data = getData();
        }

        if (initialize && !isInitialized) {
            initialize();
            source.isInitialized = true;
        }

        const layerProps = Object.assign({}, props, settings);
        Object.assign(layerProps, {
            modelMatrix: this._getModelMatrix(index, layerProps.coordinateSystem)
        });

        return new Layer(layerProps);
    }

    // _renderLayers2() {
    //     const { buildings = DATA_URL.BUILDINGS, trips = DATA_URL.TRIPS, paths = DATA_URL.PATHS, trailLength = 360 } = this.props;

    //     return [
    //         new TripsLayer({
    //             id: 'trips',
    //             data: trips,
    //             getPath: d => d.segments,
    //             getColor: d => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
    //             opacity: 0.3,
    //             strokeWidth: 5,
    //             trailLength,
    //             currentTime: this.state.time
    //         }),
    //         new PolygonLayer({
    //             id: 'buildings',
    //             data: buildings,
    //             extruded: true,
    //             wireframe: false,
    //             fp64: true,
    //             opacity: 0.3,
    //             getPolygon: f => f.polygon,
    //             getElevation: f => f.height,
    //             getFillColor: [74, 80, 87],
    //             lightSettings: LIGHT_SETTINGS,
    //             // onHover: ({object, x, y}) => {
    //             //     const tooltip = `${object.height}\nHeight: ${object.height}`;
    //             //     console.log(tooltip);
    //             // }
    //         }),
    //         //                getColor: d => colorToRGBArray(d.color),
    //         new PathLayer({
    //             id: 'path-layer',
    //             data: paths,
    //             widthScale: 5,
    //             widthMinPixels: 2,
    //             getPath: d => d.path,
    //             getWidth: d => 1,
    //         }),
    //         new MeshLayer({
    //             id: 'mesh-layer',
    //             sizeScale: 100,
    //             getColor: [50, 50, 50, 50],
    //             data: [{
    //                 position: [1.374023, 43.62500],
    //                 angle: 90,
    //                 roll: 90
    //             }],
    //             mesh: geometry,
    //             lightSettings: {
    //                 lightsPosition: [1, 50, 2000],
    //                 specularRatio: 0.4,
    //                 ambientRatio: 0.5,
    //                 diffuseRatio: 0.1
    //             }
    //         })
    //     ];
    // }

    _layerFilter({ layer }) {
        const { settings } = this.state;
        const isIdentity = layer.props.coordinateSystem === COORDINATE_SYSTEM.IDENTITY;
        return settings.infovis ? isIdentity : !isIdentity;
    }

    _renderMap() {
        const { orbitViewState, mapViewState, settings } = this.state;
        const { infovis, effects, pickingRadius, drawPickingColors, useDevicePixels } = settings;

        const views = this._getViews();

        return (
            <div style={{ backgroundColor: '#eeeeee' }}>
                <DeckGL
                    ref="deckgl"
                    id="default-deckgl-overlay"
                    layers={this._renderLayers()}
                    layerFilter={this._layerFilter}
                    views={views}
                    viewState={infovis ? orbitViewState : { ...mapViewState, position: [0, 0, 50] }}
                    onViewStateChange={this._onViewStateChange}
                    effects={effects ? this._effects : []}
                    pickingRadius={pickingRadius}
                    onLayerHover={this._onHover}
                    onLayerClick={this._onClick}
                    useDevicePixels={useDevicePixels}
                    debug={true}
                    drawPickingColors={drawPickingColors}
                >

                    <View id="basemap">
                        <StaticMap
                            key="map"
                            mapStyle="mapbox://styles/mapbox/light-v9"
                            mapboxApiAccessToken={MAPBOX_TOKEN || 'no_token'}
                        />
                        <ViewportLabel key="label">Map View</ViewportLabel>
                    </View>

                    <View id="first-person">
                        <ViewportLabel>First Person View</ViewportLabel>
                    </View>

                    <View id="infovis">
                        <ViewportLabel>Orbit View (PlotLayer only, No Navigation)</ViewportLabel>
                    </View>

                </DeckGL>
            </div>
        );
    }

    render() {
        const { settings, activeLayers, hoveredItem, clickedItem, queriedItems } = this.state;

        return (
            <div>
                {this._renderMap()}
                <div id="control-panel">
                    <div style={{ textAlign: 'center', padding: '5px 0 5px' }}>
                        <button onClick={this._onPickObjects}>
                            <b>Pick Objects</b>
                        </button>
                        <button
                            onClick={() =>
                                this.setState({ enableDepthPickOnClick: !this.state.enableDepthPickOnClick })
                            }
                        >
                            <b>Multi Depth Pick ({this.state.enableDepthPickOnClick ? 'ON' : 'OFF'})</b>
                        </button>
                    </div>
                    <LayerControls
                        title="Common Settings"
                        settings={settings}
                        onChange={this._onUpdateContainerSettings}
                    />
                    <LayerSelector
                        activeLayers={activeLayers}
                        layers={LAYER_CATEGORIES}
                        onToggleLayer={this._onToggleLayer}
                        onUpdateLayer={this._onUpdateLayerSettings}
                    />
                </div>
                <LayerInfo
                    ref="infoPanel"
                    hovered={hoveredItem}
                    clicked={clickedItem}
                    queried={queriedItems}
                />
            </div>
        );
    };
}