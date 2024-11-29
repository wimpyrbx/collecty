import React from 'react';
import './PageHeader.css';

const PageHeader = ({ 
  children,
  className = '',
  bgClass = 'bg-primary',
  textClass = 'text-white'
}) => {
  // Separate main header content from TitleSmall
  const mainContent = [];
  let titleSmall = null;

  React.Children.forEach(children, child => {
    if (child?.type === TitleSmall) {
      titleSmall = child;
    } else {
      mainContent.push(child);
    }
  });

  return (
    <div className="page-header-wrapper">
      <div className={`page-header ${bgClass} ${textClass} ${className}`}>
        <div className="page-header-content">
          {mainContent}
        </div>
      </div>
      {titleSmall}
    </div>
  );
};

const Icon = ({ children, color, className = '' }) => (
  <div 
    className={`page-header-icon ${className}`}
    style={{ color: color || 'inherit' }}
  >
    {children}
  </div>
);

const Title = ({ children, className = '' }) => (
  <h1 className={`page-header-title ${className}`}>
    {children}
  </h1>
);

const Actions = ({ children, className = '' }) => {
  // Recursively modify any Button components to be size="sm"
  const addSmallSize = (child) => {
    if (!child) return null;

    if (child.type && child.type.name === 'Button') {
      return React.cloneElement(child, { size: 'sm', ...child.props });
    }

    if (child.props && child.props.children) {
      const newChildren = React.Children.map(child.props.children, addSmallSize);
      return React.cloneElement(child, {}, newChildren);
    }

    return child;
  };

  return (
    <div className={`page-header-actions ${className}`}>
      {React.Children.map(children, addSmallSize)}
    </div>
  );
};

// Rename SubHeader to TitleSmall
const TitleSmall = ({ children, className = '' }) => (
  <div className={`page-header-small ${className}`}>
    <em>{children}</em>
  </div>
);

PageHeader.Icon = Icon;
PageHeader.Title = Title;
PageHeader.Actions = Actions;
PageHeader.TitleSmall = TitleSmall;

export default PageHeader; 