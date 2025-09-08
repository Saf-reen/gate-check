// SomeComponent.jsx
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

const SomeComponent = () => {
  const { permissions } = useContext(AuthContext);

  const handleDeleteUser = async (userId) => {
    if (!permissions.includes('delete_users')) {
      alert('You do not have permission to delete users.');
      return;
    }
    try {
      await api.user.delete(userId);
      // Handle success
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };
};
