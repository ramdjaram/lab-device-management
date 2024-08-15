import React, {useEffect} from 'react';
import {BrowserRouter as Router, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';

const App = () => {
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (location.pathname !== '/register') {
			if (token) {
				navigate('/home');
			} else {
				navigate('/login');
			}
		}
	}, [navigate, location.pathname]);

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