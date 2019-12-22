---
title: Playing with React Native and a GoPro Cam
date: 2019-05-01
tags: ['post']
---

### Wouldn't it be amazing if we could save our best moments in amateur sports? Yes, it would!
 
Image you're playing soccer with friends and take your GoPro Cam with you. A video of the whole thing might never get out of your cam.  

Why is that? **It's tedious!** You have to download a huge video to your computer and search thought it for the highlights. **What if we could have all the highlights on your mobile right after the match?**

The idea is simple: hit a button every time something interesting happen on the game. The last 15 seconds before the button gets hit will be downloaded to your phone.

It's not a new idea. Some amateur leagues are doing it and it's awesome:

<Embed
  src="https://www.youtube.com/embed/ShQQIwEjPBM"
/>

We can build it by writing some React Native code and using an Old GoPro camera.  

### Learn about GoPro capabilities 

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

Finally, if you have stuff like VLC or ffmpeg on your mac, we can do some magic:

```
# ENABLE STREAMING AND SEE LIVE VIDEO FROM VLC
curl -i "http://10.5.5.9/camera/PV?t=$GOPROPASS&p=%02"
vlc "http://10.5.5.9:8080/live/amba.m3u8"
# DOWNLOAD LAST 15 SECONDS OF SOME VIDEO ON YOUR GOPRO
ffmpeg -sseof -15 -i "$VIDEO_URL" -c copy output.mp4
```

So far I gave you every terminal command to build the app. Although we would like to have a mobile app to run those commands and not a computer.

### Mobile App

To build the app, I chose React Native because it's really simple to use and we could use fetch API to execute most of the previous commands. 

The only command which isn't available on mobile is the one to get only the last 15 seconds of the current video because it depends on ffmpeg. I use an open source library called [react-native-video-processing](https://github.com/santiagovazquez/react-native-video-processing) and made changes on top of it (to be able to trim network files).

You can see the whole code of my mobile app on [Github](https://github.com/santiagovazquez/GoProGoals).


