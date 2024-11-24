import React, { useState } from 'react';
import { 
  FaBell, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaUser,
  FaCog,
  FaEnvelope
} from 'react-icons/fa';

const UITest = () => {
  const [toastVisible, setToastVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="container-fluid py-4">
      <h1>UI Components Test Page</h1>
      
      {/* Badges and Pills */}
      <section className="card mb-4">
        <div className="card-header">
          <h4>Badges & Pills</h4>
        </div>
        <div className="card-body">
          <h5>Badges</h5>
          <div className="mb-3">
            <span className="badge bg-primary me-2">Primary</span>
            <span className="badge bg-secondary me-2">Secondary</span>
            <span className="badge bg-success me-2">Success</span>
            <span className="badge bg-danger me-2">Danger</span>
            <span className="badge bg-warning me-2">Warning</span>
            <span className="badge bg-info me-2">Info</span>
          </div>
          
          <h5>Pills</h5>
          <div className="mb-3">
            <span className="badge rounded-pill bg-primary me-2">Primary</span>
            <span className="badge rounded-pill bg-secondary me-2">Secondary</span>
            <span className="badge rounded-pill bg-success me-2">Success</span>
            <span className="badge rounded-pill bg-danger me-2">Danger</span>
            <span className="badge rounded-pill bg-warning me-2">Warning</span>
            <span className="badge rounded-pill bg-info me-2">Info</span>
          </div>

          <h5>Badges with Icons</h5>
          <div>
            <button type="button" className="btn btn-primary position-relative me-4">
              <FaEnvelope />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                99+
                <span className="visually-hidden">unread messages</span>
              </span>
            </button>

            <button type="button" className="btn btn-primary position-relative">
              <FaBell />
              <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="card mb-4">
        <div className="card-header">
          <h4>Alerts</h4>
        </div>
        <div className="card-body">
          <div className="alert alert-primary" role="alert">
            <FaInfoCircle className="me-2" />
            A simple primary alert with an icon
          </div>
          <div className="alert alert-success" role="alert">
            <FaCheck className="me-2" />
            A success alert with an icon
          </div>
          <div className="alert alert-warning" role="alert">
            <FaExclamationTriangle className="me-2" />
            A warning alert with an icon
          </div>
          <div className="alert alert-danger" role="alert">
            <FaTimes className="me-2" />
            A danger alert with an icon
          </div>
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            <strong>Dismissible Alert!</strong> Click the × to dismiss this alert.
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        </div>
      </section>

      {/* Tooltips and Popovers */}
      <section className="card mb-4">
        <div className="card-header">
          <h4>Tooltips & Popovers</h4>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <button 
              type="button" 
              className="btn btn-secondary me-2" 
              data-bs-toggle="tooltip" 
              data-bs-placement="top" 
              title="Tooltip on top"
            >
              Tooltip on top
            </button>
            <button 
              type="button" 
              className="btn btn-secondary me-2" 
              data-bs-toggle="tooltip" 
              data-bs-placement="right" 
              title="Tooltip on right"
            >
              Tooltip on right
            </button>
          </div>

          <div>
            <button 
              type="button" 
              className="btn btn-lg btn-danger me-2" 
              data-bs-toggle="popover" 
              title="Popover title" 
              data-bs-content="And here's some amazing content. It's very engaging. Right?"
            >
              Click to toggle popover
            </button>
          </div>
        </div>
      </section>

      {/* Progress Bars */}
      <section className="card mb-4">
        <div className="card-header">
          <h4>Progress Bars</h4>
        </div>
        <div className="card-body">
          <div className="progress mb-3">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{width: "25%"}} 
              aria-valuenow="25" 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              25%
            </div>
          </div>
          <div className="progress mb-3">
            <div 
              className="progress-bar bg-success progress-bar-striped progress-bar-animated" 
              role="progressbar" 
              style={{width: "40%"}} 
              aria-valuenow="40" 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              40%
            </div>
          </div>
          <div className="progress">
            <div className="progress-bar bg-primary" style={{width: "15%"}}>15%</div>
            <div className="progress-bar bg-success" style={{width: "30%"}}>30%</div>
            <div className="progress-bar bg-info" style={{width: "20%"}}>20%</div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="card mb-4">
        <div className="card-header">
          <h4>Buttons</h4>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <button type="button" className="btn btn-primary me-2">Primary</button>
            <button type="button" className="btn btn-secondary me-2">Secondary</button>
            <button type="button" className="btn btn-success me-2">Success</button>
            <button type="button" className="btn btn-danger me-2">Danger</button>
            <button type="button" className="btn btn-warning me-2">Warning</button>
            <button type="button" className="btn btn-info me-2">Info</button>
          </div>
          
          <div className="mb-3">
            <button type="button" className="btn btn-outline-primary me-2">Primary</button>
            <button type="button" className="btn btn-outline-secondary me-2">Secondary</button>
            <button type="button" className="btn btn-outline-success me-2">Success</button>
            <button type="button" className="btn btn-outline-danger me-2">Danger</button>
          </div>

          <div className="mb-3">
            <button type="button" className="btn btn-primary btn-lg me-2">Large button</button>
            <button type="button" className="btn btn-secondary me-2">Normal button</button>
            <button type="button" className="btn btn-success btn-sm">Small button</button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="card mb-4">
        <div className="card-header">
          <h4>Cards</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  Featured
                </div>
                <div className="card-body">
                  <h5 className="card-title">Special title treatment</h5>
                  <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                  <a href="#" className="btn btn-primary">Go somewhere</a>
                </div>
                <div className="card-footer text-muted">
                  2 days ago
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card text-white bg-primary mb-3">
                <div className="card-header">Header</div>
                <div className="card-body">
                  <h5 className="card-title">Primary card title</h5>
                  <p className="card-text">Some quick example text for the card.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-success">
                <div className="card-header bg-transparent border-success">Header</div>
                <div className="card-body text-success">
                  <h5 className="card-title">Success card title</h5>
                  <p className="card-text">Some quick example text for the card.</p>
                </div>
                <div className="card-footer bg-transparent border-success">Footer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* List Groups */}
      <section className="card mb-4">
        <div className="card-header">
          <h4>List Groups</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <ul className="list-group">
                <li className="list-group-item">Basic list item</li>
                <li className="list-group-item active">Active item</li>
                <li className="list-group-item disabled">Disabled item</li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Inbox
                  <span className="badge bg-primary rounded-pill">14</span>
                </li>
              </ul>
            </div>
            
            <div className="col-md-6">
              <div className="list-group">
                <a href="#" className="list-group-item list-group-item-action active">
                  <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">List group item heading</h5>
                    <small>3 days ago</small>
                  </div>
                  <p className="mb-1">Some placeholder content in a paragraph.</p>
                  <small>And some small print.</small>
                </a>
                <a href="#" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">List group item heading</h5>
                    <small className="text-muted">3 days ago</small>
                  </div>
                  <p className="mb-1">Some placeholder content in a paragraph.</p>
                  <small className="text-muted">And some muted small print.</small>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spinners */}
      <section className="card mb-4">
        <div className="card-header">
          <h4>Spinners</h4>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <div className="spinner-border text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="spinner-border text-secondary me-2" role="status"></div>
            <div className="spinner-border text-success me-2" role="status"></div>
            <div className="spinner-border text-danger me-2" role="status"></div>
          </div>
          
          <div>
            <div className="spinner-grow text-primary me-2" role="status"></div>
            <div className="spinner-grow text-secondary me-2" role="status"></div>
            <div className="spinner-grow text-success me-2" role="status"></div>
            <div className="spinner-grow text-danger me-2" role="status"></div>
          </div>
        </div>
      </section>

      {/* Toast */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{zIndex: 11}}>
        <div 
          className={`toast ${toastVisible ? 'show' : ''}`} 
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div className="toast-header">
            <strong className="me-auto">Bootstrap</strong>
            <small>11 mins ago</small>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setToastVisible(false)}
            ></button>
          </div>
          <div className="toast-body">
            Hello, world! This is a toast message.
          </div>
        </div>
      </div>

      <div className="mb-4">
        <button 
          className="btn btn-primary" 
          onClick={() => setToastVisible(true)}
        >
          Show Toast
        </button>
      </div>

      {/* Modal */}
      <div 
        className={`modal fade ${modalOpen ? 'show' : ''}`} 
        style={{display: modalOpen ? 'block' : 'none'}}
        tabIndex="-1"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Modal title</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setModalOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>Modal body text goes here.</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">Save changes</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <button 
          className="btn btn-primary" 
          onClick={() => setModalOpen(true)}
        >
          Launch Modal
        </button>
      </div>
    </div>
  );
};

export default UITest; 