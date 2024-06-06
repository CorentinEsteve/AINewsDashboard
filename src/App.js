import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ArticleScreen from './screens/ArticleScreen';

const Stack = createStackNavigator();

// Main App component with navigation setup
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'AI News'}}
        />
        <Stack.Screen
          name="Article"
          component={ArticleScreen}
          options={{title: 'Article'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
