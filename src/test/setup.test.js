const originalFetch = globalThis.fetch

describe('test teardown', () => {
  it('allows a test to stub a global', () => {
    vi.stubGlobal('fetch', vi.fn())

    expect(globalThis.fetch).not.toBe(originalFetch)
  })

  it('restores stubbed globals after each test', () => {
    expect(globalThis.fetch).toBe(originalFetch)
  })
})
