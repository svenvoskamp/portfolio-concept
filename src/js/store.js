export const store = {
  isDevice:
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i),
}

export const events = {
  dragStart: store.isDevice ? 'touchstart' : 'mousedown',
  drag: store.isDevice ? 'touchmove' : 'mousemove',
  dragEnd: store.isDevice ? 'touchend' : 'mouseup',
}

export const math = {
  lerp: (a, b, n) => {
    return (1 - n) * a + n * b
  },
  map: (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c,
}

export let viewWidth = window.innerWidth
export let viewHeight = window.innerHeight

window.addEventListener('resize', () => {
  viewWidth = window.innerWidth
  viewHeight = window.innerHeight
})
