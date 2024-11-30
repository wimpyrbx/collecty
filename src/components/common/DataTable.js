import React from 'react';
import { Table, Spinner } from 'react-bootstrap';
import './DataTable.css';

const DataTable = ({ columns, data, loading, pagination }) => {
  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <Table hover responsive>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.cell ? 
                      column.cell({ row: { original: row } }) : 
                      row[column.accessorKey]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default DataTable; 