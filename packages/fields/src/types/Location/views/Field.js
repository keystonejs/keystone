/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import Select from '@arch-ui/select';
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';

const LocationField = ({ field, value, errors, onChange, google, renderContext, isDisabled }) => {
  const { googlePlaceID, formattedAddress, lat, lng } = { ...value };
  const htmlID = `ks-input-${field.path}`;
  const autocompleteService = new google.maps.places.AutocompleteService();
  const geocoder = new google.maps.Geocoder();
  const { addToast } = useToasts();
  const [inputValue, setInputValue] = useState(
    googlePlaceID ? { label: formattedAddress, value: googlePlaceID } : null
  );
  const [marker, setMarker] = useState(lat && lng ? { lat, lng } : null);

  const handleOptionChange = option => {
    if (!option) {
      onChange(null);
      setMarker(null);
      setInputValue(null);
      return;
    }

    const placeId = option.value;

    geocoder.geocode({ placeId }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          const {
            formatted_address,
            geometry: {
              location: { lat, lng },
            },
          } = results[0];
          setInputValue({ label: formatted_address, value: placeId });
          setMarker({ lat: lat(), lng: lng() });
          onChange(placeId);
        }
      } else {
        addToast('Could not find the provided location.', {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    });
  };

  const loadOptions = inputValue =>
    new Promise(resolve => {
      autocompleteService.getPlacePredictions({ input: inputValue }, results => {
        if (results) {
          resolve(
            results.map(({ description, place_id }) => ({
              label: description,
              value: place_id,
            }))
          );
        }
        resolve(null);
      });
    });

  const selectProps =
    renderContext === 'dialog'
      ? {
          menuPortalTarget: document.body,
          menuShouldBlockScroll: true,
        }
      : null;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
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
          isDisabled={isDisabled}
          {...selectProps}
        />
        {marker && (
          <div css={{ position: 'relative', height: '14rem', marginTop: '1rem' }}>
            <Map google={google} initialCenter={marker} center={marker} zoom={16}>
              <Marker position={marker} />
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
