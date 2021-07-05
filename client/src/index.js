import React from 'react';
import ReactDOM from 'react-dom';
import  {BrowserRouter, Route} from 'react-router-dom';
import Routes from './Routes';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import promiseMiddleware from 'redux-promise';
import ReduxThunk from 'redux-thunk';
import rootReducer from './reducers/index'


//HOC 
//syntax cũ để tạo Store có sử dụng 2 middleware là promisMiddleware và ReduxThunk
// Trong rect redux 3.1 trở lên sử dụng createStore(reducer,state,applyMiddleware(middleware1,middleware2,..))
const createStoreWithMiddleware = applyMiddleware(promiseMiddleware,ReduxThunk)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())} >
    <BrowserRouter>
      <Routes/>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
