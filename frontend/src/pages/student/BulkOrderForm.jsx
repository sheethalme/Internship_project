import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { CalendarDays, Building2, Users, ChevronRight, ChevronLeft, Check, Truck, Star, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useToast } from '../../contexts/ToastContext';
import { CANTEENS, formatCurrency } from '../../data/mockData';

const EVENT_TYPES = ['Seminar', 'Club Meeting', 'Cultural Event', 'Sports Event', 'Guest Lecture', 'Workshop', 'Other'];

const STEPS = [
  { label: 'Event Details', icon: CalendarDays },
  { label: 'Select Canteen', icon: Building2 },
  { label: 'Menu Items',     icon: Truck },
  { label: 'Review',         icon: Check },
];

const minDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
};

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={s.label} className="flex items-center flex-1">
            <div className={`flex flex-col items-center flex-shrink-0 ${active || done ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all
                ${done   ? 'border-green-500 bg-green-500/20' :
                  active ? 'border-gold-500 bg-gold-500/20 shadow-gold' :
                           'border-white/20 bg-white/5'}`}>
                {done ? <Check size={16} className="text-green-400" /> : <Icon size={16} className={active ? 'text-gold-400' : 'text-white/40'} />}
              </div>
              <span className={`text-[10px] mt-1 text-center w-14 hidden sm:block ${active ? 'text-gold-400' : 'text-white/40'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${done ? 'bg-green-500' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function BulkOrderForm() {
  const { user } = useAuth();
  const { submitBulkOrder } = useOrders();
  const { getMenu } = useCanteens();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const [step, setStep]             = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(null);

  // Step 1 — Event Details
  const [eventName,     setEventName]     = useState('');
  const [eventType,     setEventType]     = useState('');
  const [venue,         setVenue]         = useState('');
  const [eventDate,     setEventDate]     = useState('');
  const [eventTime,     setEventTime]     = useState('');
  const [participants,  setParticipants]  = useState('');
  const [orgName,       setOrgName]       = useState('');
  const [orgRoll,       setOrgRoll]       = useState('');
  const [orgPhone,      setOrgPhone]      = useState('');
  const [deptClub,      setDeptClub]      = useState('');
  const [notes,         setNotes]         = useState('');
  const [errors,        setErrors]        = useState({});

  // Step 2 — Canteen
  const [selectedCanteen, setSelectedCanteen] = useState(null);

  // Step 3 — Items
  const [quantities, setQuantities] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState({});

  const panelRef = useRef(null);
  const dirRef   = useRef(1); // 1 = forward, -1 = backward

  const animateStep = (nextStep) => {
    const dir = nextStep > step ? 1 : -1;
    dirRef.current = dir;
    if (!panelRef.current) { setStep(nextStep); return; }
    gsap.to(panelRef.current, {
      x: dir * -40, opacity: 0, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setStep(nextStep);
        gsap.fromTo(panelRef.current,
          { x: dir * 40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
        );
      },
    });
  };

  const validateStep1 = () => {
    const e = {};
    if (!eventName.trim())    e.eventName   = 'Event name is required';
    if (!eventType)           e.eventType   = 'Event type is required';
    if (!venue.trim())        e.venue       = 'Venue is required';
    if (!eventDate)           e.eventDate   = 'Event date is required';
    else if (eventDate < minDate()) e.eventDate = 'Event must be at least 2 days from today';
    if (!eventTime)           e.eventTime   = 'Event time is required';
    if (!participants || parseInt(participants) < 10) e.participants = 'Minimum 10 participants required';
    if (!orgName.trim())      e.orgName     = 'Organizer name is required';
    if (!orgRoll.trim())      e.orgRoll     = 'Roll number is required';
    if (!orgPhone.trim())     e.orgPhone    = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const selectedItems = Object.entries(quantities).filter(([, qty]) => qty > 0);
    if (selectedItems.length === 0) { toast('Please add at least one item', 'warning'); return false; }
    const invalid = selectedItems.find(([, qty]) => qty < 5);
    if (invalid) { toast('Minimum quantity per item is 5', 'warning'); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !selectedCanteen) { toast('Please select a canteen', 'warning'); return; }
    if (step === 2 && !validateStep3()) return;
    animateStep(step + 1);
  };

  const handleBack = () => animateStep(step - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    const selectedItems = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        item_id: parseInt(itemId),
        quantity: qty,
        special_instructions: specialInstructions[itemId] || null,
      }));

    try {
      const result = await submitBulkOrder({
        canteen_id:      selectedCanteen.canteen_id,
        event_name:      eventName,
        event_type:      eventType,
        venue,
        event_date:      eventDate,
        event_time:      eventTime,
        num_participants: parseInt(participants),
        organizer_name:  orgName,
        organizer_roll:  orgRoll,
        organizer_phone: orgPhone,
        department_club: deptClub || null,
        additional_notes: notes || null,
        items:           selectedItems,
      });
      addNotification('bulk_submitted', `📦 Bulk order ${result.bulk_order_code} submitted for review!`);
      toast('Bulk order submitted successfully!', 'success');
      setSubmitted(result);
    } catch (err) {
      toast(err.message || 'Failed to submit bulk order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const menu = selectedCanteen ? getMenu(selectedCanteen.canteen_id) : [];
  const selectedItems = Object.entries(quantities).filter(([, qty]) => qty > 0);
  const estimatedTotal = selectedItems.reduce((sum, [itemId, qty]) => {
    const item = menu.find(m => m.item_id === parseInt(itemId));
    return sum + (item?.price || 0) * qty;
  }, 0);
  const totalPortions = selectedItems.reduce((s, [, q]) => s + q, 0);

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Bulk Order Submitted!</h2>
        <p className="text-gold-400 font-mono font-bold text-xl mb-2">{submitted.bulk_order_code}</p>
        <p className="text-white/60 text-sm mb-8">Your request is under admin review. You'll be notified once it's approved.</p>
        <div className="glass-card p-5 text-left mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Event</span>
            <span className="text-white font-medium">{eventName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Canteen</span>
            <span className="text-white font-medium">{selectedCanteen?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Date</span>
            <span className="text-white font-medium">{eventDate} at {eventTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Status</span>
            <span className="text-yellow-400 font-semibold">🟡 Pending Approval</span>
          </div>
        </div>
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300 mb-6">
          <p className="font-semibold mb-1">🕐 No Payment Required</p>
          <p className="text-blue-300/70">Payment will only be processed after admin approval and event confirmation.</p>
        </div>
        <a href="/student/orders" className="btn-gold inline-block">View My Orders</a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <CalendarDays size={24} className="text-gold-400" /> Bulk Order Request
        </h1>
        <p className="text-white/50 text-sm mt-1">Place advance food orders for campus events · Min 10 participants · 48h advance</p>
      </div>

      <StepBar current={step} />

      <div ref={panelRef}>
        {/* ── STEP 0: Event Details ──────────────────────────────── */}
        {step === 0 && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-white font-bold text-lg mb-2">Event Details</h2>

            {[
              { label: 'Event Name *', value: eventName, setter: setEventName, key: 'eventName', placeholder: 'e.g. Annual Tech Seminar' },
              { label: 'Venue *', value: venue, setter: setVenue, key: 'venue', placeholder: 'e.g. Seminar Hall 2, Block B' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-white/60 text-xs font-semibold mb-1.5">{f.label}</label>
                <input value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} className={`input-dark ${errors[f.key] ? 'border-red-500/60' : ''}`} />
                {errors[f.key] && <p className="text-red-400 text-xs mt-1">{errors[f.key]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-white/60 text-xs font-semibold mb-1.5">Event Type *</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)} className={`input-dark ${errors.eventType ? 'border-red-500/60' : ''}`}>
                <option value="" className="bg-navy-900">Select type…</option>
                {EVENT_TYPES.map(t => <option key={t} value={t} className="bg-navy-900">{t}</option>)}
              </select>
              {errors.eventType && <p className="text-red-400 text-xs mt-1">{errors.eventType}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs font-semibold mb-1.5">Event Date * <span className="text-white/30">(min 2 days ahead)</span></label>
                <input type="date" value={eventDate} min={minDate()} onChange={e => setEventDate(e.target.value)} className={`input-dark ${errors.eventDate ? 'border-red-500/60' : ''}`} />
                {errors.eventDate && <p className="text-red-400 text-xs mt-1">{errors.eventDate}</p>}
              </div>
              <div>
                <label className="block text-white/60 text-xs font-semibold mb-1.5">Event Time *</label>
                <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className={`input-dark ${errors.eventTime ? 'border-red-500/60' : ''}`} />
                {errors.eventTime && <p className="text-red-400 text-xs mt-1">{errors.eventTime}</p>}
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-xs font-semibold mb-1.5">Number of Participants * <span className="text-white/30">(min 10)</span></label>
              <input type="number" min={10} value={participants} onChange={e => setParticipants(e.target.value)} placeholder="50" className={`input-dark ${errors.participants ? 'border-red-500/60' : ''}`} />
              {errors.participants && <p className="text-red-400 text-xs mt-1">{errors.participants}</p>}
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Organizer Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Organizer Name *', value: orgName, setter: setOrgName, key: 'orgName', placeholder: 'Full name' },
                  { label: 'Roll Number *', value: orgRoll, setter: setOrgRoll, key: 'orgRoll', placeholder: 'e.g. 2221601' },
                  { label: 'Phone Number *', value: orgPhone, setter: setOrgPhone, key: 'orgPhone', placeholder: '+91 9876543210' },
                  { label: 'Department / Club', value: deptClub, setter: setDeptClub, key: 'deptClub', placeholder: 'e.g. Computer Science / IEEE' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-white/60 text-xs font-semibold mb-1.5">{f.label}</label>
                    <input value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} className={`input-dark ${errors[f.key] ? 'border-red-500/60' : ''}`} />
                    {errors[f.key] && <p className="text-red-400 text-xs mt-1">{errors[f.key]}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-white/60 text-xs font-semibold mb-1.5">Additional Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any special requirements, allergies, etc." className="input-dark resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Select Canteen ─────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start gap-2">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              Bulk orders must be placed at least 48 hours before the event.
            </div>
            {CANTEENS.map(c => (
              <button
                key={c.canteen_id}
                onClick={() => { setSelectedCanteen(c); setQuantities({}); setSpecialInstructions({}); }}
                className={`w-full glass-card p-4 text-left transition-all hover:-translate-y-0.5 ${selectedCanteen?.canteen_id === c.canteen_id ? 'border-gold-500 bg-gold-500/5' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold">{c.name}</p>
                      {selectedCanteen?.canteen_id === c.canteen_id && (
                        <span className="badge-gold text-[10px]">Selected</span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs mb-2">{c.description}</p>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>⏰ {c.operating_hours}</span>
                      <span className="flex items-center gap-1"><Star size={10} /> {c.avg_rating}</span>
                    </div>
                  </div>
                  {selectedCanteen?.canteen_id === c.canteen_id && (
                    <div className="w-8 h-8 rounded-full bg-gold-500/20 border-2 border-gold-500 flex items-center justify-center flex-shrink-0">
                      <Check size={16} className="text-gold-400" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── STEP 2: Menu Items ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">{selectedCanteen?.name} menu</p>
              {totalPortions > 0 && (
                <span className="badge-gold text-xs">{selectedItems.length} items · {totalPortions} portions</span>
              )}
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-300 flex items-start gap-2">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              Minimum 5 portions per item. Large orders require extra preparation time.
            </div>

            <div className="space-y-3">
              {menu.map(item => {
                const qty = quantities[item.item_id] || 0;
                return (
                  <div key={item.item_id} className={`glass-card p-4 transition-all ${qty > 0 ? 'border-gold-500/30 bg-gold-500/5' : ''}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-semibold">{item.name}</p>
                          <span className={`w-2.5 h-2.5 rounded-sm border ${item.is_veg ? 'border-green-500' : 'border-red-500'}`} />
                        </div>
                        <p className="text-gold-400 text-sm font-bold">{formatCurrency(item.price)} <span className="text-white/40 text-xs font-normal">per portion</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQuantities(p => ({ ...p, [item.item_id]: Math.max(0, (p[item.item_id] || 0) - 1) }))}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold">−</button>
                        <input
                          type="number"
                          min="0"
                          value={qty || ''}
                          placeholder="0"
                          onChange={e => {
                            const val = parseInt(e.target.value, 10);
                            setQuantities(p => ({ ...p, [item.item_id]: isNaN(val) ? 0 : Math.max(0, val) }));
                          }}
                          className={`w-14 bg-white/5 border border-white/10 rounded-lg py-1 text-center font-bold text-sm focus:border-gold-500 focus:bg-gold-500/10 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${qty > 0 ? 'text-gold-400 border-gold-500/30' : 'text-white/60'}`}
                        />
                        <button onClick={() => setQuantities(p => ({ ...p, [item.item_id]: (p[item.item_id] || 0) + 1 }))}
                          className="w-8 h-8 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 flex items-center justify-center text-lg font-bold">+</button>
                      </div>
                    </div>
                    {qty > 0 && qty < 5 && (
                      <p className="text-red-400 text-xs mt-2">Minimum 5 portions required</p>
                    )}
                    {qty >= 5 && (
                      <div className="mt-2">
                        <input
                          value={specialInstructions[item.item_id] || ''}
                          onChange={e => setSpecialInstructions(p => ({ ...p, [item.item_id]: e.target.value }))}
                          placeholder="Special instructions (optional)"
                          className="input-dark text-xs py-2"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPortions > 0 && (
              <div className="glass-card p-4 border-gold-500/30 bg-gold-500/5">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-white">Estimated Total</span>
                  <span className="text-gold-400">{formatCurrency(estimatedTotal)}</span>
                </div>
                <p className="text-white/40 text-xs mt-1">Reference only · Payment pending admin approval</p>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Review ────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Approval banner */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-blue-300 font-bold text-sm mb-1">🕐 No Payment Required</p>
              <p className="text-blue-300/70 text-xs">This order will be reviewed by the admin before confirmation. Estimated total is for reference only.</p>
            </div>

            <div className="glass-card p-5 space-y-3">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Event Details</p>
              {[
                ['Event',       eventName],
                ['Type',        eventType],
                ['Venue',       venue],
                ['Date & Time', `${eventDate} at ${eventTime}`],
                ['Participants', participants],
                ['Organizer',   orgName],
                ['Roll No.',    orgRoll],
                ['Phone',       orgPhone],
                ...(deptClub ? [['Dept / Club', deptClub]] : []),
                ...(notes ? [['Notes', notes]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm gap-4">
                  <span className="text-white/50 flex-shrink-0">{label}</span>
                  <span className="text-white text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="glass-card p-5 space-y-3">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                Canteen — {selectedCanteen?.name}
              </p>
              {selectedItems.map(([itemId, qty]) => {
                const item = menu.find(m => m.item_id === parseInt(itemId));
                if (!item) return null;
                return (
                  <div key={itemId} className="flex justify-between text-sm">
                    <span className="text-white/80">{item.name} × {qty}</span>
                    <span className="text-white">{formatCurrency(item.price * qty)}</span>
                  </div>
                );
              })}
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                <span className="text-white/60">Estimated Total (pending approval)</span>
                <span className="text-gold-400">{formatCurrency(estimatedTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-gold w-full text-base py-4"
            >
              {submitting
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-navy-900/50 border-t-navy-900 rounded-full animate-spin" />
                    Submitting…
                  </span>
                : '📦 Submit for Approval'
              }
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={handleBack} className="btn-outline flex-1 flex items-center justify-center gap-2">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < 3 && (
          <button onClick={handleNext} className="btn-gold flex-1 flex items-center justify-center gap-2">
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
