
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './themes/bloomberg.css'
import './themes/futuristic.css'

createRoot(document.getElementById("root")!).render(<App />);
