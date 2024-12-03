import React from "react";
import {
  LayoutDashboard,
  Shield,
  Bell,
  Settings,
  ChevronLeft,
  Users,
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (
    page: "dashboard" | "security" | "alerts" | "settings" | "agents"
  ) => void;
};

export function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", value: "dashboard" as const },
    { icon: Shield, label: "Security", value: "security" as const },
    { icon: Bell, label: "Alerts", value: "alerts" as const },
    { icon: Users, label: "Agents", value: "agents" as const },
    { icon: Settings, label: "Settings", value: "settings" as const },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } z-40`}
    >
      <div className="p-4">
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 mb-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => onNavigate(item.value)}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
