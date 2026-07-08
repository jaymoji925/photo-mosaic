export const loadImageAsync = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export const cropImageToFit = (img, targetWidth, targetHeight) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = targetWidth
  canvas.height = targetHeight
  
  const imgRatio = img.width / img.height
  const targetRatio = targetWidth / targetHeight
  
  let drawWidth, drawHeight, startX, startY
  
  if (imgRatio > targetRatio) {
    drawHeight = img.height
    drawWidth = img.height * targetRatio
    startX = (img.width - drawWidth) / 2
    startY = 0
  } else {
    drawWidth = img.width
    drawHeight = img.width / targetRatio
    startX = 0
    startY = (img.height - drawHeight) / 2
  }
  
  ctx.drawImage(img, startX, startY, drawWidth, drawHeight, 0, 0, targetWidth, targetHeight)
  
  return canvas
}

export const getAverageColor = (img, x, y, width, height) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = width
  canvas.height = height
  
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height)
  
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  let r = 0, g = 0, b = 0
  const pixelCount = data.length / 4
  
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }
  
  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount)
  }
}

export const expandPhotos = (photos, targetCount) => {
  if (photos.length >= targetCount) return photos
  
  const expanded = [...photos]
  const originalLength = photos.length
  
  while (expanded.length < targetCount) {
    const randomIndex = Math.floor(Math.random() * originalLength)
    expanded.push(photos[randomIndex])
  }
  
  return expanded
}

export const calculateOptimalGrid = (photoCount, baseWidth, baseHeight) => {
  const baseRatio = baseWidth / baseHeight
  
  let cols = Math.floor(Math.sqrt(photoCount * baseRatio))
  let rows = Math.ceil(photoCount / cols)
  
  while (cols * rows < photoCount) {
    if (cols / rows > baseRatio) {
      rows++
    } else {
      cols++
    }
  }
  
  return { cols, rows }
}

export const generateMosaic = async (baseImageSrc, photoSrcs, options = {}) => {
  const {
    targetTileCount = 1500,
    overlayOpacity = 0.5
  } = options
  
  try {
    const baseImg = await loadImageAsync(baseImageSrc)
    const photos = await Promise.all(photoSrcs.map(loadImageAsync))
    
    const expandedPhotos = expandPhotos(photos, targetTileCount)
    const { cols, rows } = calculateOptimalGrid(expandedPhotos.length, baseImg.width, baseImg.height)
    
    const tileWidth = Math.floor(baseImg.width / cols)
    const tileHeight = Math.floor(baseImg.height / rows)
    
    const mosaicCanvas = document.createElement('canvas')
    const ctx = mosaicCanvas.getContext('2d')
    
    mosaicCanvas.width = baseImg.width
    mosaicCanvas.height = baseImg.height
    
    const totalWidth = tileWidth * cols
    const totalHeight = tileHeight * rows
    const offsetX = Math.floor((baseImg.width - totalWidth) / 2)
    const offsetY = Math.floor((baseImg.height - totalHeight) / 2)
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * tileWidth
        const y = offsetY + row * tileHeight
        const w = tileWidth
        const h = tileHeight
        
        const photoIndex = (row * cols + col) % expandedPhotos.length
        const photo = expandedPhotos[photoIndex]
        
        const color = getAverageColor(baseImg, x, y, w, h)
        
        const overlayCanvas = document.createElement('canvas')
        const overlayCtx = overlayCanvas.getContext('2d')
        
        overlayCanvas.width = w
        overlayCanvas.height = h
        
        const croppedPhoto = cropImageToFit(photo, w, h)
        overlayCtx.drawImage(croppedPhoto, 0, 0)
        
        overlayCtx.globalAlpha = overlayOpacity
        overlayCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
        overlayCtx.fillRect(0, 0, w, h)
        
        ctx.drawImage(overlayCanvas, x, y)
      }
    }
    
    return {
      dataUrl: mosaicCanvas.toDataURL('image/png'),
      grid: { cols, rows },
      actualTileCount: expandedPhotos.length
    }
  } catch (error) {
    console.error('生成马赛克失败:', error)
    throw error
  }
}

export const downloadImage = (dataUrl, filename = 'photo-mosaic.png') => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
