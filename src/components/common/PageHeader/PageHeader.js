import React from 'react';
import PropTypes from 'prop-types';
import './PageHeader.css';

const PageHeader = ({ 
  children,
  className = '',
  bgClass = 'bg-primary',
  textClass = 'text-white'
}) => {
  return (
    <div className={`page-header ${bgClass} ${textClass} ${className}`}>
      <div className="page-header-content">
        {children}
      </div>
    </div>
  );
};

const PageHeaderIcon = ({ children, className = '', color = '' }) => (
  <div 
    className={`page-header-icon ${className}`}
    style={color ? { color } : undefined}
  >
    {children}
  </div>
);

const PageHeaderTitle = ({ children, className = '' }) => (
  <h1 className={`page-header-title ${className}`}>
    {children}
  </h1>
);

const PageHeaderActions = ({ children, className = '' }) => (
  <div className={`page-header-actions ${className}`}>
    {children}
  </div>
);

PageHeader.Icon = PageHeaderIcon;
PageHeader.Title = PageHeaderTitle;
PageHeader.Actions = PageHeaderActions;

PageHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  bgClass: PropTypes.string,
  textClass: PropTypes.string
};

export default PageHeader; 