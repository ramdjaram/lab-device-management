import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [devices, setDevices] = useState([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [editedDevices, setEditedDevices] = useState({});
  const navigate = useNavigate();

  const fetchDevices = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5001/devices', {
      headers: { Authorization: token },
    });
    setDevices(response.data);
  };

  useEffect(() => {
    fetchDevices();

    const fetchUserRole = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/user', {
        headers: { Authorization: token },
      });
      setRole(response.data.role);
    };

    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/users', {
        headers: { Authorization: token },
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

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleReserve = async (id, reservation) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:5001/devices/${id}/reserve`, { reservation }, {
      headers: { Authorization: token },
    });
    fetchDevices(); // Trigger re-fetch
  };

  const handleEditChange = (id, field, value) => {
    setEditedDevices(prevState => ({
      ...prevState,
      [id]: {
        ...prevState[id],
        [field]: value
      }
    }));
  };

  const handleApplyChanges = async (id) => {
    const token = localStorage.getItem('token');
    const editedDevice = editedDevices[id];
    try {
      await axios.put(`http://localhost:5001/devices/${id}`, editedDevice, {
        headers: { Authorization: token },
      });
      fetchDevices(); // Trigger re-fetch
      setEditedDevices(prevState => {
        const newState = { ...prevState };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error('Failed to apply changes', error);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5001/devices/${id}`, {
      headers: { Authorization: token },
    });
    fetchDevices(); // Trigger re-fetch
  };

  const handleMassDelete = async () => {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5001/devices/mass-delete', { ids: selectedDevices }, {
      headers: { Authorization: token },
    });
    fetchDevices(); // Trigger re-fetch
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
                    value={editedDevices[device.id]?.manufacturer || device.manufacturer}
                    onChange={(e) => handleEditChange(device.id, 'manufacturer', e.target.value)}
                  />
                ) : (
                  device.manufacturer
                )}
              </td>
              <td>
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
              <td>
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
              <td>
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
              <td>
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
              <td>
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
                    value={editedDevices[device.id]?.reservation || device.reservation}
                    onChange={(e) => handleEditChange(device.id, 'reservation', e.target.value)}
                  />
                )}
              </td>
              <td>
                {role === 'admin' ? (
                  <input
                    type="text"
                    value={editedDevices[device.id]?.location || device.location}
                    onChange={(e) => handleEditChange(device.id, 'location', e.target.value)}
                  />
                ) : (
                  device.location
                )}
              </td>
              <td>{device.reservation_date}</td>
              <td>{device.present_in_lab ? 'Yes' : 'No'}</td>
              {role === 'admin' && (
                <td>
                  <button onClick={() => handleApplyChanges(device.id)}>Apply</button>
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