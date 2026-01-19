import ShareClient from './client'

export async function generateStaticParams() {
  return [{ id: 'demo' }]
}

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  return <ShareClient params={params} />
}
