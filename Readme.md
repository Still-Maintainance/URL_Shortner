This Node.js Express application functions as a URL shortener. It allows users to:

Shorten long URLs: By sending a POST request with an originalUrl, the service generates a unique 8-character shortUrl.

Redirect to original URLs: When a GET request is made to a shortUrl, the application redirects the user to the corresponding originalUrl and increments a click counter.

Retrieve all URLs: A GET /all endpoint provides a list of all stored short and original URL mappings along with their click counts.

The application uses Express.js for handling HTTP requests, Mongoose to interact with a MongoDB database for data storage, and nanoid for generating the unique short URLs. It also incorporates CORS middleware to enable cross-origin requests. Basic error handling is in place for missing input or server issues.