import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const Home = () => {
	const [devices, setDevices] = useState([]);
	const [role, setRole] = useState('');
	const [search, setSearch] = useState('');
	const [users, setUsers] = useState([]);
	const [selectedDevices, setSelectedDevices] = useState([]);
	const [filteredDevices, setFilteredDevices] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchDevices = async () => {
			const token = localStorage.getItem('token');
			const response = await axios.get('http://localhost:5001/devices', {
				headers: {Authorization: token},
			});
			setDevices(response.data);
		};

		const fetchUserRole = async () => {
			const token = localStorage.getItem('token');
			const response = await axios.get('http://localhost:5001/user', {
				headers: {Authorization: token},
			});
			setRole(response.data.role);
		};

		const fetchUsers = async () => {
			const token = localStorage.getItem('token');
			const response = await axios.get('http://localhost:5001/users', {
				headers: {Authorization: token},
			});
			setUsers(response.data);
		};

		fetchDevices();
		fetchUserRole();
		fetchUsers();
	}, []);

	useEffect(() => {
		const filterDevices = () => {
			const filtered = devices.filter(device =>
				device.barcode.toLowerCase().includes(search.toLowerCase()) ||
				device.model.toLowerCase().includes(search.toLowerCase()) ||
				device.reservation.toLowerCase().includes(search.toLowerCase())
			);
			setFilteredDevices(filtered);
		};

		filterDevices();
	}, [search, devices]);

	const handleSearchChange = (e) => {
		setSearch(e.target.value);
	};

	const handleReserve = async (id, reservation) => {
		const token = localStorage.getItem('token');
		await axios.put(`http://localhost:5001/devices/${id}/reserve`, {reservation}, {
			headers: {Authorization: token},
		});
		setSearch(search); // Trigger re-fetch
	};

	const handleEdit = async (id, field, value) => {
		const token = localStorage.getItem('token');
		await axios.put(`http://localhost:5001/devices/${id}`, {[field]: value}, {
			headers: {Authorization: token},
		});
		setSearch(search); // Trigger re-fetch
	};

	const handleDelete = async (id) => {
		const token = localStorage.getItem('token');
		await axios.delete(`http://localhost:5001/devices/${id}`, {
			headers: {Authorization: token},
		});
		setSearch(search); // Trigger re-fetch
	};

	const handleMassDelete = async () => {
		const token = localStorage.getItem('token');
		await axios.post('http://localhost:5001/devices/mass-delete', {ids: selectedDevices}, {
			headers: {Authorization: token},
		});
		setSearch(search); // Trigger re-fetch
	};

	const handleCheckboxChange = (id) => {
		setSelectedDevices((prevSelected) =>
			prevSelected.includes(id)
				? prevSelected.filter((deviceId) => deviceId !== id)
				: [...prevSelected, id]
		);
	};

	const handleLogout = () => {
		localStorage.removeItem('token'); // Remove the token from localStorage
		navigate('/login'); // Redirect to login page
	};

	return (
		<div>
			<h1>Devices</h1>
			<button onClick={handleLogout}>Logout</button>
			<div>
				<input
					type="text"
					placeholder="Search by Barcode, Model, or Reservation"
					value={search}
					onChange={handleSearchChange}
				/>
			</div>
			<button onClick={handleMassDelete}>Delete Selected</button>
			<table>
				<thead>
				<tr>
					<th>Select</th>
					<th>Manufacturer</th>
					<th>Model</th>
					<th>Internal Name</th>
					<th>PID</th>
					<th>Barcode</th>
					<th>IP Address</th>
					<th>Reservation</th>
					<th>Location</th>
					<th>Reservation Date</th>
					<th>Present In Lab</th>
					{role === 'admin' && <th>Actions</th>}
				</tr>
				</thead>
				<tbody>
				{filteredDevices.map(device => (
					<tr key={device.id}>
						<td>
							<input
								type="checkbox"
								checked={selectedDevices.includes(device.id)}
								onChange={() => handleCheckboxChange(device.id)}
							/>
						</td>
						<td>
							{role === 'admin' ? (
								<input
									type="text"
									value={device.manufacturer}
									onChange={(e) => handleEdit(device.id, 'manufacturer', e.target.value)}
								/>
							) : (
								device.manufacturer
							)}
						</td>
						<td>
							{role === 'admin' ? (
								<input
									type="text"
									value={device.model}
									onChange={(e) => handleEdit(device.id, 'model', e.target.value)}
								/>
							) : (
								device.model
							)}
						</td>
						<td>
							{role === 'admin' ? (
								<input
									type="text"
									value={device.internal_name}
									onChange={(e) => handleEdit(device.id, 'internal_name', e.target.value)}
								/>
							) : (
								device.internal_name
							)}
						</td>
						<td>
							{role === 'admin' ? (
								<input
									type="text"
									value={device.pid}
									onChange={(e) => handleEdit(device.id, 'pid', e.target.value)}
								/>
							) : (
								device.pid
							)}
						</td>
						<td>
							{role === 'admin' ? (
								<input
									type="text"
									value={device.barcode}
									onChange={(e) => handleEdit(device.id, 'barcode', e.target.value)}
								/>
							) : (
								device.barcode
							)}
						</td>
						<td>
							{role === 'admin' ? (
								<input
									type="text"
									value={device.ip_address}
									onChange={(e) => handleEdit(device.id, 'ip_address', e.target.value)}
								/>
							) : (
								device.ip_address
							)}
						</td>
						<td>
							{role === 'user' ? (
								<select
									value={device.reservation}
									onChange={(e) => handleReserve(device.id, e.target.value)}
								>
									{users.map(user => (
										<option key={user.id} value={user.username}>{user.username}</option>
									))}
								</select>
							) : (
								<input
									type="text"
									value={device.reservation}
									onChange={(e) => handleEdit(device.id, 'reservation', e.target.value)}
								/>
							)}
						</td>
						<td>
							{role === 'admin' ? (
								<input
									type="text"
									value={device.location}
									onChange={(e) => handleEdit(device.id, 'location', e.target.value)}
								/>
							) : (
								device.location
							)}
						</td>
						<td>{device.reservation_date}</td>
						<td>{device.present_in_lab ? 'Yes' : 'No'}</td>
						{role === 'admin' && (
							<td>
								<button onClick={() => handleDelete(device.id)}>Delete</button>
							</td>
						)}
					</tr>
				))}
				</tbody>
			</table>
		</div>
	);
};

export default Home;