// src/components/Loader/Loader.tsx
import React from 'react';
import css from './Loader.module.css';

// Індикатор завантаження
const Loader: React.FC = () => {
  return <div className={css.text}>Loading...</div>;
};

export default Loader;