import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AttributeModal from '../../components/attributes/AttributeModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ProductAttributes.css';

const ProductAttributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productGroups, setProductGroups] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  const fetchAttributes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attributes', {
        params: { 
          scope: 'product',
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

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/attributes/${selectedAttribute.id}`);
      toast.success('Attribute deleted successfully');
      fetchAttributes();
      setShowDeleteModal(false);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('Cannot delete attribute as it is in use');
      } else {
        toast.error('Failed to delete attribute');
      }
      console.error('Error deleting attribute:', err);
    }
  };

  const filteredAttributes = attributes.filter(attr => 
    attr.ui_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attr.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderActionButtons = (attribute) => (
    <div className="d-flex justify-content-center gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => {
          setSelectedAttribute(attribute);
          setShowEditModal(true);
        }}
      >
        Edit
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => {
          setSelectedAttribute(attribute);
          setShowDeleteModal(true);
        }}
      >
        Delete
      </Button>
    </div>
  );

  const renderAttributeValue = (attribute) => {
    switch (attribute.type) {
      case 'boolean':
        return attribute.default_value === '1' ? 'Yes' : 'No';
      case 'set':
        return attribute.default_value || '-';
      default:
        return attribute.default_value || '-';
    }
  };

  const renderAllowedValues = (attribute) => {
    if (attribute.type !== 'set' || !attribute.allowed_values) return '-';
    return attribute.allowed_values;
  };

  const getGroupNames = (attribute) => {
    if (!attribute.product_group_ids) return '-';
    try {
      const groupIds = JSON.parse(attribute.product_group_ids);
      return groupIds.map(id => 
        productGroups.find(g => g.id === id)?.name || id
      ).join(', ') || '-';
    } catch (e) {
      return '-';
    }
  };

  const getTypeNames = (attribute) => {
    if (!attribute.product_type_ids) return '-';
    try {
      const typeIds = JSON.parse(attribute.product_type_ids);
      return typeIds.map(id => 
        productTypes.find(t => t.id === id)?.name || id
      ).join(', ') || '-';
    } catch (e) {
      return '-';
    }
  };

  const renderBooleanValue = (value) => (
    <div className="text-center">
      {value ? (
        <FaCheck className="text-success" />
      ) : (
        <FaTimes className="text-danger" />
      )}
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Product Attributes</h1>
        <Button 
          variant="primary" 
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Attribute
        </Button>
      </div>

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
        <table className="table table-hover">
          <thead className="bg-primary text-white">
            <tr>
              <th>Display Name</th>
              <th>Internal Name</th>
              <th>Type</th>
              <th className="text-center">Required</th>
              <th>Default Value</th>
              <th>Allowed Values</th>
              <th>Product Group</th>
              <th>Product Type</th>
              <th className="text-center">Use Image</th>
              <th className="text-center">Show in UI</th>
              <th className="text-center">Show if Empty</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttributes.map(attribute => (
              <tr key={attribute.id}>
                <td>{attribute.ui_name}</td>
                <td>{attribute.name}</td>
                <td>{attribute.type}</td>
                <td>{renderBooleanValue(attribute.is_required)}</td>
                <td>{renderAttributeValue(attribute)}</td>
                <td>{renderAllowedValues(attribute)}</td>
                <td>{getGroupNames(attribute)}</td>
                <td>{getTypeNames(attribute)}</td>
                <td>{renderBooleanValue(attribute.use_image)}</td>
                <td>{renderBooleanValue(attribute.show_in_ui)}</td>
                <td>{renderBooleanValue(attribute.show_if_empty)}</td>
                <td className="text-center">
                  {renderActionButtons(attribute)}
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
        onHide={() => setShowEditModal(false)}
        onAttributeSaved={fetchAttributes}
        attribute={selectedAttribute}
        productGroups={productGroups}
        productTypes={productTypes}
        isEdit
      />

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Attribute"
        message="Are you sure you want to delete this attribute? This action cannot be undone."
      />
    </div>
  );
};

export default ProductAttributes; 