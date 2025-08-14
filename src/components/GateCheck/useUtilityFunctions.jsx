const useUtilityFunctions = () => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'text-green-800 bg-green-100';
      case 'PENDING': return 'text-yellow-800 bg-yellow-100';
      case 'REJECTED': return 'text-red-800 bg-red-100';
      case 'EXPIRED': return 'text-gray-800 bg-gray-100';
      case 'CANCELLED': return 'text-orange-800 bg-orange-100';
      case 'BLACKLISTED': return 'text-red-800 bg-red-200';
      case 'CHECKED_IN': return 'text-blue-800 bg-blue-100';
      case 'CHECKED_OUT': return 'text-purple-800 bg-purple-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusDot = (status) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'REJECTED': return 'bg-red-500';
      case 'EXPIRED': return 'bg-gray-500';
      case 'CANCELLED': return 'bg-orange-500';
      case 'BLACKLISTED': return 'bg-red-600';
      case 'CHECKED_IN': return 'bg-blue-500';
      case 'CHECKED_OUT': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPassTypeLabel = (passType) => {
    switch(passType) {
      case 'ONE_TIME': return 'One Time';
      case 'RECURRING': return 'Recurring';
      case 'PERMANENT': return 'Permanent';
      default: return passType;
    }
  };

  const getCategoryLabel = (categoryValue, categories) => {
    const categoryByValue = categories.find(cat => cat.value === categoryValue);
    if (categoryByValue) {
      return categoryByValue.name;
    }

    const categoryByName = categories.find(cat => cat.name === categoryValue);
    if (categoryByName) {
      return categoryByName.name;
    }

    return categoryValue;
  };

  return {
    getStatusColor,
    getStatusDot,
    getPassTypeLabel,
    getCategoryLabel
  };
};

export default useUtilityFunctions;
