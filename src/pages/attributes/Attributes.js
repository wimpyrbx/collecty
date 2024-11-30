import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaSearch, FaCheck, FaTimes, FaEdit, FaTrash, FaCog, FaTags } from 'react-icons/fa';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import AttributeModal from '../../components/attributes/AttributeModal';
import DeleteModal from '../../components/common/DeleteModal/DeleteModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader/PageHeader';
import './Attributes.css';

const Attributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [productGroups, setProductGroups] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    item: null,
    isDeleting: false
  });
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  const fetchAttributes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attributes', {
        params: { 
          sortOrder: 'asc'
        }
      });
      setAttributes(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load attributes');
      console.error('Error fetching attributes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [groupsRes, typesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/product-groups'),
        axios.get('http://localhost:5000/api/product-types')
      ]);
      setProductGroups(groupsRes.data.data);
      setProductTypes(typesRes.data.data);
    } catch (err) {
      toast.error('Failed to load reference data');
      console.error('Error fetching reference data:', err);
    }
  };

  useEffect(() => {
    fetchAttributes();
    fetchReferenceData();
  }, []);

  const handleEdit = (attribute) => {
    setSelectedAttribute(attribute);
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    const { item } = deleteModal;
    
    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      
      await axios.delete(`http://localhost:5000/api/attributes/${item.id}`);
      toast.success('Attribute deleted successfully');
      fetchAttributes();
      
      setDeleteModal({ show: false, item: null, isDeleting: false });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete attribute';
      toast.error(errorMessage);
      setDeleteModal({ show: false, item: null, isDeleting: false });
    }
  };

  const showDeleteModal = (item) => {
    setDeleteModal({
      show: true,
      item,
      isDeleting: false
    });
  };

  const filteredAttributes = attributes.filter(attr => 
    attr.ui_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attr.scope.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGroupNames = (attribute) => {
    if (!attribute.product_group_ids) return '-';
    try {
      const groupIds = typeof attribute.product_group_ids === 'string' 
        ? JSON.parse(attribute.product_group_ids) 
        : attribute.product_group_ids;
        
      return groupIds
        .map(id => productGroups.find(g => g.id === id)?.name || id)
        .join(', ') || '-';
    } catch (e) {
      console.error('Error parsing group IDs:', e);
      return '-';
    }
  };

  const getTypeNames = (attribute) => {
    if (!attribute.product_type_ids) return '-';
    try {
      const typeIds = typeof attribute.product_type_ids === 'string'
        ? JSON.parse(attribute.product_type_ids)
        : attribute.product_type_ids;
        
      return typeIds
        .map(id => productTypes.find(t => t.id === id)?.name || id)
        .join(', ') || '-';
    } catch (e) {
      console.error('Error parsing type IDs:', e);
      return '-';
    }
  };

  const renderBooleanValue = (value) => {
    if (typeof value === 'string') {
      value = value === '1';
    }
    return (
      <div className="text-center">
        {value ? (
          <FaCheck className="text-success" />
        ) : (
          <FaTimes className="text-danger" />
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid">
      <PageHeader bgClass="bg-primary" textClass="text-white">
        <PageHeader.Icon color="#66BB6A">
          <FaTags />
        </PageHeader.Icon>
        <PageHeader.Title>
          Attributes
        </PageHeader.Title>
        <PageHeader.Actions>
          <Button variant="light" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" />
            Add Attribute
          </Button>
        </PageHeader.Actions>
        <PageHeader.TitleSmall>
          Manage your product attributes
        </PageHeader.TitleSmall>
      </PageHeader>

      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search attributes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Scope</th>
              <th>Name</th>
              <th>Type</th>
              <th>Required</th>
              <th>Image</th>
              <th>Show UI</th>
              <th>Show Empty</th>
              <th>Product Groups</th>
              <th>Product Types</th>
              <th>Allowed Values</th>
              <th>Default Value</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredAttributes.map(attribute => (
              <tr key={attribute.id}>
                <td>{attribute.scope === 'product' ? 'Product' : 'Inventory'}</td>
                <td>{attribute.ui_name} ({attribute.name})</td>
                <td>{attribute.type}</td>
                <td>{renderBooleanValue(attribute.is_required)}</td>
                <td>{renderBooleanValue(attribute.use_image)}</td>
                <td>{renderBooleanValue(attribute.show_in_ui)}</td>
                <td>{renderBooleanValue(attribute.show_if_empty)}</td>
                <td>{getGroupNames(attribute)}</td>
                <td>{getTypeNames(attribute)}</td>
                <td>
                  {attribute.allowed_values ? 
                    JSON.parse(attribute.allowed_values).join(', ') 
                    : ''}
                </td>
                <td>{attribute.default_value}</td>
                <td>{renderBooleanValue(attribute.is_active)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <FaEdit 
                      className="text-primary cursor-pointer" 
                      onClick={() => handleEdit(attribute)}
                      title="Edit"
                    />
                    <FaTrash 
                      className="text-danger cursor-pointer" 
                      role="button" 
                      onClick={() => showDeleteModal(attribute)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AttributeModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAttributeSaved={fetchAttributes}
        productGroups={productGroups}
        productTypes={productTypes}
      />

      <AttributeModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedAttribute(null);
        }}
        onAttributeSaved={fetchAttributes}
        attribute={selectedAttribute}
        productGroups={productGroups}
        productTypes={productTypes}
        isEdit
      />

      <DeleteModal 
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, item: null, isDeleting: false })}
        onConfirm={handleDelete}
        title="Delete Attribute"
        message={`Are you sure you want to delete "${deleteModal.item?.name}"?`}
        isDeleting={deleteModal.isDeleting}
      />
    </div>
  );
};

export default Attributes; 