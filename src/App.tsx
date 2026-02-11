import { useState, useEffect } from 'react';
import { Visualizer } from './components/Visualizer';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Visualizer theme={theme} toggleTheme={toggleTheme} />
  );
}

export default App;
