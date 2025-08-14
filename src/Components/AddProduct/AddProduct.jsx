import React, { useState, useEffect } from "react";
import "./AddProduct.css";
import upload_area from "../Assets/upload_area.svg";
import { backend_url } from "../../App";

const AddProduct = () => {
  const [image, setImage] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  
  const [productDetails, setProductDetails] = useState({
    // Basic Information
    name: "",
    description: "",
    image: "",
    images: [],
    category: "",
    subcategory: "",
    new_price: "",
    old_price: "",
    
    // Product Variants
    sizes: [],
    colors: [],
    ageRange: { min: "", max: "" },
    
    // Additional Professional Fields
    brand: "",
    material: "",
    care_instructions: "",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    stock_quantity: "",
    sku: "",
    tags: [],
    
    // SEO Fields
    meta_title: "",
    meta_description: "",
    
    // Product Status
    status: "active",
    featured: false,
    on_sale: false
  });

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${backend_url}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    
    // Update product details
    setProductDetails({ ...productDetails, category: categoryId, subcategory: '' });
    
    // Find selected category and set available subcategories
    const category = categories.find(cat => cat._id === categoryId);
    if (category && category.subcategories) {
      setAvailableSubcategories(category.subcategories);
    } else {
      setAvailableSubcategories([]);
    }
  };

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    setSelectedSubcategory(subcategoryId);
    setProductDetails({ ...productDetails, subcategory: subcategoryId });
  };

  // Predefined options
  const sizeOptions = ["Newborn", "0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M", "2T", "3T", "4T", "5T", "6T"];
  const colorOptions = ["Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "Black", "White", "Gray", "Brown", "Navy"];
  const materialOptions = ["Cotton", "Polyester", "Wool", "Silk", "Denim", "Linen", "Fleece", "Organic Cotton", "Bamboo", "Mixed"];

  const AddProduct = async () => {
    let dataObj;
    let product = { ...productDetails };

    // Upload main image
    if (image) {
      let formData = new FormData();
      formData.append('product', image);

      await fetch(`${backend_url}/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      }).then((resp) => resp.json())
        .then((data) => { dataObj = data });

      if (dataObj.success) {
        product.image = dataObj.image_url;
      }
    }

    // Upload additional images
    if (additionalImages.length > 0) {
      let additionalFormData = new FormData();
      additionalImages.forEach((img, index) => {
        additionalFormData.append('products', img);
      });

      await fetch(`${backend_url}/upload-multiple`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: additionalFormData,
      }).then((resp) => resp.json())
        .then((data) => {
          if (data.success) {
            product.images = data.image_urls;
          }
        });
    }

    // Process numeric fields
    if (product.new_price) product.new_price = parseFloat(product.new_price);
    if (product.old_price) product.old_price = parseFloat(product.old_price);
    if (product.weight) product.weight = parseFloat(product.weight);
    if (product.stock_quantity) product.stock_quantity = parseInt(product.stock_quantity);
    if (product.ageRange.min) product.ageRange.min = parseInt(product.ageRange.min);
    if (product.ageRange.max) product.ageRange.max = parseInt(product.ageRange.max);
    if (product.dimensions.length) product.dimensions.length = parseFloat(product.dimensions.length);
    if (product.dimensions.width) product.dimensions.width = parseFloat(product.dimensions.width);
    if (product.dimensions.height) product.dimensions.height = parseFloat(product.dimensions.height);

    // Add product to database
    await fetch(`${backend_url}/addproduct`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.success) {
          alert("Product Added Successfully!");
          // Reset form
          setProductDetails({
            name: "", description: "", image: "", images: [], category: "", subcategory: "",
            new_price: "", old_price: "", sizes: [], colors: [], ageRange: { min: "", max: "" },
            brand: "", material: "", care_instructions: "", weight: "",
            dimensions: { length: "", width: "", height: "" }, stock_quantity: "",
            sku: "", tags: [], meta_title: "", meta_description: "",
            status: "active", featured: false, on_sale: false
          });
          setImage(false);
          setAdditionalImages([]);
          setSelectedCategory('');
          setSelectedSubcategory('');
          setAvailableSubcategories([]);
        } else {
          alert("Failed to add product");
        }
      });
  }

  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setProductDetails({ ...productDetails, [name]: checked });
    } else {
      setProductDetails({ ...productDetails, [name]: value });
    }
  }

  const handleNestedChange = (parent, field, value) => {
    setProductDetails({
      ...productDetails,
      [parent]: {
        ...productDetails[parent],
        [field]: value
      }
    });
  }

  const handleArrayToggle = (arrayName, item) => {
    const currentArray = productDetails[arrayName];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    setProductDetails({ ...productDetails, [arrayName]: newArray });
  }

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setProductDetails({ ...productDetails, tags });
  }

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalImages(files);
  }

  return (
    <div className="addproduct">
      <h2 className="addproduct-title">Add New Product</h2>
      
      {/* Tab Navigation */}
      <div className="addproduct-tabs">
        <button 
          className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`}
          onClick={() => setActiveTab('variants')}
        >
          Variants
        </button>
        <button 
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button 
          className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          SEO & Status
        </button>
      </div>

      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <div className="tab-content">
          <div className="addproduct-row">
            <div className="addproduct-itemfield">
              <p>Product Name *</p>
              <input 
                type="text" 
                name="name" 
                value={productDetails.name} 
                onChange={changeHandler} 
                placeholder="Enter product name" 
                required
              />
            </div>
            <div className="addproduct-itemfield">
              <p>SKU</p>
              <input 
                type="text" 
                name="sku" 
                value={productDetails.sku} 
                onChange={changeHandler} 
                placeholder="Product SKU" 
              />
            </div>
          </div>

          <div className="addproduct-itemfield">
            <p>Product Description *</p>
            <textarea 
              name="description" 
              value={productDetails.description} 
              onChange={changeHandler} 
              placeholder="Enter detailed product description" 
              rows="4"
              required
            />
          </div>

          <div className="addproduct-row">
            <div className="addproduct-itemfield">
              <p>Category *</p>
              <select 
                value={selectedCategory} 
                onChange={handleCategoryChange}
                className="add-product-selector"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="addproduct-itemfield">
              <p>Subcategory</p>
              <select 
                value={selectedSubcategory} 
                onChange={handleSubcategoryChange}
                className="add-product-selector"
                disabled={!selectedCategory || availableSubcategories.length === 0}
              >
                <option value="">Select Subcategory</option>
                {availableSubcategories.map(subcategory => (
                  <option key={subcategory._id} value={subcategory._id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
              {selectedCategory && availableSubcategories.length === 0 && (
                <small style={{color: '#666', fontStyle: 'italic'}}>No subcategories available</small>
              )}
            </div>
          </div>
          
          <div className="addproduct-row">
            <div className="addproduct-itemfield">
              <p>Brand</p>
              <input 
                type="text" 
                name="brand" 
                value={productDetails.brand} 
                onChange={changeHandler} 
                placeholder="Product brand" 
              />
            </div>
          </div>

          <div className="addproduct-price">
            <div className="addproduct-itemfield">
              <p>Regular Price *</p>
              <input 
                type="number" 
                name="old_price" 
                value={productDetails.old_price} 
                onChange={changeHandler} 
                placeholder="0.00" 
                step="0.01"
                required
              />
            </div>
            <div className="addproduct-itemfield">
              <p>Sale Price</p>
              <input 
                type="number" 
                name="new_price" 
                value={productDetails.new_price} 
                onChange={changeHandler} 
                placeholder="0.00" 
                step="0.01"
              />
            </div>
            <div className="addproduct-itemfield">
              <p>Stock Quantity</p>
              <input 
                type="number" 
                name="stock_quantity" 
                value={productDetails.stock_quantity} 
                onChange={changeHandler} 
                placeholder="0" 
                min="0"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="addproduct-images">
            <div className="addproduct-itemfield">
              <p>Main Product Image *</p>
              <label htmlFor="file-input" className="image-upload-label">
                <img 
                  className="addproduct-thumbnail-img" 
                  src={!image ? upload_area : URL.createObjectURL(image)} 
                  alt="Upload" 
                />
                <span>Click to upload main image</span>
              </label>
              <input 
                onChange={(e) => setImage(e.target.files[0])} 
                type="file" 
                name="image" 
                id="file-input" 
                accept="image/*" 
                hidden 
              />
            </div>

            <div className="addproduct-itemfield">
              <p>Additional Images (up to 5)</p>
              <input 
                onChange={handleAdditionalImagesChange} 
                type="file" 
                multiple 
                accept="image/*" 
                className="additional-images-input"
              />
              {additionalImages.length > 0 && (
                <div className="additional-images-preview">
                  {Array.from(additionalImages).map((img, index) => (
                    <img 
                      key={index} 
                      src={URL.createObjectURL(img)} 
                      alt={`Additional ${index + 1}`} 
                      className="additional-image-preview"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Variants Tab */}
      {activeTab === 'variants' && (
        <div className="tab-content">
          <div className="addproduct-itemfield">
            <p>Available Sizes</p>
            <div className="checkbox-group">
              {sizeOptions.map(size => (
                <label key={size} className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={productDetails.sizes.includes(size)}
                    onChange={() => handleArrayToggle('sizes', size)}
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="addproduct-itemfield">
            <p>Available Colors</p>
            <div className="checkbox-group">
              {colorOptions.map(color => (
                <label key={color} className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={productDetails.colors.includes(color)}
                    onChange={() => handleArrayToggle('colors', color)}
                  />
                  <span className="color-option">
                    <span className="color-circle" style={{backgroundColor: color.toLowerCase()}}></span>
                    {color}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="addproduct-row">
            <div className="addproduct-itemfield">
              <p>Age Range - Min (months)</p>
              <input 
                type="number" 
                value={productDetails.ageRange.min} 
                onChange={(e) => handleNestedChange('ageRange', 'min', e.target.value)}
                placeholder="0" 
                min="0"
              />
            </div>
            <div className="addproduct-itemfield">
              <p>Age Range - Max (months)</p>
              <input 
                type="number" 
                value={productDetails.ageRange.max} 
                onChange={(e) => handleNestedChange('ageRange', 'max', e.target.value)}
                placeholder="24" 
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="tab-content">
          <div className="addproduct-row">
            <div className="addproduct-itemfield">
              <p>Material</p>
              <select 
                name="material" 
                value={productDetails.material} 
                onChange={changeHandler}
                className="add-product-selector"
              >
                <option value="">Select Material</option>
                {materialOptions.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>
            <div className="addproduct-itemfield">
              <p>Weight (grams)</p>
              <input 
                type="number" 
                name="weight" 
                value={productDetails.weight} 
                onChange={changeHandler} 
                placeholder="0" 
                min="0"
              />
            </div>
          </div>

          <div className="addproduct-row">
            <div className="addproduct-itemfield">
              <p>Length (cm)</p>
              <input 
                type="number" 
                value={productDetails.dimensions.length} 
                onChange={(e) => handleNestedChange('dimensions', 'length', e.target.value)}
                placeholder="0" 
                min="0"
                step="0.1"
              />
            </div>
            <div className="addproduct-itemfield">
              <p>Width (cm)</p>
              <input 
                type="number" 
                value={productDetails.dimensions.width} 
                onChange={(e) => handleNestedChange('dimensions', 'width', e.target.value)}
                placeholder="0" 
                min="0"
                step="0.1"
              />
            </div>
            <div className="addproduct-itemfield">
              <p>Height (cm)</p>
              <input 
                type="number" 
                value={productDetails.dimensions.height} 
                onChange={(e) => handleNestedChange('dimensions', 'height', e.target.value)}
                placeholder="0" 
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="addproduct-itemfield">
            <p>Care Instructions</p>
            <textarea 
              name="care_instructions" 
              value={productDetails.care_instructions} 
              onChange={changeHandler} 
              placeholder="Enter care instructions (e.g., Machine wash cold, tumble dry low)" 
              rows="3"
            />
          </div>

          <div className="addproduct-itemfield">
            <p>Tags (comma-separated)</p>
            <input 
              type="text" 
              value={productDetails.tags.join(', ')} 
              onChange={handleTagsChange} 
              placeholder="e.g., summer, casual, comfortable" 
            />
          </div>
        </div>
      )}

      {/* SEO & Status Tab */}
      {activeTab === 'seo' && (
        <div className="tab-content">
          <div className="addproduct-itemfield">
            <p>Meta Title</p>
            <input 
              type="text" 
              name="meta_title" 
              value={productDetails.meta_title} 
              onChange={changeHandler} 
              placeholder="SEO title for search engines" 
              maxLength="60"
            />
            <small>{productDetails.meta_title.length}/60 characters</small>
          </div>

          <div className="addproduct-itemfield">
            <p>Meta Description</p>
            <textarea 
              name="meta_description" 
              value={productDetails.meta_description} 
              onChange={changeHandler} 
              placeholder="SEO description for search engines" 
              rows="3"
              maxLength="160"
            />
            <small>{productDetails.meta_description.length}/160 characters</small>
          </div>

          <div className="addproduct-row">
            <div className="addproduct-itemfield">
              <p>Product Status</p>
              <select 
                name="status" 
                value={productDetails.status} 
                onChange={changeHandler}
                className="add-product-selector"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="addproduct-checkboxes">
            <label className="checkbox-item">
              <input 
                type="checkbox" 
                name="featured"
                checked={productDetails.featured}
                onChange={changeHandler}
              />
              <span>Featured Product</span>
            </label>
            <label className="checkbox-item">
              <input 
                type="checkbox" 
                name="on_sale"
                checked={productDetails.on_sale}
                onChange={changeHandler}
              />
              <span>On Sale</span>
            </label>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="addproduct-actions">
        <button className="addproduct-btn-secondary" onClick={() => {
          if(window.confirm('Are you sure you want to reset the form?')) {
            setProductDetails({
              name: "", description: "", image: "", images: [], category: "", subcategory: "",
              new_price: "", old_price: "", sizes: [], colors: [], ageRange: { min: "", max: "" },
              brand: "", material: "", care_instructions: "", weight: "",
              dimensions: { length: "", width: "", height: "" }, stock_quantity: "",
              sku: "", tags: [], meta_title: "", meta_description: "",
              status: "active", featured: false, on_sale: false
            });
            setImage(false);
            setAdditionalImages([]);
            setSelectedCategory('');
            setSelectedSubcategory('');
            setAvailableSubcategories([]);
          }
        }}>Reset Form</button>
        <button className="addproduct-btn" onClick={AddProduct}>
          Add Product
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
