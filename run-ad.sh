# docker sock permission
# sudo usermod -aG docker $USER
# newgrp docker ? may fix if i restart

docker stop myapp
docker rm -f myapp
#docker run -p 3000:3000 --name myapp nestjs-crud-app
docker run -v $(pwd):/app -w /app -p 3000:3000 --name myapp nestjs-crud-app

