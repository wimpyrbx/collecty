import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Form, Badge, OverlayTrigger, Tooltip, Table } from 'react-bootstrap';
import { 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaBox, 
  FaTable, 
  FaThLarge, 
  FaList, 
  FaGamepad, 
  FaImage, 
  FaSort, 
  FaUsers 
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CustomTableCell from '../../components/common/Table/CustomTableCell';
import AddProductModal from '../../components/products/Forms/AddProductModal';
import EditProductModal from '../../components/products/Forms/EditProductModal';
import AttributeDisplay from '../../components/attributes/AttributeDisplay';
import RegionImage from '../../components/common/Images/RegionImage';
import ProductTypeImage from '../../components/common/Images/ProductTypeImage';
import PageHeader from '../../components/layout/PageHeader/PageHeader';
import DeleteModal from '../../components/common/Modal/DeleteModal';
import SimplePagination from '../../components/common/SimplePagination';
import AddInventoryModal from '../../components/inventory/Forms/AddInventoryModal';
import './ProductList.css';

const IMAGE_SIZE = {
  width: 60,  // DVD case proportions (approximately 7.5:11)
  height: 85
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'grid', 'compact', or 'showcase'
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    productGroup: '',
    productType: '',
    region: '',
    searchTerm: '',
  });
  const [preselectedFilters, setPreselectedFilters] = useState({
    product_group_id: '',
    product_type_id: '',
    region_id: ''
  });
  const [productGroups, setProductGroups] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [availableRatingGroups, setAvailableRatingGroups] = useState([]);
  const [availableRatings, setAvailableRatings] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    item: null,
    isDeleting: false
  });
  const [showAddToInventory, setShowAddToInventory] = useState(false);
  const [selectedForInventory, setSelectedForInventory] = useState(null);

  // Define fetchProducts as a function reference
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products', {
        params: {
          extended: true,
          groupId: filters.productGroup || undefined,
          typeId: filters.productType || undefined,
          regionId: filters.region || undefined,
          sortField: sortField,
          sortOrder: sortDirection,
          page: currentPage,
          limit: entriesPerPage
        }
      });
      setProducts(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products: ' + err.message);
      console.error('API Error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Use fetchProducts in useEffect
  useEffect(() => {
    fetchProducts();
  }, [filters, sortDirection, sortField, currentPage, entriesPerPage]);

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [
          groupsRes, 
          typesRes, 
          regionsRes, 
          attributesRes, 
          ratingsRes, 
          ratingGroupsRes
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/product-groups', {
            params: { sortOrder: 'asc' }
          }),
          axios.get('http://localhost:5000/api/product-types', {
            params: { sortOrder: 'asc' }
          }),
          axios.get('http://localhost:5000/api/regions', {
            params: { sortOrder: 'asc' }
          }),
          axios.get('http://localhost:5000/api/attributes', {
            params: { 
              sortOrder: 'asc',
              is_active: true,  // Only get active attributes
              scope: 'product'
            }
          }),
          axios.get('http://localhost:5000/api/ratings', {
            params: { 
              extended: true,
              sortOrder: 'asc'
            }
          }),
          axios.get('http://localhost:5000/api/rating-groups', {
            params: { 
              extended: true,
              sortOrder: 'asc'
            }
          })
        ]);

        const groups = groupsRes.data.data || [];
        const types = typesRes.data.data || [];
        const regs = regionsRes.data.data || [];
        const attrs = attributesRes.data.data || [];
        const ratings = ratingsRes.data.data || [];
        const ratingGroups = ratingGroupsRes.data.data || [];

        //console.group('Reference Data Loaded');
        //console.log('Groups:', groups);
        //console.log('Types:', types);
        //console.log('Regions:', regs);
        //console.log('Attributes:', attrs);
        //console.log('Ratings:', ratings);
        //console.log('Rating Groups:', ratingGroups);
        //console.groupEnd();

        setProductGroups(groups);
        setProductTypes(types);
        setRegions(regs);
        setAttributes(attrs);
        setAvailableRatings(ratings);
        setAvailableRatingGroups(ratingGroups);
      } catch (err) {
        console.error('Failed to load reference data:', err);
        toast.error('Failed to load reference data');
      }
    };

    fetchReferenceData();
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const searchLower = filters.searchTerm.toLowerCase();
      return !filters.searchTerm || 
        product.title.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      return direction * String(a[sortField]).localeCompare(String(b[sortField]));
    });

  // Pagination
  const indexOfLastProduct = currentPage * entriesPerPage;
  const indexOfFirstProduct = indexOfLastProduct - entriesPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / entriesPerPage);

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleEditClick = (productId) => {
    setSelectedProductId(productId);
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    const { item } = deleteModal;
    
    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      
      await axios.delete(`http://localhost:5000/api/products/${item.id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
      
      setDeleteModal({ show: false, item: null, isDeleting: false });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete product';
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

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleProductUpdated = (updatedProduct) => {
    // Update just the single product in the list
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const renderActionButtons = (product) => (
    <div className="d-flex gap-2 justify-content-center">
      <button 
        className="btn btn-link text-warning p-0"
        onClick={() => handleEditClick(product.id)}
        title="Edit Product"
      >
        <FaEdit />
      </button>
      <button 
        className="btn btn-link text-danger p-0"
        onClick={() => showDeleteModal(product)}
        title="Delete Product"
      >
        <FaTrashAlt />
      </button>
    </div>
  );

  const renderFilters = () => (
    <div className="filter-section">
      <div className="filter-controls">
        <div className="filter-group">
          <Form.Control
            type="text"
            placeholder="Search products..."
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <Form.Select
            name="productGroup"
            value={filters.productGroup}
            onChange={handleFilterChange}
          >
            <option value="">All Groups</option>
            {productGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </Form.Select>
        </div>
        <div className="filter-group">
          <Form.Select
            name="productType"
            value={filters.productType}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            {productTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </Form.Select>
        </div>
        <div className="filter-group">
          <Form.Select
            name="region"
            value={filters.region}
            onChange={handleFilterChange}
          >
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </Form.Select>
        </div>
        <div className="view-mode-group">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'outline-secondary'}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <FaTable />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'outline-secondary'}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <FaThLarge />
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'secondary' : 'outline-secondary'}
            onClick={() => setViewMode('compact')}
            title="Compact View"
          >
            <FaList />
          </Button>
          <Button
            variant={viewMode === 'showcase' ? 'secondary' : 'outline-secondary'}
            onClick={() => setViewMode('showcase')}
            title="Showcase View"
          >
            <FaGamepad />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="product-grid">
      {currentProducts.map(product => (
        <div key={product.id} className="product-card">
          <div className="product-card-image-container">
            {product.productImageOriginal ? (
              <img 
                src={product.productImageOriginal} 
                alt={product.title}
                className="product-card-image"
              />
            ) : (
              <div className="product-card-placeholder">
                <FaImage />
              </div>
            )}
          </div>
          <div className="product-card-content">
            <h3 className="product-card-title">{product.title}</h3>
            <div className="product-card-badges">
              <RegionImage region={product.region_name} size={20} />
              <ProductTypeImage type={product.product_type_name} size={20} />
              {product.rating_name && (
                <Badge bg="secondary">{product.rating_name}</Badge>
              )}
            </div>
            <div className="product-card-info">
              {product.release_year && (
                <span>Released: {product.release_year}</span>
              )}
              {product.attributes?.developerName && (
                <span>Developer: {product.attributes.developerName}</span>
              )}
              {product.attributes?.publisherName && (
                <span>Publisher: {product.attributes.publisherName}</span>
              )}
            </div>
            <div className="product-card-attributes">
              {product.attributes?.gameGenre && (
                <span className="product-card-attribute">
                  Genre: {product.attributes.gameGenre}
                </span>
              )}
              {product.attributes?.isKinect === "1" && (
                <Badge bg="purple">Kinect</Badge>
              )}
            </div>
          </div>
          <div className="product-card-footer">
            <Button
              variant="outline-warning"
              size="sm"
              onClick={() => handleEditClick(product.id)}
            >
              <FaEdit />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => showDeleteModal(product)}
            >
              <FaTrashAlt />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => {
    return (
      <Table responsive hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Image</th>
            <th>Rating</th>
            <th>Region</th>
            <th>Attributes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                <div className="product-title-cell">
                  <div className="product-title">
                    {product.title}
                    {product.release_year && (
                      <span className="release-year">({product.release_year})</span>
                    )}
                  </div>
                  <div className="product-group">{product.product_group_name}</div>
                </div>
              </td>
              <td className="product-image-cell">
                {product.productImageThumb && (
                  <img 
                    src={product.productImageThumb} 
                    alt={product.title}
                    className="product-thumb"
                  />
                )}
              </td>
              <td>
                <img 
                  src={`/assets/images/ratings/${product.rating_group_name.toLowerCase()}/${product.rating_name.toLowerCase().replace(' ', '_')}.webp`}
                  alt={product.rating_name}
                  className="rating-image"
                />
              </td>
              <td>
                <img 
                  src={`/assets/images/regions/${product.region_name.toLowerCase().replace('-', '_')}.webp`}
                  alt={product.region_name}
                  className="region-image"
                />
              </td>
              <td>
                <div className="product-attributes">
                  {product.attributes?.developerName && (
                    <div className="attribute-item">Developer: {product.attributes.developerName}</div>
                  )}
                  {product.attributes?.publisherName && (
                    <div className="attribute-item">Publisher: {product.attributes.publisherName}</div>
                  )}
                  {product.attributes?.gameGenre && (
                    <div className="attribute-item">Genre: {product.attributes.gameGenre}</div>
                  )}
                  {product.attributes?.isKinect === "1" && (
                    <div className="attribute-item">
                      <img 
                        src="/assets/images/attributes/iskinect.webp" 
                        alt="Kinect"
                        className="attribute-image"
                      />
                    </div>
                  )}
                </div>
              </td>
              <td className="actions-cell">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => handleEditClick(product.id)}
                >
                  <FaEdit />
                </Button>
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => handleAddToInventory(product)}
                >
                  <FaBox />
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => showDeleteModal(product)}
                >
                  <FaTrashAlt />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  const handleAddToInventory = (product) => {
    setSelectedForInventory(product);
    setShowAddToInventory(true);
  };

  // Compact card view - two per row with enhanced layout
  const renderCompactView = () => (
    <div className="product-compact">
      {currentProducts.map(product => {
        // Generate a random rotation between -15 and 15 degrees
        const rotation = Math.random() * 30 - 15;
        const scale = 1.2 + (Math.random() * 0.4); // Random scale between 1.2 and 1.6
        
        return (
          <div key={product.id} className="product-compact-card">
            {product.productImageOriginal && (
              <div 
                className="product-compact-background" 
                style={{
                  backgroundImage: `url(${product.productImageOriginal})`,
                  transform: `rotate(${rotation}deg) scale(${scale})`,
                }}
              />
            )}
            <div className="product-compact-inner">
              <div className="product-compact-image">
                {product.productImageOriginal ? (
                  <img 
                    src={product.productImageOriginal} 
                    alt={product.title}
                  />
                ) : (
                  <div className="product-compact-placeholder">
                    <FaImage />
                  </div>
                )}
              </div>
              <div className="product-compact-content">
                <div className="product-compact-header">
                  <div className="product-compact-title-group">
                    <h3>{product.title}</h3>
                    <div className="product-compact-meta">
                      {product.release_year && (
                        <span className="product-compact-year">{product.release_year}</span>
                      )}
                      <div className="product-compact-badges">
                        <RegionImage region={product.region_name} size={16} />
                        <ProductTypeImage type={product.product_type_name} size={16} />
                        {product.rating_name && (
                          <Badge bg="secondary" className="product-compact-badge">{product.rating_name}</Badge>
                        )}
                        {product.attributes?.isKinect === "1" && (
                          <Badge bg="purple" className="product-compact-badge">Kinect</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="product-compact-details">
                  <div className="product-compact-main-info">
                    {product.attributes?.developerName && (
                      <div className="product-compact-info-item">
                        <span className="info-label">Developer</span>
                        <span className="info-value">{product.attributes.developerName}</span>
                      </div>
                    )}
                    {product.attributes?.publisherName && (
                      <div className="product-compact-info-item">
                        <span className="info-label">Publisher</span>
                        <span className="info-value">{product.attributes.publisherName}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="product-compact-secondary-info">
                    {product.attributes?.gameGenre && (
                      <div className="product-compact-tag">
                        <FaGamepad className="tag-icon" />
                        {product.attributes.gameGenre}
                      </div>
                    )}
                    {product.product_group_name && (
                      <div className="product-compact-tag">
                        <FaBox className="tag-icon" />
                        {product.product_group_name}
                      </div>
                    )}
                    {product.attributes?.numberOfPlayers && (
                      <div className="product-compact-tag">
                        <FaUsers className="tag-icon" />
                        {product.attributes.numberOfPlayers} Players
                      </div>
                    )}
                  </div>
                  
                  {product.attributes?.gameFeatures && (
                    <div className="product-compact-features">
                      <span className="info-label">Features</span>
                      <div className="features-list">
                        {product.attributes.gameFeatures.split(',').map((feature, index) => (
                          <span key={index} className="feature-tag">
                            {feature.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="product-compact-actions">
                  <Button variant="outline-warning" size="sm" onClick={() => handleEditClick(product.id)}>
                    <FaEdit /> Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => showDeleteModal(product)}>
                    <FaTrashAlt /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Showcase view - immersive gallery with original images
  const renderShowcaseView = () => (
    <div className="product-showcase">
      {currentProducts.map(product => (
        <div key={product.id} className="product-showcase-item">
          <div className="product-showcase-image">
            {product.productImageOriginal ? (
              <img 
                src={product.productImageOriginal} 
                alt={product.title}
              />
            ) : (
              <div className="product-showcase-placeholder">
                <FaImage />
              </div>
            )}
            <div className="product-showcase-overlay">
              <div className="product-showcase-header">
                <h3>{product.title}</h3>
                <div className="product-showcase-meta">
                  {product.release_year && (
                    <span className="product-showcase-year">{product.release_year}</span>
                  )}
                  <div className="product-showcase-badges">
                    <RegionImage region={product.region_name} size={24} />
                    <ProductTypeImage type={product.product_type_name} size={24} />
                    {product.rating_name && (
                      <Badge bg="secondary">{product.rating_name}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="product-showcase-details">
                {product.attributes?.developerName && (
                  <div className="product-showcase-detail">
                    <strong>Developer:</strong> {product.attributes.developerName}
                  </div>
                )}
                {product.attributes?.publisherName && (
                  <div className="product-showcase-detail">
                    <strong>Publisher:</strong> {product.attributes.publisherName}
                  </div>
                )}
                {product.attributes?.gameGenre && (
                  <div className="product-showcase-detail">
                    <strong>Genre:</strong> {product.attributes.gameGenre}
                  </div>
                )}
                {product.attributes?.isKinect === "1" && (
                  <Badge bg="purple" className="product-showcase-kinect">Kinect</Badge>
                )}
              </div>
              <div className="product-showcase-actions">
                <Button variant="light" onClick={() => handleEditClick(product.id)}>
                  <FaEdit /> Edit
                </Button>
                <Button variant="danger" onClick={() => showDeleteModal(product)}>
                  <FaTrashAlt /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container-fluid">
      <PageHeader bgClass="bg-primary" textClass="text-white">
        <PageHeader.Icon color="#66BB6A">
          <FaBox />
        </PageHeader.Icon>
        <PageHeader.Title>
          Products
        </PageHeader.Title>
        <PageHeader.Actions>
          <Form.Select
            className="me-2"
            style={{ width: 'auto', display: 'inline-block' }}
            value={preselectedFilters.product_group_id}
            onChange={(e) => setPreselectedFilters(prev => ({ ...prev, product_group_id: e.target.value }))}
          >
            <option value="">Select Group</option>
            {productGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </Form.Select>
          <Form.Select
            className="me-2"
            style={{ width: 'auto', display: 'inline-block' }}
            value={preselectedFilters.product_type_id}
            onChange={(e) => setPreselectedFilters(prev => ({ ...prev, product_type_id: e.target.value }))}
          >
            <option value="">Select Type</option>
            {productTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </Form.Select>
          <Form.Select
            className="me-2"
            style={{ width: 'auto', display: 'inline-block' }}
            value={preselectedFilters.region_id}
            onChange={(e) => setPreselectedFilters(prev => ({ ...prev, region_id: e.target.value }))}
          >
            <option value="">Select Region</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </Form.Select>
          <Button variant="light" onClick={handleAddClick}>
            <FaPlus className="me-2" />
            Add Product
          </Button>
        </PageHeader.Actions>
        <PageHeader.TitleSmall>
          Manage your product catalog
        </PageHeader.TitleSmall>
      </PageHeader>

      {renderFilters()}

      {viewMode === 'table' && renderTableView()}
      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'compact' && renderCompactView()}
      {viewMode === 'showcase' && renderShowcaseView()}

      {/* Pagination */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add Product Modal */}
      <AddProductModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchProducts();
        }}
        preselectedGroup={preselectedFilters.product_group_id}
        preselectedType={preselectedFilters.product_type_id}
        preselectedRegion={preselectedFilters.region_id}
        productGroups={productGroups}
        productTypes={productTypes}
        regions={regions}
        attributes={attributes}
        availableRatingGroups={availableRatingGroups}
        availableRatings={availableRatings}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onProductUpdated={handleProductUpdated}
        productId={selectedProductId}
        productGroups={productGroups}
        productTypes={productTypes}
        regions={regions}
        availableRatingGroups={availableRatingGroups}
        availableRatings={availableRatings}
        attributes={attributes}
        attributeValues={attributeValues}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, item: null, isDeleting: false })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete the product "${deleteModal.item?.title}"?`}
        isDeleting={deleteModal.isDeleting}
      />

      {/* Add to Inventory Modal */}
      <AddInventoryModal
        show={showAddToInventory}
        onHide={() => {
          setShowAddToInventory(false);
          setSelectedForInventory(null);
        }}
        onSuccess={() => {
          setShowAddToInventory(false);
          setSelectedForInventory(null);
          toast.success('Added to inventory successfully');
        }}
        product={selectedForInventory}
      />
    </div>
  );
};

export default ProductList; 