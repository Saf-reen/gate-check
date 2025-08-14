import { useCallback } from 'react';
import { api } from '../Auth/api';

const useDataFetching = (state) => {
  const {
    setVisitors,
    setRecurringVisitors,
    setFilteredVisitors,
    setCategories,
    setLoading,
    setCategoriesLoading,
    setErrors,
    searchTerm,
    filterStatus,
    filterType,
    filterCategory,
    showRecurring,
    setTotalVisitors,
    setTotalVendors,
    setApprovedCount,
    setPendingCount,
    setRejectedCount,
    setOneTimeCount,
    setRecurringCount,
    setPermanentCount,
    onVisitorCountChange,
    onVendorsCountChange
  } = state;

  const applyFilters = useCallback((data) => {
    if (!Array.isArray(data)) {
      return [];
    }
    let filtered = [...data];
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(visitor =>
        visitor.visitor_name?.toLowerCase().includes(searchLower) ||
        visitor.mobile_number?.includes(searchTerm) ||
        visitor.email_id?.toLowerCase().includes(searchLower) ||
        visitor.coming_from?.toLowerCase().includes(searchLower) ||
        visitor.purpose_of_visit?.toLowerCase().includes(searchLower) ||
        visitor.pass_id?.toLowerCase().includes(searchLower)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(visitor => visitor.status === filterStatus);
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(visitor => visitor.pass_type === filterType);
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter(visitor => visitor.category_name === filterCategory);
    }
    return filtered;
  }, [searchTerm, filterStatus, filterType, filterCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.visitors.category();
      if (response && response.data) {
        const categoriesData = response.data.categories || response.data;
        console.log('Categories:', categoriesData);
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setErrors(prev => ({ ...prev, categories: 'Failed to load categories' }));
    } finally {
      setCategoriesLoading(false);
    }
  }, [setCategoriesLoading, setCategories, setErrors]);

  const calculateVisitorCounts = useCallback((visitorsData) => {
    if (!Array.isArray(visitorsData)) {
      const resetCounts = {
        totalVisitors: 0,
        totalVendors: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        oneTime: 0,
        recurring: 0,
        permanent: 0
      };

      setTotalVisitors(resetCounts.totalVisitors);
      setTotalVendors(resetCounts.totalVendors);
      setApprovedCount(resetCounts.approved);
      setPendingCount(resetCounts.pending);
      setRejectedCount(resetCounts.rejected);
      setOneTimeCount(resetCounts.oneTime);
      setRecurringCount(resetCounts.recurring);
      setPermanentCount(resetCounts.permanent);

      if (onVisitorCountChange) {
        onVisitorCountChange(resetCounts.totalVisitors);
      }
      if (onVendorsCountChange) {
        onVendorsCountChange(resetCounts.totalVendors);
      }
      return;
    }

    const filteredData = applyFilters(visitorsData);
    const total = filteredData.length;
    const approved = filteredData.filter(visitor => visitor.status === 'APPROVED').length;
    const pending = filteredData.filter(visitor => visitor.status === 'PENDING').length;
    const rejected = filteredData.filter(visitor => visitor.status === 'REJECTED').length;

    let passTypeFilteredData = [...visitorsData];
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      passTypeFilteredData = passTypeFilteredData.filter(visitor =>
        visitor.visitor_name?.toLowerCase().includes(searchLower) ||
        visitor.mobile_number?.includes(searchTerm) ||
        visitor.email_id?.toLowerCase().includes(searchLower) ||
        visitor.coming_from?.toLowerCase().includes(searchLower) ||
        visitor.purpose_of_visit?.toLowerCase().includes(searchLower) ||
        visitor.pass_id?.toLowerCase().includes(searchLower)
      );
    }
    if (filterCategory !== 'all') {
      passTypeFilteredData = passTypeFilteredData.filter(visitor => visitor.category_name === filterCategory);
    }
    const oneTime = passTypeFilteredData.filter(visitor => visitor.pass_type === 'ONE_TIME').length;
    const recurring = passTypeFilteredData.filter(visitor => visitor.pass_type === 'RECURRING').length;
    const permanent = passTypeFilteredData.filter(visitor => visitor.pass_type === 'PERMANENT').length;

    setTotalVisitors(total);
    setTotalVendors(total);
    setApprovedCount(approved);
    setPendingCount(pending);
    setRejectedCount(rejected);
    setOneTimeCount(oneTime);
    setRecurringCount(recurring);
    setPermanentCount(permanent);

    if (onVisitorCountChange) {
      onVisitorCountChange(total);
    }
    if (onVendorsCountChange) {
      onVendorsCountChange(total);
    }
  }, [searchTerm, filterCategory, applyFilters, onVisitorCountChange, onVendorsCountChange, setTotalVisitors, setTotalVendors, setApprovedCount, setPendingCount, setRejectedCount, setOneTimeCount, setRecurringCount, setPermanentCount]);

  const fetchVisitorCounts = useCallback(async () => {
    if (!showRecurring) {
      return;
    }
    try {
      const baseParams = {
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory !== 'all' && { category: filterCategory })
      };
      const totalResponse = await api.visitors.filterPassType({
        ...baseParams,
        count_only: true
      });

      console.log('Total Response:', totalResponse.data);
      const newTotalVisitors = totalResponse?.data?.count || 0;
      const newTotalVendors = totalResponse?.data?.vendors_count || 0;

      setTotalVisitors(newTotalVisitors);
      setTotalVendors(newTotalVendors);

      if (onVisitorCountChange) {
        onVisitorCountChange(newTotalVisitors);
      }
      if (onVendorsCountChange) {
        onVendorsCountChange(newTotalVendors);
      }
      setApprovedCount(0);
      setPendingCount(0);
      setRejectedCount(0);

      const [oneTimeResponse, recurringResponse, permanentResponse] = await Promise.all([
        api.visitors.filterPassType({ ...baseParams, pass_type: 'ONE_TIME', count_only: true }),
        api.visitors.filterPassType({ ...baseParams, pass_type: 'RECURRING', count_only: true }),
        api.visitors.filterPassType({ ...baseParams, pass_type: 'PERMANENT', count_only: true })
      ]);

      setOneTimeCount(oneTimeResponse?.data?.count || 0);
      setRecurringCount(recurringResponse?.data?.count || 0);
      setPermanentCount(permanentResponse?.data?.count || 0);
    } catch (error) {
      console.error('Error fetching visitor counts:', error);
      setErrors(prev => ({ ...prev, counts: 'Failed to load visitor counts' }));
    }
  }, [searchTerm, filterCategory, showRecurring, onVisitorCountChange, onVendorsCountChange, setTotalVisitors, setTotalVendors, setApprovedCount, setPendingCount, setRejectedCount, setOneTimeCount, setRecurringCount, setPermanentCount, setErrors]);

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      setErrors(prev => ({ ...prev, general: '' }));

      const filterParams = {
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterType !== 'all' && { pass_type: filterType }),
        ...(filterCategory !== 'all' && { category: filterCategory })
      };

      if (showRecurring) {
        const recurringResponse = await api.visitors.getRecurring(filterParams);
        if (recurringResponse && recurringResponse.data) {
          const recurringData = recurringResponse.data.visitors || recurringResponse.data;
          if (Array.isArray(recurringData)) {
            setRecurringVisitors(recurringData);
            const filtered = applyFilters(recurringData);
            setFilteredVisitors(filtered);
          } else {
            setRecurringVisitors([]);
            setFilteredVisitors([]);
          }
        }
      } else {
        const visitorsResponse = await api.visitors.getAll(filterParams);
        console.log('Visitors Response:', visitorsResponse);
        console.log('inside', visitorsResponse.data?.is_inside);
        if (visitorsResponse && visitorsResponse.data) {
          const visitorsData = visitorsResponse.data.visitors || visitorsResponse.data;
          if (Array.isArray(visitorsData)) {
            setVisitors(visitorsData);
            const filtered = applyFilters(visitorsData);
            setFilteredVisitors(filtered);
          } else {
            setVisitors([]);
            setFilteredVisitors([]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setErrors(prev => ({ ...prev, general: 'Failed to load visitors data. Please try again.' }));
      setVisitors([]);
      setRecurringVisitors([]);
      setFilteredVisitors([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, filterType, filterCategory, showRecurring, applyFilters, setLoading, setErrors, setVisitors, setRecurringVisitors, setFilteredVisitors]);

  const autoRefresh = useCallback(async () => {
    console.log('🔄 Auto refreshing data...');
    try {
      setErrors({});
      await fetchVisitors();
      if (showRecurring) {
        await fetchVisitorCounts();
      }
      console.log('✅ Auto refresh completed successfully');
    } catch (error) {
      console.error('❌ Error during auto refresh:', error);
      setErrors(prev => ({ ...prev, general: 'Failed to refresh data. Please try again.' }));
    }
  }, [fetchVisitors, fetchVisitorCounts, showRecurring, setErrors]);

  const triggerRefresh = useCallback(() => {
    console.log('🔄 Triggering manual refresh...');
    setRefreshTrigger(prev => prev + 1);
  }, [setRefreshTrigger]);

  return {
    applyFilters,
    fetchCategories,
    calculateVisitorCounts,
    fetchVisitorCounts,
    fetchVisitors,
    autoRefresh,
    triggerRefresh
  };
};

export default useDataFetching;
