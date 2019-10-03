<!--[meta]
section: api
subSection: field-types
title: Location
[meta]-->

# Color

## Usage

```js
keystone.createList('Event', {
  fields: {
    location: {
      type: Location,
      googleMapsKey: 'GOOGLE_MAPS_API_KEY',
    },
    // ...
  },
});
```

## Querying

```
allEvents {
  location {
    id
    googlePlaceID
    formattedAddress
    lat
    lng
  }
}
```
