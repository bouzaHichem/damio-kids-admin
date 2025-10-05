import React, { useEffect, useMemo, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import { backend_url, currency } from "../../App";
import { productsAdminService } from '../../services/apiService';
import { getImageUrl } from '../../utils/imageUtils';
import toast from "react-hot-toast";
import EditProductModal from "./EditProductModal";

const ListProduct = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchInfo = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${backend_url}/allproducts`);
            const data = await res.json();
            setAllProducts(Array.isArray(data) ? data : (data?.products || []));
        } catch (e) {
            console.error('Failed to fetch products', e);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInfo();
    }, []);

    const removeProduct = async (id) => {
        const confirmed = window.confirm('Are you sure you want to remove this product?');
        if (!confirmed) return;
        try {
            await fetch(`${backend_url}/removeproduct`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id }),
            });
            toast.success('Product removed');
            await fetchInfo();
        } catch (e) {
            console.error('Failed to remove product', e);
            toast.error('Failed to remove product');
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
        const stock = product.stock_quantity ?? product?.stock?.quantity ?? 0;
        if (stock === 0) return { text: 'Out of Stock', class: 'status-inactive' };
        if (stock < 10) return { text: 'Low Stock', class: 'status-warning' };
        return { text: 'In Stock', class: 'status-active' };
    };

    const getId = (p) => p?._id || p?.id;

    const openEdit = (product) => {
        setSelectedProduct(product);
        setEditOpen(true);
    };

    const handleSaved = (updated) => {
        const updatedId = getId(updated);
        setAllProducts(prev => prev.map(p => (getId(p) === updatedId ? { ...p, ...updated } : p)));
        // Keep expanded state aligned if the same product is open
        if (expandedProduct && expandedProduct === updatedId) {
            setExpandedProduct(updatedId);
        }
    };

    return (
        <div className="listproduct container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="listproduct-header">
                <div className="header-title">
                    <h1>📦 Product Management</h1>
                    <p className="header-subtitle">Manage your product inventory and details</p>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <span className="stat-number">{allProducts.length || 0}</span>
                        <span className="stat-label">Total Products</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{allProducts.filter(p => p.available !== false).length || 0}</span>
                        <span className="stat-label">Available</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{allProducts.filter(p => p.categoryName || p.category).length || 0}</span>
                        <span className="stat-label">Categorized</span>
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

            {/* Modern table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* Header row */}
                <div className="grid grid-cols-12 items-center gap-4 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <div className="col-span-4">Product</div>
                    <div className="col-span-2">Pricing</div>
                    <div className="col-span-2">Stock</div>
                    <div className="col-span-3">Category</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>
                <div className="divide-y divide-gray-100">
                    {paginatedProducts.map((product, index) => {
                        const pid = getId(product);
                        const quantity = product.stock_quantity ?? product?.stock?.quantity ?? 0;
                        const categoryText = (product.categoryName || product.category || 'Uncategorized') + (product.subcategoryName ? ` > ${product.subcategoryName}` : '');
                        return (
                            <div key={pid || index} className="grid grid-cols-12 items-center gap-4 px-4 py-3 hover:bg-gray-50">
                                {/* Product cell */}
                                <div className="col-span-4 flex items-center gap-3">
                                    <img className="h-14 w-14 rounded-md border object-cover" src={getImageUrl(product.image || (product.images && product.images[0]))} alt={product.name || 'product'} onError={(e)=>{e.currentTarget.src='/api/placeholder/80/80'}} />
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium text-gray-900">{product.name}</div>
                                        <button 
                                            className="mt-1 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
                                            onClick={() => toggleExpanded(pid)}
                                        >
                                            {expandedProduct === pid ? 'Hide' : 'Show'} details
                                        </button>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="col-span-2 text-sm">
                                    <div className="text-gray-900">{currency}{product.new_price ?? '-'}</div>
                                    <div className="text-xs text-gray-500 line-through">{product.old_price ? `${currency}${product.old_price}` : ''}</div>
                                </div>

                                {/* Stock */}
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${quantity === 0 ? 'bg-red-50 text-red-700' : quantity < 10 ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-700'}`}>
                                        {quantity === 0 ? 'Out of stock' : quantity < 10 ? `Low (${quantity})` : `In stock (${quantity})`}
                                    </span>
                                </div>

                                {/* Category */}
                                <div className="col-span-3">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                        {categoryText}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex items-center justify-end gap-2">
                                    <button 
                                        className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        onClick={() => openEdit(product)}
                                    >
                                        Edit
                                    </button>
                                    <img 
                                        className="listproduct-remove-icon"
                                        onClick={() => removeProduct(product.id)}
                                        src={cross_icon}
                                        alt="Remove"
                                        title="Remove product"
                                    />
                                </div>

                                {/* Expanded details */}
                                {expandedProduct === pid && (
                                    <div className="col-span-12 product-details-expanded mt-2">
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
                                                <p><strong>Colors:</strong> {renderArray(product.variants?.colors || product.colors)}</p>
                                                <p><strong>Sizes:</strong> {(() => {
                                                  const preset = product.variants?.sizes || product.sizes || [];
                                                  const custom = product.customSizes || [];
                                                  const all = Array.from(new Set([...(preset || []), ...(custom || [])]));
                                                  return renderArray(all);
                                                })()}</p>
                                                <p><strong>Shoe Sizes:</strong> {renderArray(product.shoeSizes)}</p>
                                                <p><strong>Age Groups:</strong> {renderArray(product.variants?.ageGroups)}</p>
                                                <p><strong>Materials:</strong> {renderArray(product.variants?.materials)}</p>
                                                <p><strong>Styles:</strong> {renderArray(product.variants?.styles)}</p>
                                            </div>

                                            <div className="details-section">
                                                <h3>Stock & Pricing</h3>
                                                <p><strong>Stock Quantity:</strong> {product.stock?.quantity || product.stock_quantity || 0}</p>
                                                <p><strong>Stock Status:</strong> {product.stock?.status || '—'}</p>
                                                <p><strong>Low Stock Threshold:</strong> {product.stock?.lowStockThreshold || 'Not set'}</p>
                                                <p><strong>Sale Price:</strong> {product.pricing?.salePrice ? `${currency}${product.pricing.salePrice}` : (product.new_price ? `${currency}${product.new_price}` : 'Not on sale')}</p>
                                                <p><strong>Cost Price:</strong> {product.pricing?.costPrice ? `${currency}${product.pricing.costPrice}` : (product.old_price ? `${currency}${product.old_price}` : 'Not specified')}</p>
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
                                                <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginTop: '10px'}}>
                                                  <button className="pagination-btn" onClick={async ()=>{ await productsAdminService.updateFlags(getId(product), { isFeatured: !product.isFeatured }); fetchInfo(); }}>Toggle Featured</button>
                                                  <button className="pagination-btn" onClick={async ()=>{ await productsAdminService.updateFlags(getId(product), { isPromo: !product.isPromo }); fetchInfo(); }}>Toggle Promo</button>
                                                  <button className="pagination-btn" onClick={async ()=>{ await productsAdminService.updateFlags(getId(product), { isBestSelling: !product.isBestSelling }); fetchInfo(); }}>Toggle Best-Selling</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="details-section">
                                            <h3>Image Gallery</h3>
                                            {renderImageGallery(product.imageGallery)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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

            <EditProductModal 
                open={editOpen} 
                product={selectedProduct} 
                onClose={() => setEditOpen(false)} 
                onSaved={handleSaved} 
            />
        </div>
    );
};

export default ListProduct;
