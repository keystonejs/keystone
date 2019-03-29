import { useContext, useEffect, useMemo, useState } from 'react';
import { __RouterContext as RouterContext } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { useQuery } from 'react-apollo-hooks';

import { deconstructErrorsToDataShape } from '../../util';
import { pseudoLabelField } from './FieldSelect';
import { decodeSearch, encodeSearch } from './url-state';
import { useAdminMeta } from '../../providers/AdminMeta';

// ==============================
// Interim Measures
// ==============================

/*
 Use the provided API when these libs have hooks ready
*/

// FIXME: react-router-dom
// https://github.com/ReactTraining/react-router

export function useRouter() {
  return useContext(RouterContext);
}

// ==============================
// Primary Hook
// ==============================

/*
this is what the data provider had access to
type Props = {
  adminMeta: AdminMeta,
  history: Object,
  list: Object,
  location: Object,
  match: Object,
};
*/

export function useListData(listKey) {
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const routeInfo = useRouter();
  const { history, location, match } = routeInfo;

  // Get the current list
  const { getListByKey } = useAdminMeta();
  const list = getListByKey(listKey);

  // Query prep
  const decodeConfig = { ...routeInfo, list };
  const searchState = decodeSearch(location.search, decodeConfig);
  const { currentPage, fields, filters, pageSize, search, sortBy } = searchState;
  const orderBy = `${sortBy.field.path}_${sortBy.direction}`;
  const first = pageSize;
  const skip = (currentPage - 1) * pageSize;

  // Get and store items
  const query = list.getQuery({ fields, filters, search, orderBy, skip, first });
  const { data, error, loading, refetch } = useQuery(query);

  useEffect(() => {
    const maybeItems = data && data[list.gqlNames.listQueryName]; // NOTE: this feels wrong...

    setItems(maybeItems);
    setItemCount((maybeItems && maybeItems.count) || 0);
  }, [listKey]);

  // get errors
  const itemErrors = deconstructErrorsToDataShape(error)[list.gqlNames.listQueryName] || [];

  // Search
  // ------------------------------

  const handleSearchChange = debounce(newSearch => {
    const addHistoryRecord = !search;
    setSearch({ search: newSearch }, addHistoryRecord);
  }, 300);

  const handleSearchClear = () => {
    const addHistoryRecord = !!search;
    setSearch({ search: '' }, addHistoryRecord);
  };
  const handleSearchSubmit = () => {
    // FIXME: This seems likely to do the wrong thing if data is not yet loaded.
    if (items.length === 1) {
      history.push(`${match.url}/${items[0].id}`);
    }
  };

  // Filters
  // ------------------------------

  const handleFilterRemove = value => () => {
    const newFilters = filters.filter(f => {
      return !(f.field.path === value.field.path && f.type === value.type);
    });
    setSearch({ filters: newFilters });
  };
  const handleFilterRemoveAll = () => {
    setSearch({ filters: [] });
  };
  const handleFilterAdd = value => {
    filters.push(value);
    setSearch({ filters });
  };
  const handleFilterUpdate = updatedFilter => {
    const updateIndex = filters.findIndex(i => {
      return i.field.path === updatedFilter.field.path && i.type === updatedFilter.type;
    });

    filters.splice(updateIndex, 1, updatedFilter);
    setSearch({ filters });
  };

  // Columns
  // ------------------------------

  const handleFieldChange = selectedFields => {
    // Ensure that the displayed fields maintain their original sortDirection
    // when they're added/removed
    const newFields = [pseudoLabelField]
      .concat(list.fields)
      .filter(field => selectedFields.some(selectedField => selectedField.path === field.path));

    // Reset `sortBy` if we were ordering by a field which has been removed.
    const newSort = newFields.includes(sortBy.field)
      ? sortBy
      : { ...sortBy, field: newFields.filter(field => field !== pseudoLabelField)[0] };
    setSearch({ fields: newFields, sortBy: newSort });
  };

  // Sorting
  // ------------------------------

  const handleSortChange = sb => {
    setSearch({ sortBy: sb });
  };

  // Pagination
  // ------------------------------

  const handlePageChange = cp => {
    setSearch({ currentPage: cp });
  };
  const handlePageReset = () => {
    setSearch({ currentPage: 1 });
  };
  const handlePageSizeChange = ps => {
    setSearch({ pageSize: ps });
  };

  // Utils
  // ------------------------------

  const setSearch = (changes, addHistoryRecord = true) => {
    let overrides = {};

    // NOTE: some changes should reset the currentPage number to 1.
    // eg: typing in the search box or changing filters
    const resetsCurrentPage = ['search', 'pageSize', 'filters'];
    if (Object.keys(changes).some(k => resetsCurrentPage.includes(k))) {
      overrides.currentPage = 1;
    }

    // encode the new search string
    const encodedSearch = encodeSearch(
      {
        ...searchState,
        ...changes,
        ...overrides,
      },
      this.props
    );

    const newLocation = { ...location, search: encodedSearch };

    list.setPersistedSearch(encodedSearch);

    // Do we want to add an item to history or not
    if (addHistoryRecord) {
      history.push(newLocation);
    } else {
      history.replace(newLocation);
    }
  };

  const handleReset = () => {
    setSearch(decodeSearch('', decodeConfig));
  };

  return {
    query: { data, error, loading, refetch },
    itemErrors,
    data: {
      currentPage,
      fields,
      filters,
      items,
      // itemCount,
      pageSize,
      search,
      skip,
      sortBy,
    },
    handleSearchChange,
    handleSearchClear,
    handleSearchSubmit,
    handleFilterRemove,
    handleFilterRemoveAll,
    handleFilterAdd,
    handleFilterUpdate,
    handleFieldChange,
    handleSortChange,
    handlePageChange,
    handlePageReset,
    handlePageSizeChange,
    handleReset,
  };
}

// ==============================
// Search Hooks
// ==============================

export const useListSearch = listKey => {
  const { handleSearchChange, handleSearchClear, handleSearchSubmit } = useListData(listKey);

  return {
    handleChange: handleSearchChange,
    handleClear: handleSearchClear,
    handleSubmit: handleSearchSubmit,
  };
};

// ==============================
// Filter Hooks
// ==============================

export const useListFilter = listKey => {
  const {
    handleFilterRemove,
    handleFilterRemoveAll,
    handleFilterAdd,
    handleFilterUpdate,
  } = useListData(listKey);

  return {
    handleRemove: handleFilterRemove,
    handleRemoveAll: handleFilterRemoveAll,
    handleAdd: handleFilterAdd,
    handleUpdate: handleFilterUpdate,
  };
};

// ==============================
// Pagination Hooks
// ==============================

export const useListPagination = listKey => {
  const { handlePageChange, handlePageReset, handlePageSizeChange } = useListData(listKey);

  return {
    handleChange: handlePageChange,
    handleReset: handlePageReset,
    handleSizeChange: handlePageSizeChange,
  };
};
