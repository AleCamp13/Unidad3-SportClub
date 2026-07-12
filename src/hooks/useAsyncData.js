import { useCallback, useEffect, useState } from 'react'

export default function useAsyncData(loader, initialValue) {
  const [data, setData] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const loaded = await loader()
      setData(loaded)
      return true
    } catch (requestError) {
      setError(requestError)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [loader])

  useEffect(() => {
    load()
  }, [load])

  return { data, error, isLoading, reload: load }
}
