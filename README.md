## Express Application

This is an Express app written in TypeScript. The app is structured in a modular way, with different functionalities separated into their respective directories.

This app contains big amount of comments that can help you understend what`s going on.

I used `https://postman-echo.com` API as endpoints to send final requests after all logic is done. (very rear like 1 of 10 similar requests postman API gives error, but it`s problem with postman API)

## Directory Structure

`src/config`: This directory contains configuration files for the application. The appConfig.ts file contains application-level configurations, typically it should be an `.ENV` dont judge me too hard for this, I was sick this days).

While the destinationsConfig.json file contains configurations for various destinations (Destinations dictionary).

`src/controller`: This directory contains the controller files for the application. The eventController.ts file contains the controller for handling events.

`src/dbmodels`: This directory contains the database models for the application. The loggingModels.ts file contains the model for logging.

`src/helpers`: This directory contains helper functions for the application. Such as functions that helps manipulate and transform data.

`src/mainLogic`: This directory contains the main logic functions for the application. Such as Strategies, how they applies etc.

`src/middleware`: This directory contains middleware for the application. The jwtAuthorization.ts file contains the JWT authorization middleware, while the jwtInjection.ts file contains logic of injecting token into request so we could authorize it. The eventValidation.ts file contains basic validation for event in request

`src/routes`: This directory contains the routes for the application. The eventRouter.ts file contains the routes for handling events.

`src/types`: This directory contains the types for the application.

## Building and running the Application with Docker

You should install docker firstly)

Then login in terminal
`docker login`

Pull docker img from my public repository

`docker pull rostislav733/picsio:latest`

Then

`docker run -p 3000:3000 rostislav733/picsio`

After running this command, new container is created and started. If you want to restart an existing container, you would use

`docker start <container-id>` instead

After container is created and started, your application should be accessible at `localhost:3000` on your host machine.

## Running the Application without docker

To run the application, clone git repository, you need to have Node.js and npm installed. Once you have these installed, you can install the application's dependencies by running npm install in the application's root directory.

After the dependencies are installed, you can start the application by running npm start.

## Testing Application

I used https://www.postman.com/ service to send requests to my app.

To send request to localhost you should install Postman Desktop agent
https://blog.postman.com/introducing-the-postman-agent-send-api-requests-from-your-browser-without-limits/

Endpoint of app `localhost:3000/event` you can send `post`, `put`, `patch` requests to it and you can use request `body` that i left here:

Notice that strategies is commented

```
{"event":{
    // "strategy": "ALL",
    // "strategy": "() => { return true; }",
    "payload": {"b":1234, "c":true, "a":"text"},
    "possibleDestinations": [
        {
            "destination1": true,
            "destination2": true,
            "destination6": true
        },
        {
            "destination1": true,
            "destination7": false
        },
        {
            "destination5": true,
            "destination2": false,
            "destination3": true
        }
    ]
}
}
```

If you want to recive DB logs you should hit `GET` request on `localhost:3000/event/logs` and you will get logs in console and in browser

## P.S

This app needs more code refactor and types tuning but I wanted to make proper functionality and match with technical requirements while have limited amount of time(
