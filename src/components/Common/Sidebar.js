import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  LayoutDashboard,
  Shield,
  Building2,
  Users,
  Lock,
} from "lucide-react";

const Sidebar = ({ 
  activeSection = "dashboard", 
  onSectionChange, 
  userProfile,
  className = ""
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Configure which links are disabled
  const [disabledLinks, setDisabledLinks] = useState({
    dashboard: false,
    gatecheck: false,
    profile: false,
    organization: false,
    user: false
  });

  // Handle section click with routing
  const handleSectionClick = (section) => {
    if (disabledLinks[section.id]) return;
    
    // Navigate using React Router
    navigate(section.route);
    
    // Call the parent callback if provided
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  // Get current active section from URL
  const getCurrentActiveSection = () => {
    const path = location.pathname.slice(1); // Remove leading slash
    return path.toLowerCase() || "dashboard";
  };

  // Check if current section is active
  const isSectionActive = (sectionId, route) => {
    const currentPath = location.pathname.toLowerCase();
    const targetRoute = route.toLowerCase();
    return currentPath === targetRoute || currentPath.includes(`/${sectionId}`);
  };

  // Sidebar navigation items without sub-items
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
      route: "/Profile"
    },
    {
      id: "organization",
      title: "Organization",
      icon: <Building2 size={20} />,
      route: "/Organization"
    },
    {
      id: "user",
      title: "User",
      icon: <Users size={20} />,
      route: "/User"
    }
  ];

  // Render navigation link
  const renderNavLink = (section) => {
    const isActive = isSectionActive(section.id, section.route);
    const isDisabled = disabledLinks[section.id];

    const linkClasses = `w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors duration-200 ${
      isDisabled
        ? "opacity-50 cursor-not-allowed text-slate-400"
        : isActive
        ? "bg-green-600 text-white"
        : "text-slate-300 hover:bg-slate-700 hover:text-white"
    }`;

    if (isDisabled) {
      return (
        <div key={section.id}>
          <div
            className={linkClasses}
            title="This feature is currently disabled"
          >
            {section.icon}
            <span className="flex-grow font-medium">{section.title}</span>
            <Lock size={16} className="opacity-70" />
          </div>
        </div>
      );
    }

    return (
      <div key={section.id}>
        <button
          onClick={() => handleSectionClick(section)}
          className={linkClasses}
        >
          {section.icon}
          <span className="flex-grow font-medium text-left">{section.title}</span>
          {isActive && (
            <span className="w-2 h-2 bg-white rounded-full"></span>
          )}
        </button>
      </div>
    );
  };

  return (
    <aside className={`w-50 h-fill bg-slate-800 text-white flex flex-col shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex justify-center p-4 text-center border-b border-slate-700">
        <div className="space-x-3">
          <div>
            <h1 className="text-lg font-bold">SMART CHECK</h1>
            <p className="text-xs text-slate-400">Version 1.0.0</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      {/* {userProfile && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 overflow-hidden rounded-full">
              {userProfile.profile_pic_url ? (
                <img
                  src={userProfile.profile_pic_url}
                  alt="Profile"
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-green-600 rounded-full">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userProfile.name || "User"}
              </p>
              <p className="text-xs truncate text-slate-400">
                {userProfile.role || "user"}
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-1">
          {sidebarSections.map((section) => renderNavLink(section))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 text-xs text-center border-t border-slate-700 text-slate-400">
        © 2024 Smart Check
      </div>
    </aside>
  );
};

export default Sidebar;