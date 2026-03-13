# Utiliza la imagen oficial de Node.js como base
FROM node:18.16.0

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos del proyecto al directorio de trabajo
COPY . .

# Compila el proyecto Angular con configuración Docker (apiUrl relativo)
RUN npm run build -- --configuration=docker

# Segunda etapa: Nginx para el despliegue
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

# Configuración con proxy /api hacia backend
COPY default.docker.conf /etc/nginx/conf.d/default.conf

# Copia los archivos compilados (output: dist/frontend-clt)
COPY --from=0 /app/dist/frontend-clt /usr/share/nginx/html/frontend-clt


# Expone el puerto 80 para acceder a la aplicación desde el navegador
EXPOSE 80

# Comando para iniciar el servidor Nginx y servir la aplicación Angular
CMD ["nginx", "-g", "daemon off;"]