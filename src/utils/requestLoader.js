let pendingRequests = 0
const listeners = new Set()

const notify = () => {
  listeners.forEach((listener) => listener(pendingRequests))
}

export const startRequest = () => {
  pendingRequests += 1
  notify()
}

export const endRequest = () => {
  pendingRequests = Math.max(0, pendingRequests - 1)
  notify()
}

export const subscribeRequestState = (listener) => {
  listeners.add(listener)
  listener(pendingRequests)

  return () => {
    listeners.delete(listener)
  }
}
