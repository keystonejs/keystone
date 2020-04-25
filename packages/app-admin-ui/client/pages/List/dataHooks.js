import { useEffect, useState, useCallback } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { pseudoLabelField } from './FieldSelect';
import { decodeSearch, encodeSearch } from './url-state';
import { useList } from '../../providers/List';

/**
 * Modifier Hook
 * ------------------------------
 * @returns {function} setSearch - Used for internal hooks to modify the URL
 */

export function useListModifier() {
  const history = useHistory();
  const location = useLocation();
  const { list, urlState, decodeConfig } = useList();

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
  const { decodeConfig } = useList();
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
    listData: { items },
    urlState: { search: searchValue },
  } = useList();
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
  const {
    urlState: { filters },
  } = useList();
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
    listData: { itemCount },
    urlState: { currentPage, pageSize },
  } = useList();
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
  const {
    urlState: { sortBy },
  } = useList();
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
  const {
    list,
    urlState: { fields },
  } = useList();
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

/**
 * Selection Hook
 * ------------------------------
 * @param {string} listKey - The key for the list to operate on.
 * @returns {[Object, Function]}
 * - fields - an array of the current columns
 * - onChange - the change handler for columns
 */

// NOTE: disable text selection
// ensures the browser receives the click event on our checkbox
const bodyUserSelect = val => {
  ['WebkitUserSelect', 'MozUserSelect', 'msUserSelect', 'userSelect'].forEach(k => {
    document.body.style[k] = val;
  });
};

export function useListSelect(items) {
  const [lastChecked, setLastChecked] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleKeyDown = () => {
    if (selectedItems.length > 0) bodyUserSelect('none');
  };
  const handleKeyUp = () => {
    if (selectedItems.length > 0) bodyUserSelect(null);
  };
  const shiftIsDown = useKeyDown('Shift', [handleKeyDown, handleKeyUp]);

  const onSelect = value => {
    let nextSelected = selectedItems.slice(0);

    if (Array.isArray(value)) {
      setSelectedItems(value);
    } else if (shiftIsDown && lastChecked) {
      const itemIds = items.map(i => i.id);
      const from = itemIds.indexOf(value);
      const to = itemIds.indexOf(lastChecked);
      const start = Math.min(from, to);
      const end = Math.max(from, to) + 1;

      itemIds
        .slice(start, end)
        .filter(id => id !== lastChecked)
        .forEach(id => {
          if (!nextSelected.includes(lastChecked)) {
            nextSelected = nextSelected.filter(existingId => existingId !== id);
          } else {
            nextSelected.push(id);
          }
        });

      const uniqueItems = [...new Set(nextSelected)]; // lazy ensure unique

      setLastChecked(value);
      setSelectedItems(uniqueItems);
    } else {
      if (nextSelected.includes(value)) {
        nextSelected = nextSelected.filter(existingId => existingId !== value);
      } else {
        nextSelected.push(value);
      }

      setLastChecked(value);
      setSelectedItems(nextSelected);
    }
  };

  // TODO: deal with this elsewhere
  // const deleteSelectedItems = () => {
  //   const { query } = this.props;
  //   if (query.refetch) query.refetch();
  //   setSelectedItems([]);
  // };

  return [selectedItems, onSelect];
}

/**
 * Key Down Hook
 * ------------------------------
 * @param {string} targetKey - The key to target e.g. 'Alt', or 'Shift'
 * @param {tuple} [keydownHandler, keyupHandler] - Optional event handlers
 * @returns {boolean} keyIsDown - whether or not the target key is down
 */

export function useKeyDown(targetKey, [keydownHandler, keyupHandler] = []) {
  const [keyIsDown, setKeyDown] = useState(false);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key !== targetKey) return;
      if (keydownHandler) keydownHandler(e);

      setKeyDown(true);
    };
    const handleKeyUp = e => {
      if (e.key !== targetKey) return;
      if (keyupHandler) keyupHandler(e);

      setKeyDown(false);
    };

    document.addEventListener('keydown', handleKeyDown, { isPassive: true });
    document.addEventListener('keyup', handleKeyUp, { isPassive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { isPassive: true });
      document.removeEventListener('keyup', handleKeyUp, { isPassive: true });
    };
  }, [keydownHandler, keyupHandler]);

  return keyIsDown;
}
