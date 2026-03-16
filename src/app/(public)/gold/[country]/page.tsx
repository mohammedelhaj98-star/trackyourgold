import { PublicDataPage } from '@/components/seo/PublicDataPage';
export default function Page({ params }: { params: { country: string } }) { return <PublicDataPage title={`Live Gold Price in ${params.country}`} country={params.country} intro="Track all detected karats from Malabar and compare against global reference prices." />; }
