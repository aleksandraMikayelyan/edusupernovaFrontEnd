js// navigation/MainTabs.js  ← future file
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MAIN_TABS } from "../constants/navTab.js";

const Tab = createBottomTabNavigator();

const MainTabs = ({ navigation }) => (
  <View style={{ flex: 1 }}>
    <AppHeader navigation={navigation} />      // renders once, never remounts

    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {MAIN_TABS.map(({ label, route, icon, component: Screen }) => (
        <Tab.Screen
          key={route}
          name={route}
          component={Screen}
          options={{ tabBarIcon: ({ color }) =>
            <Ionicons name={icon} size={22} color={color} />
          }}
        />
      ))}
    </Tab.Navigator>

    <AppFooter />                              // renders once, never remounts
  </View>
);