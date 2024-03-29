FROM node:12.9.0-stretch

ARG CHROME_DRIVER_VERSION="76.0.3809.126"
ARG CHROME_VERSION="google-chrome-stable"

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qqy \
  && apt-get -qqy install \
    unzip ${CHROME_VERSION:-google-chrome-stable} \
  && rm /etc/apt/sources.list.d/google-chrome.list \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

RUN CD_VERSION=$(if [ ${CHROME_DRIVER_VERSION:-latest} = "latest" ]; then echo $(wget -qO- https://chromedriver.storage.googleapis.com/LATEST_RELEASE); else echo $CHROME_DRIVER_VERSION; fi) \
  && echo "Using chromedriver version: "$CD_VERSION \
  && wget --no-verbose -O /tmp/chromedriver_linux64.zip https://chromedriver.storage.googleapis.com/$CD_VERSION/chromedriver_linux64.zip \
  && rm -rf /opt/selenium/chromedriver \
  && unzip /tmp/chromedriver_linux64.zip -d /opt/selenium \
  && rm /tmp/chromedriver_linux64.zip \
  && mv /opt/selenium/chromedriver /opt/selenium/chromedriver-$CD_VERSION \
  && chmod 755 /opt/selenium/chromedriver-$CD_VERSION \
  && ln -fs /opt/selenium/chromedriver-$CD_VERSION /usr/bin/chromedriver

ENV IS_CI="true"

RUN mkdir /planner
WORKDIR /planner
COPY package.json yarn.lock ./
RUN yarn install && yarn cache clean
COPY . .

ARG GIT_COMMIT="XXX"
ARG GIT_BRANCH="master"
ENV GIT_COMMIT=$GIT_COMMIT
ENV GIT_BRANCH=$GIT_BRANCH
RUN sed -i "s/COMMIT/${GIT_COMMIT}/g ; s/BRANCH/${GIT_BRANCH}/g" src/git-version.ts

ENV NODE_OPTIONS=--max_old_space_size=3072
CMD yarn run ng e2e Web-Planner-e2e
