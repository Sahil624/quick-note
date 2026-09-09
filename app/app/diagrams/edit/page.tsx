'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { DiagramEditorPageClient } from '@/components/diagram-editor-page'

function EditDiagramContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  return <DiagramEditorPageClient diagramId={id ?? undefined} />
}

export default function EditDiagramPage() {
  return (
    <Suspense fallback={null}>
      <EditDiagramContent />
    </Suspense>
  )
}
