/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useRef, useEffect } from 'react';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Popout from '@arch-ui/popout';
import { Input } from '@arch-ui/input';
import SketchPicker from 'react-color/lib/Sketch';

import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';

const ColorField = ({ field, value: serverValue, errors, onChange, google }) => {
  const value = serverValue || '';
  const htmlID = `ks-input-${field.path}`;

  const [options, setOptions] = useState(null);
  const [inputValue, setInputvalue] = useState(value);
  const [marker, setMarker] = useState(null);

  const autocompleteService = new google.maps.places.AutocompleteService();
  const geocoder = new google.maps.Geocoder();

  useEffect(() => {
    autocompleteService.getPlacePredictions({ input: inputValue }, results => {
      setOptions(results);
    });
  }, [inputValue]);

  const handleOptionClick = ({ id, description, place_id, reference }) => {
    geocoder.geocode({ placeId: place_id }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          const { lat, lng } = results[0].geometry.location;
          setMarker({ lat: lat(), lng: lng() });
          console.log(results[0]);
          // infowindow.setContent();
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });

    setOptions(null);
    // onChange(JSON.stringify({ id, description, place_id, reference }));
  };

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldInput>
        <div>
          <Input onChange={e => setInputvalue(e.target.value)} />
          {options &&
            options.map((option, index) => (
              <div key={index} onClick={() => handleOptionClick(option)}>
                {option.structured_formatting.main_text}{' '}
                {option.structured_formatting.secondary_text}
              </div>
            ))}
          {marker && (
            <div style={{ width: 500, height: 250 }}>
              <Map
                style={{ width: 500, height: 250 }}
                google={google}
                initialCenter={marker}
                center={marker}
                zoom={16}
              >
                {marker && <Marker position={marker} />}
              </Map>
            </div>
          )}
        </div>
      </FieldInput>
    </FieldContainer>
  );
};

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDml6rqKwjgQgPomyAhC-WxVt4aLodlraU',
})(ColorField);
