import { useEffect, useState } from 'react'
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../lib/products'
import { useToast } from '../context/ToastContext'
import { FALLBACK_IMAGE } from '../lib/fallbackImage'
import './Admin.css'

const EMPTY_FORM = {
  id: null,
  name: '',
  description: '',
  price: '',
  compare_at_price: '',
  category_id: '',
  brand: '',
  features: '',
  stock: '',
  is_featured: false,
  image_url: '',
}

export default function Admin() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const { showToast } = useToast()

  async function loadAll() {
    setLoading(true)
    const [productsRes, categoriesRes] = await Promise.all([fetchProducts({ sort: 'newest' }), fetchCategories()])
    setProducts(productsRes.data)
    setCategories(categoriesRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  function openCreateForm() {
    setForm(EMPTY_FORM)
    setImageFile(null)
    setShowForm(true)
  }

  function openEditForm(product) {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      compare_at_price: product.compare_at_price || '',
      category_id: product.category_id || '',
      brand: product.brand || '',
      features: (product.features || []).join(', '),
      stock: product.stock,
      is_featured: product.is_featured,
      image_url: product.image_url || '',
    })
    setImageFile(null)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    let imageUrl = form.image_url
    if (imageFile) {
      const { url, error } = await uploadProductImage(imageFile)
      if (error) {
        showToast('Image upload failed: ' + error.message, 'error')
        setSaving(false)
        return
      }
      imageUrl = url
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      category_id: form.category_id || null,
      brand: form.brand,
      features: form.features
        ? form.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [],
      stock: Number(form.stock),
      is_featured: form.is_featured,
      image_url: imageUrl,
    }

    const { error } = form.id
      ? await updateProduct(form.id, payload)
      : await createProduct(payload)

    setSaving(false)

    if (error) {
      showToast('Save failed: ' + error.message, 'error')
      return
    }

    showToast(form.id ? 'Product updated' : 'Product created', 'success')
    setShowForm(false)
    loadAll()
  }

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    const { error } = await deleteProduct(product.id)
    if (error) {
      showToast('Delete failed: ' + error.message, 'error')
      return
    }
    showToast('Product deleted', 'success')
    loadAll()
  }

  return (
    <div className="container admin">
      <div className="admin__head">
        <h1>Admin · Products</h1>
        <button className="admin__add-btn" onClick={openCreateForm}>+ Add product</button>
      </div>

      {loading ? (
        <p className="admin__loading">Loading products...</p>
      ) : (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      className="admin__thumb"
                      src={p.image_url}
                      alt={p.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = FALLBACK_IMAGE
                      }}
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.brand || '—'}</td>
                  <td>{p.category?.name || '—'}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>{p.is_featured ? '✓' : ''}</td>
                  <td className="admin__row-actions">
                    <button onClick={() => openEditForm(p)}>Edit</button>
                    <button className="admin__delete" onClick={() => handleDelete(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="admin__modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="admin__modal" onClick={(e) => e.stopPropagation()}>
            <h2>{form.id ? 'Edit product' : 'Add product'}</h2>
            <form onSubmit={handleSubmit} className="admin__form">
              <label>
                Name
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>

              <label>
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>

              <div className="admin__form-row">
                <label>
                  Price ($)
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </label>
                <label>
                  Compare-at price ($)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.compare_at_price}
                    onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                  />
                </label>
              </div>

              <div className="admin__form-row">
                <label>
                  Category
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  >
                    <option value="">— None —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Brand
                  <input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g. Sony"
                  />
                </label>
              </div>

              <label>
                Features (comma-separated)
                <input
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="e.g. Bluetooth 5.0, Waterproof, 8GB Ram"
                />
              </label>

              <label>
                Stock
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </label>

              <label className="admin__checkbox">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
                Show in "Deals & offers" (featured)
              </label>

              <label>
                Product image
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
              </label>
              {(imageFile || form.image_url) && (
                <img
                  className="admin__preview"
                  src={imageFile ? URL.createObjectURL(imageFile) : form.image_url}
                  alt="Preview"
                />
              )}

              <div className="admin__form-actions">
                <button type="button" className="admin__cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : form.id ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
