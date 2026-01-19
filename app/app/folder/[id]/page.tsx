import FolderClient from './client'

export async function generateStaticParams() {
  return [{ id: 'demo' }]
}

export default function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  return <FolderClient params={params} />
}
