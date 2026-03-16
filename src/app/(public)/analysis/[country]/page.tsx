import { PublicDataPage } from '@/components/seo/PublicDataPage';
export default function Page({ params }: { params: { country: string } }) { return <PublicDataPage title={`Gold Market Analysis in ${params.country}`} country={params.country} intro="AI-assisted summaries and recommendation reasons." />; }
