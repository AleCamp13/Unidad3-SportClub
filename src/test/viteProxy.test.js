import { viteServer } from '../config/viteServer'

it('proxies local /api requests to the unmodified teacher backend', () => {
  expect(viteServer.proxy['/api']).toEqual({
    target: 'http://localhost:3000',
    changeOrigin: true,
  })
})
