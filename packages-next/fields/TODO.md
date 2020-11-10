# General

- [ ] Review types for defaultValue across all fields
- [ ] Review types for hooks, specifically including GraphQLInput

# Field Types

## Password

- [x] Add Password Field

## Select

- [x] Add Select Field
- [x] Current UI with a Select
- [x] New UI Mode with a SegmentedControl

## Relationship

- [x] Make a functional Relationship Field UI as per the current Relationship field (i.e just a select)

# Date / Time Types Reboot

- [ ] Talk about aligning the naming of these with temporal

## Timestamp

The current `DateTimeUtc` type; a point in time; effectively a datetime at UTC and/or epoch

- [ ] Add a Timestamp Field
- [ ] Add DatePicker and TimePicker components to the Design System

## Timezone

Basically a preconfigured select. See <https://github.com/keystonejs/keystone/issues/2937>

- [ ] Add Timezone Field
- [ ] Allow formatting date input in the field resolver (see <https://date-fns.org/v2.0.0-alpha.27/docs/Time-Zones>)

## LocalDateTime

Combines both Timestamp and Timezone into a single field. See <https://github.com/keystonejs/keystone/issues/2938>

- [ ] Add a LocalDateTime field type
- [ ] Allow formatting the date in the field resolver (see <https://date-fns.org/v2.0.0-alpha.27/docs/Time-Zones>)

## CalendarDay

As per the current implementation

- [ ] Add a CalendarDay field type

## Time

New field type for storing a time of day.

> It would be nice to capture the intent of "this time of day, every day, regardless of time zone or offset" in a type.
> I imagine we'd store it as per the time part of an ISO 8601 string (ie. HH:mm:ss.nnn) with millisecond precision.
> – <https://github.com/keystonejs/keystone/issues/46#issuecomment-413743564>

- [ ] Write up the spec in an issue
- [ ] Add a Time field type
