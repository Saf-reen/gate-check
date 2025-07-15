import React, { useState, useEffect } from "react";
import { X, Shield, Key, Check, Loader } from "lucide-react";

const RolePermissionModal = ({ 
  isOpen, 
  onClose, 
  title, 
  rolePermission, 
  onChange, 
  onSubmit, 
  submitting, 
  roles, 
  permissions,
  isEdit = false
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);


  useEffect(() => {
    if (isOpen && rolePermission) {
      // For edit mode, convert permission names to IDs
      if (isEdit && rolePermission.permission) {
        const permissionIds = rolePermission.permission.map(permName => {
          const perm = permissions.find(p => p.name === permName);
          return perm ? perm.id : null;
        }).filter(id => id !== null);
        setSelectedPermissions(permissionIds);
      } else {
        setSelectedPermissions(rolePermission.permission || []);
      }
    }
  }, [isOpen, rolePermission, permissions, isEdit]);

  useEffect(() => {
    setSelectAll(selectedPermissions.length === permissions.length);
  }, [selectedPermissions, permissions]);

  if (!isOpen) return null;

  const handleRoleChange = (roleId) => {
    onChange({
      ...rolePermission,
      role: roleId
    });
  };

  const handlePermissionToggle = (permissionId) => {
    let newPermissions;
    if (selectedPermissions.includes(permissionId)) {
      newPermissions = selectedPermissions.filter(id => id !== permissionId);
    } else {
      newPermissions = [...selectedPermissions, permissionId];
    }
    console.log('Toggled permission:', permissionId);
    console.log('Updated permissions:', newPermissions);
    setSelectedPermissions(newPermissions);
    onChange({
      ...rolePermission,
      permission: newPermissions
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPermissions([]);
      onChange({
        ...rolePermission,
        permission: []
      });
    } else {
      const allPermissionIds = permissions.map(p => p.id);
      setSelectedPermissions(allPermissionIds);
      onChange({
        ...rolePermission,
        permission: allPermissionIds
      });
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <Shield className="inline w-4 h-4 mr-1" />
                  Role
                </label>
                <select
                  value={rolePermission?.role || ""}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={isEdit}
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {isEdit && (
                  <p className="mt-1 text-xs text-gray-500">
                    Role cannot be changed in edit mode
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Key className="inline w-4 h-4 mr-1" />
                    Permissions
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    {selectAll ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="p-3 space-y-2 overflow-y-auto border border-gray-200 rounded-lg max-h-64">
                  {permissions.map(permission => (
                    <label
                      key={permission.permission_id}
                      className="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.permission_id)}
                        onChange={() => handlePermissionToggle(permission.permission_id)}
                        name={permission.id}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {permission.name}
                        </div>
                        {permission.description && (
                          <div className="text-xs text-gray-500">
                            {permission.description}
                          </div>
                        )}
                      </div>
                      {selectedPermissions.includes(permission.id) && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </label>
                  ))}
                </div>
                
                <p className="mt-2 text-xs text-gray-500">
                  {selectedPermissions.length} of {permissions.length} permissions selected
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 text-purple-800 bg-transparent border border-purple-800 rounded-lg hover:bg-purple-100 disabled:opacity-50"
            >
              {submitting && <Loader className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Update' : 'Assign'} Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolePermissionModal;