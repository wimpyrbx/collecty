import React from 'react';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import { FaChartLine } from 'react-icons/fa';

const CollectionCompletion = () => {
  return (
    <div className="page-container">
      <PageHeader>
        <PageHeader.Icon color="#FFA726">
          <FaChartLine />
        </PageHeader.Icon>
        <PageHeader.Title>
          Collection Completion
        </PageHeader.Title>
        <PageHeader.TitleSmall>
          Track your collection progress and completion rates
        </PageHeader.TitleSmall>
      </PageHeader>
      <p>Track your collection completion progress</p>
    </div>
  );
};

export default CollectionCompletion; 