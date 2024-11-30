import React from 'react';
import PropTypes from 'prop-types';

const SimplePagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="d-flex justify-content-center mt-4">
      <div className="d-flex gap-2">
        <button 
          className={`btn btn-light ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
        >
          First
        </button>
        <button 
          className={`btn btn-light ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button className="btn btn-primary">
          {currentPage}
        </button>
        <button 
          className={`btn btn-light ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <button 
          className={`btn btn-light ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages}
        >
          Last
        </button>
      </div>
    </div>
  );
};

SimplePagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired
};

export default SimplePagination; 