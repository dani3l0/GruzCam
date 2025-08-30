# Replay Torque logs

This initially was a project integrating car OBD data with camcorder. Right after picking RPi3, initial idea dies (got ~0.33fps in OBS Studio during recording)

But, I managed to record a video with my Android phone and Torque app running in background (with log collection enabled). This way, I could later replay collected data on web dashboards and put them in recorded video. Too much struggle you say? Yes. But I rrrreeeeaaaaalllllyyyy wanted to keep some videos of having fun destroying my cheap trashcar.


## Before the ride...

Download Torque app from Google Play (or anywhere else, doesn't really matter) onto your phone.
In settings, there should be section related to logging. Go there, enable logging and find interesting params to be logged (I used **OBD speed**, **Engine revs**, **Engine load (%)**, **Coolant temperature**, **Adapter voltage**)

Voila! You have your car params recorded.

Now just open any camera app and start recording. Or just use your car's dashcam, ok too.


## Preparing the video

### Prepare recorded data

1) Create a folder for your stuff. Put there your recorded video and Torque app logs (should be somewhere on your phone named `trackLog.csv`)

2) Copy the log here to `torque2json` dir. You must keep the original name! In case it already exists, overwrite it.

3) Now run `torque2json.py` file. It will convert `csv` into web-friendly `json` format. And will skip incomplete info making it impossible to re-run dashboards.

4) Once you have the `trackLog.json`, put it into `needles-web` folder.


## Re-run scenario

1) Open your terminal and go to `needles-web` folder.

2) Run `npm i` and `npm run dev` to spin up the server. It will be available on **[localhost:5173](http://localhost:5173)**

3) You now have some ugly UI with buttons on top and gauges on bottom. Feel free to scale the page for best resolution.

4) Now the poorest solution ever made. Prepare your screen recorder and start recording your browser window. Until the end 😞

5) Enable blue background, adjust date and time and tap `Start` button. It will fancy-initialize the gauges and behave exactly your car behaved in specified timestamp (according to logs, at least)

6) Wait till your logs are fully replayed (e.g. end of your journey). You can stop it earlier, gauges will 'simulate' the real look as the engine turns off.


## Create the video

1) Copy your recorded video into the same folder you have your dashcam video.

2) Open any video editor (I used **kdenlive**) and initialize your project. Set dashcam video as base

3) Now cut and insert the screen-recorded video with gauges only as an overlay.

4) It's ok to have blue background. Use filter to replace the color: replace #2222FF with any fully transparent color. Background is now gone.

5) The hardest: you need to synchronize base video with gauges one. The easiest way is to listen the engine sound recorded in the base video. And, remember file names and timestamps can be helpful, too.

6) Once both videos are synchronized, it's now ok to render the final video.
