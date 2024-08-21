import React from 'react';

const SearchBar = ({ role, search, isAnyChanged, isAnySelected, handleSearchChange, handleMassDelete, handleApplyAllChanges }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by Barcode, Model or Reservation"
        value={search}
        onChange={handleSearchChange}
      />
      {isAnyChanged && (
        <button className="apply-button" onClick={handleApplyAllChanges}>Apply All Changes</button>
      )}
      {role === 'admin' && isAnySelected && (
        <button className="delete-button" onClick={handleMassDelete}>Delete Selected</button>
      )}
    </div>
  );
};

export default SearchBar;