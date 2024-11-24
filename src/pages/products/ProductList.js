import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTable, FaThLarge, FaSearch, FaSort } from 'react-icons/fa';

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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/products', {
          params: {
            groupId: filters.productGroup || undefined,
            typeId: filters.productType || undefined,
            regionId: filters.region || undefined,
            sortOrder: sortDirection,
          }
        });
        setProducts(response.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, sortDirection]);

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [groupsRes, typesRes, regionsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/product-groups'),
          axios.get('http://localhost:5000/api/product-types'),
          axios.get('http://localhost:5000/api/regions')
        ]);

        setProductGroups(groupsRes.data.data);
        setProductTypes(typesRes.data.data);
        setRegions(regionsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch reference data:', err);
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

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Product List</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
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
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th onClick={() => handleSort('title')} style={{cursor: 'pointer'}}>
                    Title <FaSort className={sortField === 'title' ? 'text-primary' : ''} />
                  </th>
                  <th>Image</th>
                  <th onClick={() => handleSort('product_group_id')} style={{cursor: 'pointer'}}>
                    Group <FaSort className={sortField === 'product_group_id' ? 'text-primary' : ''} />
                  </th>
                  <th onClick={() => handleSort('product_type_id')} style={{cursor: 'pointer'}}>
                    Type <FaSort className={sortField === 'product_type_id' ? 'text-primary' : ''} />
                  </th>
                  <th onClick={() => handleSort('region_id')} style={{cursor: 'pointer'}}>
                    Region <FaSort className={sortField === 'region_id' ? 'text-primary' : ''} />
                  </th>
                  <th onClick={() => handleSort('developer')} style={{cursor: 'pointer'}}>
                    Developer <FaSort className={sortField === 'developer' ? 'text-primary' : ''} />
                  </th>
                  <th onClick={() => handleSort('release_year')} style={{cursor: 'pointer'}}>
                    Year <FaSort className={sortField === 'release_year' ? 'text-primary' : ''} />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td>
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.title} 
                          className="img-thumbnail"
                          style={{width: '50px', height: '50px', objectFit: 'cover'}}
                        />
                      ) : (
                        <div className="bg-secondary text-center" style={{width: '50px', height: '50px', lineHeight: '50px'}}>
                          No Image
                        </div>
                      )}
                    </td>
                    <td>{productGroups.find(g => g.id === product.product_group_id)?.name || '-'}</td>
                    <td>{productTypes.find(t => t.id === product.product_type_id)?.name || '-'}</td>
                    <td>{regions.find(r => r.id === product.region_id)?.name || '-'}</td>
                    <td>{product.developer || '-'}</td>
                    <td>{product.release_year || '-'}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-warning">Edit</button>
                        <button className="btn btn-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                <button className="page-link bg-dark border-secondary" onClick={() => setCurrentPage(1)}>First</button>
              </li>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link bg-dark border-secondary" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button 
                    className="page-link bg-dark border-secondary"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link bg-dark border-secondary" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link bg-dark border-secondary" onClick={() => setCurrentPage(totalPages)}>Last</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ProductList; 