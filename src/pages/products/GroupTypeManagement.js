import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { FaTags, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import './GroupTypeManagement.css';
import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from '../../components/BaseModal';
import DeleteModal from '../../components/common/DeleteModal/DeleteModal';

const GroupTypeManagement = () => {
  // State for each section
  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    groups: true,
    types: true
  });

  // Add modal states
  const [modals, setModals] = useState({
    addGroup: false,
    editGroup: false,
    addType: false,
    editType: false,
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
  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/product-groups');
      setGroups(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/product-types');
      setTypes(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load types');
    } finally {
      setLoading(prev => ({ ...prev, types: false }));
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchTypes();
  }, []);

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
      
      await axios.delete(`http://localhost:5000/api/${type}/${item.id}`);
      toast.success('Item deleted successfully');
      
      if (type === 'product-groups') {
        fetchGroups();
      } else {
        fetchTypes();
      }
      
      setDeleteModal({ show: false, type: null, item: null, isDeleting: false });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete item';
      toast.error(errorMessage);
      setDeleteModal({ show: false, type: null, item: null, isDeleting: false });
    }
  };

  const handleSubmit = async (type) => {
    try {
      const isEdit = editingItem !== null;
      const method = isEdit ? 'put' : 'post';
      const url = `http://localhost:5000/api/${type}${isEdit ? `/${editingItem.id}` : ''}`;
      
      let data = { ...formData };
      if (!data.name) {
        toast.error('Name is required');
        return;
      }

      await axios[method](url, data);
      toast.success(`Item ${isEdit ? 'updated' : 'added'} successfully`);
      handleModalClose();

      if (type === 'product-groups') {
        fetchGroups();
      } else {
        fetchTypes();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || `Failed to ${editingItem ? 'update' : 'add'} item`;
      toast.error(errorMessage);
    }
  };

  // Add showDeleteModal function
  const showDeleteModal = (type, item) => {
    setDeleteModal({
      show: true,
      type,
      item,
      isDeleting: false
    });
  };

  const renderGroupsList = () => (
    <div className="section-content">
      {loading.groups ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="list-group">
          {groups.map(group => (
            <div
              key={group.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{group.name}</span>
              <div>
                <FaEdit 
                  className="me-2" 
                  role="button" 
                  onClick={() => handleModalShow('editGroup', group)}
                />
                <FaTrash 
                  className="text-danger" 
                  role="button" 
                  onClick={() => showDeleteModal('product-groups', group)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTypesList = () => (
    <div className="section-content">
      {loading.types ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="list-group">
          {types.map(type => (
            <div
              key={type.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{type.name}</span>
              <div>
                <FaEdit 
                  className="me-2" 
                  role="button" 
                  onClick={() => handleModalShow('editType', type)}
                />
                <FaTrash 
                  className="text-danger" 
                  role="button" 
                  onClick={() => showDeleteModal('product-types', type)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderModals = () => (
    <>
      <BaseModal 
        show={modals.addGroup || modals.editGroup} 
        onHide={handleModalClose}
        size="sm"
      >
        <Form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit('product-groups');
        }}>
          <BaseModalHeader 
            icon={editingItem ? <FaEdit /> : <FaPlus />}
            onHide={handleModalClose}
          >
            {editingItem ? 'Edit Group' : 'Add Group'}
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
            onConfirm={() => handleSubmit('product-groups')}
            cancelText="Cancel"
            confirmText={editingItem ? 'Update' : 'Create'}
          />
        </Form>
      </BaseModal>

      <BaseModal 
        show={modals.addType || modals.editType} 
        onHide={handleModalClose}
        size="sm"
      >
        <Form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit('product-types');
        }}>
          <BaseModalHeader 
            icon={editingItem ? <FaEdit /> : <FaPlus />}
            onHide={handleModalClose}
          >
            {editingItem ? 'Edit Type' : 'Add Type'}
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
            onConfirm={() => handleSubmit('product-types')}
            cancelText="Cancel"
            confirmText={editingItem ? 'Update' : 'Create'}
          />
        </Form>
      </BaseModal>
    </>
  );

  return (
    <div className="page-container">
      <Toaster position="top-right" />
      
      <PageHeader>
        <PageHeader.Icon color="#ffc107">
          <FaTags />
        </PageHeader.Icon>
        <PageHeader.Title>
          Groups/Types
        </PageHeader.Title>
        <PageHeader.Actions>
          {/* Add actions if needed */}
        </PageHeader.Actions>
      </PageHeader>

      <Row className="g-4">
        <Col md={6}>
          <div className="section-container">
            <div className="section-header bg-primary text-white">
              <h5 className="mb-0">Groups</h5>
              <Button 
                size="sm" 
                variant="light"
                onClick={() => handleModalShow('addGroup')}
              >
                <FaPlus className="me-1" /> Add Group
              </Button>
            </div>
            {renderGroupsList()}
          </div>
        </Col>

        <Col md={6}>
          <div className="section-container">
            <div className="section-header bg-primary text-white">
              <h5 className="mb-0">Types</h5>
              <Button 
                size="sm" 
                variant="light"
                onClick={() => handleModalShow('addType')}
              >
                <FaPlus className="me-1" /> Add Type
              </Button>
            </div>
            {renderTypesList()}
          </div>
        </Col>
      </Row>

      {renderModals()}

      <DeleteModal 
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, type: null, item: null, isDeleting: false })}
        onConfirm={handleDelete}
        title={`Delete ${deleteModal.type === 'product-groups' ? 'Group' : 'Type'}`}
        message={`Are you sure you want to delete "${deleteModal.item?.name}"?`}
        isDeleting={deleteModal.isDeleting}
      />
    </div>
  );
};

export default GroupTypeManagement; 