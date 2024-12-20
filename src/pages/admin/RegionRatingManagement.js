import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaGlobe, FaPlus, FaSearch, FaEdit, FaTrash, FaLayerGroup, FaTags } from 'react-icons/fa';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader/PageHeader';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../../components/common/Modal';
import DeleteModal from '../../components/common/Modal/DeleteModal';

const RegionRatingManagement = () => {
  // State for each section
  const [regions, setRegions] = useState([]);
  const [ratingGroups, setRatingGroups] = useState([]);
  const [ratings, setRatings] = useState([]);
  
  // Selected items
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedRatingGroup, setSelectedRatingGroup] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    regions: true,
    groups: false,
    ratings: false
  });

  // Add modal states
  const [modals, setModals] = useState({
    addRegion: false,
    editRegion: false,
    addRatingGroup: false,
    editRatingGroup: false,
    addRating: false,
    editRating: false,
  });
  
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Add state for delete modal
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    type: null,
    item: null,
    isDeleting: false
  });

  // Fetch data
  const fetchRegions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/regions');
      setRegions(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load regions');
    } finally {
      setLoading(prev => ({ ...prev, regions: false }));
    }
  };

  const fetchRatingGroups = async (regionId) => {
    if (!regionId) {
      setRatingGroups([]);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, groups: true }));
      const response = await axios.get(`http://localhost:5000/api/rating-groups`, {
        params: { regionId }
      });
      const groups = response.data.data || [];
      setRatingGroups(groups);
      
      // Auto-select if only one rating group
      const filteredGroups = groups.filter(group => group.region_id === regionId);
      if (filteredGroups.length === 1) {
        setSelectedRatingGroup(filteredGroups[0]);
      } else {
        setSelectedRatingGroup(null);
      }
    } catch (err) {
      toast.error('Failed to load rating groups');
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  };

  const fetchRatings = async (groupId) => {
    if (!groupId) {
      setRatings([]);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, ratings: true }));
      const response = await axios.get(`http://localhost:5000/api/ratings`, {
        params: { groupId }
      });
      setRatings(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load ratings');
    } finally {
      setLoading(prev => ({ ...prev, ratings: false }));
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      fetchRatingGroups(selectedRegion.id);
    } else {
      setRatingGroups([]);
      setSelectedRatingGroup(null);
      setRatings([]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedRatingGroup) {
      fetchRatings(selectedRatingGroup.id);
    } else {
      setRatings([]);
    }
  }, [selectedRatingGroup]);

  const handleRegionSelect = (region) => {
    if (region.id !== selectedRegion?.id) {
      setSelectedRegion(region);
      setSelectedRatingGroup(null);
      setRatings([]);
    }
  };

  const handleRatingGroupSelect = (group) => {
    setSelectedRatingGroup(group);
  };

  // Modal handlers
  const handleModalClose = () => {
    setModals(prev => Object.keys(prev).reduce((acc, key) => ({...acc, [key]: false}), {}));
    setEditingItem(null);
    setFormData({});
  };

  const handleModalShow = (modalType, item = null) => {
    setModals(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({...acc, [key]: false}), {}),
      [modalType]: true
    }));
    setEditingItem(item);
    setFormData(item || {});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // CRUD operations
  const handleDelete = async () => {
    const { type, item } = deleteModal;
    
    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));

      // Check dependencies before deleting
      if (type === 'regions') {
        const associatedGroups = ratingGroups.filter(group => group.region_id === item.id);
        if (associatedGroups.length > 0) {
          toast.error('Cannot delete region with associated rating groups. Please delete the rating groups first.');
          setDeleteModal({ show: false, type: null, item: null, isDeleting: false }); // Close modal
          return;
        }
      }

      if (type === 'rating-groups') {
        const associatedRatings = ratings.filter(rating => rating.rating_group_id === item.id);
        if (associatedRatings.length > 0) {
          toast.error('Cannot delete rating group with associated ratings. Please delete the ratings first.');
          setDeleteModal({ show: false, type: null, item: null, isDeleting: false }); // Close modal
          return;
        }
      }
      
      await axios.delete(`http://localhost:5000/api/${type}/${item.id}`);
      toast.success('Item deleted successfully');
      
      // Refresh appropriate list
      switch (type) {
        case 'regions':
          fetchRegions();
          if (selectedRegion?.id === item.id) {
            setSelectedRegion(null);
          }
          break;
        case 'rating-groups':
          fetchRatingGroups(selectedRegion.id);
          if (selectedRatingGroup?.id === item.id) {
            setSelectedRatingGroup(null);
          }
          break;
        case 'ratings':
          fetchRatings(selectedRatingGroup.id);
          break;
      }
      
      setDeleteModal({ show: false, type: null, item: null, isDeleting: false });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete item';
      toast.error(errorMessage);
      setDeleteModal({ show: false, type: null, item: null, isDeleting: false }); // Close modal on error too
    }
  };

  const handleSubmit = async (type) => {
    try {
      const isEdit = editingItem !== null;
      const method = isEdit ? 'put' : 'post';
      const url = `http://localhost:5000/api/${type}${isEdit ? `/${editingItem.id}` : ''}`;
      
      // Add necessary IDs for rating groups and ratings
      let data = { ...formData };
      if (type === 'rating-groups' && !isEdit) {
        if (!selectedRegion?.id) {
          toast.error('Please select a region first');
          return;
        }
        data.region_id = selectedRegion.id;
        
        if (!data.name) {
          toast.error('Name is required');
          return;
        }
      }
      if (type === 'ratings' && !isEdit) {
        if (!selectedRatingGroup?.id) {
          toast.error('Please select a rating group first');
          return;
        }
        data.rating_group_id = selectedRatingGroup.id;
      }

      console.log('Submitting data:', data); // Debug log
      await axios[method](url, data);
      toast.success(`Item ${isEdit ? 'updated' : 'added'} successfully`);
      handleModalClose();

      // Refresh appropriate list
      switch (type) {
        case 'regions':
          fetchRegions();
          break;
        case 'rating-groups':
          fetchRatingGroups(selectedRegion.id);
          break;
        case 'ratings':
          fetchRatings(selectedRatingGroup.id);
          break;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || `Failed to ${editingItem ? 'update' : 'add'} item`;
      toast.error(errorMessage);
      console.error('Submit error:', err.response?.data); // Debug log
    }
  };

  // Add these modal render functions
  const renderModals = () => (
    <>
      <BaseModal 
        show={modals.addRegion || modals.editRegion} 
        onHide={handleModalClose}
        size="sm"
      >
        <Form onSubmit={() => handleSubmit('regions')}>
          <BaseModalHeader 
            icon={editingItem ? <FaEdit /> : <FaPlus />}
            onHide={handleModalClose}
          >
            {editingItem ? 'Edit Region' : 'Add Region'}
          </BaseModalHeader>

          <BaseModalBody>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </BaseModalBody>

          <BaseModalFooter
            onCancel={handleModalClose}
            onConfirm={() => handleSubmit('regions')}
            cancelText="Cancel"
            confirmText={editingItem ? 'Update' : 'Create'}
          />
        </Form>
      </BaseModal>

      <BaseModal 
        show={modals.addRatingGroup || modals.editRatingGroup} 
        onHide={handleModalClose}
        size="sm"
      >
        <Form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit('rating-groups');
        }}>
          <BaseModalHeader 
            icon={editingItem ? <FaEdit /> : <FaPlus />}
            onHide={handleModalClose}
          >
            {editingItem ? 'Edit Rating Group' : 'Add Rating Group'}
          </BaseModalHeader>

          <BaseModalBody>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </BaseModalBody>

          <BaseModalFooter
            onCancel={handleModalClose}
            onConfirm={() => handleSubmit('rating-groups')}
            cancelText="Cancel"
            confirmText={editingItem ? 'Update' : 'Create'}
          />
        </Form>
      </BaseModal>

      <BaseModal 
        show={modals.addRating || modals.editRating} 
        onHide={handleModalClose}
        size="sm"
      >
        <Form onSubmit={() => handleSubmit('ratings')}>
          <BaseModalHeader 
            icon={editingItem ? <FaEdit /> : <FaPlus />}
            onHide={handleModalClose}
          >
            {editingItem ? 'Edit Rating' : 'Add Rating'}
          </BaseModalHeader>

          <BaseModalBody>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                name="age"
                value={formData.age || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </BaseModalBody>

          <BaseModalFooter
            onCancel={handleModalClose}
            onConfirm={() => handleSubmit('ratings')}
            cancelText="Cancel"
            confirmText={editingItem ? 'Update' : 'Create'}
          />
        </Form>
      </BaseModal>
    </>
  );

  // Add showDeleteModal function
  const showDeleteModal = (type, item) => {
    setDeleteModal({
      show: true,
      type,
      item,
      isDeleting: false
    });
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col md={4}>
          <PageHeader bgClass="bg-primary" textClass="text-white">
            <PageHeader.Icon color="#66BB6A">
              <FaGlobe />
            </PageHeader.Icon>
            <PageHeader.Title>
              Regions
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button variant="light" onClick={() => handleModalShow('addRegion')}>
                <FaPlus className="me-2" />
                Add Region
              </Button>
            </PageHeader.Actions>
            <PageHeader.TitleSmall>
              Manage regions
            </PageHeader.TitleSmall>
          </PageHeader>
        </Col>
        <Col md={4}>
          <PageHeader bgClass="bg-primary" textClass="text-white">
            <PageHeader.Icon color="#66BB6A">
              <FaLayerGroup />
            </PageHeader.Icon>
            <PageHeader.Title>
              Rating Groups
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button variant="light" disabled={!selectedRegion} onClick={() => handleModalShow('addRatingGroup')}>
                <FaPlus className="me-2" />
                Add Group
              </Button>
            </PageHeader.Actions>
            <PageHeader.TitleSmall>
              Manage rating groups
            </PageHeader.TitleSmall>
          </PageHeader>
        </Col>
        <Col md={4}>
          <PageHeader bgClass="bg-primary" textClass="text-white">
            <PageHeader.Icon color="#66BB6A">
              <FaTags />
            </PageHeader.Icon>
            <PageHeader.Title>
              Ratings
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button variant="light" disabled={!selectedRatingGroup} onClick={() => handleModalShow('addRating')}>
                <FaPlus className="me-2" />
                Add Rating
              </Button>
            </PageHeader.Actions>
            <PageHeader.TitleSmall>
              Manage ratings
            </PageHeader.TitleSmall>
          </PageHeader>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={4}>
          <div>
            {loading.regions ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th style={{width: '3px', padding: 0}}></th>
                      <th>Name</th>
                      <th style={{width: '1%'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map(region => (
                      <tr 
                        key={region.id} 
                        className={`${selectedRegion?.id === region.id ? 'table-active' : ''}`}
                        onClick={() => handleRegionSelect(region)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{
                          padding: 0,
                          background: selectedRegion?.id === region.id ? 'var(--bs-success)' : 'transparent'
                        }}></td>
                        <td>{region.name}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <FaEdit 
                              className="text-primary cursor-pointer" 
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleModalShow('editRegion', region);
                              }}
                              title="Edit"
                            />
                            <FaTrash 
                              className="text-danger cursor-pointer" 
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                showDeleteModal('regions', region);
                              }}
                              title="Delete"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Col>

        <Col md={4}>
          <div>
            {loading.groups ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : selectedRegion ? (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th style={{width: '3px', padding: 0}}></th>
                      <th>Name</th>
                      <th>Description</th>
                      <th style={{width: '1%'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratingGroups
                      .filter(group => group.region_id === selectedRegion.id)
                      .map(group => (
                        <tr 
                          key={group.id}
                          className={`${selectedRatingGroup?.id === group.id ? 'table-active' : ''}`}
                          onClick={() => handleRatingGroupSelect(group)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{
                            padding: 0,
                            background: selectedRatingGroup?.id === group.id ? 'var(--bs-success)' : 'transparent'
                          }}></td>
                          <td>{group.name}</td>
                          <td>{group.description || '-'}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <FaEdit 
                                className="text-primary cursor-pointer" 
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleModalShow('editRatingGroup', group);
                                }}
                                title="Edit"
                              />
                              <FaTrash 
                                className="text-danger cursor-pointer" 
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showDeleteModal('rating-groups', group);
                                }}
                                title="Delete"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted py-3">
                Select a region to view rating groups
              </div>
            )}
          </div>
        </Col>

        <Col md={4}>
          <div>
            {loading.ratings ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : selectedRatingGroup ? (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th style={{width: '1%'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings
                      .filter(rating => rating.rating_group_id === selectedRatingGroup.id)
                      .map(rating => (
                        <tr key={rating.id}>
                          <td>{rating.name}</td>
                          <td>{rating.age || '-'}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <FaEdit 
                                className="text-primary cursor-pointer" 
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleModalShow('editRating', rating);
                                }}
                                title="Edit"
                              />
                              <FaTrash 
                                className="text-danger cursor-pointer" 
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showDeleteModal('ratings', rating);
                                }}
                                title="Delete"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted py-3">
                Select a rating group to view ratings
              </div>
            )}
          </div>
        </Col>
      </Row>

      {renderModals()}

      <DeleteModal 
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, type: null, item: null, isDeleting: false })}
        onConfirm={handleDelete}
        title={`Delete ${
          deleteModal.type === 'regions' ? 'Region' : 
          deleteModal.type === 'rating-groups' ? 'Rating Group' : 
          'Rating'
        }`}
        message={`Are you sure you want to delete "${deleteModal.item?.name}"?`}
        isDeleting={deleteModal.isDeleting}
      />

      <Toaster position="top-right" />
    </div>
  );
};

export default RegionRatingManagement; 