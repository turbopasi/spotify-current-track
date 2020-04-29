require('dotenv').config();

const axios = require('axios');
const express = require('express');
const fs = require('fs');
const app = express();

const buff = Buffer.from(process.env.SPOTIFY_CLIENT_ID+':'+process.env.SPOTIFY_CLIENT_SECRET);
const base64data = buff.toString('base64');

app.listen(8888, () => {
    console.log("App listening on http://localhost:8888")
});

/* ++++++++++++++++++++++++++ */
/* +++ USER AUTHORIZATION +++ */
/* ++++++++++++++++++++++++++ */

app.get('/login', function(req, res) {

    const scopes = 'user-read-currently-playing';
    const redirect_uri = 'http://localhost:8888/callback';

    res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + process.env.SPOTIFY_CLIENT_ID +
      '&scope=' + encodeURIComponent(scopes) +
      '&redirect_uri=' + encodeURIComponent(redirect_uri));

});

app.get('/callback', function(req, res) {

    const auth_code = req.query.code;
    const redirect_uri = 'http://localhost:8888/callback';
    const options = {
        url : 'https://accounts.spotify.com/api/token',
        method : 'post',
        headers : {
            authorization : `Basic ${base64data}`,
            contentType : 'application/x-www-form-urlencoded'
        },
        params : {
            grant_type : 'authorization_code',
            code : auth_code,
            redirect_uri : redirect_uri
        }
    }

    axios(options)
        .then(r => {
            const refresh_token = r.data.refresh_token;
            fs.writeFileSync('./token/refresh_token.txt', refresh_token);
            return res.end('Success ! You can close this tab now !')
        })
        .catch(err => {
            console.log(err.message);
        });

});

/* +++++++++++++++++ */
/* +++ MAIN LOOP +++ */
/* +++++++++++++++++ */

let isRequesting = false;
let requestsMade = 0;
async function main () {

    if (isRequesting) { return }
    isRequesting = true;

    // GET SAVED REFRESH_TOKEN
    const refresh_token = fs.readFileSync('./token/refresh_token.txt', 'utf8');
    if (refresh_token && refresh_token !== "") {

        // GET NEW ACCESS_TOKEN
        const options1 = {
            url : 'https://accounts.spotify.com/api/token',
            method : 'post',
            headers : {
                authorization : `Basic ${base64data}`,
                contentType : 'application/x-www-form-urlencoded'
            },
            params : {
                grant_type : 'refresh_token',
                refresh_token : refresh_token
            }
        }


        let access_token = "";
        try {
          const auth         = await axios(options1);
                access_token = auth.data.access_token;
        } catch (e) {
          console.error("refresh_token request error");
          console.error(e.message);
        }

        // REQUEST CURRENTLY PLAYING SONG DATA
        const options2 = {
            url : 'https://api.spotify.com/v1/me/player/currently-playing',
            method : 'get',
            headers : {
                authorization : `Bearer ${access_token}`
            }
        }

        let trackInformation = {};
        try {
          trackInformation = await axios(options2);
        } catch (e) {
          console.error("currently-playing request error");
          console.error(e.message);
        }

        if (trackInformation.data) {
            // WRITE TRACK INFORMATIONS TO FILE
            const artist        = trackInformation.data.item.artists[0].name;
            const song          = trackInformation.data.item.name;
            const album         = trackInformation.data.item.album.name;
            const progress_ms   = trackInformation.data.progress_ms;
            const duration_ms   = trackInformation.data.item.duration_ms;
            const progress_time = millisToMinutesAndSeconds(progress_ms);
            const duration_time = millisToMinutesAndSeconds(duration_ms);
            const text          = `${progress_time} / ${duration_time} - ${song} by ${artist}`;
            fs.writeFileSync('./output/song.txt', text);
            console.clear();
            console.log('Currently playing:');
            console.log(text);
            requestsMade++;
            console.log("Requests Made:", requestsMade);
            isRequesting = false;
        } else {
            console.clear();
            console.log('Looks like you are not playing anyting at the moment.');
            isRequesting = false;
        }


    } else {
        console.clear();
        console.log('Please authorize first.');
        console.log('Open http://localhost:8888/login in your browser.')
        isRequesting = false;
    }
}

/* +++++++++++++++++++++++ */
/* +++ START MAIN LOOP +++ */
/* +++++++++++++++++++++++ */

setInterval(main, 1000);

// user-read-currently-playing
// https://api.spotify.com/v1/me/player/currently-playing

//    SPOTIFY_CLIENT_ID=d12a6ebd7a5940a09285a97241de5154
//SPOTIFY_CLIENT_SECRET=71351f9ce9294c7383a98552b17d28c7
// SPOTIFY_ENDPOINT=https://api.spotify.com/v1/me/player/currently-playing

/* +++++++++++++++++++++++ */
/* +++ HELPER FUNCTION +++ */
/* +++++++++++++++++++++++ */

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
