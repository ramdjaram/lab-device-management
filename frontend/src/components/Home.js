import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [devices, setDevices] = useState([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/devices', {
        headers: { Authorization: token },
        params: search,
      });
      setDevices(response.data);
    };

    const fetchUserRole = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/user', {
        headers: { Authorization: token },
      });
      setRole(response.data.role);
    };

    fetchDevices();
    fetchUserRole();
  }, [search]);

  const handleSearchChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleReserve = async (id) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:5001/devices/${id}/reserve`, {}, {
      headers: { Authorization: token },
    });
    setSearch({ ...search }); // Trigger re-fetch
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5001/devices/${id}`, {
      headers: { Authorization: token },
    });
    setSearch({ ...search }); // Trigger re-fetch
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
        <input type="text" name="barcode" placeholder="Search by Barcode" value={search.barcode}
               onChange={handleSearchChange} />
        <input type="text" name="model" placeholder="Search by Model" value={search.model}
               onChange={handleSearchChange} />
        <input type="text" name="reservation" placeholder="Search by Reservation" value={search.reservation}
               onChange={handleSearchChange} />
      </div>
      <table>
        <thead>
        <tr>
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
        {devices.map(device => (
          <tr key={device.id}>
            <td>{device.manufacturer}</td>
            <td>{device.model}</td>
            <td>{device.internal_name}</td>
            <td>{device.pid}</td>
            <td>{device.barcode}</td>
            <td>{device.ip_address}</td>
            <td>
              {role === 'user' ? (
                <input type="text" value={device.reservation}
                       onChange={(e) => handleReserve(device.id, e.target.value)} />
              ) : (
                device.reservation
              )}
            </td>
            <td>{device.location}</td>
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