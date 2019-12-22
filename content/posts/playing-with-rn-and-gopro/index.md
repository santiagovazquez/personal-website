---
title: Playing with React Native and My GoPro Cam
date: 2019-05-01
tags: ['post']
---

What if we could save our best moments in amateur sports?  It would be awesome! 

So imagine that you're playing soccer with friends and take your GoPro Cam with you. If you record everything it would be tedious to find and get the highlights. 

What if we have a button we could press when a goal happens and last 15 seconds get saved somewhat.

It's not a new idea. Some amateur leagues are doing it and it's awesome:

<Embed
  src="https://www.youtube.com/embed/ShQQIwEjPBM"
/>

We can build it and it's not difficult. For that, I used an old GoPro Cam and React Native to build an App. 

I started by experimenting with my GoPro Cam, a Silver Hero 3. It has a Wifi Spot which you can send commands over curl (see commands for other models on this [repo](https://github.com/KonradIT/goprowifihack
                                                                                                                                                               )). 
For example:
```
# SWITCH TO VIDEO MODE
curl "http://10.5.5.9/camera/CM?t=$GOPROPASS&p=%00"

# START/STOP RECORDING 
curl "http://10.5.5.9/bacpac/SH?t=$GOPROPASS&p=%01"

# DELETE ALL FILES FROM CAMERA
curl "http://10.5.5.9/camera/DA?t=$GOPROPASS"

```

Also it has a file server (Cherokee) where you can see all cam files:
```
# See files on your browser
open "http://10.5.5.9:8080/gp/gpMediaList"
```

Finally, if we have stuff like VLC or ffmpeg on your mac, we can do some magic:

```
# ENABLE STREAMING AND SEE LIVE VIDEO FROM VLC
curl -i "http://10.5.5.9/camera/PV?t=$GOPROPASS&p=%02"
vlc "http://10.5.5.9:8080/live/amba.m3u8"
# DOWNLOAD LAST 5 SECONDS OF SOME VIDEO ON YOUR GOPRO
ffmpeg -sseof -5 -i "$VIDEO_URL" -c copy output.mp4
```

So far I gave you every terminal command to build the app. Although we would like to have a mobile app to run those commands and not a computer.

To build the app, I chose React Native because it's really simple to use and we could use fetch API to execute most of the commands. 

The difficult part is to get only the last 15 seconds of the current video without using stuff like ffmpeg which is not available on RN. For that I use an open source library called [react-native-video-processing](https://github.com/santiagovazquez/react-native-video-processing) and made changes on top of it (to be able to trim network files).

You can see the [mobile app here](https://github.com/santiagovazquez/GoProGoals)


