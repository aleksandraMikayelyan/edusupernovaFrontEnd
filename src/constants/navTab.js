/**
 * constants/navTab.js — navigation destinations (WEB)
 *
 * Converted from React Navigation (bottom tabs) to React Router v6.
 *
 * In React Native this powered Tab.Screen entries via createBottomTabNavigator.
 * On web it powers:
 *   1. AppHeader — renders these as nav links in the top bar
 *   2. router setup (App.jsx) — maps each `path` to its `component`
 *
 * To add a new page: add one entry here, add a <Route> in App.jsx.
 * Nothing else changes.
 *
 * Icon names reference Ionicons (keep them — you can use react-icons/io5
 * or heroicons on web; the string names stay the same either way).
 */

/**
 * Nav link metadata only — no component imports.
 * Components are mapped to paths in App.jsx.
 * Importing screens here caused a circular dependency:
 *   navTab → UserInterface → AppHeader → navTab
 */

export const MAIN_TABS = [
  { icon: "home-outline",    label: "Home",    path: "/"        },
  { icon: "book-outline",    label: "Courses", path: "/courses" },
  { icon: "history-outline", label: "History", path: "/history" },
];