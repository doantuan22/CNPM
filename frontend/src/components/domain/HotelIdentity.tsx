import type { ReactNode } from 'react';

export function HotelIdentity({ name, location, stars, image, alt, supporting }: {
  name: string;
  location?: string;
  stars?: number;
  image?: string | null;
  alt?: string;
  supporting?: ReactNode;
}) {
  return (
    <div className="hotel-identity">
      {image && <img src={image} alt={alt ?? `Ảnh ${name}`} className="hotel-identity__image" />}
      <div className="hotel-identity__body">
        <strong>{name}</strong>
        {typeof stars === 'number' && <span className="hotel-identity__stars" aria-label={`${stars} sao`}>{'★'.repeat(Math.max(0, Math.min(5, stars)))}</span>}
        {location && <span className="hotel-identity__location">{location}</span>}
        {supporting}
      </div>
    </div>
  );
}
