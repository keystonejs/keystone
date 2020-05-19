import React, { useState, useEffect, forwardRef, useRef } from 'react';
import chrono from 'chrono-node';
import { Input } from '@arch-ui/input';
import { format, formatISO, parseISO } from 'date-fns';

export const TextDayPicker = forwardRef(
  ({ date = '', onChange, format: displayFormat = 'do MMMM yyyy', ...props }, ref) => {
    const formatDate = newDate => (newDate ? format(parseISO(newDate), displayFormat) : '');

    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState({
      raw: date,
      formatted: formatDate(date),
    });

    const parseCache = useRef();

    useEffect(() => {
      // Parse the raw input. This may be a string such as 'Today'.
      const parsedDate = chrono.parseDate(value.raw);

      // If valid, convert it to ISO 8601.
      const isoDate = parsedDate ? formatISO(parsedDate, { representation: 'date' }) : null;

      // Pass it up the tree. The parent can handle the null case.
      onChange(isoDate);

      parseCache.current = isoDate;
    }, [value.raw]);

    const onFocus = () => {
      setIsEditing(true);
    };

    const onBlur = () => {
      setIsEditing(false);

      const raw = parseCache.current;

      // At this point, the parse cache should either be null or an ISO 8601 date.
      if (raw) {
        setValue({ raw, formatted: formatDate(raw) });
      } else {
        setValue({ raw: '', formatted: '' });
      }
    };

    const handleChange = ({ target: { value: raw } }) => {
      setValue(oldValue => ({ ...oldValue, raw }));
    };

    return (
      <Input
        ref={ref}
        value={isEditing ? value.raw : value.formatted}
        placeholder="Enter a date..."
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
