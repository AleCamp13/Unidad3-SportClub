# Despliegue Seguro en AWS EC2

Esta guia publica el frontend sin cambiar codigo, modelos, base de datos, contratos ni endpoints del backend oficial.

## Datos necesarios

- IP publica o Elastic IP de la instancia.
- Usuario SSH de Debian, normalmente `admin` o el indicado por AWS.
- Ruta local del archivo `.pem`. Nunca se comparte el contenido de la llave.
- Confirmacion de que el grupo de seguridad permite TCP 22 y 80.

## 1. Auditoria previa, sin cambios

Conectarse desde PowerShell:

```powershell
ssh -i "C:\ruta\llave.pem" admin@IP_PUBLICA
```

Ejecutar en EC2:

```bash
cat /etc/os-release
uname -a
df -h
free -h
sudo ss -tulpn
docker --version
docker compose version
nginx -v
sudo nginx -T
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
```

Guardar la salida antes de instalar, detener o reemplazar cualquier servicio. Si Nginx o Docker no existen, su comando fallara sin modificar la instancia.

## 2. Respaldo de configuracion existente

Solo despues de revisar la auditoria:

```bash
stamp=$(date +%Y%m%d-%H%M%S)
sudo mkdir -p "/var/backups/sportclub-$stamp"
sudo cp -a /etc/nginx "/var/backups/sportclub-$stamp/nginx"
docker ps --no-trunc > "/tmp/docker-before-$stamp.txt"
```

No se eliminan volumenes ni contenedores existentes durante el respaldo.

## 3. Backend oficial

El backend debe escuchar en `127.0.0.1:3000` o publicar el puerto `3000` desde Docker. Se utiliza el repositorio oficial sin modificar archivos fuente.

Verificacion local en EC2:

```bash
curl -i http://127.0.0.1:3000/api/member/classes
```

Una respuesta 401 o 403 confirma que la ruta existe y exige JWT. Un error de conexion indica que primero debe iniciarse el backend oficial siguiendo su propio `docker-compose.yml`.

## 4. Construir el frontend

En el equipo local, desde la raiz del repositorio:

```powershell
npm ci
npm test -- --run
npm run lint
npm run build
```

La compilacion usa `.env.production`, por lo que las solicitudes apuntan a `/api` y no a `localhost` del visitante.

## 5. Copiar `dist`

```powershell
scp -i "C:\ruta\llave.pem" -r .\dist admin@IP_PUBLICA:/tmp/unidad3-sportclub
scp -i "C:\ruta\llave.pem" .\deploy\nginx-sportclub.conf admin@IP_PUBLICA:/tmp/nginx-sportclub.conf
```

En EC2:

```bash
sudo mkdir -p /var/www/unidad3-sportclub
sudo rsync -a --delete /tmp/unidad3-sportclub/ /var/www/unidad3-sportclub/
sudo chown -R www-data:www-data /var/www/unidad3-sportclub
sudo install -m 0644 /tmp/nginx-sportclub.conf /etc/nginx/sites-available/unidad3-sportclub
sudo ln -sfn /etc/nginx/sites-available/unidad3-sportclub /etc/nginx/sites-enabled/unidad3-sportclub
sudo nginx -t
sudo systemctl reload nginx
```

`nginx -t` debe aprobar antes de recargar el servicio.

## 6. Verificacion publica

```bash
curl -I http://IP_PUBLICA/
curl -I http://IP_PUBLICA/login
curl -i http://IP_PUBLICA/api/member/classes
```

Luego comprobar en navegador:

1. Login de administrador, entrenador y socio.
2. Refresh directo en `/user/classes` y `/admin/users`.
3. Un CRUD temporal con limpieza posterior.
4. Catalogo, reserva y cancelacion del socio.
5. Consola sin errores y vista movil sin solapamientos.

## 7. Reversion

Si Nginx falla, restaurar el respaldo de configuracion y recargar solo despues de `sudo nginx -t`. No ejecutar `docker compose down -v`, no borrar volumenes y no reemplazar la base de datos para revertir el frontend.
