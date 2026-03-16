import { PublicDataPage } from '@/components/seo/PublicDataPage';
export default function Page({ params }: { params: { country: string } }) { return <PublicDataPage title={`Gold Price History in ${params.country}`} country={params.country} intro="Analyze 24h, 7-day, 30-day, and 90-day ranges." />; }
