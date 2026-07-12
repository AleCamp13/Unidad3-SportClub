import { useCallback, useEffect, useState } from 'react'

export default function useEntityList(loader) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await loader()
      setItems(Array.isArray(data) ? data : [])
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

  return { items, isLoading, error, reload: load }
}
