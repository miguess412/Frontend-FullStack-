# Etapa 1: Construir la app Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación para producción
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:1.25-alpine

# Copiar los archivos construidos
COPY --from=build /app/dist/admin-panel/browser /usr/share/nginx/html

# Copiar configuración de Nginx (si existe)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]