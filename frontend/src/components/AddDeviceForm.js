import React from 'react';

const AddDeviceForm = ({ newDevice, handleNewDeviceChange, handleAddDevice }) => {
  return (
    <tr style={{ 'backgroundColor': '#4caf50' }}>
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
      <td colSpan={12}>
        <button onClick={handleAddDevice}>Add Device</button>
      </td>
    </tr>
  );
};

export default AddDeviceForm;