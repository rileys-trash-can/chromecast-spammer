# Chromecast spammer

A small little script by derz
Based on the [chromecast-api](https://github.com/alxhotel/chromecast-api) libary by [alxhotel](https://github.com/alxhotel)

## how to install

```bash
sudo apt install nodejs git
git clone https://github.com/eds-trash-can/chromecast-spammer.git # download repo
cd chromecast-spammer.git # go into folder
git submodules update --init # get deps 1/2
npm i # get deps 2/2
```

## how to use

download some video

```bash
node index.js

# get some help:
help

# start webserver
starthttp r /path/to/video/in/mp4/format

# list all available devices
devices

# send to specific device based on name
send <devicename>

# send to all devices
sendall

# stop on all playing devices
stop
```
