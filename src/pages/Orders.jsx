import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchMyOrders } from '../lib/orders'
import './Orders.css'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await fetchMyOrders(user.id)
      setOrders(data)
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return <div className="container orders__loading">Loading orders...</div>

  return (
    <div className="container orders">
      <h1>My orders</h1>

      {orders.length === 0 ? (
        <p className="orders__empty">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="orders__list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card__head">
                <div>
                  <span className="order-card__id">Order #{order.id.slice(0, 8)}</span>
                  <span className="order-card__date">
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>
                <span className={`order-card__status order-card__status--${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-card__items">
                {order.order_items.map((item) => (
                  <div key={item.id} className="order-card__item">
                    <span>{item.quantity} × {item.product_name}</span>
                    <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-card__total">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
