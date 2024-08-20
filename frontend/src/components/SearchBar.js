import React from 'react';

const SearchBar = ({ search, handleSearchChange }) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Search by Barcode, Model or Reservation"
        value={search}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default SearchBar;