export const downloadImage = async (url, fileName = 'qr-code.png') => {
  if (!url) return

  const response = await fetch(url)
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(objectUrl)
}
