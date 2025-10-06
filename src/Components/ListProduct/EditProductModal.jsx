import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { categoriesAdminService, productsAdminService, uploadService } from '../../services/apiService';
import { getImageUrl } from '../../utils/imageUtils';

const EditProductModal = ({ open, onClose, product, onSaved }) => {
  const [categories, setCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    old_price: '',
    new_price: '',
    stock_quantity: '',
    categoryId: '',
    categoryName: '',
    sizes: [],
    customSizes: [],
    shoeSizes: [],
    colors: [],
  });

  // Options for quick toggles
  const sizeOptions = [
    'Newborn','0-3M','3-6M','6-9M','9-12M','12-18M','18-24M','2T','3T','4T','5T','6T',
    '3Y','4Y','5Y','6Y','7Y','8Y','9Y','10Y','12Y','XS','S','M','L','XL'
  ];
  const colorOptions = ['Red','Blue','Green','Yellow','Pink','Purple','Orange','Black','White','Gray','Brown','Navy'];
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [shoeSizeInput, setShoeSizeInput] = useState('');

  const productId = useMemo(() => product?._id || product?.id, [product]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await categoriesAdminService.list();
        setCategories(res.categories || []);
      } catch (e) {
        console.warn('Failed to load categories', e);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!product) return;

    const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean).map((x) => String(x))));
    // Gather sizes across legacy/new fields
    const gatheredSizes = uniq([
      ...(product.sizes || []),
      ...(product.customSizes || []), // keep separate as custom but also show in combined list below
      ...(product.availableSizes || []),
      ...(product.shoeSizes || []), // shoe sizes are separate but include for visibility
      ...((product.variants && Array.isArray(product.variants.sizes)) ? product.variants.sizes : []),
    ]);
    const shoe = uniq(product.shoeSizes || (product.variants && product.variants.shoeSizes));
    const colors = uniq(product.colors || (product.variants && product.variants.colors));

    setForm({
      name: product.name || '',
      description: product.description || '',
      old_price: product.old_price ?? '',
      new_price: product.new_price ?? '',
      stock_quantity: product.stock_quantity ?? product?.stock?.quantity ?? '',
      categoryId: product.categoryId || '',
      categoryName: product.categoryName || product.category || '',
      sizes: uniq(product.sizes),
      customSizes: uniq(product.customSizes),
      shoeSizes: shoe,
      colors: colors,
    });
    setImageFile(null);
    setImagePreview('');
  }, [product]);

  const close = () => {
    if (isSaving) return;
    onClose?.();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : '');
  };

  const handleSave = async () => {
    if (!productId) return;

    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {};

      const normArr = (a) => (Array.isArray(a) ? a.map(String) : []);
      const arrChanged = (a, b) => {
        const A = normArr(a).sort().join('|');
        const B = normArr(b).sort().join('|');
        return A !== B;
      };

      if (form.name !== (product.name || '')) payload.name = form.name.trim();
      if ((form.description || '') !== (product.description || '')) payload.description = form.description || '';

      const toNumber = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };

      const oldPriceNum = toNumber(form.old_price);
      const newPriceNum = toNumber(form.new_price);
      if (oldPriceNum !== undefined && oldPriceNum !== product.old_price) payload.old_price = oldPriceNum;
      if (newPriceNum !== undefined && newPriceNum !== product.new_price) payload.new_price = newPriceNum;

      const stockNum = toNumber(form.stock_quantity);
      if (stockNum !== undefined && stockNum !== (product.stock_quantity ?? product?.stock?.quantity)) payload.stock_quantity = stockNum;

      // Category
      if (form.categoryId && form.categoryId !== (product.categoryId || '')) {
        payload.categoryId = form.categoryId;
        const cat = categories.find(c => c._id === form.categoryId);
        if (cat?.name) payload.category = cat.name; // keep legacy name in sync
      } else if (!form.categoryId && form.categoryName && form.categoryName !== (product.categoryName || product.category || '')) {
        // Fallback: changed legacy name when no id yet
        payload.category = form.categoryName;
      }

      // Variants / sizes / colors
      if (arrChanged(form.sizes, product.sizes)) payload.sizes = normArr(form.sizes);
      if (arrChanged(form.customSizes, product.customSizes)) payload.customSizes = normArr(form.customSizes);
      if (arrChanged(form.shoeSizes, product.shoeSizes)) payload.shoeSizes = normArr(form.shoeSizes);
      if (arrChanged(form.colors, product.colors)) payload.colors = normArr(form.colors);
      // Compatibility field some code might read
      if (payload.sizes && !product.availableSizes) payload.availableSizes = payload.sizes;

      // Image upload (optional)
      if (imageFile) {
        const res = await uploadService.uploadSingle(imageFile);
        if (res?.success && res.image_url) {
          payload.image = res.image_url;
        } else if (res?.image_url) {
          payload.image = res.image_url;
        } else {
          throw new Error('Image upload failed');
        }
      }

      // Nothing changed
      if (Object.keys(payload).length === 0) {
        toast('No changes to save');
        setIsSaving(false);
        return;
      }

      const res = await productsAdminService.updateProduct(productId, payload);

      let updated = null;
      if (res?.success && (res.product || res.data?.product)) {
        updated = res.product || res.data.product;
      } else if (res?.product) {
        updated = res.product;
      }

      if (!updated) {
        // Merge local payload into product as a fallback
        updated = { ...product, ...payload };
      }

      toast.success('Product updated successfully');
      onSaved?.(updated);
      onClose?.();
    } catch (e) {
      console.error('Failed to update product', e);
      toast.error(e?.response?.data?.message || e.message || 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">Edit Product</h3>
          <button onClick={close} className="rounded-md p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">✕</button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="Product name" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Stock quantity</label>
              <input type="number" min="0" name="stock_quantity" value={form.stock_quantity} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="Product description" />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Regular price</label>
              <input type="number" step="0.01" name="old_price" value={form.old_price} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sale price</label>
              <input type="number" step="0.01" name="new_price" value={form.new_price} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="0.00" />
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Current category</label>
              <input value={form.categoryName} name="categoryName" onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="Category name (legacy)" />
            </div>
          </div>

          {/* Sizes & Colors */}
          <div className="space-y-3 rounded-lg border border-gray-200 p-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Sizes</label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((s) => {
                  const checked = (form.sizes || []).includes(s);
                  return (
                    <button key={s} type="button" onClick={() => setForm((prev) => ({...prev, sizes: checked ? prev.sizes.filter(x=>x!==s) : [...(prev.sizes||[]), s]}))} className={`rounded-full border px-3 py-1 text-xs ${checked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{s}</button>
                  );
                })}
              </div>
              {/* Custom sizes chips */}
              {(form.customSizes || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.customSizes.map((cs) => (
                    <span key={cs} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs">
                      {cs}
                      <button type="button" className="text-gray-500 hover:text-red-600" onClick={() => setForm((p)=>({...p, customSizes: p.customSizes.filter(x=>x!==cs)}))} aria-label={`Remove ${cs}`}>×</button>
                      <button type="button" className="ml-1 text-[11px] text-red-600 hover:underline" onClick={() => setForm((p)=>({...p, customSizes: p.customSizes.filter(x=>x!==cs)}))}>Delete variant</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <input value={customSizeInput} onChange={(e)=>setCustomSizeInput(e.target.value)} placeholder="Add custom sizes (comma or Enter)" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); if(customSizeInput.trim()){ const parts = customSizeInput.split(/[\,\n]/g).map(s=>s.trim()).filter(Boolean); setForm(p=>({...p, customSizes: Array.from(new Set([...(p.customSizes||[]), ...parts]))})); setCustomSizeInput(''); } } }} />
                <button type="button" className="rounded-md bg-gray-800 px-3 py-2 text-xs font-medium text-white" onClick={()=>{ if(customSizeInput.trim()){ const parts = customSizeInput.split(/[\,\n]/g).map(s=>s.trim()).filter(Boolean); setForm(p=>({...p, customSizes: Array.from(new Set([...(p.customSizes||[]), ...parts]))})); setCustomSizeInput(''); } }}>Add</button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Shoe sizes</label>
              {(form.shoeSizes || []).length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {form.shoeSizes.map((ss) => (
                    <span key={ss} className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs text-green-800 ring-1 ring-inset ring-green-200">
                      {ss}
                      <button type="button" className="text-green-700 hover:text-red-600" onClick={() => setForm((p)=>({...p, shoeSizes: p.shoeSizes.filter(x=>x!==ss)}))} aria-label={`Remove ${ss}`}>×</button>
                      <button type="button" className="ml-1 text-[11px] text-red-600 hover:underline" onClick={() => setForm((p)=>({...p, shoeSizes: p.shoeSizes.filter(x=>x!==ss)}))}>Delete variant</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-1 flex items-center gap-2">
                <input value={shoeSizeInput} onChange={(e)=>setShoeSizeInput(e.target.value)} placeholder="Add shoe sizes (comma or Enter)" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); if(shoeSizeInput.trim()){ const parts = shoeSizeInput.split(/[\,\n]/g).map(s=>s.trim()).filter(Boolean); setForm(p=>({...p, shoeSizes: Array.from(new Set([...(p.shoeSizes||[]), ...parts]))})); setShoeSizeInput(''); } } }} />
                <button type="button" className="rounded-md bg-gray-800 px-3 py-2 text-xs font-medium text-white" onClick={()=>{ if(shoeSizeInput.trim()){ const parts = shoeSizeInput.split(/[\,\n]/g).map(s=>s.trim()).filter(Boolean); setForm(p=>({...p, shoeSizes: Array.from(new Set([...(p.shoeSizes||[]), ...parts]))})); setShoeSizeInput(''); } }}>Add</button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Colors</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((c) => {
                  const checked = (form.colors || []).includes(c);
                  return (
                    <button key={c} type="button" onClick={() => setForm((prev) => ({...prev, colors: checked ? prev.colors.filter(x=>x!==c) : [...(prev.colors||[]), c]}))} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${checked ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                      <span className="inline-block h-3 w-3 rounded-full border" style={{ backgroundColor: c.toLowerCase() }} /> {c}
                    </button>
                  );
                })}
              </div>
              {(form.colors || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.colors.map((c) => (
                    <span key={`sel-${c}`} className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs text-pink-700 ring-1 ring-inset ring-pink-200">
                      <span className="inline-block h-3 w-3 rounded-full border" style={{ backgroundColor: c.toLowerCase() }} /> {c}
                      <button type="button" className="text-pink-700 hover:text-red-600" onClick={() => setForm((p)=>({...p, colors: p.colors.filter(x=>x!==c)}))} aria-label={`Remove ${c}`}>×</button>
                      <button type="button" className="ml-1 text-[11px] text-red-600 hover:underline" onClick={() => setForm((p)=>({...p, colors: p.colors.filter(x=>x!==c)}))}>Delete variant</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Main image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-700 hover:file:bg-blue-100" />
              <p className="mt-1 text-xs text-gray-500">Leave empty to keep the current image</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">Preview:</div>
              <img src={imagePreview || getImageUrl(product?.image || (product?.images && product?.images[0]))} alt="Preview" className="h-16 w-16 rounded-md border object-cover" onError={(e)=>{e.currentTarget.src='/api/placeholder/64/64'}} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button onClick={close} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
