/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Select from '@arch-ui/select';
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';

const LocationField = ({ field, value: serverValue, errors, onChange, google, renderContext }) => {
  const htmlID = `ks-input-${field.path}`;
  const { googlePlaceID, formattedAddress } = serverValue || {};
  const autocompleteService = new google.maps.places.AutocompleteService();
  const geocoder = new google.maps.Geocoder();

  const [inputValue, setInputvalue] = useState(
    googlePlaceID ? { label: formattedAddress, value: googlePlaceID } : null
  );
  const [marker, setMarker] = useState(null);

  const handleOptionChange = option => setInputvalue(option);

  useEffect(() => {
    if (!inputValue) {
      onChange(null);
      setMarker(null);
      return;
    }
    geocoder.geocode({ placeId: inputValue.value }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          const { lat, lng } = results[0].geometry.location;
          setMarker({ lat: lat(), lng: lng() });
          onChange(inputValue.value);
        } else {
          // window.alert('No results found');
        }
      } else {
        // window.alert('Geocoder failed due to: ' + status);
      }
    });
  }, [inputValue]);

  const selectProps =
    renderContext === 'dialog'
      ? {
          menuPortalTarget: document.body,
          menuShouldBlockScroll: true,
        }
      : null;

  const loadOptions = inputValue =>
    new Promise(resolve => {
      autocompleteService.getPlacePredictions({ input: inputValue }, results => {
        resolve(
          results.map(result => ({
            label:
              result.structured_formatting.main_text +
              ' ' +
              result.structured_formatting.secondary_text,
            value: result.place_id,
          }))
        );
      });
    });

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldInput css={{ flexDirection: 'column' }}>
        <Select
          isAsync
          isClearable
          cacheOptions
          placeholder="Search for a location ..."
          value={inputValue}
          onChange={handleOptionChange}
          loadOptions={loadOptions}
          id={`react-select-${htmlID}`}
          inputId={htmlID}
          instanceId={htmlID}
          css={{ width: '100%' }}
          {...selectProps}
        />
        {marker && (
          <div css={{ position: 'relative', height: '14rem', marginTop: '1rem' }}>
            <Map google={google} initialCenter={marker} center={marker} zoom={16}>
              {marker && <Marker position={marker} />}
            </Map>
          </div>
        )}
      </FieldInput>
    </FieldContainer>
  );
};

export default GoogleApiWrapper(props => ({
  apiKey: props.field.config.googleMapsKey,
}))(LocationField);
