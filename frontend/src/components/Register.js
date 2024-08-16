import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import '../styles/Login.css';

const Register = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [verifyPassword, setVerifyPassword] = useState('');
	const [role, setRole] = useState('user');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (password !== verifyPassword) {
			alert('Passwords do not match');
			return;
		}
		await axios.post('http://localhost:5001/register', {username, password, role});
		navigate('/login'); // Redirect to login page after successful registration
	};

	return (
		<div className="auth-container">
			<h2>Register</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"
				/>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Password"
				/>
				<input
					type="password"
					value={verifyPassword}
					onChange={(e) => setVerifyPassword(e.target.value)}
					placeholder="Verify Password"
				/>
				<select value={role} onChange={(e) => setRole(e.target.value)}>
					<option value="user">User</option>
					<option value="admin">Admin</option>
				</select>
				<button type="submit">Register</button>
			</form>
		</div>
	);
};

export default Register;