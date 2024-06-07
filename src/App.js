import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from './screens/HomeScreen';
import SavedScreen from './screens/SavedScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ArticleScreen from './screens/ArticleScreen';
import {ArticleProvider} from './context/ArticleContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Saved') {
            iconName = 'bookmark';
          } else if (route.name === 'Favorites') {
            iconName = 'favorite';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2f5689',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <ArticleProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="HomeTabs"
            component={HomeStack}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Article"
            component={ArticleScreen}
            options={{title: 'Article'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ArticleProvider>
  );
};

export default App;
