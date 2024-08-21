import React from 'react';
import DeviceRow from './DeviceRow';

const DeviceTable = ({
	                     devices,
	                     role,
	                     selectedDevices,
	                     editedDevices,
	                     handleCheckboxChange,
	                     handleEditChange,
	                     handleReserve,
	                     handleDelete,
	                     handleApplyChanges,
	                     handleSortByDate,
	                     sortOrder
                     }) => {
	return (
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
			{devices.map(device => (
				<DeviceRow
					key={device.id}
					device={device}
					role={role}
					selectedDevices={selectedDevices}
					editedDevices={editedDevices}
					handleCheckboxChange={handleCheckboxChange}
					handleEditChange={handleEditChange}
					handleReserve={handleReserve}
					handleDelete={handleDelete}
					handleApplyChanges={handleApplyChanges}
				/>
			))}
			</tbody>
		</table>
	);
};

export default DeviceTable;