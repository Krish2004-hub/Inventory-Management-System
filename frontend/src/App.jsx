
import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080/api/products'

function App() {
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    lowStockThreshold: '5'
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Convert backend Product object into frontend format
  const formatProduct = (product) => ({
    ...product,
    category: product.description || '',
    price: Number(product.price),
    quantity: Number(product.quantity),
    lowStockThreshold: Number(product.lowStockThreshold ?? 5)
  })

  // Fetch products from Spring Boot
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Unable to fetch products.')
      }

      const data = await response.json()
      setProducts(data.map(formatProduct))

    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  // Initial product loading
  useEffect(() => {
    fetchProducts()
  }, [])

  // Automatically clear notifications
  useEffect(() => {
    if (!error && !successMessage) return

    const timer = setTimeout(() => {
      setError('')
      setSuccessMessage('')
    }, 4000)

    return () => clearTimeout(timer)
  }, [error, successMessage])

  // Stock status
  const getStatus = (product) => {
    if (product.quantity === 0) return 'Out of Stock'

    if (product.quantity <= product.lowStockThreshold) {
      return 'Low Stock'
    }

    return 'Available'
  }

  // Dashboard calculations
  const totalProducts = products.length

  const availableStock = products.reduce(
    (total, product) => total + product.quantity,
    0
  )

  const availableProducts = products.filter(
    product => getStatus(product) === 'Available'
  ).length

  const lowStockProducts = products.filter(
    product => getStatus(product) === 'Low Stock'
  )

  const outOfStockProducts = products.filter(
    product => getStatus(product) === 'Out of Stock'
  )

  const lowStock = lowStockProducts.length
  const outOfStock = outOfStockProducts.length

  // Stock distribution percentages
  const getPercentage = (count) => {
    if (totalProducts === 0) return 0

    return (count / totalProducts) * 100
  }

  const availablePercentage = getPercentage(availableProducts)
  const lowStockPercentage = getPercentage(lowStock)
  const outOfStockPercentage = getPercentage(outOfStock)

  // Category analytics
  const categoryStats = Object.entries(
    products.reduce((categories, product) => {
      const category = product.category.trim() || 'Uncategorized'

      categories[category] = (categories[category] || 0) + 1

      return categories
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const maxCategoryCount = Math.max(
    ...categoryStats.map(category => category.count),
    1
  )

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      quantity: '',
      lowStockThreshold: '5'
    })

    setEditingId(null)
    setShowForm(false)
  }

  // Add product
  const handleAddProduct = () => {
    resetForm()
    setShowForm(true)
    setError('')
    setSuccessMessage('')
  }

  // Edit product
  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
      lowStockThreshold: String(product.lowStockThreshold)
    })

    setEditingId(product.id)
    setShowForm(true)
    setError('')
    setSuccessMessage('')
  }

  // Input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault()

    const name = formData.name.trim()
    const category = formData.category.trim()
    const price = Number(formData.price)
    const quantity = Number(formData.quantity)
    const lowStockThreshold = Number(formData.lowStockThreshold)

    if (!name || !category) {
      setError('Please enter product name and category.')
      return
    }

    if (
      formData.price === '' ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError('Please enter a valid non-negative price.')
      return
    }

    if (
      formData.quantity === '' ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError('Quantity must be a non-negative whole number.')
      return
    }

    if (
      formData.lowStockThreshold === '' ||
      !Number.isInteger(lowStockThreshold) ||
      lowStockThreshold < 0
    ) {
      setError('Low stock threshold must be a non-negative whole number.')
      return
    }

    const productData = {
      name,
      description: category,
      price,
      quantity,
      lowStockThreshold
    }

    try {
      setSaving(true)
      setError('')
      setSuccessMessage('')

      const isEditing = editingId !== null

      const url = isEditing
        ? `${API_URL}/${editingId}`
        : API_URL

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to save product.')
      }

      const savedProduct = formatProduct(await response.json())

      if (isEditing) {
        setProducts(prev =>
          prev.map(product =>
            product.id === editingId ? savedProduct : product
          )
        )

        setSuccessMessage('Product updated successfully!')

      } else {
        setProducts(prev => [...prev, savedProduct])
        setSuccessMessage('Product added successfully!')
      }

      resetForm()

    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product?'
    )

    if (!confirmDelete) return

    try {
      setError('')
      setSuccessMessage('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to delete product.')
      }

      setProducts(prev =>
        prev.filter(product => product.id !== id)
      )

      setSuccessMessage('Product deleted successfully!')

    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to delete product.')
    }
  }

  // Search and filter
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' ||
      getStatus(product) === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>InventoryPro</h2>

        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#analytics">Analytics</a>
          <a href="#alerts">Stock Alerts</a>
          <a href="#products">Products</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Header */}
        <header className="header">
          <h1 id="dashboard">Dashboard</h1>
          <div className="profile">Welcome, Admin</div>
        </header>

        {/* Notifications */}
        {error && (
          <div className="notification error">
            {error}
            <button onClick={() => setError('')}>✕</button>
            <button onClick={fetchProducts}>Retry</button>
          </div>
        )}

        {successMessage && (
          <div className="notification success">
            {successMessage}
            <button onClick={() => setSuccessMessage('')}>✕</button>
          </div>
        )}

        {/* Summary Cards */}
        <section className="summary-cards">

          <div className="card">
            <h3>Total Products</h3>
            <p>{totalProducts}</p>
          </div>

          <div className="card">
            <h3>Available Stock Units</h3>
            <p>{availableStock}</p>
          </div>

          <div className="card">
            <h3>Low Stock Products</h3>
            <p>{lowStock}</p>
          </div>

          <div className="card">
            <h3>Out of Stock</h3>
            <p>{outOfStock}</p>
          </div>

        </section>

        {/* Analytics */}
        <section className="analytics-section" id="analytics">

          {/* Stock Distribution */}
          <div className="analytics-card">

            <h2>Stock Distribution</h2>

            {loading ? (
              <p className="loading">Loading analytics...</p>
            ) : totalProducts === 0 ? (
              <p className="loading">No stock data available.</p>
            ) : (
              <>
                <div className="stock-chart">
                  <span
                    className="available-color"
                    style={{ width: `${availablePercentage}%` }}
                  />

                  <span
                    className="low-color"
                    style={{ width: `${lowStockPercentage}%` }}
                  />

                  <span
                    className="out-color"
                    style={{ width: `${outOfStockPercentage}%` }}
                  />
                </div>

                <div className="chart-legend">

                  <div className="legend-item">
                    <div className="legend-label">
                      <span className="legend-dot available-color" />
                      Available
                    </div>
                    <strong>
                      {availableProducts} ({availablePercentage.toFixed(1)}%)
                    </strong>
                  </div>

                  <div className="legend-item">
                    <div className="legend-label">
                      <span className="legend-dot low-color" />
                      Low Stock
                    </div>
                    <strong>
                      {lowStock} ({lowStockPercentage.toFixed(1)}%)
                    </strong>
                  </div>

                  <div className="legend-item">
                    <div className="legend-label">
                      <span className="legend-dot out-color" />
                      Out of Stock
                    </div>
                    <strong>
                      {outOfStock} ({outOfStockPercentage.toFixed(1)}%)
                    </strong>
                  </div>

                </div>
              </>
            )}

          </div>

          {/* Category Analytics */}
          <div className="analytics-card">

            <h2>Category Analytics</h2>

            {loading ? (
              <p className="loading">Loading categories...</p>
            ) : categoryStats.length === 0 ? (
              <p className="loading">No category data available.</p>
            ) : (
              <div className="category-list">

                {categoryStats.map(category => (

                  <div className="category-item" key={category.name}>

                    <div className="category-info">
                      <span>{category.name}</span>
                      <strong>{category.count} products</strong>
                    </div>

                    <div className="category-bar">
                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${(category.count / maxCategoryCount) * 100}%`
                        }}
                      />
                    </div>

                  </div>

                ))}

              </div>
            )}

          </div>

        </section>

        {/* Low Stock Alerts */}
        <section className="alerts-section" id="alerts">

          <h2>⚠️ Inventory Alerts</h2>

          {loading ? (
            <p className="loading">Checking inventory...</p>
          ) : lowStock + outOfStock === 0 ? (

            <p className="no-alerts">
              ✓ All products have sufficient stock!
            </p>

          ) : (

            [...outOfStockProducts, ...lowStockProducts].map(product => (

              <div className="alert-item" key={product.id}>

                <strong>{product.name}</strong>

                <span>
                  {product.quantity === 0
                    ? 'Out of stock'
                    : `Only ${product.quantity} units remaining`}
                </span>

              </div>

            ))

          )}

        </section>

        {/* Product Management */}
        <section className="products-section" id="products">

          <div className="products-header">
            <h2>Product Management</h2>

            <button onClick={handleAddProduct}>
              + Add Product
            </button>
          </div>

          {/* Search and Filter */}
          <div className="products-filters">

            <input
              type="text"
              placeholder="Search by product name or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Stock Status</option>
              <option value="Available">Available</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

          </div>

          {/* Add / Edit Form */}
          {showForm && (

            <div className="add-product-form">

              <h2>
                {editingId !== null ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSubmit}>

                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />

                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />

                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  required
                />

                <input
                  type="number"
                  name="lowStockThreshold"
                  placeholder="Low Stock Threshold"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  required
                />

                <div className="form-buttons">

                  <button type="submit" disabled={saving}>
                    {saving
                      ? 'Saving...'
                      : editingId !== null
                        ? 'Update Product'
                        : 'Save Product'}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>

          )}

          {/* Product Table */}
          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td colSpan="7">Loading products...</td>
                  </tr>

                ) : filteredProducts.length > 0 ? (

                  filteredProducts.map(product => (

                    <tr key={product.id}>

                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>

                      <td>
                        ₹{product.price.toLocaleString('en-IN')}
                      </td>

                      <td>{product.quantity}</td>

                      <td>
                        <span
                          className={`status ${getStatus(product)
                            .toLowerCase()
                            .replaceAll(' ', '-')}`}
                        >
                          {getStatus(product)}
                        </span>
                      </td>

                      <td>

                        <button
                          className="edit-btn"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td colSpan="7">No products found.</td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          <p className="product-count">
            Showing {filteredProducts.length} of {totalProducts} products
          </p>

        </section>

      </main>

    </div>
  )
}

export default App
