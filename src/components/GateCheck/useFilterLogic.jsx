import { useEffect } from 'react';

const useFilterLogic = (state, dataFetching) => {
  const {
    visitors,
    recurringVisitors,
    showRecurring,
    setFilteredVisitors,
    searchTerm,
    filterStatus,
    filterType,
    filterCategory,
    refreshTrigger
  } = state;

  const { applyFilters, fetchVisitors, fetchVisitorCounts, autoRefresh } = dataFetching;

  useEffect(() => {
    if (!showRecurring && visitors.length >= 0) {
      const filtered = applyFilters(visitors);
      setFilteredVisitors(filtered);
    }
  }, [visitors, showRecurring, applyFilters, setFilteredVisitors]);

  useEffect(() => {
    if (showRecurring && recurringVisitors.length >= 0) {
      const filtered = applyFilters(recurringVisitors);
      setFilteredVisitors(filtered);
    }
  }, [recurringVisitors, showRecurring, applyFilters, setFilteredVisitors]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Manual refresh triggered:', refreshTrigger);
      autoRefresh();
    }
  }, [refreshTrigger, autoRefresh]);

  useEffect(() => {
    if (searchTerm !== '') {
      const timeoutId = setTimeout(() => {
        fetchVisitors();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (searchTerm === '') {
      fetchVisitors();
    }
  }, [searchTerm, fetchVisitors]);

  useEffect(() => {
    if (filterStatus !== 'all' || filterType !== 'all' || filterCategory !== 'all') {
      const timeoutId = setTimeout(() => {
        fetchVisitors();
        if (showRecurring) {
          fetchVisitorCounts();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [filterStatus, filterType, filterCategory, showRecurring, fetchVisitors, fetchVisitorCounts]);
};

export default useFilterLogic;
