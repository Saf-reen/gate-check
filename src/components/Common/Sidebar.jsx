import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, LayoutDashboard, Shield, Building2, Folder, ChevronDown, ChevronUp, Link } from "lucide-react";

const Sidebar = ({
  activeSection = "dashboard",
  onSectionChange,
  className = "",
  isOpen = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [disabledLinks] = useState({
    dashboard: false,
    gatecheck: false,
    profile: false,
    organization: false,
  });
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleSectionClick = (section) => {
    if (disabledLinks[section.id]) return;
    console.log(`Navigating to ${section.title}`);
    navigate(section.route);
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  const toggleDropdown = (sectionId) => {
    setOpenDropdown(openDropdown === sectionId ? null : sectionId);
  };

  const isSectionActive = (sectionId, route) => {
    const currentPath = location.pathname.toLowerCase();
    const targetRoute = route.toLowerCase();
    return currentPath === targetRoute;
  };

  const sidebarSections = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      route: "/Dashboard"
    },
    {
      id: "gatecheck",
      title: "GateCheck",
      icon: <Shield size={20} />,
      route: "/GateCheck"
    },
    {
      id: "profile",
      title: "Profile",
      icon: <User size={20} />,
      route: "/ProfilePage"
    },
    {
      id: "organization",
      title: "Organization",
      icon: <Building2 size={20} />,
      route: "/Organization"
    },
    {
      id: "roles",
      title: "Roles",
      icon: <User size={20} />,
      route: "/Roles",
      dropdown: [
        {
          id: "roles",
          title: "Roles",
          icon: <User size={20} />,
          route: "/Roles"
        },
        {
          id: "permissions",
          title: "Permissions",
          icon: <Shield size={20} />,
          route: "/Permissions"
        },
        {
          id: "rolespermissions",
          title: "Roles & Permissions",
          icon: <Link size={20} />,
          route: "/RolesPermissions"
        },
        {
          id: "userroles",
          title: "User Roles",
          icon: <User size={20} />,
          route: "/UserRoles"
        }
      ]
    },
    {
      id: "category",
      title: "Categories",
      icon: <Folder size={20} />,
      route: "/category",
    }
  ];

  const renderNavLink = (section) => {
    const isActive = isSectionActive(section.id, section.route);
    const isDisabled = disabledLinks[section.id];
    const linkClasses = `w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors duration-200 ${
      isDisabled
        ? "opacity-50 cursor-not-allowed text-slate-400"
        : isActive
        ? "border-solid border-2 border-purple-800 text-white"
        : "text-slate-300 hover:bg-slate-700 hover:text-white"
    }`;

    if (section.dropdown) {
      return (
        <div key={section.id} className="mb-2">
          <button
            onClick={() => toggleDropdown(section.id)}
            className={`w-full flex items-center justify-between space-x-3 px-3 py-2 rounded-md text-left transition-colors duration-200 ${isDisabled ? "opacity-50 cursor-not-allowed text-slate-400" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}
          >
            <div className="flex items-center space-x-3">
              {section.icon}
              <span className="flex-grow text-sm text-left">{section.title}</span>
            </div>
            {openDropdown === section.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openDropdown === section.id && (
            <div className="mt-1 ml-6 space-y-1">
              {section.dropdown.map((dropdownItem) => {
                const dropdownItemActive = isSectionActive(dropdownItem.id, dropdownItem.route);
                return (
                  <button
                    key={dropdownItem.id}
                    onClick={() => handleSectionClick(dropdownItem)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors duration-200 ${dropdownItemActive ? "border-solid border-2 border-purple-800 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}
                  >{dropdownItem.icon}
                    <span className="flex-grow text-sm text-left">{dropdownItem.title}</span>
                    {dropdownItemActive && <span className="w-[5px] h-[5px] bg-purple-800 rounded-full"></span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (isDisabled) {
      return (
        <div key={section.id}>
          <div className={linkClasses} title="This feature is currently disabled">
            {section.icon}
            <span className="flex-grow text-xs font-thin">{section.title}</span>
          </div>
        </div>
      );
    }

    return (
      <div key={section.id}>
        <button onClick={() => handleSectionClick(section)} className={linkClasses}>
          {section.icon}
          <span className="flex-grow text-sm text-left">{section.title}</span>
          {isActive && <span className="w-[5px] h-[5px] bg-purple-800 rounded-full"></span>}
        </button>
      </div>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-800 text-white flex flex-col shadow-lg transition-transform duration-300 z-20 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${className}`}
      style={{ width: "200px" }}
    >
      <div className="flex justify-center p-4 text-center border-b border-slate-700">
        <div className="space-x-3">
          <div>
            <h1 className="text-lg font-bold">SMART CHECK</h1>
            <p className="text-xs text-slate-400">Version 1.0.0</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-1">
          {sidebarSections.map((section) => renderNavLink(section))}
        </div>
      </nav>
      <div className="p-4 text-xs text-center border-t border-slate-700 text-slate-400">
        © 2025 Smart Check
      </div>
    </aside>
  );
};

export default Sidebar;
