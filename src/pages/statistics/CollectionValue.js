import React from 'react';
import PageHeader from '../../components/layout/PageHeader/PageHeader';
import { FaChartLine } from 'react-icons/fa';

const CollectionValue = () => {
  return (
    <div className="container-fluid">
      <PageHeader bgClass="bg-primary" textClass="text-white">
        <PageHeader.Icon color="#66BB6A">
          <FaChartLine />
        </PageHeader.Icon>
        <PageHeader.Title>
          Collection Value
        </PageHeader.Title>
        <PageHeader.TitleSmall>
          Track your collection value
        </PageHeader.TitleSmall>
      </PageHeader>
      <p>Monitor your collection's value and trends</p>
    </div>
  );
};

export default CollectionValue; 