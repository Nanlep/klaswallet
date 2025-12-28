
import { AppRegistry } from 'react-native';
import App from './App';

// Inject React Native Web styles
const style = document.createElement('style');
style.textContent = `
  input, textarea, select { outline: none; }
  #root { display: flex; flex: 1; height: 100vh; overflow: hidden; }
`;
document.head.append(style);

// Register the application component
AppRegistry.registerComponent('Main', () => App);

// Run the application on the web
AppRegistry.runApplication('Main', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
