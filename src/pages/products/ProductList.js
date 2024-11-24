import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTable, FaThLarge, FaSearch, FaSort, FaGamepad, FaDesktop, FaKeyboard, FaFlag, FaCompactDisc, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CustomTableCell from '../../components/Table/CustomTableCell';
import { FaEuroSign, FaDollarSign, FaYenSign } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import AddProductModal from '../../components/products/AddProductModal';
import AttributeDisplay from '../../components/attributes/AttributeDisplay';

const IMAGE_SIZE = {
  width: 60,  // DVD case proportions (approximately 7.5:11)
  height: 85
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
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
  const [productGroups, setProductGroups] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [attributes, setAttributes] = useState([]);

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
        const [groupsRes, typesRes, regionsRes, attributesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/product-groups', {
            params: {
              sortOrder: 'asc'
            }
          }),
          axios.get('http://localhost:5000/api/product-types', {
            params: {
              sortOrder: 'asc'
            }
          }),
          axios.get('http://localhost:5000/api/regions', {
            params: {
              sortOrder: 'asc'
            }
          }),
          axios.get('http://localhost:5000/api/attributes', {
            params: { 
              scope: 'product',
              sortOrder: 'asc'
            }
          })
        ]);

        setProductGroups(groupsRes.data.data || []);
        setProductTypes(typesRes.data.data || []);
        setRegions(regionsRes.data.data || []);
        setAttributes(attributesRes.data.data || []);

        console.log('Product Groups:', groupsRes.data.data);
        console.log('Product Types:', typesRes.data.data);
        console.log('Regions:', regionsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch reference data:', err);
        console.error('Error details:', err.response?.data || err.message);
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
        product.title.toLowerCase().includes(searchLower) ||
        product.developer?.toLowerCase().includes(searchLower) ||
        product.publisher?.toLowerCase().includes(searchLower);
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

  const getRegionIcon = (regionId) => {
    const region = regions.find(r => r.id === regionId);
    if (!region) return <FaFlag title="Unknown Region" size={24} />;
    
    switch(region.name.toLowerCase()) {
      case 'pal':
      case 'eu':
        return <FaEuroSign title="PAL/EU" className="text-primary" size={24} />;
      case 'ntsc':
      case 'usa':
        return <FaDollarSign title="NTSC/USA" className="text-success" size={24} />;
      case 'ntsc-j':
      case 'japan':
        return <FaYenSign title="NTSC-J/Japan" className="text-danger" size={24} />;
      default:
        return <FaFlag title={region.name} size={24} />;
    }
  };

  const getTypeIcon = (typeId) => {
    const type = productTypes.find(t => t.id === typeId);
    if (!type) return <FaGamepad title="Unknown Type" size={24} />;
    
    switch(type.name.toLowerCase()) {
      case 'game':
        return <FaCompactDisc title="Game" className="text-primary" size={24} />;
      case 'console':
        return <FaDesktop title="Console" className="text-success" size={24} />;
      case 'peripheral':
        return <FaKeyboard title="Peripheral" className="text-warning" size={24} />;
      default:
        return <FaGamepad title={type.name} size={24} />;
    }
  };

  const handleEdit = async (productId) => {
    try {
      // Fetch the specific product first
      const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
      // TODO: Open edit modal with product data
      console.log('Edit product:', response.data);
    } catch (err) {
      toast.error('Failed to fetch product details');
    }
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      fetchProducts(); // Now fetchProducts is in scope
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Product List</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleAddClick}>
            Add New Product
          </button>
          <div className="btn-group">
            <button 
              className={`btn btn-outline-secondary ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <FaTable />
            </button>
            <button 
              className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FaThLarge />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  name="searchTerm"
                  placeholder="Search products..."
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                name="entriesPerPage"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="form-select"
              >
                <option value={10}>10 entries</option>
                <option value={25}>25 entries</option>
                <option value={50}>50 entries</option>
                <option value={100}>100 entries</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                name="productGroup"
                value={filters.productGroup}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All Product Groups</option>
                {productGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                name="productType"
                value={filters.productType}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All Product Types</option>
                {productTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="card">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <span>Products</span>
            <button className="btn btn-sm btn-light">Add Product</button>
          </div>
          <table className="table table-bordered mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th onClick={() => handleSort('id')} style={{cursor: 'pointer', width: '1%', whiteSpace: 'nowrap'}}>
                  ID <FaSort className={sortField === 'id' ? 'text-primary' : ''} />
                </th>
                <th onClick={() => handleSort('title')} style={{cursor: 'pointer'}}>
                  Information <FaSort className={sortField === 'title' ? 'text-primary' : ''} />
                </th>
                <th style={{width: `${IMAGE_SIZE.width}px`, padding: 0}}></th>
                <th onClick={() => handleSort('rating')} style={{cursor: 'pointer', width: '1%', whiteSpace: 'nowrap'}}>
                  Rating <FaSort className={sortField === 'rating' ? 'text-primary' : ''} />
                </th>
                <th style={{cursor: 'pointer'}}>
                  Attributes
                </th>
                <th onClick={() => handleSort('product_type_id')} style={{cursor: 'pointer', width: '1%', whiteSpace: 'nowrap'}}>
                  Type <FaSort className={sortField === 'product_type_id' ? 'text-primary' : ''} />
                </th>
                <th onClick={() => handleSort('region_id')} style={{cursor: 'pointer', width: '1%', whiteSpace: 'nowrap'}}>
                  Region <FaSort className={sortField === 'region_id' ? 'text-primary' : ''} />
                </th>
                <th onClick={() => handleSort('developer')} style={{cursor: 'pointer'}}>
                  Product Details <FaSort className={sortField === 'developer' ? 'text-primary' : ''} />
                </th>
                <th style={{width: '1%', whiteSpace: 'nowrap'}}></th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map(product => (
                <tr key={product.id}>
                  <td className="text-center">
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip id={`tooltip-${product.id}`}>
                          <pre style={{ margin: 0, textAlign: 'left', fontSize: '0.8rem' }}>
                            {JSON.stringify(product, null, 2)}
                          </pre>
                        </Tooltip>
                      }
                    >
                      <span className="text-muted" style={{ cursor: 'help' }}>
                        {product.id}
                      </span>
                    </OverlayTrigger>
                  </td>
                  <CustomTableCell>
                    <div className="d-flex flex-column">
                      <div>
                        <strong>{product.title}</strong>
                        {product.release_year && (
                          <span className="text-muted ms-2">
                            ({product.release_year})
                          </span>
                        )}
                      </div>
                      <div className="text-muted small">
                        {product.product_group_name || '-'}
                      </div>
                    </div>
                  </CustomTableCell>
                  <td style={{width: `${IMAGE_SIZE.width}px`, padding: '4px'}}>
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="rounded shadow-sm"
                        style={{
                          maxHeight: '40px',
                          width: 'auto',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <div 
                        className="d-flex flex-column align-items-center justify-content-center rounded shadow-sm image-placeholder"
                        style={{
                          maxHeight: '40px',
                          width: 'auto',
                          background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
                          border: '1px solid #dee2e6'
                        }}
                      >
                        <FaGamepad 
                          className="text-secondary"
                          style={{opacity: 0.5}}
                          size={16}
                        />
                      </div>
                    )}
                  </td>
                  <td className="text-center">
                    {product.rating_name ? (
                      <Badge 
                        bg={
                          product.rating_name === 'E' ? 'success' :
                          product.rating_name === 'T' ? 'warning' :
                          product.rating_name === 'M' ? 'danger' :
                          'secondary'
                        }
                      >
                        {product.rating_name}
                      </Badge>
                    ) : '-'}
                  </td>
                  <td>
                    {product.attributes && Object.entries(product.attributes).length > 0 ? (
                      <div className="attributes-container">
                        {/* Text attributes */}
                        <div className="flex-grow-1">
                          {Object.entries(product.attributes).map(([key, value]) => {
                            const attribute = attributes.find(a => a.name === key);
                            if (!attribute || attribute.use_image) return null;
                            
                            return (
                              <div key={key} className="attribute-row">
                                <AttributeDisplay 
                                  attribute={attribute} 
                                  value={value} 
                                />
                              </div>
                            );
                          })}
                        </div>
                        {/* Image attributes in vertical stack */}
                        <div className="attribute-images">
                          {Object.entries(product.attributes).map(([key, value]) => {
                            const attribute = attributes.find(a => a.name === key);
                            if (!attribute || !attribute.use_image) return null;
                            
                            return (
                              <AttributeDisplay 
                                key={key}
                                attribute={attribute} 
                                value={value} 
                              />
                            );
                          })}
                        </div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="text-center">
                    {getTypeIcon(product.product_type_id)}
                    <div className="small text-muted mt-1">
                      {product.product_type_name}
                    </div>
                  </td>
                  <td className="text-center">
                    {getRegionIcon(product.region_id)}
                    <div className="small text-muted mt-1">
                      {product.region_name}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      {product.developer && (
                        <div className="mb-1">
                          Developer: <strong>{product.developer}</strong>
                        </div>
                      )}
                      {product.publisher && (
                        <div className="mb-1">
                          Publisher: <strong>{product.publisher}</strong>
                        </div>
                      )}
                      {product.genre && (
                        <div className="mb-1">
                          Genre: <strong>{product.genre}</strong>
                        </div>
                      )}
                      {product.players && (
                        <div className="mb-1">
                          Players: <strong>{product.players}</strong>
                        </div>
                      )}
                      {product.format && (
                        <div className="mb-1">
                          Format: <strong>{product.format}</strong>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button 
                        className="btn btn-link btn-sm p-0 text-primary" 
                        title="Edit"
                        onClick={() => handleEdit(product.id)}
                      >
                        <FaEdit size={18} />
                      </button>
                      <button 
                        className="btn btn-link btn-sm p-0 text-danger" 
                        title="Delete"
                        onClick={() => handleDelete(product.id)}
                      >
                        <FaTrashAlt size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="row g-4">
          {currentProducts.map(product => (
            <div key={product.id} className="col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100">
                <div className="card-img-top" style={{height: '200px'}}>
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title}
                      className="w-100 h-100 object-fit-cover"
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                      No Image
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{product.title}</h5>
                  <p className="card-text">{product.developer}</p>
                  <p className="card-text"><small className="text-muted">{product.release_year}</small></p>
                </div>
                <div className="card-footer">
                  <div className="btn-group w-100">
                    <button className="btn btn-warning">Edit</button>
                    <button className="btn btn-danger">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="card mt-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} entries
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(1)}>First</button>
              </li>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(totalPages)}>Last</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <AddProductModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onProductAdded={fetchProducts}
      />
    </div>
  );
};

export default ProductList; 