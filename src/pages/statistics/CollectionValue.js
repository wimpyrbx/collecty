import React from 'react';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import { FaChartLine } from 'react-icons/fa';

const CollectionValue = () => {
  return (
    <div className="page-container">
      <PageHeader>
        <PageHeader.Icon color="#FFB74D">
          <FaChartLine />
        </PageHeader.Icon>
        <PageHeader.Title>
          Collection Value
        </PageHeader.Title>
        <PageHeader.TitleSmall>
          Monitor the value of your collection over time
        </PageHeader.TitleSmall>
      </PageHeader>
      <p>Monitor your collection's value and trends</p>
    </div>
  );
};

export default CollectionValue; 