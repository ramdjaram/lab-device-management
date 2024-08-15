import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post('http://localhost:5000/login', {username, password});
			localStorage.setItem('token', response.data.token); // Store the token in localStorage
			navigate('/home'); // Redirect to home page after successful login
		} catch (error) {
			console.error('Login failed', error);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"/>
			<input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
			       placeholder="Password"/>
			<button type="submit">Login</button>
		</form>
	);
};

export default Login;