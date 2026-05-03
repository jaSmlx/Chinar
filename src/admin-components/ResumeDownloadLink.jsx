import React from 'react'
import { Link } from '@adminjs/design-system'

const ResumeDownloadLink = (props) => {
  const { record } = props
  const id = record?.params?.id
  const path = record?.params?.resumeFilePath
  if (!path) return null
  return (
    <Link href={`/download/resume/${id}`} target="_blank" rel="noopener noreferrer">
      Скачать
    </Link>
  )
}

export default ResumeDownloadLink
