# Assumes docker-compose.yaml is at the root /app root
cd server_codespace
# This setup script depends on running some code in other containers
sudo dockerd &
# Ugh yes there's no nice way to wait until dockerd is ready
sleep 5
# Do whatever setup you need
sudo docker-compose up -d
#docker-compose exec {some command to run migrations etc}
# If you need to use docker for this setup script you must stop all containers
# otherwise, any servers running in docker will not have their ports
# forwarded properly by codespaces.
sudo docker-compose stop