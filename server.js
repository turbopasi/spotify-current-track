require('dotenv').config();

const axios = require('axios');
const express = require('express');
const fs = require('fs');
const app = express();

const buff = new Buffer(process.env.SPOTIFY_CLIENT_ID+':'+process.env.SPOTIFY_CLIENT_SECRET);
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

        const auth = await axios(options1);
        const access_token = auth.data.access_token;

        // REQUEST CURRENTLY PLAYING SONG DATA
        const options2 = {
            url : 'https://api.spotify.com/v1/me/player/currently-playing',
            method : 'get',
            headers : {
                authorization : `Bearer ${access_token}`
            }
        }

        const trackInformation = await axios(options2);
        if (trackInformation.data) {
            // WRITE TRACK INFORMATIONS TO FILE
            const artist = trackInformation.data.item.artists[0].name;
            const song = trackInformation.data.item.name;
            const album = trackInformation.data.item.album.name;
            const text = `${song} by ${artist} (${album})`;
            fs.writeFileSync('./output/song.txt', text);
            console.clear();
            console.log('Currently playing:');
            console.log(text);
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

setInterval(main, 3000);

// user-read-currently-playing
// https://api.spotify.com/v1/me/player/currently-playing

//    SPOTIFY_CLIENT_ID=d12a6ebd7a5940a09285a97241de5154
//SPOTIFY_CLIENT_SECRET=71351f9ce9294c7383a98552b17d28c7
// SPOTIFY_ENDPOINT=https://api.spotify.com/v1/me/player/currently-playing
    