import { redirect } from 'next/navigation'

export default function BeneficiaireDetailPage({
  params,
}: {
  params: { id: string }
}) {
  redirect(`/consultant/beneficiaires/${params.id}`)
}
