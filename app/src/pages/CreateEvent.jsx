import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../utils/storage';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function CreateEvent() {
  const { user, profile } = useAuth();
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
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role={profile?.role === 'manager' ? 'manager' : 'student'} managerProfileComplete={!!profile?.profileComplete} current={'create_event'} onChange={() => {}} />
        <main className="flex-1 p-6">
          {!profile?.profileComplete && profile?.role === 'manager' ? (
            <div className="max-w-3xl mx-auto">
              <div className="border border-gray-200 p-6 rounded-none shadow-none">
                <h1 className="text-xl font-semibold text-fjwuGreen">Create Event</h1>
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
                <h1 className="text-xl font-semibold text-fjwuGreen mb-4">Create Event</h1>
                {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Event Details */}
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

                  {/* Schedule Information */}
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

                  {/* Venue / Location */}
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

                  {/* Registration */}
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

                  {/* Image & Brochure */}
                  <label className="block md:col-span-2">
                    <span className="text-sm">Event Image URL</span>
                    <input type="url" className="input mt-1" value={eventImageUrl} onChange={(e) => setEventImageUrl(e.target.value)} placeholder="Paste an image URL" />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm">Or Upload Banner</span>
                    <input type="file" accept="image/*" className="input mt-1" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm">Brochure or PDF Link (optional)</span>
                    <input type="url" className="input mt-1" value={brochureLink} onChange={(e) => setBrochureLink(e.target.value)} placeholder="Paste link to brochure or PDF" />
                  </label>

                  {/* Organizer Contact */}
                  <label className="block md:col-span-2">
                    <span className="text-sm">Organizer Contact Email</span>
                    <input type="email" className="input mt-1" value={organizerContact} onChange={(e) => setOrganizerContact(e.target.value)} />
                  </label>

                  {/* Misc */}
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

                  <div className="md:col-span-2">
                    <button className="btn btn-primary" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
