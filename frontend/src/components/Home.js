import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import '../styles/Home.css';
import Header from './Header';
import DeviceRow from './DeviceRow';
import AddDeviceForm from './AddDeviceForm';
import SearchBar from './SearchBar';
import '../styles/SearchBar.css';
import config from '../config';

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
	const [sortOrder, setSortOrder] = useState('asc');
	const [selectAll, setSelectAll] = useState(false);
	const navigate = useNavigate();
	const apiUrl = config.apiUrl;

	const fetchDevices = async () => {
		const token = localStorage.getItem('token');
		const response = await axios.get(`${apiUrl}/devices`, {
			headers: {Authorization: token},
		});
		setDevices(response.data);
		setDeviceCount(response.data.length);
	};

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
			const response = await axios.get(`${apiUrl}/user`, {
				headers: {Authorization: token},
			});
			setRole(response.data.role);
			setUsername(response.data.username);
		};

		const fetchUsers = async () => {
			const token = localStorage.getItem('token');
			const response = await axios.get(`${apiUrl}/users`, {
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
		await axios.put(`${apiUrl}/devices/${id}/reserve`, {reservation}, {
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
					...prevState[id],
					[field]: value
				}
			};
			// if (value === originalValue) {
			//   delete newState[id][field];
			//   if (Object.keys(newState[id]).length === 0) {
			//     delete newState[id];
			//   }
			// } // Commented out to allow matching the placeholder value
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
			await axios.put(`${apiUrl}/devices/${id}`, updatedDevice, {
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
				axios.put(`${apiUrl}/devices/${id}`, updatedDevice, {
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
			await axios.delete(`${apiUrl}/devices/${id}`, {
				headers: {Authorization: token},
			});
			fetchDevices();
		} catch (error) {
			console.error('Failed to delete device', error);
		}
	};

	const handleMassDelete = async () => {
		const token = localStorage.getItem('token');
		await axios.post(`${apiUrl}/devices/mass-delete`, {ids: selectedDevices}, {
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

	const handleSelectAllChange = () => {
		if (selectAll) {
			setSelectedDevices([]);
		} else {
			setSelectedDevices(devices.map(device => device.id));
		}
		setSelectAll(!selectAll);
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
			await axios.post(`${apiUrl}/devices`, deviceToAdd, {
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
			<Header deviceCount={deviceCount} handleLogout={handleLogout}/>
			<SearchBar role={role}
			           search={search}
			           isAnyChanged={isAnyChanged}
			           isAnySelected={isAnySelected}
			           handleSearchChange={handleSearchChange}
			           handleApplyAllChanges={handleApplyAllChanges}
			/>

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
					<AddDeviceForm
						newDevice={newDevice}
						handleNewDeviceChange={handleNewDeviceChange}
						handleAddDevice={handleAddDevice}
						handleSelectAllChange={handleSelectAllChange}
						selectAll={selectAll}
					/>
				)}
				{filteredDevices.map(device => (
					<DeviceRow
						key={device.id}
						device={device}
						role={role}
						username={username}
						selectedDevices={selectedDevices}
						editedDevices={editedDevices}
						handleCheckboxChange={handleCheckboxChange}
						handleEditChange={handleEditChange}
						handleReserve={handleReserve}
						handleDelete={handleDelete}
						// handleApplyChanges={handleApplyChanges}
					/>
				))}
				</tbody>
			</table>
		</div>
	);
};

export default Home;