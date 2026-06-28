import { supabase } from './supabaseClient'

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  return { data: data ?? [], error }
}

export async function fetchProducts({ search, categorySlug, sort = 'newest', limit, featured, brands, features } = {}) {
  let query = supabase.from('products').select('*, category:categories(name, slug)')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }
  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (featured) {
    query = query.eq('is_featured', true)
  }
  if (brands && brands.length > 0) {
    query = query.in('brand', brands)
  }
  if (features && features.length > 0) {
    query = query.contains('features', features)
  }

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  return { data: data ?? [], error }
}

// Returns the distinct brand and feature values currently in use, so the
// listing sidebar can render real filter options instead of a hardcoded list.
export async function fetchFilterOptions() {
  const { data, error } = await supabase.from('products').select('brand, features')
  if (error || !data) return { brands: [], features: [] }

  const brandSet = new Set()
  const featureSet = new Set()
  for (const row of data) {
    if (row.brand) brandSet.add(row.brand)
    for (const f of row.features || []) featureSet.add(f)
  }
  return {
    brands: Array.from(brandSet).sort(),
    features: Array.from(featureSet).sort(),
  }
}

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function fetchRelatedProducts(categoryId, excludeId, limit = 6) {
  if (!categoryId) return { data: [], error: null }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(limit)
  return { data: data ?? [], error }
}

// ---- Admin mutations ----

export async function createProduct(product) {
  const { data, error } = await supabase.from('products').insert(product).select().single()
  return { data, error }
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
  return { data, error }
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error }
}

export async function uploadProductImage(file) {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file)
  if (uploadError) return { url: null, error: uploadError }
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
