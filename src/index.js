import React from 'react';
import ReactDOM from 'react-dom';
import BrowserRouter from 'react-router-dom/BrowserRouter';
import Route from 'react-router-dom/Route';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import App from './App';

ReactDOM.render(
  <MuiThemeProvider>
    <BrowserRouter>
      <Route path="/" component={App}/>
    </BrowserRouter>
  </MuiThemeProvider>,
  document.getElementById('root')
);
