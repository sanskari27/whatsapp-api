const { google } = require('googleapis');

// Load the access token and set up OAuth2 client
const credentials = require('./credentials.json');
const accessToken =
	'ya29.a0AfB_byA-AqvZVnhdbwSLG4psaH-sbNbkC08wEbSNaBNds9fPb6tRdin9rQzAYYvaQu8fisHFzb_Kscfh23H_TexVS4VhqnfldTZ0JJLUKsecDzKEYQa6TJHdz0N3uucXaEl5r2swAtoEOqy5heYOhpkV3t8YtUq0ocsXaCgYKAdASARASFQHGX2Mi89IvX2XhPD6SlX2KSBcW8Q0171'; // Retrieve the access token from your storage
const refresh_token =
	'1//0gO4fNeDsb-5yCgYIARAAGBASNwF-L9Ir6nTzwmlhCUK8BFmVyp3Up2lc1Wxv1G1nxVj-JaEjCTGzR_oe5-lvTthaWK5aZGQPE7k'; // Retrieve the access token from your storage

const oAuth2Client = new google.auth.OAuth2();
oAuth2Client.setCredentials({ access_token: accessToken, refresh_token: refresh_token });

// Create a Google Contacts API instance
const people = google.people({
	version: 'v1',
	auth: oAuth2Client,
});

// Function to fetch contacts
async function getContacts() {
	try {
		const res = await people.people.connections.list({
			resourceName: 'people/me',
			personFields: 'names,emailAddresses,phoneNumbers', // Specify the fields you want to retrieve
		});

		const contacts = res.data.connections;
		const jsonPretty = JSON.stringify(contacts.slice(0, 10), null, 2);
		console.log('Contacts:', jsonPretty);
	} catch (error) {
		console.error('Error fetching contacts:', error.message);
	}
}

// Call the function to fetch contacts
getContacts();
