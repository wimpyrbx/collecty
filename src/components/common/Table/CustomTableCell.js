import React from 'react';
import { Badge } from 'react-bootstrap';

const CustomTableCell = ({ children, badgeText, badgeVariant }) => {
  return (
    <td>
      <div className="table-custom-content">
        <span>{children}</span>
        {badgeText && <Badge bg={badgeVariant}>{badgeText}</Badge>}
      </div>
    </td>
  );
};

export default CustomTableCell; 