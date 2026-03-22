/**
 * SidebarItem.jsx — Single nav item in the Test screen sidebar (WEB)
 *
 * Converted from React Native:
 *   TouchableOpacity → button
 *   Ionicons         → lucide-react (mapped by icon name string)
 *   testStyles       → Tailwind
 */

import { Home, BookOpen, User, BarChart2, LogOut } from "lucide-react";

// Maps Ionicons name strings → lucide-react components
const ICON_MAP = {
  "home-outline":        Home,
  "book-outline":        BookOpen,
  "person-outline":      User,
  "stats-chart-outline": BarChart2,
  "log-out-outline":     LogOut,
};

const SidebarItem = ({ icon, label, isActive = false, onPress }) => {
  const IconComp = ICON_MAP[icon] || Home;

  return (
    <button
      onClick={onPress}
      className={`
        w-full flex items-center gap-3
        px-3.5 py-3 rounded-xl mb-1.5
        transition-colors duration-200
        font-serif text-[15px] tracking-wide
        ${isActive
          ? "bg-ocean-light text-ocean-deep font-bold"
          : "text-[#64748B] hover:bg-gray-50"
        }
      `}
    >
      <IconComp
        size={20}
        className={isActive ? "text-ocean-deep" : "text-[#64748B]"}
      />
      {label}
    </button>
  );
};

export default SidebarItem;