docker build --tag remkolomna/webplanner:builder ../../Builder
docker run --rm -p 5111:5001 -t -i remkolomna/webplanner:builder /opt/builder/Builder --integration
pause
