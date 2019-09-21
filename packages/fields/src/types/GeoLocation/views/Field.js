import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';
import { CheckboxPrimitive } from '@arch-ui/controls';
import { LocationIcon } from '@arch-ui/icons';
import GoogleMapReact from 'google-map-react';
import debounce from 'lodash.debounce';

class Maker extends Component {
  render = () => <LocationIcon />;
}
export default class TextField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMap: true,
      location: this.props.value || this.props.field.config.defaultCenter,
    };
  }

  onSubFieldChange = type => event => {
    const value = event.target.value;
    const { location } = this.state;
    location[type] = parseFloat(value.replace(/[^0-9.,]+/g, ''));
    this.setState({
      location,
    });
    this.props.onChange(location);
  };

  valueToString = value => {
    // Make the value a string to prevent loss of accuracy and precision.
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'number') {
      return String(value);
    } else {
      // If it is neither string nor number then it must be empty.
      return '';
    }
  };

  onDisplayMapChange = event => {
    this.setState({
      displayMap: event.target.checked,
    });
  };

  onMapClick = debounce(
    ({ lat, lng }) => {
      const location = { lat, lng };
      this.setState({
        location,
      });
      this.props.onChange(location);
    },
    400,
    { leading: false, trailing: true }
  );

  render() {
    const { autoFocus, field, value = {}, errors } = this.props;
    const { lng, lat } = value || defaultCenter;
    const { displayMap } = this.state;
    const { defaultCenter, defaultZoom, googleApiKey } = field.config;
    const htmlID = `ks-input-${field.path}`;
    const mapComponent = (
      <div style={{ height: '300px', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: googleApiKey }}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          onClick={this.onMapClick}
        >
          {lat && lng && <Maker lat={lat} lng={lng} />}
        </GoogleMapReact>
      </div>
    );
    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <FieldInput>
          <label>Latitude </label>
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="number"
            min="0"
            max="90"
            value={this.valueToString(lat)}
            onChange={this.onSubFieldChange('lat')}
            id={`${htmlID}['lat']`}
          />
        </FieldInput>
        <FieldInput>
          <label>Longitude </label>
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="number"
            min="0"
            max="180"
            value={this.valueToString(lng)}
            onChange={this.onSubFieldChange('lng')}
            id={`${htmlID}['lng']`}
          />
        </FieldInput>
        <CheckboxPrimitive checked={displayMap} onChange={this.onDisplayMapChange}>
          Show Map?
        </CheckboxPrimitive>
        {displayMap && mapComponent}
      </FieldContainer>
    );
  }
}
