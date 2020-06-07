// console.disableYellowBox = true;
import React from 'react';
import { StatusBar } from 'react-native';

import Routes from './src/routes';

export default function App() {
  return (
    <>
      <Routes/>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent/>
    </>
  );
}
