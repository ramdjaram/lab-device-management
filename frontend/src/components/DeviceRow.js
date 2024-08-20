import React from 'react';
import moment from 'moment-timezone';

const DeviceRow = ({ device, role, username, selectedDevices, editedDevices, handleCheckboxChange, handleEditChange, handleReserve, handleDelete, handleApplyChanges }) => {
  return (
    <tr>
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
          {/*<button onClick={() => handleApplyChanges(device.id)}>Apply</button>*/}
          <button className={"delete-button"} onClick={() => handleDelete(device.id)}>Delete</button>
        </td>
      )}
    </tr>
  );
};

export default DeviceRow;