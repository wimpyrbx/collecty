import React, { useState } from 'react';
import { 
  FaChartLine, FaChartBar, FaChartPie, FaChartArea,
  FaArrowUp, FaArrowDown, FaExclamationTriangle
} from 'react-icons/fa';

const StatsTest = () => {
  // Mock data
  const [timeRange, setTimeRange] = useState('month');
  
  const mockData = {
    collectionValue: {
      current: 125000,
      previous: 115000,
      change: 8.7,
      history: [110000, 112000, 115000, 113000, 118000, 125000]
    },
    completionRate: {
      overall: 75,
      byGroup: {
        'Console Games': 85,
        'Handheld Games': 65,
        'Accessories': 90,
        'Hardware': 60
      }
    },
    recentAcquisitions: {
      count: 12,
      value: 3500,
      topItems: [
        { name: 'Rare Game A', value: 1200 },
        { name: 'Limited Edition B', value: 800 },
        { name: 'Collector Item C', value: 600 }
      ]
    },
    marketTrends: {
      priceChanges: [
        { category: 'RPGs', change: 15.5 },
        { category: 'Platformers', change: -5.2 },
        { category: 'Strategy', change: 8.7 },
        { category: 'Sports', change: -2.1 }
      ]
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Value Statistics */}
      <section className="row g-4 mb-4">
        {/* Total Value Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-2">Total Collection Value</h6>
                  <h3 className="mb-0">${mockData.collectionValue.current.toLocaleString()}</h3>
                </div>
                <div className={`badge bg-${mockData.collectionValue.change >= 0 ? 'success' : 'danger'} h-50`}>
                  {mockData.collectionValue.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  {' '}{Math.abs(mockData.collectionValue.change)}%
                </div>
              </div>
              <div className="mt-3">
                <div className="progress" style={{height: '4px'}}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{width: `${(mockData.collectionValue.current / 150000) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="text-muted mb-2">Overall Completion Rate</h6>
              <div className="d-flex align-items-center mb-3">
                <h3 className="mb-0">{mockData.completionRate.overall}%</h3>
                <div className="ms-auto">
                  <div className="rounded-circle bg-success-subtle p-3">
                    <FaChartPie className="text-success" />
                  </div>
                </div>
              </div>
              <div className="progress" style={{height: '8px'}}>
                <div 
                  className="progress-bar bg-success" 
                  style={{width: `${mockData.completionRate.overall}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Acquisitions Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="text-muted mb-2">Recent Acquisitions</h6>
              <div className="d-flex align-items-center mb-3">
                <div>
                  <h3 className="mb-0">{mockData.recentAcquisitions.count}</h3>
                  <small className="text-muted">New Items</small>
                </div>
                <div className="ms-auto">
                  <h4 className="text-success mb-0">
                    ${mockData.recentAcquisitions.value.toLocaleString()}
                  </h4>
                  <small className="text-muted">Total Value</small>
                </div>
              </div>
              <div className="progress" style={{height: '8px'}}>
                <div 
                  className="progress-bar bg-info" 
                  style={{width: '65%'}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Trends Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="text-muted mb-2">Market Trends</h6>
              <div className="d-flex flex-column">
                {mockData.marketTrends.priceChanges.map((trend, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{trend.category}</span>
                    <span className={`badge bg-${trend.change >= 0 ? 'success' : 'danger'}`}>
                      {trend.change >= 0 ? '+' : ''}{trend.change}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Statistics */}
      <section className="row g-4 mb-4">
        {/* Collection Value Chart */}
        <div className="col-xl-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Collection Value Trend</h5>
              <div className="btn-group btn-group-sm">
                <button 
                  className={`btn btn${timeRange === 'week' ? '' : '-outline'}-primary`}
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </button>
                <button 
                  className={`btn btn${timeRange === 'month' ? '' : '-outline'}-primary`}
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </button>
                <button 
                  className={`btn btn${timeRange === 'year' ? '' : '-outline'}-primary`}
                  onClick={() => setTimeRange('year')}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-placeholder bg-light rounded d-flex align-items-center justify-content-center" style={{height: '300px'}}>
                <div className="text-muted">
                  <FaChartLine size={48} className="d-block mx-auto mb-2" />
                  Chart Component Will Be Implemented Here
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion by Category */}
        <div className="col-xl-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Completion by Category</h5>
            </div>
            <div className="card-body">
              {Object.entries(mockData.completionRate.byGroup).map(([category, rate]) => (
                <div key={category} className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <span>{category}</span>
                    <span>{rate}%</span>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                    <div 
                      className="progress-bar bg-primary" 
                      style={{width: `${rate}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Acquisitions Table */}
      <section className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Acquisitions</h5>
          <button className="btn btn-sm btn-light">View All</button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Purchase Date</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockData.recentAcquisitions.topItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded p-2 me-2">
                        <FaChartBar />
                      </div>
                      <div>
                        <div className="fw-bold">{item.name}</div>
                        <small className="text-muted">ID: #{(1000 + index).toString()}</small>
                      </div>
                    </div>
                  </td>
                  <td>Video Games</td>
                  <td>{new Date().toLocaleDateString()}</td>
                  <td>${item.value.toLocaleString()}</td>
                  <td>
                    <span className="badge bg-success">Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Alert Cards */}
      <section className="row g-4">
        <div className="col-md-6">
          <div className="card border-warning">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-warning p-3 me-3">
                  <FaExclamationTriangle className="text-white" />
                </div>
                <div>
                  <h6 className="mb-1">Price Alert</h6>
                  <p className="mb-0">3 items in your wishlist have decreased in price</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-info">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-info p-3 me-3">
                  <FaChartArea className="text-white" />
                </div>
                <div>
                  <h6 className="mb-1">Market Analysis</h6>
                  <p className="mb-0">RPG games have shown 15% value increase this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StatsTest; 