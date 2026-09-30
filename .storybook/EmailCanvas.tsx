import React, { useEffect, useState } from 'react'
import { render } from 'react-email'

export function EmailCanvas({ story }: { story: React.ReactElement }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    let active = true
    void render(story).then((markup) => {
      if (active) setHtml(markup)
    })
    return () => {
      active = false
    }
  }, [story])

  return (
    <iframe
      title="Email preview"
      srcDoc={html}
      sandbox="allow-same-origin"
      className="min-h-[960px] w-full border-0 bg-white"
    />
  )
}
