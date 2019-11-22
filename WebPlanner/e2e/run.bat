SET COMPOSE_PROJECT_NAME=WINTEST
SET WP_TEST_PROJECT=Web-Planner-e2e
docker-compose down -v --remove-orphans
docker-compose up --build --exit-code-from webplanner-e2e
pause
