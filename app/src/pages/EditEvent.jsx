import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventCategory: '',
    eventType: 'Offline',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    venue: '',
    locationLink: '',
    organizerName: '',
    organizerContact: '',
    isRegistrationRequired: false,
    registrationLink: '',
    registrationFee: 0,
    maxParticipants: '',
    status: 'Published',
    bannerImage: '',
    tags: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'events', id));
        if (!snap.exists()) {
          setError('Event not found');
        } else {
          const e = snap.data();
          setForm({
            title: e.title || '',
            description: e.description || '',
            eventCategory: e.eventCategory || '',
            eventType: e.eventType || 'Offline',
            startDate: e.startDate?.seconds ? new Date(e.startDate.seconds * 1000).toISOString().slice(0,16) : (e.dateTime ? new Date(e.dateTime).toISOString().slice(0,16) : ''),
            endDate: e.endDate?.seconds ? new Date(e.endDate.seconds * 1000).toISOString().slice(0,16) : '',
            registrationDeadline: e.registrationDeadline?.seconds ? new Date(e.registrationDeadline.seconds * 1000).toISOString().slice(0,16) : '',
            venue: e.venue || '',
            locationLink: e.locationLink || '',
            organizerName: e.organizerName || '',
            organizerContact: e.organizerContact || '',
            isRegistrationRequired: !!e.isRegistrationRequired,
            registrationLink: e.registrationLink || '',
            registrationFee: e.registrationFee || 0,
            maxParticipants: e.maxParticipants || '',
            status: e.status || 'Published',
            bannerImage: e.bannerImage || e.posterURL || '',
            tags: (e.tags || []).join(', '),
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const updateField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        eventCategory: form.eventCategory,
        eventType: form.eventType,
        startDate: form.startDate ? new Date(form.startDate) : null,
        endDate: form.endDate ? new Date(form.endDate) : null,
        registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline) : null,
        venue: form.venue,
        locationLink: form.locationLink,
        organizerName: form.organizerName,
        organizerContact: form.organizerContact,
        isRegistrationRequired: !!form.isRegistrationRequired,
        registrationLink: form.registrationLink,
        registrationFee: Number(form.registrationFee || 0),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
        status: form.status,
        bannerImage: form.bannerImage,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, 'events', id), payload);
      alert('Event updated');
      navigate('/manager/events');
    } catch (err) {
      setError(err.message || 'Failed to update');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Event</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">Event Title</span>
          <input className="input mt-1" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm">Description</span>
          <textarea className="input mt-1" rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Category</span>
          <input className="input mt-1" value={form.eventCategory} onChange={(e) => updateField('eventCategory', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Type</span>
          <select className="input mt-1" value={form.eventType} onChange={(e) => updateField('eventType', e.target.value)}>
            {['Online','Offline','Hybrid'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Start</span>
          <input type="datetime-local" className="input mt-1" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">End</span>
          <input type="datetime-local" className="input mt-1" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Registration Deadline</span>
          <input type="datetime-local" className="input mt-1" value={form.registrationDeadline} onChange={(e) => updateField('registrationDeadline', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Venue</span>
          <input className="input mt-1" value={form.venue} onChange={(e) => updateField('venue', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Location / Meet Link</span>
          <input className="input mt-1" value={form.locationLink} onChange={(e) => updateField('locationLink', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Organizer Name</span>
          <input className="input mt-1" value={form.organizerName} onChange={(e) => updateField('organizerName', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Organizer Contact</span>
          <input className="input mt-1" value={form.organizerContact} onChange={(e) => updateField('organizerContact', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Require Registration</span>
          <input type="checkbox" className="ml-2" checked={form.isRegistrationRequired} onChange={(e) => updateField('isRegistrationRequired', e.target.checked)} />
        </label>
        <label className="block">
          <span className="text-sm">Registration Link</span>
          <input className="input mt-1" value={form.registrationLink} onChange={(e) => updateField('registrationLink', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Registration Fee</span>
          <input type="number" min="0" className="input mt-1" value={form.registrationFee} onChange={(e) => updateField('registrationFee', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Max Participants</span>
          <input type="number" min="0" className="input mt-1" value={form.maxParticipants} onChange={(e) => updateField('maxParticipants', e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Status</span>
          <select className="input mt-1" value={form.status} onChange={(e) => updateField('status', e.target.value)}>
            {['Draft','Published','Completed','Cancelled'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm">Tags (comma-separated)</span>
          <input className="input mt-1" value={form.tags} onChange={(e) => updateField('tags', e.target.value)} />
        </label>
        <div className="md:col-span-2">
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}