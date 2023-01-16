# 🎧 Spotify : Current Track 

![NodeJS and Spotify Logo](https://image.prntscr.com/image/FHtaiEkPTjalgfKIupVZWg.png)

##### What does it do
Automatically fetches "currently playing track" information from user's Spotify Account and writes it into a plain *.txt file. Also outputs it to console. 

#####  How does it work
It utilizes Spotify's [`Web API`](https://developer.spotify.com/documentation/web-api/) and specifically the endpoint for current track informations `https://api.spotify.com/v1/me/player/currently-playing`. The user's `refresh_token` is used to make continuous requests on behalf of the authorized user. After a one-time authorization process the `refresh_token` is kept locally ⚠️ so please use at your own risk ⚠️. 

##### Why did I create it
I started streaming on Twitch and wanted to include my "currently playing" information within the stream's overlays. I am using OBS, so including text from a local *.txt is very simple. 

##### What do you need

 - NodeJS & NPM
 - CLIENT_ID & CLIENT_SECRET from the [Spotify Developer Console](https://developer.spotify.com/dashboard/login)
 
# Setup
**Install project**
```bash
git clone https://github.com/turbopasi/spotify-current-track
cd spotify-current-track
npm install
```

**Create `.env` file in project root directory, input CLIENT_ID & CLIENT_SECRET and a few other variables**
Should look like this:
```ini
SPOTIFY_CLIENT_ID=xxxxx
SPOTIFY_CLIENT_SECRET=xxxxx
PORT="8888"
HOST="http://localhost:8888"
OUTPUT_FILE="C:/Path/To/Output/song.txt"
```

**Start App**
```bash
npm start
```
If you start it for the first time, follow the instructions in the console to authorize your user account with Spotify. After that, you should start to see the following:

![Example Preview](https://image.prntscr.com/image/S_0T-Q0ySIaC_MHU_iB2gw.png)
# Contribute
Feel free to open pull requests if you want to contribute or enhance/improve the project.

The easiest way to review a pull request for a project maintainer is by submitting a pull request from a copy of the remote repository (usually called “fork”). In most cases, you won’t have the permission to push your changes directly to the project when contributing to open source software.

While on the Github webpage for this repository, you should see a “fork” button. Please fork this repo. From this online copy (fork), you can create pull requests if you push commits to it.

Clone your new fork to your computer with: `git clone --origin fork <your fork’s url>`

Then, check out a new branch with `git checkout -b my-branch-name`

Create your code / documentation changes in this branch, and commit when done. Once done, `git push fork your-branch-name`

Once this is finished pushing, you can go to your fork on GitHub. It should now ask you right away if you want to create a pull request. Clicking that button should set you up with a text field similar to when creating a new issue on GitHub. Fill it out and submit the pull request. Then, we can review it “Pull requests” in this original repository.




