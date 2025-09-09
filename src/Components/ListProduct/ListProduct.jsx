import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import { backend_url, currency } from "../../App";
import { productsAdminService } from '../../services/apiService';
import { getImageUrl } from '../../utils/imageUtils';

const ListProduct = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    const fetchInfo = async () => {
        await fetch(`${backend_url}/allproducts`)
            .then((res) => res.json())
            .then((data) => { setAllProducts(data) })
    }

    useEffect(() => {
        fetchInfo();
    }, []);

    const removeProduct = async (id) => {
        const confirmed = window.confirm('Are you sure you want to remove this product?');
        if (confirmed) {
            await fetch(`${backend_url}/removeproduct`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id }),
            });
            await fetchInfo();
        }
    }

    const toggleExpanded = (productId) => {
        if (expandedProduct === productId) {
            setExpandedProduct(null);
        } else {
            setExpandedProduct(productId);
        }
    }

    const renderArray = (arr) => {
        if (!arr || arr.length === 0) return 'None';
        return arr.join(', ');
    }

    const renderImageGallery = (images) => {
        if (!images || images.length === 0) return <span>No additional images</span>;
        return (
            <div className="image-gallery">
                {images.map((img, index) => (
                    <img key={index} src={img} alt={`Gallery ${index + 1}`} className="gallery-thumbnail" />
                ))}
            </div>
        );
    }

    // Filter and search logic
    const filteredProducts = allProducts.filter(product => {
        const catName = (product.categoryName || product.category || '').toLowerCase();
        const subName = (product.subcategoryName || '').toLowerCase();
        const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              catName.includes(searchTerm.toLowerCase()) ||
                              subName.includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || (product.categoryName || product.category) === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Sort logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'name': return (a.name || '').localeCompare(b.name || '');
            case 'price-low': return (a.new_price || 0) - (b.new_price || 0);
            case 'price-high': return (b.new_price || 0) - (a.new_price || 0);
            case 'newest': return new Date(b.date || 0) - new Date(a.date || 0);
            case 'category': return (a.categoryName || a.category || '').localeCompare(b.categoryName || b.category || '');
            default: return 0;
        }
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

    // Get unique categories for filter
    const categories = ['all', ...new Set(allProducts.map(p => p.categoryName || p.category).filter(Boolean))];

    const getStockStatus = (product) => {
        const stock = product.stock_quantity || 0;
        if (stock === 0) return { text: 'Out of Stock', class: 'status-inactive' };
        if (stock < 10) return { text: 'Low Stock', class: 'status-warning' };
        return { text: 'In Stock', class: 'status-active' };
    };

    return (
        <div className="listproduct">
            {/* Header */}
            <div className="listproduct-header">
                <div className="header-title">
                    <h1>📦 Product Management</h1>
                    <p className="header-subtitle">Manage your product inventory and details</p>
                </div>
                <div className="header-stats">
                    <div className="stat-card" style={{background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center', minWidth: '120px'}}>
                        <span className="stat-number" style={{display: 'block', fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: 'white'}}>{allProducts.length || 0}</span>
                        <span className="stat-label" style={{fontSize: '12px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Products</span>
                    </div>
                    <div className="stat-card" style={{background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center', minWidth: '120px'}}>
                        <span className="stat-number" style={{display: 'block', fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: 'white'}}>{allProducts.filter(p => p.available !== false).length || 0}</span>
                        <span className="stat-label" style={{fontSize: '12px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Available</span>
                    </div>
                    <div className="stat-card" style={{background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center', minWidth: '120px'}}>
                        <span className="stat-number" style={{display: 'block', fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: 'white'}}>{allProducts.filter(p => p.categoryName || p.category).length || 0}</span>
                        <span className="stat-label" style={{fontSize: '12px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Categorized</span>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="listproduct-controls">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="🔍 Search products by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-container">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="filter-select"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? '📂 All Categories' : `📂 ${cat}`}
                            </option>
                        ))}
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="newest">📅 Newest First</option>
                        <option value="name">🔤 Name A-Z</option>
                        <option value="price-low">💰 Price: Low to High</option>
                        <option value="price-high">💰 Price: High to Low</option>
                        <option value="category">📂 Category A-Z</option>
                    </select>
                </div>
            </div>

            {/* Results Info */}
            <div className="results-info">
                <span>Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products</span>
            </div>

            {/* Table Header */}
            <div className="listproduct-table">
                <div className="listproduct-format-main">
                    <p>Product</p> 
                    <p>Details</p> 
                    <p>Pricing</p> 
                    <p>Stock</p> 
                    <p>Category</p> 
                    <p>Actions</p>
                </div>
                <div className="listproduct-allproducts">
                    <hr />
                    {paginatedProducts.map((product, index) => (
                    <div key={index}>
                        <div className="listproduct-format-main listproduct-format">
                            <img className="listproduct-product-icon" src={getImageUrl(product.image || (product.images && product.images[0]))} alt={product.name || 'product'} onError={(e)=>{e.currentTarget.src='/api/placeholder/80/80'}} />
                            <p className="cartitems-product-title">{product.name}</p>
                            <p>{currency}{product.old_price}</p>
                            <p>{currency}{product.new_price}</p>
                            <p>{(product.categoryName || product.category) + (product.subcategoryName ? ` > ${product.subcategoryName}` : '')}</p>
                            <button 
                                className="details-toggle-btn" 
                                onClick={() => toggleExpanded(product.id)}
                            >
                                {expandedProduct === product.id ? 'Hide' : 'Show'} Details
                            </button>
                            <img 
                                className="listproduct-remove-icon" 
                                onClick={() => removeProduct(product.id)} 
                                src={cross_icon} 
                                alt="Remove" 
                            />
                        </div>
                        
                        {expandedProduct === product.id && (
                            <div className="product-details-expanded">
                                <div className="details-grid">
                                    <div className="details-section">
                                        <h3>Basic Information</h3>
                                        <p><strong>Description:</strong> {product.description || 'No description'}</p>
                                        <p><strong>Brand:</strong> {product.brand || 'Not specified'}</p>
                                        <p><strong>SKU:</strong> {product.sku || 'Not specified'}</p>
                                        <p><strong>Tags:</strong> {renderArray(product.tags)}</p>
                                    </div>
                                    
                                    <div className="details-section">
                                        <h3>Variants</h3>
                                        <p><strong>Colors:</strong> {renderArray(product.variants?.colors)}</p>
                                        <p><strong>Sizes:</strong> {renderArray(product.variants?.sizes)}</p>
                                        <p><strong>Age Groups:</strong> {renderArray(product.variants?.ageGroups)}</p>
                                        <p><strong>Materials:</strong> {renderArray(product.variants?.materials)}</p>
                                        <p><strong>Styles:</strong> {renderArray(product.variants?.styles)}</p>
                                    </div>
                                    
                                    <div className="details-section">
                                        <h3>Stock & Pricing</h3>
                                        <p><strong>Stock Quantity:</strong> {product.stock?.quantity || 0}</p>
                                        <p><strong>Stock Status:</strong> {product.stock?.status || 'Unknown'}</p>
                                        <p><strong>Low Stock Threshold:</strong> {product.stock?.lowStockThreshold || 'Not set'}</p>
                                        <p><strong>Sale Price:</strong> {product.pricing?.salePrice ? `${currency}${product.pricing.salePrice}` : 'Not on sale'}</p>
                                        <p><strong>Cost Price:</strong> {product.pricing?.costPrice ? `${currency}${product.pricing.costPrice}` : 'Not specified'}</p>
                                    </div>
                                    
                                    <div className="details-section">
                                        <h3>Dimensions & Weight</h3>
                                        <p><strong>Weight:</strong> {product.dimensions?.weight || 'Not specified'}</p>
                                        <p><strong>Length:</strong> {product.dimensions?.length || 'Not specified'}</p>
                                        <p><strong>Width:</strong> {product.dimensions?.width || 'Not specified'}</p>
                                        <p><strong>Height:</strong> {product.dimensions?.height || 'Not specified'}</p>
                                    </div>
                                    
                                    <div className="details-section">
                                        <h3>SEO</h3>
                                        <p><strong>Meta Title:</strong> {product.seo?.metaTitle || 'Not set'}</p>
                                        <p><strong>Meta Description:</strong> {product.seo?.metaDescription || 'Not set'}</p>
                                        <p><strong>Keywords:</strong> {renderArray(product.seo?.keywords)}</p>
                                    </div>
                                    
                                    <div className="details-section">
                                        <h3>Status & Dates</h3>
                                        <p><strong>Status:</strong> {product.status || 'Unknown'}</p>
                                        <p><strong>Featured (legacy):</strong> {product.featured ? 'Yes' : 'No'}</p>
                                        <p><strong>isFeatured:</strong> {product.isFeatured ? 'Yes' : 'No'}</p>
                                        <p><strong>isPromo:</strong> {product.isPromo ? 'Yes' : 'No'}</p>
                                        <p><strong>isBestSelling:</strong> {product.isBestSelling ? 'Yes' : 'No'}</p>
                                        <p><strong>Created:</strong> {product.date ? new Date(product.date).toLocaleDateString() : 'Unknown'}</p>
                                    </div>
                                    <div className="details-section">
                                        <h3>Homepage Flags</h3>
                                        <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                                          <button className="pagination-btn" onClick={async ()=>{ await productsAdminService.updateFlags(product._id || product.id, { isFeatured: !product.isFeatured }); fetchInfo(); }}>Toggle Featured</button>
                                          <button className="pagination-btn" onClick={async ()=>{ await productsAdminService.updateFlags(product._id || product.id, { isPromo: !product.isPromo }); fetchInfo(); }}>Toggle Promo</button>
                                          <button className="pagination-btn" onClick={async ()=>{ await productsAdminService.updateFlags(product._id || product.id, { isBestSelling: !product.isBestSelling }); fetchInfo(); }}>Toggle Best-Selling</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="details-section">
                                    <h3>Image Gallery</h3>
                                    {renderImageGallery(product.imageGallery)}
                                </div>
                            </div>
                        )}
                        
                        <hr />
                    </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ListProduct;
