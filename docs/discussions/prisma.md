<!--[meta]
section: discussions
title: Prisma
[meta]-->

# Prisma

## Field types

## Supported field types

| Name                 |         Prisma Type         | Core | Filter | Required | Unique | Notes                                                                                                                                                       |
| :------------------- | :-------------------------: | :--: | :----: | :------: | :----: | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core**             |                             |      |        |          |        |                                                                                                                                                             |
| `CalendarDay`        |          `DateTime`         |   ✅  |    ✅   |     ✅    |    ✅   |                                                                                                                                                             |
| `Checkbox`           |          `Boolean`          |   ✅  |    ✅   |     ✅    |   ☑️   |                                                                                                                                                             |
| `DateTime`           |    `DateTime` + `String`    |   ✅  |    ✅   |     ✅    |    ✅   |                                                                                                                                                             |
| `DateTimeUtc`        |          `DateTime`         |   ✅  |    ✅   |     ✅    |    ✅   |                                                                                                                                                             |
| `Decimal`            |            `N/A`            |   �  |    �   |     �    |    �   | Prisma does not currently support a decimal database type (<https://github.com/prisma/prisma/issues/3374>) (<https://github.com/prisma/prisma/issues/3447>) |
| `File`               |            `Json`           |   ?  |    �   |     ✅    |   ☑️   | <https://github.com/prisma/prisma/issues/3579> \|                                                                                                           |
| `Float`              |           `Float`           |   ✅  |    ✅   |     ✅    |    ✅   |                                                                                                                                                             |
| `Integer`            |            `Int`            |   ✅  |    ✅   |     ✅    |    ✅   |                                                                                                                                                             |
| `Password`           |           `String`          |   ?  |    ✅   |     ✅    |   ☑️   | Need to be able to check for a regex                                                                                                                        |
| `Relationship`       |         `@relation`         |   ✅  |    ✅   |    ☑️    |   ☑️   |                                                                                                                                                             |
| `Select`             | `Enum` \| `Int` \| `String` |   ✅  |    ✅   |     ✅    |    ✅   |                                                                                                                                                             |
| `Slug`               |           `String`          |   ✅  |    ✅   |     ✅    |    ✅   |                                                                                                                                                             |
| `Text`               |           `String`          |   ✅  |    ✅   |     ✅    |    ✅   | ~~<https://github.com/prisma/prisma-client-js/issues/690>~~ \|                                                                                              |
| `Url`                |           `String`          |   ✅  |    ✅   |     ✅    |    ✅   | ~~<https://github.com/prisma/prisma-client-js/issues/690>~~ \|                                                                                              |
| `Uuid`               |           `String`          |   ?  |    ✅   |     ✅    |    ✅   | We have used a `String` here for now, but we should really work out how to get an actual `uuid` column                                                      |
| `Virtual`            |              ☑️             |  ☑️  |   ☑️   |    ☑️    |   ☑️   |                                                                                                                                                             |
| **Extra**            |                             |      |        |          |        |                                                                                                                                                             |
| `Color`              |           `String`          |   ✅  |    ✅   |     ✅    |    ✅   | ~~<https://github.com/prisma/prisma-client-js/issues/690>~~                                                                                                 |
| `Content`            |         `@relation`         |   ✅  |    ✅   |    ☑️    |   ☑️   |                                                                                                                                                             |
| `AuthedRelationship` |         `@relation`         |   ✅  |    ✅   |    ☑️    |   ☑️   |                                                                                                                                                             |
| `AutoIncrement`      |            `Int`            |   ✅  |    ✅   |     ✅    |    ✅   |                                                                                                                                                             |
| `CloudinaryImage`    |            `Json`           |   ?  |    ?   |     ?    |   ☑️   |                                                                                                                                                             |
| `GoogleLocation`     |            `Json`           |   ?  |    ?   |     ✅    |   ☑️   |                                                                                                                                                             |
| `Markdown`           |           `String`          |   ✅  |    ✅   |     ✅    |    ✅   | ~~<https://github.com/prisma/prisma-client-js/issues/690>~~ \|                                                                                              |
| `MongoId`            |           `String`          |   ✅  |    ✅   |     ✅    |    ✅   |                                                                                                                                                             |
| `OEmbed`             |            `Json`           |   ?  |    ?   |     ?    |   ☑️   |                                                                                                                                                             |
| `Unsplash`           |            `Json`           |   ?  |    ?   |     ?    |   ☑️   |                                                                                                                                                             |
| `Wysiwyg`            |           `String`          |   ✅  |    ✅   |     ✅    |    ✅   |                                                                                                                                                             |
