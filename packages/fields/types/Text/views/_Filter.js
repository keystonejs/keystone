// @flow

// type TextFilterValue = {
//   field: string,
//   type:
//     | 'contains'
//     | 'not_contains'
//     | 'is'
//     | 'not'
//     | 'starts_with'
//     | 'not_starts_with'
//     | 'ends_with'
//     | 'not_ends_with',
//   value: string,
// };

/*
example activeFilters = [
  { field: 'name', type: 'starts_with', value: 'J' },
  { field: 'name', type: 'ends_with', value: 'n' },
];
*/

type FieldType = {
  path: string,
  label: string,
  type: string,
};

type FilterType = {
  label: string,
  getInitialValue: () => string,
  type:
    | 'contains'
    | 'not_contains'
    | 'is'
    | 'not'
    | 'starts_with'
    | 'not_starts_with'
    | 'ends_with'
    | 'not_ends_with',
};

type FilterValue = string;

type Props = {
  field: FieldType,
  filter: FilterType,
  onChange: FilterValue => undefined,
  value: FilterValue,
};

class AddTextFilter extends Component<Props> {
  // constructor(props) {
  //   super(props);
  //
  //   const activeFilters = props.activeFilters.filter(
  //     i => i.field === props.field.path
  //   );
  //   const filterIsActive = filter =>
  //     activeFilters.filter(i => i.type === filter.type).length > 0;
  //   const inactiveFilters = filterTypes.filter(i => !filterIsActive(i));
  //   this.filterTypes = filterTypes.map(type => ({
  //     ...type,
  //     isDisabled: filterIsActive(type),
  //   }));
  //
  //   this.state = {
  //     selectedFilter: inactiveFilters[0],
  //     showInvertedFilters: false,
  //     inputValue: '',
  //   };
  // }

  render() {
    const { onChange, value } = this.props;
    return (
      <Fragment>
        <Input value={value} onChange={e => onChange(e.target.value)} />
      </Fragment>
    );
  }
}
