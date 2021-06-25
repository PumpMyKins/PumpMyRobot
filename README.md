# PumpMyRobot

### Create container
```
docker run -d --name=pumpmyrobot --mount type=volume,dst=/modules,volume-driver=local,volume-opt=type=none,volume-opt=o=bind,volume-opt=device=/var/pumpmyrobot-data ghcr.io/pumpmykins/pumpmyrobot:stable 
```