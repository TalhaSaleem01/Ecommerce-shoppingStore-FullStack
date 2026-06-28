import { supabase } from './supabaseClient'

/**
 * Creates an order + order_items from the current cart, then clears the cart.
 * cartItems: array of { product: {id, name, price}, quantity }
 */
export async function placeOrder(userId, cartItems, total) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: userId, total, status: 'pending' })
    .select()
    .single()

  if (orderError) return { error: orderError }

  const orderItems = cartItems.map((row) => ({
    order_id: order.id,
    product_id: row.product.id,
    product_name: row.product.name,
    price: row.product.price,
    quantity: row.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return { error: itemsError }

  const cartItemIds = cartItems.map((row) => row.id)
  await supabase.from('cart_items').delete().in('id', cartItemIds)

  return { data: order, error: null }
}

export async function fetchMyOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data ?? [], error }
}
