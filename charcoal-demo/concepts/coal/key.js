// Interim imagery: the supplied drink photographs sit on white, grey
// checkerboard or black boxes. This keys the box out in the browser (flood fill
// from the edges, so light parts inside the can survive), trims to the content
// and returns a transparent image, so every drink stands on the same board.
// Real cut-out photography replaces this without any layout change.
const cache = new Map()

export function keyed(url) {
  if (!cache.has(url)) cache.set(url, load(url).catch(() => ({ url, ar: 1.6, failed: true })))
  return cache.get(url)
}

async function load(url) {
  const image = new Image()
  image.src = url
  await image.decode()
  const scale = Math.min(1, 440 / Math.max(image.naturalWidth, image.naturalHeight))
  const w = Math.round(image.naturalWidth * scale)
  const h = Math.round(image.naturalHeight * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(image, 0, 0, w, h)
  const data = ctx.getImageData(0, 0, w, h)
  const px = data.data
  const corner = i => px[i * 4 + 3] < 16 ? 'alpha' : Math.max(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]) < 50 ? 'dark' : 'light'
  const corners = [0, w - 1, (h - 1) * w, h * w - 1].map(corner)
  const dark = corners.filter(c => c === 'dark').length >= 2
  const isBg = i => {
    const o = i * 4
    if (px[o + 3] < 20) return true
    const max = Math.max(px[o], px[o + 1], px[o + 2])
    const min = Math.min(px[o], px[o + 1], px[o + 2])
    return dark ? max < 34 : min > 182 && max - min < 26
  }
  const mask = new Uint8Array(w * h)
  const queue = new Int32Array(w * h)
  let head = 0
  let tail = 0
  const push = i => { if (!mask[i] && isBg(i)) { mask[i] = 1; queue[tail++] = i } }
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x) }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1) }
  while (head < tail) {
    const i = queue[head++]
    const x = i % w
    if (x > 0) push(i - 1)
    if (x < w - 1) push(i + 1)
    if (i >= w) push(i - w)
    if (i < w * (h - 1)) push(i + w)
  }
  let minX = w, minY = h, maxX = 0, maxY = 0
  for (let i = 0; i < w * h; i++) {
    const x = i % w
    const y = (i - x) / w
    if (mask[i]) { px[i * 4 + 3] = 0; continue }
    // Soften the cut edge by one pixel.
    const edge = (x > 0 && mask[i - 1]) || (x < w - 1 && mask[i + 1]) || (y > 0 && mask[i - w]) || (y < h - 1 && mask[i + w])
    if (edge) px[i * 4 + 3] = Math.round(px[i * 4 + 3] * .5)
    if (px[i * 4 + 3] > 40) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  ctx.putImageData(data, 0, 0)
  const cw = Math.max(1, maxX - minX + 1)
  const ch = Math.max(1, maxY - minY + 1)
  const out = document.createElement('canvas')
  out.width = cw
  out.height = ch
  out.getContext('2d').drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch)
  const blob = await new Promise(resolve => out.toBlob(resolve, 'image/webp', .9))
  return { url: blob ? URL.createObjectURL(blob) : out.toDataURL(), ar: ch / cw }
}
