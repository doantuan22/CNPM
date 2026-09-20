import { useParams } from 'react-router-dom';

export default function HotelDetailPage() {
  const { id } = useParams();
  return <h1>Hotel #{id}</h1>;
}
