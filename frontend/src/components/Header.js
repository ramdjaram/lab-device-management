import React from 'react';

const Header = ({deviceCount, handleLogout}) => {
	return (
		<div>
			<button className="logout-button" onClick={handleLogout}>Logout</button>
			<h1>Devices ({deviceCount})</h1>
		</div>
	);
};

export default Header;