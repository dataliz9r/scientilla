# Scientilla

[![Build Status](https://travis-ci.org/scientilla/scientilla.svg?branch=master)](https://travis-ci.org/scientilla/scientilla)


## Current status

Scientilla is currently in development and not ready to be used in production.

## Installation:

At the moment you need to build Scientilla by yourself.

1. The first step is to download Scientilla. You can do that just by using git:

    ```
    git clone https://github.com/scientilla/scientilla.git scientilla
    ```

2. Then you have to surf to the scientilla folder

    ```
    cd scientilla
    ```

3. The next step is to configure the application:

    ```
    cp config/scientilla.js.example config/scientilla.js

    cp config/connectors.js.example config/connectors.js

    cp config/customizations.js.example config/customizations.js

    cp config/connections.js config/local.js
    sed -i 's/safe/alter/g' config/models.js
    ```

    And edit the config/scientilla.js and config/local.js files with your system settings.
    
    The customizations and external connectors config file can be changed by the UI of Scientilla.

4. The next step is to install the dependencies of Scientilla. 
 
    This can be performed in 2 ways:

    1. By using [docker](https://www.docker.com/) (suggested):

        ```
        ./bin/npm install
        ./bin/bower install
        cp docker-compose-develop.yml docker-compose.yml
        docker-compose up
        ```

    2. By installing all the dependencies manually (Ubuntu 16.04):

        ```
        sudo apt-get install build-essential libcurl4-gnutls-dev libxml2-dev libssl-dev
        sudo apt-get install postgresql-9.5
        ```
        Here you have to create the user and database for Scientilla.

        ```
        curl -sL https://deb.nodesource.com/setup_7.x -o nodesource_setup.sh
        sudo bash nodesource_setup.sh
        rm nodesource_setup.sh
        sudo apt-get install nodejs
        sudo npm install pm2 -g
        sudo npm install bower -g
        npm install && bower install
        ```

        (These depedencies can be easily installed also on other Operating Systems)

5. The last step is to run Scientilla:

    ```
    pm2 start app.js -x -- --prod
    ```

6. Now you can access Scientilla by browsing to the Scientilla Url.
  
    If you installed Scientilla locally the URL will be:

    ```
    127.0.0.1:1337
    ```

    If you find any problem while performing these procedures please [open up a new issue and let us know](https://github.com/scientilla/scientilla/issues/new).

## API 

[API documentation](docs/api/README.md)



## POWERED BY
<img src="https://www.browserstack.com/images/layout/browserstack-logo-600x315.png" width="150">
