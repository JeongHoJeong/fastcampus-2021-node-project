;(() => {
  const url = new URL(window.location)
  const info = url.searchParams.get('info')
  const error = url.searchParams.get('error')

  function addMessageBlock(message, className) {
    const div = document.createElement('div')
    div.className = `absolute flex top-4 left-4 right-4 rounded text-base text-white items-center justify-center pointer-cursor text-center p-4 ${className}`
    div.innerText = message
    div.addEventListener('click', () => {
      document.body.removeChild(div)
    })
    document.body.appendChild(div)
  }

  if (info) {
    addMessageBlock(info, 'bg-blue-500')
  }
  if (error) {
    addMessageBlock(error, 'bg-red-500')
  }
})()
