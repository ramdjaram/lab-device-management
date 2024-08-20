import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import '../styles/Home.css';
import moment from 'moment-timezone';

const Home = () => {
	const [devices, setDevices] = useState([]);
	const [role, setRole] = useState('');
	const [username, setUsername] = useState('');
	const [search, setSearch] = useState('');
	const [users, setUsers] = useState([]);
	const [selectedDevices, setSelectedDevices] = useState([]);
	const [filteredDevices, setFilteredDevices] = useState([]);
	const [editedDevices, setEditedDevices] = useState({});
	const [deviceCount, setDeviceCount] = useState(0);
	const [isAnySelected, setIsAnySelected] = useState(false);
	const [isAnyChanged, setIsAnyChanged] = useState(false);
	const [newDevice, setNewDevice] = useState({});
	const [sortOrder, setSortOrder] = useState('asc'); // New state for sort order
	const navigate = useNavigate();

	const fetchDevices = async () => {
		const token = localStorage.getItem('token');
		const response = await axios.get('http://localhost:5001/devices', {
			headers: {Authorization: token},
		});
		setDevices(response.data);
		setDeviceCount(response.data.length);
	};

	// Axios interceptor to handle 401 responses
	useEffect(() => {
		const interceptor = axios.interceptors.response.use(
			response => response,
			error => {
				if (error.response && (error.response.status === 401 || error.response.status === 403)) {
					navigate('/login');
				}
				return Promise.reject(error);
			}
		);

		return () => {
			axios.interceptors.response.eject(interceptor);
		};
	}, [navigate]);

	useEffect(() => {
		fetchDevices();
		const fetchUserRole = async () => {
			const token = localStorage.getItem('token');
			const response = await axios.get('http://localhost:5001/user', {
				headers: {Authorization: token},
			});
			setRole(response.data.role);
			setUsername(response.data.username);
		};

		const fetchUsers = async () => {
			const token = localStorage.getItem('token');
			const response = await axios.get('http://localhost:5001/users', {
				headers: {Authorization: token},
			});
			setUsers(response.data);
		};

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

	useEffect(() => {
		setIsAnySelected(selectedDevices.length > 0);
	}, [selectedDevices]);

	useEffect(() => {
		setIsAnyChanged(Object.keys(editedDevices).length > 0);
	}, [editedDevices]);

	const handleSearchChange = (e) => {
		setSearch(e.target.value);
	};

	const handleReserve = async (id, reservation) => {
		const token = localStorage.getItem('token');
		await axios.put(`http://localhost:5001/devices/${id}/reserve`, {reservation}, {
			headers: {Authorization: token},
		});
		fetchDevices();
	};

	const handleEditChange = (id, field, value) => {
		setEditedDevices(prevState => {
			const originalValue = devices.find(device => device.id === id)[field];
			const newState = {
				...prevState,
				[id]: {
					id: id,
					...prevState[id],
					[field]: value
				}
			};
			if (value === originalValue) {
				delete newState[id][field];
				if (Object.keys(newState[id]).length === 0) {
					delete newState[id];
				}
			}
			return newState;
		});
	};

	const handleApplyChanges = async (id) => {
		const token = localStorage.getItem('token');
		const editedDevice = editedDevices[id];
		const device = devices.find(device => device.id === id);

		const updatedDevice = {
			manufacturer: editedDevice?.manufacturer || device.manufacturer,
			model: editedDevice?.model || device.model,
			internal_name: editedDevice?.internal_name || device.internal_name,
			pid: editedDevice?.pid || device.pid,
			barcode: editedDevice?.barcode || device.barcode,
			ip_address: editedDevice?.ip_address || device.ip_address,
			reservation: editedDevice?.reservation || device.reservation,
			location: editedDevice?.location || device.location,
			present_in_lab: editedDevice?.present_in_lab ?? device.present_in_lab,
			status: editedDevice?.status || device.status
		};

		try {
			await axios.put(`http://localhost:5001/devices/${id}`, updatedDevice, {
				headers: {Authorization: token},
			});
			fetchDevices();
			setEditedDevices(prevState => {
				const newState = {...prevState};
				delete newState[id];
				return newState;
			});
		} catch (error) {
			console.error('Failed to apply changes', error);
		}
	};

	const handleApplyAllChanges = async () => {
		const token = localStorage.getItem('token');
		const updates = Object.keys(editedDevices).map(id => {
			const editedDevice = editedDevices[id];
			const device = devices.find(device => device.id === parseInt(id));
			return {
				id,
				updatedDevice: {
					manufacturer: editedDevice?.manufacturer || device.manufacturer,
					model: editedDevice?.model || device.model,
					internal_name: editedDevice?.internal_name || device.internal_name,
					pid: editedDevice?.pid || device.pid,
					barcode: editedDevice?.barcode || device.barcode,
					ip_address: editedDevice?.ip_address || device.ip_address,
					reservation: editedDevice?.reservation || device.reservation,
					location: editedDevice?.location || device.location,
					present_in_lab: editedDevice?.present_in_lab ?? device.present_in_lab,
					status: editedDevice?.status || device.status
				}
			};
		});

		try {
			await Promise.all(updates.map(({id, updatedDevice}) =>
				axios.put(`http://localhost:5001/devices/${id}`, updatedDevice, {
					headers: {Authorization: token},
				})
			));
			fetchDevices();
			setEditedDevices({});
		} catch (error) {
			console.error('Failed to apply changes', error);
		}
	};

	const handleDelete = async (id) => {
		const confirmDelete = window.confirm('Are you sure you want to delete this device?');
		if (!confirmDelete) return;

		const token = localStorage.getItem('token');
		try {
			await axios.delete(`http://localhost:5001/devices/${id}`, {
				headers: {Authorization: token},
			});
			fetchDevices();
		} catch (error) {
			console.error('Failed to delete device', error);
		}
	};

	const handleMassDelete = async () => {
		const token = localStorage.getItem('token');
		await axios.post('http://localhost:5001/devices/mass-delete', {ids: selectedDevices}, {
			headers: {Authorization: token},
		});
		fetchDevices();
		setSelectedDevices([]);
		setIsAnySelected(false);
	};

	const handleCheckboxChange = (id) => {
		setSelectedDevices((prevSelected) =>
			prevSelected.includes(id)
				? prevSelected.filter((deviceId) => deviceId !== id)
				: [...prevSelected, id]
		);
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/login');
	};

	const handleNewDeviceChange = (field, value) => {
		setNewDevice(prevState => ({
			...prevState,
			[field]: value
		}));
	};

	const handleAddDevice = async () => {
		const token = localStorage.getItem('token');

		// Validation for mandatory fields
		if (!newDevice.model || !newDevice.barcode || !newDevice.reservation) {
			alert('Model, Barcode, and Reservation are required fields.');
			return;
		}

		// Set default values for other fields
		const deviceToAdd = {
			manufacturer: newDevice.manufacturer || '',
			model: newDevice.model,
			internal_name: newDevice.internal_name || '',
			pid: newDevice.pid || '',
			barcode: newDevice.barcode,
			ip_address: newDevice.ip_address || '',
			reservation: newDevice.reservation,
			location: newDevice.location || 'BgLab',
			reservation_date: newDevice.reservation_date || '1970-01-01',
			present_in_lab: newDevice.present_in_lab !== undefined ? newDevice.present_in_lab : true,
			status: newDevice.status || ''
		};

		try {
			await axios.post(`http://localhost:5001/devices`, deviceToAdd, {
				headers: {Authorization: token},
			});
			fetchDevices();
			setNewDevice({});
		} catch (error) {
			console.error('Failed to add device', error);
		}
	};

	const handleSortByDate = () => {
		const sortedDevices = [...filteredDevices].sort((a, b) => {
			const dateA = new Date(a.reservation_date);
			const dateB = new Date(b.reservation_date);
			return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
		});
		setFilteredDevices(sortedDevices);
		setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
	};

	return (
		<div className="container">
			<button className="logout-button" onClick={handleLogout}>Logout</button>
			<h1>Devices ({deviceCount})</h1>
			<div>
				<input
					type="text"
					placeholder="Search by Barcode, Model or Reservation"
					value={search}
					onChange={handleSearchChange}
				/>
			</div>
			{role === 'admin' && isAnySelected && (
				<button className="delete-button" onClick={handleMassDelete}>Delete Selected</button>
			)}
			{isAnyChanged && (
				<button className="apply-button" onClick={handleApplyAllChanges}>Apply All Changes</button>
			)}
			<table>
				<thead>
				<tr>
					{role === 'admin' && <th>Select</th>}
					<th>Manufacturer</th>
					<th className={'th-mandatory'}>Model</th>
					<th>Internal Name</th>
					<th>PID</th>
					<th className={'th-mandatory'}>Barcode</th>
					<th>IP Address</th>
					<th className={'th-mandatory'}>Reservation</th>
					<th>Location</th>
					<th onClick={handleSortByDate} style={{cursor: 'pointer'}}>Reservation Date</th>
					<th>Present In Lab</th>
					<th>Status</th>
					{role === 'admin' && <th>Actions</th>}
				</tr>
				</thead>
				<tbody>
				{role === 'admin' && (
					<tr style={{'backgroundColor': '#4caf50'}}>
						<td></td>
						<td>
							<input
								type="text"
								value={newDevice.manufacturer || ''}
								onChange={(e) => handleNewDeviceChange('manufacturer', e.target.value)}
							/>
						</td>
						<td className={'th-mandatory'}>
							<input
								type="text"
								value={newDevice.model || ''}
								onChange={(e) => handleNewDeviceChange('model', e.target.value)}
							/>
						</td>
						<td>
							<input
								type="text"
								value={newDevice.internal_name || ''}
								onChange={(e) => handleNewDeviceChange('internal_name', e.target.value)}
							/>
						</td>
						<td>
							<input
								type="text"
								value={newDevice.pid || ''}
								onChange={(e) => handleNewDeviceChange('pid', e.target.value)}
							/>
						</td>
						<td className={'th-mandatory'}>
							<input
								type="text"
								value={newDevice.barcode || ''}
								onChange={(e) => handleNewDeviceChange('barcode', e.target.value)}
							/>
						</td>
						<td>
							<input
								type="text"
								value={newDevice.ip_address || ''}
								onChange={(e) => handleNewDeviceChange('ip_address', e.target.value)}
							/>
						</td>
						<td className={'th-mandatory'}>
							<input
								type="text"
								value={newDevice.reservation || ''}
								onChange={(e) => handleNewDeviceChange('reservation', e.target.value)}
							/>
						</td>
						<td>
							<input
								type="text"
								value={newDevice.location || ''}
								onChange={(e) => handleNewDeviceChange('location', e.target.value)}
							/>
						</td>
						<td>
							<input
								type="date"
								value={newDevice.reservation_date || ''}
								onChange={(e) => handleNewDeviceChange('reservation_date', e.target.value)}
							/>
						</td>
						<td>
							<select
								value={newDevice.present_in_lab || ''}
								onChange={(e) => handleNewDeviceChange('present_in_lab', e.target.value)}
							>
								<option value="true">Yes</option>
								<option value="false">No</option>
							</select>
						</td>
						<td>
							<input
								type="text"
								value={newDevice.status || ''}
								onChange={(e) => handleNewDeviceChange('status', e.target.value)}
							/>
						</td>
						<td colSpan={role === 'admin' ? 12 : 11}>
							<button onClick={handleAddDevice}>Add Device</button>
						</td>
					</tr>
				)}
				{filteredDevices.map(device => (
					<tr key={device.id}>
						{role === 'admin' && <td>
							<input
								type="checkbox"
								checked={selectedDevices.includes(device.id)}
								onChange={() => handleCheckboxChange(device.id)}
							/>
						</td>}
						<td className={editedDevices[device.id]?.manufacturer ? 'modified-cell' : ''}>
							{role === 'admin' ? (
								<input
									type="text"
									value={editedDevices[device.id]?.manufacturer || device.manufacturer}
									onChange={(e) => handleEditChange(device.id, 'manufacturer', e.target.value)}
								/>
							) : (
								device.manufacturer
							)}
						</td>
						<td className={editedDevices[device.id]?.model ? 'modified-cell' : 'td-mandatory'}>
							{role === 'admin' ? (
								<input
									type="text"
									value={editedDevices[device.id]?.model || device.model}
									onChange={(e) => handleEditChange(device.id, 'model', e.target.value)}
								/>
							) : (
								device.model
							)}
						</td>
						<td className={editedDevices[device.id]?.internal_name ? 'modified-cell' : ''}>
							{role === 'admin' ? (
								<input
									type="text"
									value={editedDevices[device.id]?.internal_name || device.internal_name}
									onChange={(e) => handleEditChange(device.id, 'internal_name', e.target.value)}
								/>
							) : (
								device.internal_name
							)}
						</td>
						<td className={editedDevices[device.id]?.pid ? 'modified-cell' : ''}>
							{role === 'admin' ? (
								<input
									type="text"
									value={editedDevices[device.id]?.pid || device.pid}
									onChange={(e) => handleEditChange(device.id, 'pid', e.target.value)}
								/>
							) : (
								device.pid
							)}
						</td>
						<td className={editedDevices[device.id]?.barcode ? 'modified-cell' : 'td-mandatory'}>
							{role === 'admin' ? (
								<input
									type="text"
									value={editedDevices[device.id]?.barcode || device.barcode}
									onChange={(e) => handleEditChange(device.id, 'barcode', e.target.value)}
								/>
							) : (
								device.barcode
							)}
						</td>
						<td className={editedDevices[device.id]?.ip_address ? 'modified-cell' : ''}>
							{role === 'admin' ? (
								<input
									type="text"
									value={editedDevices[device.id]?.ip_address || device.ip_address}
									onChange={(e) => handleEditChange(device.id, 'ip_address', e.target.value)}
								/>
							) : (
								device.ip_address
							)}
						</td>
						<td className={editedDevices[device.id]?.reservation ? 'modified-cell' : 'td-mandatory'}>
							{role === 'user' ? (
								<select
									value={device.reservation}
									onChange={(e) => handleReserve(device.id, e.target.value)}
								>
									{device.reservation !== username && <option value="">{device.reservation}</option>}
									{device.reservation === username && <option value=""></option>}
									<option value={username}>{username}</option>
								</select>
							) : (
								<input
									type="text"
									value={editedDevices[device.id]?.reservation || device.reservation}
									onChange={(e) => handleEditChange(device.id, 'reservation', e.target.value)}
								/>
							)}
						</td>
						<td className={editedDevices[device.id]?.location ? 'modified-cell' : ''}>
							<input
								type="text"
								value={editedDevices[device.id]?.location || device.location}
								onChange={(e) => handleEditChange(device.id, 'location', e.target.value)}
							/>
						</td>
						<td>{moment(device.reservation_date).tz('Europe/Berlin').format('DD-MM-YYYY HH:mm:ss')}</td>
						<td>
							<select
								value={device.present_in_lab ? 'true' : 'false'}
								onChange={(e) => handleEditChange(device.id, 'present_in_lab', e.target.value === 'true')}
							>
								<option value="true">Yes</option>
								<option value="false">No</option>
							</select>
						</td>
						<td className={editedDevices[device.id]?.status ? 'modified-cell' : ''}>
							<input
								type="text"
								value={editedDevices[device.id]?.status || device.status}
								onChange={(e) => handleEditChange(device.id, 'status', e.target.value)}
							/>
						</td>
						{role === 'admin' && (
							<td>
								<button className={"delete-button"} onClick={() => handleDelete(device.id)}>Delete
								</button>
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