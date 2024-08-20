import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';

const App = () => {
	return (
		<Routes>
			<Route path="/login" element={<Login/>}/>
			<Route path="/register" element={<Register/>}/>
			<Route path="/home" element={<Home/>}/>
		</Routes>
	);
};

const AppWrapper = () => (
	<Router>
		<App/>
	</Router>
);

export default AppWrapper;