import React from 'react';
import PageHeader from '../../components/layout/PageHeader/PageHeader';
import { FaChartPie } from 'react-icons/fa';

const CollectionCompletion = () => {
  return (
    <div className="container-fluid">
      <PageHeader bgClass="bg-primary" textClass="text-white">
        <PageHeader.Icon color="#66BB6A">
          <FaChartPie />
        </PageHeader.Icon>
        <PageHeader.Title>
          Collection Completion
        </PageHeader.Title>
        <PageHeader.TitleSmall>
          Track your collection progress
        </PageHeader.TitleSmall>
      </PageHeader>
      <p>Track your collection completion progress</p>
    </div>
  );
};

export default CollectionCompletion; 