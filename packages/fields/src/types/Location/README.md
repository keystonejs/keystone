<!--[meta]
section: api
subSection: field-types
title: Location
[meta]-->

# Location

The Location Field Type enables storing data from the Google Maps API.

## Usage

```javascript
const { Location } = require('@keystonejs/fields');
const { Keystone } = require('@keystonejs/keystone');

const keystone = new Keystone({...});

keystone.createList('Event', {
  fields: {
    venue: {
      type: Location,
      googleMapsKey: 'GOOGLE_MAPS_KEY',
    },
  },
});
```

## GraphQL

```graphql
query {
  allEvents {
    venue {
      id
      googlePlaceID
      formattedAddress
      lat
      lng
    }
  }
}
```

Will yield:

```javascript
{
  "data": {
    "allEvents": [
      {
        "venue": {
          "id": "1",
          "googlePlaceID": "ChIJOza7MD-uEmsRrf4t12uji6Y",
          "formattedAddress": "10/191 Clarence St, Sydney NSW 2000, Australia",
          "lat": -33.869374,
          "lng": 151.205097
        }
      }
    ]
  }
}
```

### Mutations

To create a `Location`, pass the Google `place_id` for the desired field path.

```graphql
mutation {
  createEvent(data: { venue: "ChIJOza7MD-uEmsRrf4t12uji6Y" }) {
    venue {
      id
      googlePlaceID
      formattedAddress
      lat
      lng
    }
  }
}
```

Results in:

```javascript
{
  "createEvent": {
    "venue": {
      "id": "1",
      "googlePlaceID": "ChIJOza7MD-uEmsRrf4t12uji6Y",
      "formattedAddress": "10/191 Clarence St, Sydney NSW 2000, Australia",
      "lat": -33.869374,
      "lng": 151.205097
    }
  }
}
```
