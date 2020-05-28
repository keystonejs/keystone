import { useCallback, useMemo } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { pseudoLabelField } from './FieldSelect';
import { decodeSearch, encodeSearch } from './url-state';
import { useList } from '../../providers/List';

/**
 * URL State Hook
 * ------------------------------
 * @param {Object} list - The the list to operate on.
 * @returns {Object}
 * - decodeConfig - config necessary to decode url state
 * - urlState - the current list state decoded from from the URL
 */

// type UrlState = {
//  currentPage: number,
//  fields: Array<FieldController>,
//  filters: Array<Object>,
//  pageSize: number,
//  search: string,
//  sortBy: SortBy,
// };
// type DecodeConfig = {
//  history: HistoryInterface,
//  list: ListMeta,
//  location: LocationInterface,
//  match: MatchInterface,
// };

export function useListUrlState(list) {
  const location = useLocation();

  const decodeConfig = { list };
  const urlState = useMemo(() => decodeSearch(location.search, decodeConfig), [location.search]);

  return { decodeConfig, urlState };
}

/**
 * Modifier Hook
 * ------------------------------
 * @returns {function} setSearch - Used for internal hooks to modify the URL
 */

export function useListModifier() {
  const history = useHistory();
  const location = useLocation();
  const { list } = useList();
  const { urlState, decodeConfig } = useListUrlState(list);

  /**
   * setSearch
   * ------------------------------
   * @param {string} changes - configuration object
   * @param {boolean} addHistoryRecord - whether to add an item to history, or not
   * @returns {undefined}
   */
  return function setSearch(changes, addHistoryRecord = true) {
    let overrides = {};

    // NOTE: some changes should reset the currentPage number to 1.
    // eg: typing in the search box or changing filters
    const resetsCurrentPage = ['search', 'pageSize', 'filters'];
    if (Object.keys(changes).some(k => resetsCurrentPage.includes(k))) {
      overrides.currentPage = 1;
    }

    // encode the new search string
    const encodedSearch = encodeSearch({ ...urlState, ...changes, ...overrides }, decodeConfig);
    const newLocation = { ...location, search: encodedSearch };

    list.setPersistedSearch(encodedSearch);

    if (addHistoryRecord) {
      history.push(newLocation);
    } else {
      history.replace(newLocation);
    }
  };
}

/**
 * Reset Hook
 * ------------------------------
 * @returns {Function} - The function to reset url state
 */

export function useReset() {
  const { list } = useList();
  const { decodeConfig } = useListUrlState(list);
  const setSearch = useListModifier();

  return () => setSearch(decodeSearch('', decodeConfig));
}

/**
 * Search Hook
 * ------------------------------
 * @returns {Object}
 * - searchValue - the current search string
 * - onChange - change the current search
 * - onClear - clear the current search
 * - onSubmit - commit the current search to history and update the URL
 */

export function useListSearch() {
  const {
    list,
    listData: { items },
  } = useList();
  const {
    urlState: { search: searchValue },
  } = useListUrlState(list);
  const setSearch = useListModifier();

  const history = useHistory();
  const match = useRouteMatch();

  const onChange = useCallback(
    newSearch => {
      const addHistoryRecord = !searchValue;
      setSearch({ search: newSearch }, addHistoryRecord);
    },
    [searchValue]
  );

  const onClear = useCallback(() => {
    const addHistoryRecord = !!searchValue;
    setSearch({ search: '' }, addHistoryRecord);
  }, [searchValue]);

  const onSubmit = event => {
    if (event) {
      event.preventDefault();
    }

    // FIXME: This seems likely to do the wrong thing if data is not yet loaded.
    if (items.length === 1) {
      history.push(`${match.url}/${items[0].id}`);
    }
  };

  return {
    searchValue,
    onChange,
    onClear,
    onSubmit,
  };
}

/**
 * Filter Hook
 * ------------------------------
 * @returns {Object}
 * - filters - the active filter array
 * - onRemove - remove a given filter
 * - onRemoveAll - clear all filters
 * - onAdd - add a filter
 * - onUpdate - update a filter
 */

// type Filters = Array<{
//   field: FieldController,
//   label: string,
//   path: string,
//   type: string,
//   value: any,
// }>

export function useListFilter() {
  const { list } = useList();
  const {
    urlState: { filters },
  } = useListUrlState(list);
  const setSearch = useListModifier();

  const onRemove = value => () => {
    const newFilters = filters.filter(f => {
      return !(f.field.path === value.field.path && f.type === value.type);
    });
    setSearch({ filters: newFilters });
  };

  const onRemoveAll = () => {
    setSearch({ filters: [] });
  };

  const onAdd = value => {
    filters.push(value);
    setSearch({ filters });
  };

  const onUpdate = updatedFilter => {
    const updateIndex = filters.findIndex(i => {
      return i.field.path === updatedFilter.field.path && i.type === updatedFilter.type;
    });

    filters.splice(updateIndex, 1, updatedFilter);
    setSearch({ filters });
  };

  return { filters, onRemove, onRemoveAll, onAdd, onUpdate };
}

/**
 * Pagination Hook
 * ------------------------------
 * @returns {Object}
 * - data - the pagination data
 * - onChange - change the current page
 * - onChangeSize - change the page size
 * - onReset - reset to the first page
 */

// type PaginationData = {
//   currentPage: number,
//   isLoading: boolean,
//   itemCount: numnber,
//   pageSize: numnber,
// }

export function useListPagination() {
  const {
    list,
    listData: { itemCount },
  } = useList();
  const {
    urlState: { currentPage, pageSize },
  } = useListUrlState(list);
  const setSearch = useListModifier();

  const onChange = cp => {
    setSearch({ currentPage: cp });
  };

  const onChangeSize = ps => {
    setSearch({ pageSize: ps });
  };

  return {
    data: {
      currentPage: currentPage,
      itemCount: itemCount,
      pageSize: pageSize,
    },
    onChange,
    onChangeSize,
  };
}

/**
 * Sort Hook
 * ------------------------------
 * @returns {[Object, Function]}
 * - sortBy - the sort config object
 * - onChange - the change handler for sorting
 */

// type SortBy = {
//   direction: 'ASC' | 'DESC',
//   field: { label: string, path: string },
// };

export function useListSort() {
  const { list } = useList();
  const {
    urlState: { sortBy },
  } = useListUrlState(list);
  const setSearch = useListModifier();

  const onChange = sb => {
    setSearch({ sortBy: sb });
  };

  return [sortBy, onChange];
}

/**
 * Column Hook
 * ------------------------------
 * @returns {[Object, Function]}
 * - fields - an array of the current columns
 * - onChange - the change handler for columns
 */

// type Fields = Array<FieldController>;

export function useListColumns() {
  const { list } = useList();
  const {
    urlState: { fields },
  } = useListUrlState(list);
  const setSearch = useListModifier();

  const onChange = selectedFields => {
    // Ensure that the displayed fields maintain their original sortDirection
    // when they're added/removed
    const newFields = [pseudoLabelField]
      .concat(list.fields)
      .filter(field => selectedFields.some(selectedField => selectedField.path === field.path));

    setSearch({ fields: newFields });
  };

  return [fields, onChange];
}
