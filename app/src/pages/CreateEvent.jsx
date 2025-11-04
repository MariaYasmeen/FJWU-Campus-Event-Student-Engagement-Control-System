import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadFile } from '../utils/storage';
import ManagerLayout from '../components/ManagerLayout.jsx';

export default function CreateEvent() {
  const { user, profile } = useAuth();
  const { id } = useParams();
  const isEdit = !!id;
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventType, setEventType] = useState('Offline');
  // New schedule fields
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(''); // minutes
  // Backward compat fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [venue, setVenue] = useState('');
  const [locationLink, setLocationLink] = useState('');
  const [organizerName, setOrganizerName] = useState(profile?.organizerName || '');
  const [organizerDepartment, setOrganizerDepartment] = useState(profile?.department || '');
  const [organizerContact, setOrganizerContact] = useState(profile?.contactEmail || profile?.email || '');
  const [isRegistrationRequired, setIsRegistrationRequired] = useState(false);
  const [registrationLink, setRegistrationLink] = useState('');
  const [registrationFee, setRegistrationFee] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [status, setStatus] = useState('Published');
  const [bannerFile, setBannerFile] = useState(null);
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [brochureLink, setBrochureLink] = useState('');
  const [campus, setCampus] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-calculate duration when start/end provided
  useEffect(() => {
    if (startTime && endTime) {
      // Compute minutes difference
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      const diff = end - start;
      if (!Number.isNaN(diff) && diff > 0) setDuration(String(diff));
    }
  }, [startTime, endTime]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let uploadedUrl = '';
      if (bannerFile) {
        const { url } = await uploadFile({
          file: bannerFile,
          pathPrefix: 'event_banners',
          uid: user.uid,
        });
        uploadedUrl = url;
      }
      // Choose poster URL: prefer pasted URL over uploaded
      const posterURL = (eventImageUrl && eventImageUrl.trim()) ? eventImageUrl.trim() : (uploadedUrl || '');
      // Compose combined dateTime string for convenience
      let dateTime = '';
      if (eventDate) {
        const base = new Date(eventDate);
        if (startTime) {
          const [hh, mm] = startTime.split(':').map(Number);
          base.setHours(hh || 0, mm || 0, 0, 0);
        }
        dateTime = base.toISOString();
      } else if (startDate) {
        dateTime = startDate;
      }
      if (isEdit) {
        // Update existing event
        const ref = doc(db, 'events', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error('Event not found');
        const data = snap.data();
        if (data.createdBy !== user.uid) throw new Error('You can only edit your own event');
        await updateDoc(ref, {
          title,
          description,
          eventCategory,
          eventType,
          eventDate: eventDate ? new Date(eventDate) : null,
          startTime: startTime || '',
          endTime: endTime || '',
          duration: duration ? Number(duration) : null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
          venue,
          locationLink,
          organizerId: user.uid,
          organizerName,
          organizerDepartment,
          organizerEmail: organizerContact,
          organizerContact,
          campus,
          isRegistrationRequired,
          registrationLink,
          registrationFee: Number(registrationFee || 0),
          maxParticipants: maxParticipants ? Number(maxParticipants) : null,
          status,
          bannerImage: posterURL,
          posterURL,
          brochureLink: brochureLink || '',
          tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          visibility,
          dateTime,
          updatedAt: serverTimestamp(),
        });
        navigate(`/events/${id}`);
      } else {
        const docRef = await addDoc(collection(db, 'events'), {
          title,
          description,
          eventCategory,
          eventType,
          // New schedule fields
          eventDate: eventDate ? new Date(eventDate) : null,
          startTime: startTime || '',
          endTime: endTime || '',
          duration: duration ? Number(duration) : null,
          // Backward compat
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
          venue,
          locationLink,
          organizerId: user.uid,
          organizerName,
          organizerDepartment,
          organizerEmail: organizerContact,
          organizerContact,
          campus,
          isRegistrationRequired,
          registrationLink,
          registrationFee: Number(registrationFee || 0),
          maxParticipants: maxParticipants ? Number(maxParticipants) : null,
          status,
          bannerImage: posterURL,
          posterURL,
          brochureLink: brochureLink || '',
          tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          visibility,
          attendeesCount: 0,
          likesCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user.uid,
          dateTime,
          approvalStatus: 'pending',
        });
        navigate(`/events/${docRef.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadForEdit = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const ref = doc(db, 'events', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error('Event not found');
        const data = snap.data();
        if (data.createdBy !== user.uid) throw new Error('You can only edit your own event');
        setTitle(data.title || '');
        setDescription(data.description || '');
        setEventCategory(data.eventCategory || '');
        setEventType(data.eventType || 'Offline');
        const d = data.eventDate?.seconds ? new Date(data.eventDate.seconds * 1000) : (data.eventDate ? new Date(data.eventDate) : (data.dateTime ? new Date(data.dateTime) : null));
        setEventDate(d ? d.toISOString().slice(0, 10) : '');
        setStartTime(data.startTime || '');
        setEndTime(data.endTime || '');
        setDuration(data.duration ? String(data.duration) : '');
        setStartDate(data.startDate?.seconds ? new Date(data.startDate.seconds * 1000).toISOString() : '');
        setEndDate(data.endDate?.seconds ? new Date(data.endDate.seconds * 1000).toISOString() : '');
        setRegistrationDeadline(data.registrationDeadline?.seconds ? new Date(data.registrationDeadline.seconds * 1000).toISOString().slice(0,10) : '');
        setVenue(data.venue || '');
        setLocationLink(data.locationLink || '');
        setOrganizerName(data.organizerName || '');
        setOrganizerDepartment(data.organizerDepartment || '');
        setOrganizerContact(data.organizerEmail || data.organizerContact || '');
        setIsRegistrationRequired(!!data.isRegistrationRequired);
        setRegistrationLink(data.registrationLink || '');
        setRegistrationFee(typeof data.registrationFee === 'number' ? data.registrationFee : 0);
        setMaxParticipants(data.maxParticipants ? String(data.maxParticipants) : '');
        setStatus(data.status || 'Published');
        setEventImageUrl(data.posterURL || '');
        setBrochureLink(data.brochureLink || '');
        setCampus(data.campus || '');
        setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '');
        setVisibility(data.visibility || 'public');
      } catch (err) {
        setError(err.message || 'Failed to load event for edit');
      } finally {
        setLoading(false);
      }
    };
    if (user) loadForEdit();
  }, [isEdit, id, user]);

  return (
    <ManagerLayout current={'create_event'} onChange={() => {}}>
          {!profile?.profileComplete && profile?.role === 'manager' ? (
            <div className="max-w-3xl mx-auto">
              <div className="border border-gray-200 p-6 rounded-none shadow-none">
                <h1 className="text-xl font-semibold text-fjwuGreen">{isEdit ? 'Edit Event' : 'Create Event'}</h1>
                <p className="mt-2 text-gray-700">
                  Please create your society profile before creating events.
                </p>
                <div className="mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/manager/profile')}
                  >
                    Go to Society Profile
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="border border-gray-200 p-6 rounded-none shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-semibold text-fjwuGreen">{isEdit ? 'Edit Event' : 'Create Event'}</h1>
                  {isEdit && step === 3 && (
                    <button className="btn btn-primary" onClick={(e) => onSubmit(e)} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>
                {/* Stepper */}
                <div className="mb-4 flex items-center justify-center gap-3 text-sm">
                  {[1,2,3].map((s) => (
                    <button key={s} className={`px-3 py-1 rounded-full border ${step===s?'bg-fjwuGreen text-white border-fjwuGreen':'bg-white text-gray-700 border-gray-300'}`} onClick={() => setStep(s)}>
                      Step {s}
                    </button>
                  ))}
                </div>
                {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

                {/* Step 1: Image URL + Preview */}
                {step === 1 && (
                  <div className="space-y-4">
                    {eventImageUrl ? (
                      <div className="w-full">
                        <img src={eventImageUrl} alt="Preview" className="w-full max-h-96 object-contain rounded-md border" />
                      </div>
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-gray-500 border rounded-md">Image preview</div>
                    )}
                    <label className="block">
                      <span className="text-sm">Event Image URL</span>
                      <input type="url" className="input mt-1" value={eventImageUrl} onChange={(e) => setEventImageUrl(e.target.value)} placeholder="Paste an image URL" />
                    </label>
                    <label className="block">
                      <span className="text-sm">Or Upload Banner</span>
                      <input type="file" accept="image/*" className="input mt-1" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
                    </label>
                    <div className="flex justify-end">
                      <button className="btn btn-primary" onClick={() => setStep(2)}>Next →</button>
                    </div>
                  </div>
                )}

                {/* Step 2: Basic Event Details */}
                {step === 2 && (
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e)=>{e.preventDefault(); setStep(3);}}>
                    <label className="block md:col-span-2">
                      <span className="text-sm">Event Title</span>
                      <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-sm">Description</span>
                      <textarea className="input mt-1" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm">Event Category</span>
                      <select className="input mt-1" value={eventCategory} onChange={(e) => setEventCategory(e.target.value)}>
                        {['Seminar','Workshop','Sports','Cultural','Academic','Competition'].map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm">Event Type</span>
                      <select className="input mt-1" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                        {['Online','Offline','Hybrid'].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm">Organizer Name</span>
                      <input className="input mt-1" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm">Organizer Department</span>
                      <input className="input mt-1" value={organizerDepartment} onChange={(e) => setOrganizerDepartment(e.target.value)} />
                    </label>
                    <div className="md:col-span-2 flex items-center justify-between">
                      <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                      <button type="submit" className="btn btn-primary">Next →</button>
                    </div>
                  </form>
                )}

                {/* Step 3: Additional Information */}
                {step === 3 && (
                  <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm">Event Date</span>
                      <input type="date" className="input mt-1" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm">Start Time</span>
                      <input type="time" className="input mt-1" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm">End Time</span>
                      <input type="time" className="input mt-1" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm">Duration (minutes)</span>
                      <input type="number" className="input mt-1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Auto-calculated if times provided" />
                    </label>

                    <label className="block">
                      <span className="text-sm">Venue / Location</span>
                      <input className="input mt-1" value={venue} onChange={(e) => setVenue(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm">Campus (optional)</span>
                      <select className="input mt-1" value={campus} onChange={(e) => setCampus(e.target.value)}>
                        <option value="">Select campus</option>
                        {['Main Campus','Satellite Campus','Online'].map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-sm">Location Link (optional)</span>
                      <input className="input mt-1" value={locationLink} onChange={(e) => setLocationLink(e.target.value)} placeholder="Google Maps or meeting link" />
                    </label>

                    <label className="block">
                      <span className="text-sm">Registration Deadline</span>
                      <input type="date" className="input mt-1" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm">Registration Required?</span>
                      <select className="input mt-1" value={isRegistrationRequired ? 'yes' : 'no'} onChange={(e) => setIsRegistrationRequired(e.target.value === 'yes')}>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm">Registration Link</span>
                      <input className="input mt-1" value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="text-sm">Registration Fee</span>
                      <input type="number" className="input mt-1" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-sm">Brochure or PDF Link (optional)</span>
                      <input type="url" className="input mt-1" value={brochureLink} onChange={(e) => setBrochureLink(e.target.value)} placeholder="Paste link to brochure or PDF" />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-sm">Organizer Contact Email</span>
                      <input type="email" className="input mt-1" value={organizerContact} onChange={(e) => setOrganizerContact(e.target.value)} />
                    </label>

                    <label className="block">
                      <span className="text-sm">Visibility</span>
                      <select className="input mt-1" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm">Status</span>
                      <select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
                        {['Published','Draft','Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-sm">Tags (comma-separated)</span>
                      <input className="input mt-1" value={tags} onChange={(e) => setTags(e.target.value)} />
                    </label>

                    <div className="md:col-span-2 flex items-center justify-between">
                      <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                      <button className="btn btn-primary" disabled={loading}>
                        {isEdit ? (loading ? 'Saving...' : 'Save Changes') : (loading ? 'Publishing...' : 'Confirm / Publish Event')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
    </ManagerLayout>
  );
}
