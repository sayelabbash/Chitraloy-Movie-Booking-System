import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CreditCard, MapPin, Calendar, Clock, Armchair, ShieldCheck } from 'lucide-react'
import { getMyBookings } from '../api/bookings'
import { createPaymentOrder, verifyPayment } from '../api/payments'
import { PageSpinner } from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'
import Countdown from '../components/Countdown'
import { useAuth } from '../context/AuthContext'
import { formatCurrencyINR, formatDate, formatTime } from '../lib/format'
import { getErrorMessage } from '../lib/api'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID
const HOLD_MINUTES = 5 // matches booking.limits.seat-hold-minutes on the backend

function waitForRazorpay(timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const start = Date.now()
    const interval = setInterval(() => {
      if (window.Razorpay) {
        clearInterval(interval)
        resolve(true)
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval)
        resolve(false)
      }
    }, 150)
  })
}

export default function Payment() {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [booking, setBooking] = useState(location.state?.booking || null)
  const [status, setStatus] = useState(booking ? 'ready' : 'loading')
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const [expired, setExpired] = useState(false)
  const attemptedInit = useRef(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const mine = await getMyBookings()
      const found = mine.find((b) => String(b.id) === String(bookingId))
      if (!found) {
        setError('This booking could not be found on your account.')
        setStatus('error')
        return
      }
      setBooking(found)
      setStatus('ready')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this booking.'))
      setStatus('error')
    }
  }, [bookingId])

  useEffect(() => {
    if (!booking) load()
  }, [booking, load])

  const deadline = booking ? new Date(booking.bookingTime).getTime() + HOLD_MINUTES * 60 * 1000 : null

  async function handlePay() {
    if (!RAZORPAY_KEY_ID) {
      toast.error('Payment gateway is not configured. Set VITE_RAZORPAY_KEY_ID in your .env file.')
      return
    }
    setPaying(true)
    try {
      const order = await createPaymentOrder(booking.id)
      const scriptLoaded = await waitForRazorpay()
      if (!scriptLoaded) {
        toast.error('Could not load the payment gateway. Check your connection and try again.')
        setPaying(false)
        return
      }

      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'ShowTime',
        description: `${booking.show?.movie?.name || 'Movie'} · ${booking.seatNumbers?.join(', ')}`,
        order_id: order.orderId,
        prefill: { name: user?.username, email: user?.email },
        theme: { color: '#e21f3a' },
        handler: async (response) => {
          try {
            const result = await verifyPayment(booking.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (typeof result === 'string' && result.toLowerCase().includes('successful')) {
              toast.success('Payment successful! Your booking is confirmed.')
              navigate(`/bookings/${booking.id}/confirmation`, { state: { booking: { ...booking, bookingStatus: 'CONFIRMED' } } })
            } else {
              toast.error(result || 'Payment could not be verified.')
              navigate('/profile')
            }
          } catch (err) {
            toast.error(getErrorMessage(err, 'Payment verification failed.'))
            navigate('/profile')
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      })
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Your seats will be released automatically.')
        setPaying(false)
      })
      rzp.open()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Payment could not be started. Please try again.'))
      setPaying(false)
    }
  }

  if (status === 'loading') return <PageSpinner label="Loading your booking…" />
  if (status === 'error')
    return (
      <div className="container-page py-16">
        <ErrorState message={error} onRetry={load} />
      </div>
    )
  if (!booking) return null

  if (booking.bookingStatus !== 'PENDING') {
    return (
      <div className="container-page max-w-lg py-16 text-center">
        <p className="text-ink-500 dark:text-ink-400">This booking is no longer awaiting payment.</p>
        <button onClick={() => navigate('/profile')} className="focus-ring mt-4 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">
          Go to my bookings
        </button>
      </div>
    )
  }

  const show = booking.show

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="mb-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50 sm:text-3xl">Confirm &amp; pay</h1>
      <p className="mb-6 text-sm text-ink-500 dark:text-ink-400">Your seats are held while you complete payment.</p>

      <div className="mb-6 flex justify-center">
        {!expired ? (
          <Countdown deadline={deadline} onExpire={() => setExpired(true)} />
        ) : (
          <span className="rounded-full border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950 px-3.5 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-400">Hold expired</span>
        )}
      </div>

      {expired && (
        <ErrorState
          message="Your seat hold has expired. Please go back and select your seats again."
          onRetry={() => navigate(`/shows/${show.id}/seats`)}
        />
      )}

      {!expired && (
        <>
          <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{show?.movie?.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500 dark:text-ink-400">
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {show?.theater?.theaterName}</span>
              <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(show?.showTime)}</span>
              <span className="flex items-center gap-1.5"><Clock size={13} /> {formatTime(show?.showTime)}</span>
            </div>

            <div className="my-5 h-px bg-ink-100 dark:bg-ink-800" />

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-ink-500 dark:text-ink-400"><Armchair size={15} /> Seats</span>
              <span className="font-semibold text-ink-900 dark:text-ink-50">{booking.seatNumbers?.join(', ')}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-ink-500 dark:text-ink-400">Tickets</span>
              <span className="font-semibold text-ink-900 dark:text-ink-50">{booking.numberOfSeats}</span>
            </div>

            <div className="my-5 h-px bg-ink-100 dark:bg-ink-800" />

            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold text-ink-900 dark:text-ink-50">Total</span>
              <span className="font-display text-2xl font-extrabold text-brand-600">{formatCurrencyINR(booking.price)}</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={paying}
            className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3.5 text-sm font-bold text-white shadow-pop transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CreditCard size={17} /> {paying ? 'Processing…' : `Pay ${formatCurrencyINR(booking.price)}`}
          </button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400 dark:text-ink-500">
            <ShieldCheck size={13} /> Payments are securely processed by Razorpay.
          </p>
        </>
      )}
    </div>
  )
}
