# Usamos una imagen de node
FROM node:16 AS build

# Instalamos pnpm globalmente
RUN npm install -g pnpm

# Seteamos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de package.json y pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instalamos las dependencias con pnpm
RUN pnpm install

# Copiamos todo el código fuente
COPY . .

# Construimos la app para producción
RUN pnpm run build

# Usamos una imagen más ligera para la ejecución
FROM nginx:alpine

# Copiamos los archivos construidos en el contenedor de nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponemos el puerto
EXPOSE 80

# Iniciamos nginx
CMD ["nginx", "-g", "daemon off;"]
