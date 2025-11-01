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
    </div>
  );
}