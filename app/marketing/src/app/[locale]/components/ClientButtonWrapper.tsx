'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import GetStartedButton from './GetStartedButton'

type Props = {
  label?: string
}

export default function ClientButtonWrapper({ label }: Props) {
  const router = useRouter()
  const locale = useLocale()

  const handleClick = () => {
    router.push(`${process.env.NEXT_PUBLIC_DRIVER_APP_URL}/${locale}`)
  }

  return <GetStartedButton label={label} onClick={handleClick} />
}
