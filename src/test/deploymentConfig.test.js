import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const projectRoot = path.resolve('.')

describe('production deployment configuration', () => {
  it('documents a same-origin API and an SPA-safe Nginx proxy', () => {
    const files = ['.env.example', '.env.production', 'deploy/nginx-sportclub.conf', 'deploy/README.md']
    const allFilesExist = files.every((file) => existsSync(path.join(projectRoot, file)))

    expect(allFilesExist).toBe(true)
    if (!allFilesExist) return

    expect(readFileSync(path.join(projectRoot, '.env.example'), 'utf8')).toContain('VITE_API_URL=/api')
    expect(readFileSync(path.join(projectRoot, '.env.production'), 'utf8')).toContain('VITE_API_URL=/api')

    const nginx = readFileSync(path.join(projectRoot, 'deploy/nginx-sportclub.conf'), 'utf8')
    expect(nginx).toMatch(/listen 80;/)
    expect(nginx).toContain('try_files $uri $uri/ /index.html;')
    expect(nginx).toContain('location /api/')
    expect(nginx).toContain('proxy_pass http://127.0.0.1:3000/api/;')

    const viteConfig = readFileSync(path.join(projectRoot, 'vite.config.js'), 'utf8')
    expect(viteConfig).toContain("'**/.worktrees/**'")
  })
})
