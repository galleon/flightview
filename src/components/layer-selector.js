import React, {PureComponent} from 'react';
import LayerControls from './layer-controls';
import PropTypes from 'prop-types';

const propTypes = {
  layers: PropTypes.object,
  activeLayers: PropTypes.object,
  onToggleLayer: PropTypes.func.isRequired,
  onUpdateLayer: PropTypes.func.isRequired
};

export default class LayerSelector extends PureComponent {
  _renderLayerButton(layerName, source) {
    const {activeLayers} = this.props;

    const settings = activeLayers[layerName];

    return (
      <div key={layerName}>
        <div className="checkbox">
          <input
            type="checkbox"
            id={layerName}
            checked={Boolean(settings)}
            onChange={() => this.props.onToggleLayer(layerName, source)}
          />
          <label htmlFor={layerName}>
            <span>{layerName}</span>
          </label>
        </div>

        {settings && (
          <LayerControls
            settings={settings}
            layer={source.layer}
            propTypes={source.propTypes}
            onChange={this.props.onUpdateLayer.bind(this, layerName)}
          />
        )}
      </div>
    );
  }

  _renderLayerCategories(layers) {
    return Object.keys(layers).map(categoryName => {
      const category = layers[categoryName];
      return (
        <div key={categoryName}>
          <h4>{categoryName}</h4>
          {Object.keys(category).map(layerName =>
            this._renderLayerButton(layerName, category[layerName])
          )}
        </div>
      );
    });
  }

  render() {
    return (
      <div className="layer-selector">{this._renderLayerCategories(this.props.layers)}</div>
    );
  }
}

LayerSelector.propTypes = propTypes;
