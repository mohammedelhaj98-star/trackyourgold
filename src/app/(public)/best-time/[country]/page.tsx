import { PublicDataPage } from '@/components/seo/PublicDataPage';
export default function Page({ params }: { params: { country: string } }) { return <PublicDataPage title={`Best Time to Buy Gold in ${params.country}`} country={params.country} intro="Signal-based guidance with transparent scoring." />; }
