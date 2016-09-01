# Rocket

## Fresh Setup in Ubuntu 14.04

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

sudo apt-get update

sudo apt-get upgrade

sudo apt-get install -y git nodejs-legacy npm mongodb-org

sudo service mongod start

[Optional] Azure network setup

Check HTTP port (80) is open: Web Portal > Virtual Machines > Network Interface > Network security group > Inbound security rules

## Configuration files set up

1. Create .env file

2. Create config.js file

3. Create alias.conf file

## Initial Database

node ./app_api/jobs/index.js --id 8ccb958f-ef57-414d-a887-c4ba83f19817 --secret D3ccYg5yMehjSH5L8aAqstJdJHEkHP3yqkY5RYewYqcgAgNx

## Start Up

sudo PORT=80 npm start
