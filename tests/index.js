const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/contacts'];
const TOKEN_PATH = 'token.json'; // Store tokens securely

// Load client secrets from a file
// fs.readFile('credentials.json', (err, content) => {
// 	if (err) return console.error('Error loading client secret file:', err);

// 	// Authorize a client with credentials
// 	authorize(JSON.parse(content), getAccessToken);
// });

function authorize(credentials, callback) {
	const { client_secret, client_id, redirect_uris } = credentials.web;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	// Check if we have previously stored a token
	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getAccessToken(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token));
		callback(oAuth2Client);
	});
}

function getAccessToken(oAuth2Client) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});

	console.log('Authorize this app by visiting this url:', authUrl);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	// http://localhost/?code=4/0AfJohXlsbCoGGrAPSq1Qs_d5VITqITcdo9aSW_-v7CFPWB1LesOOY7lIDrMmAtGTKyMwgg&scope=https://www.googleapis.com/auth/contacts
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token:', err);
			oAuth2Client.setCredentials(token);
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error('Error writing token file:', err);
				console.log('Token stored to', TOKEN_PATH);
			});
		});
	});
}
