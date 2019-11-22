SET COMPOSE_PROJECT_NAME=WININTEGRATION
docker-compose down -v --remove-orphans
docker-compose up --build --exit-code-from webplanner-integration
pause
