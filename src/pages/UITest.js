import React, { useState, useEffect } from 'react';
import { Tooltip, Toast, Popover } from 'bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { 
  FaBell, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaUser,
  FaCog,
  FaEnvelope,
  FaHome,
  FaChartLine,
  FaCode,
  FaLightbulb,
  FaMoon,
  FaToggleOn,
  FaToggleOff,
  FaTools,
  FaPalette
} from 'react-icons/fa';
import { Modal, OverlayTrigger, Tooltip as BSTooltip, Popover as BSPopover, Accordion, Carousel } from 'react-bootstrap';
import PageHeader from '../components/layout/PageHeader/PageHeader';

const UITest = () => {
  const [toastVisible, setToastVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('buttons');
  const [switches, setSwitches] = useState({
    notifications: true,
    darkMode: false,
    autoUpdate: true,
    maintenance: false
  });
  const [showModal, setShowModal] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Initialize tooltips and popovers
  useEffect(() => {
    // Initialize all tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));

    // Initialize all popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    [...popoverTriggerList].map(popoverTriggerEl => new Popover(popoverTriggerEl));

    // Cleanup
    return () => {
      tooltipTriggerList.forEach(tooltip => {
        const instance = Tooltip.getInstance(tooltip);
        if (instance) {
          instance.dispose();
        }
      });
      popoverTriggerList.forEach(popover => {
        const instance = Popover.getInstance(popover);
        if (instance) {
          instance.dispose();
        }
      });
    };
  }, []);

  // Notification examples
  const showSuccessToast = () => {
    toast.success('Operation completed successfully!', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const showErrorToast = () => {
    toast.error('Something went wrong!', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const showSweetAlert = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        );
      }
    });
  };

  const handleSwitchChange = (key) => {
    setSwitches(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle tab changes
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleCarouselSelect = (selectedIndex, e) => {
    setCarouselIndex(selectedIndex);
  };

  return (
    <div className="container-fluid">
      <PageHeader bgClass="bg-primary" textClass="text-white">
        <PageHeader.Icon color="#66BB6A">
          <FaTools />
        </PageHeader.Icon>
        <PageHeader.Title>
          UI Test
        </PageHeader.Title>
        <PageHeader.TitleSmall>
          Test and preview UI components and features
        </PageHeader.TitleSmall>
      </PageHeader>

      <ToastContainer /> {/* Required for react-toastify */}
      
      <h1>UI Components Test Page</h1>
      
      {/* Tab Navigation */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'buttons' ? 'active' : ''}`}
            onClick={() => handleTabChange('buttons')}
          >
            Buttons
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'modals' ? 'active' : ''}`}
            onClick={() => handleTabChange('modals')}
          >
            Modals
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => handleTabChange('alerts')}
          >
            Alerts
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => handleTabChange('cards')}
          >
            Cards
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => handleTabChange('progress')}
          >
            Progress
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content mt-3">
        {/* Buttons Tab */}
        {activeTab === 'buttons' && (
          <div className="tab-pane show active">
            <section className="mb-4">
              <h4>Button Variations</h4>
              <button className="btn btn-primary m-1">Primary</button>
              <button className="btn btn-secondary m-1">Secondary</button>
              <button className="btn btn-success m-1">Success</button>
              <button className="btn btn-danger m-1">Danger</button>
              <button className="btn btn-warning m-1">Warning</button>
              <button className="btn btn-info m-1">Info</button>
              <button className="btn btn-light m-1">Light</button>
              <button className="btn btn-dark m-1">Dark</button>
            </section>

            {/* Additional Button Examples */}
            <section className="mb-4">
              <h4>Icon Buttons</h4>
              <button className="btn btn-primary m-1">
                <FaHome /> Home
              </button>
              <button className="btn btn-success m-1">
                <FaCheck /> Confirm
              </button>
              <button className="btn btn-danger m-1">
                <FaTimes /> Cancel
              </button>
            </section>

            <section className="mb-4">
              <h4>Button Sizes</h4>
              <button className="btn btn-primary btn-sm m-1">Small Button</button>
              <button className="btn btn-primary m-1">Default Button</button>
              <button className="btn btn-primary btn-lg m-1">Large Button</button>
            </section>
          </div>
        )}

        {/* Modals Tab */}
        {activeTab === 'modals' && (
          <div className="tab-pane show active">
            <section className="mb-4">
              <h4>Modal Examples</h4>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Open Modal
              </button>

              <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Modal Title</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  This is the content inside the modal.
                </Modal.Body>
                <Modal.Footer>
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                  <button className="btn btn-primary">
                    Save changes
                  </button>
                </Modal.Footer>
              </Modal>
            </section>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="tab-pane show active">
            <section className="mb-4">
              <h4>Alert Examples</h4>
              <div className="alert alert-primary" role="alert">
                This is a primary alert—check it out!
              </div>
              <div className="alert alert-secondary" role="alert">
                This is a secondary alert—check it out!
              </div>
              <div className="alert alert-success" role="alert">
                This is a success alert—check it out!
              </div>
              <div className="alert alert-danger" role="alert">
                This is a danger alert—check it out!
              </div>
            </section>
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className="tab-pane show active">
            <section className="mb-4">
              <h4>Card Examples</h4>
              <div className="card mb-3" style={{maxWidth: '540px'}}>
                <div className="row g-0">
                  <div className="col-md-4">
                    <img src="https://via.placeholder.com/150" className="img-fluid rounded-start" alt="..." />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title">Card title</h5>
                      <p className="card-text">This is a wider card with supporting text.</p>
                      <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="tab-pane show active">
            <section className="mb-4">
              <h4>Progress Bar Examples</h4>
              <div className="mb-3">
                <label>Basic Progress Bar</label>
                <div className="progress">
                  <div className="progress-bar" role="progressbar" style={{width: '25%'}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
                </div>
              </div>
              <div className="mb-3">
                <label>Striped Progress Bar</label>
                <div className="progress">
                  <div className="progress-bar progress-bar-striped" role="progressbar" style={{width: '50%'}} aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">50%</div>
                </div>
              </div>
              <div className="mb-3">
                <label>Animated Progress Bar</label>
                <div className="progress">
                  <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{width: '75%'}} aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">75%</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default UITest; 