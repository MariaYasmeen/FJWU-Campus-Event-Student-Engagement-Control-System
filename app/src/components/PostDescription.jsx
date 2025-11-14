import React from 'react';

export default function PostDescription({ event }) {
  const dateStr = event?.dateTime
    ? new Date(event.dateTime).toLocaleString()
    : (event?.eventDate?.seconds
      ? new Date(event.eventDate.seconds * 1000).toLocaleString()
      : (event?.eventDate ? new Date(event.eventDate).toLocaleString() : ''));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-fjwuGreen">{event?.title}</h1>
      <p className="text-gray-700 mt-2">{event?.description}</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div><span className="font-medium">Category:</span> {event?.eventCategory}</div>
        <div><span className="font-medium">Type:</span> {event?.eventType}</div>
        <div><span className="font-medium">Venue:</span> {event?.venue}</div>
        <div><span className="font-medium">Campus:</span> {event?.campus}</div>
        <div><span className="font-medium">Date & Time:</span> {dateStr}</div>
        {event?.brochureLink && (
          <div>
            <span className="font-medium">Brochure:</span> <a className="underline text-fjwuGreen" href={event.brochureLink} target="_blank" rel="noreferrer">Open</a>
          </div>
        )}
      </div>
      {/* Registration and fee details */}
      <div className="mt-4 text-sm">
        {event?.isOpenEvent ? (
          <div className="text-gray-700">This event is free and open to everyone. No registration required.</div>
        ) : (
          <>
            {event?.isRegistrationRequired ? (
              <div className="space-y-1">
                <div className="text-gray-700">Registration Required</div>
                {event?.registrationLink && (
                  <div>
                    <span className="font-medium">Registration Link:</span>{' '}
                    <a className="underline text-fjwuGreen" href={event.registrationLink} target="_blank" rel="noreferrer">Open</a>
                  </div>
                )}
                {Number(event?.registrationFee || 0) > 0 ? (
                  <div><span className="font-medium">Registration Fee:</span> {Number(event.registrationFee)} </div>
                ) : (
                  <div className="text-gray-700">This event is free.</div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-gray-700">No registration required.</div>
                {Number(event?.registrationFee || 0) > 0 ? (
                  <div><span className="font-medium">Event Fee:</span> {Number(event.registrationFee)}</div>
                ) : (
                  <div className="text-gray-700">This event is free.</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}