
import { AppRegistry } from 'react-native';
import App from './App';

// Register the application component
AppRegistry.registerComponent('Main', () => App);

// Run the application on the web
AppRegistry.runApplication('Main', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
