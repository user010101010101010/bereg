import React from 'react';
import {createRoot} from 'react-dom/client';
import BeregApp from './app/bereg-app';
import './app/globals.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><BeregApp/></React.StrictMode>);
