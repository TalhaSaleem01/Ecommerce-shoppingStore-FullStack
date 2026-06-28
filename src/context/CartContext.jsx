import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])      // active cart items, each with joined product
  const [savedItems, setSavedItems] = useState([])
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([])
      setSavedItems([])
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, saved_for_later, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setItems(data.filter((row) => !row.saved_for_later))
      setSavedItems(data.filter((row) => row.saved_for_later))
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return { error: { message: 'not_authenticated' } }

    const existing = items.find((row) => row.product.id === productId)
    if (existing) {
      return updateQuantity(existing.id, existing.quantity + quantity)
    }

    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: user.id, product_id: productId, quantity, saved_for_later: false })
    if (!error) await refreshCart()
    return { error }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return removeItem(cartItemId)
    setItems((prev) => prev.map((row) => (row.id === cartItemId ? { ...row, quantity } : row)))
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId)
    if (error) await refreshCart()
    return { error }
  }

  const removeItem = async (cartItemId) => {
    setItems((prev) => prev.filter((row) => row.id !== cartItemId))
    setSavedItems((prev) => prev.filter((row) => row.id !== cartItemId))
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId)
    if (error) await refreshCart()
    return { error }
  }

  const removeAll = async () => {
    if (!user) return
    setItems([])
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('saved_for_later', false)
    if (error) await refreshCart()
  }

  const saveForLater = async (cartItemId, save = true) => {
    const { error } = await supabase
      .from('cart_items')
      .update({ saved_for_later: save })
      .eq('id', cartItemId)
    await refreshCart()
    return { error }
  }

  const subtotal = useMemo(
    () => items.reduce((sum, row) => sum + Number(row.product.price) * row.quantity, 0),
    [items]
  )


  const itemCount = useMemo(() => items.length, [items])

  const value = {
    items,
    savedItems,
    loading,
    subtotal,
    itemCount,
    addToCart,
    updateQuantity,
    removeItem,
    removeAll,
    saveForLater,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (ctx === undefined) throw new Error('useCart must be used within CartProvider')
  return ctx
}
