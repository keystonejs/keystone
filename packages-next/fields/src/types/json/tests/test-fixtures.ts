import { ProviderName } from '@keystone-next/test-utils-legacy';
import { json } from '..';

export const name = 'Text';
export const typeFunction = json;
export const exampleValue = () => '{"name":"value", "number": 123.45}';
export const exampleValue2 = () => `
{
    "glossary": {
        "title": "example glossary",
		"GlossDiv": {
            "title": "S",
			"GlossList": {
                "GlossEntry": {
                    "ID": "SGML",
					"SortAs": "SGML",
					"GlossTerm": "Standard Generalized Markup Language",
					"Acronym": "SGML",
					"Abbrev": "ISO 8879:1986",
					"GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
						"GlossSeeAlso": ["GML", "XML"]
                    },
					"GlossSee": "markup"
                }
            }
        }
    }
}`;
export const supportsUnique = true;
export const fieldName = 'testField';

export const getTestFields = () => ({ name: json(), testField: json() });

export const initItems = () => {
  return [
    { name: 'a', testField: '' },
    { name: 'b', testField: '{}' },
    { name: 'c', testField: '{"name":"value", "number": 123.45}' },
    { name: 'd', testField: null },
    { name: 'e' },
  ];
};

export const storedValues = () => [
  { name: 'a', testField: '' },
  { name: 'b', testField: '{}' },
  { name: 'c', testField: '{"name":"value", "number": 123.45}' },
  { name: 'd', testField: null },
  { name: 'e' },
];

export const supportedFilters = (provider: ProviderName) => [
  'null_equality',
  'equality',
  provider !== 'sqlite' && 'equality_case_insensitive',
  'in_empty_null',
  'in_value',
  provider !== 'sqlite' && 'string',
  provider !== 'sqlite' && 'string_case_insensitive',
];
