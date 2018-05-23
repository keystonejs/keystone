Breville
========

## The endpoints

See below the GraphQL queries for each step of the application.

### Ingredients

#### Chose ingredient

```graphql
{
  allAnswers {
    ingredient {
      name
    }
  }
}
```

#### Chose technique

```graphql
{
  allAnswers(where: { ingredient: { name: "Beef" } }) { # replace `Beef` with the selection made earlier
    ingredient {
      name
    }
  }
}
```


### Technique

#### Chose technique

```graphql
{
  allAnswers {
    technique {
      name
    }
  }
}
```

#### Chose ingredient

```graphql
{
  allAnswers(where: { technique: { name: "Deep Fry" } }) { # replace `Deep Fry` with the selection made earlier
    ingredient {
      name
    }
  }
}
```


### Doneness

#### Chose ingredient

```graphql
{
  allAnswers {
    ingredient {
      name
    }
  }
}
```

#### Chose technique

```graphql
{
  allAnswers(where: { ingredient: { name: "Beef" } }) { # replace `Beef` with the selection made earlier
    ingredient {
      name
    }
  }
}
```

#### Chose doneness

```graphql
{
  allAnswers(where: { ingredient: { name: "Beef" }, technique: { name: "Deep Fry" }, ingredient_not: "" }) { # replace `Beef` and `Deep Fry` with the selections made earlier
    ingredient {
      name
    }
  }
}
```
