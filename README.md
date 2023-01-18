# Reaktor birdnest assignment

[Reaktor pre-assignment](https://assignments.reaktor.com/birdnest/) for reporting no-drone zone violations around a birdnest.

## Deploy locally

To deploy locally, you need to have Docker and Docker Compose installed.

1. Clone the repository
2. Run `docker-compose up` in the root directory
3. The application is now running at `localhost:5050`

## Current deployment

The application (`birdnest-ui`) is currently deployed at https://birdnest-ui.vercel.app/

The backend (`birdnest-reporter`) is currently deployed at https://birdnest-reporter.deno.dev/

The birdnest violation monitoring and reporting service (`birdnest-observer`) is currently deployed on my Raspberry Pi. It does not need HTTP access.

## Architecture

The system consists of three parts:

1. The UI (`birdnest-ui`) is a simple Next.js application that displays violations from the last 10 minutes. It receives the violations from the backend (`birdnest-reporter`).

2. The backend (`birdnest-reporter`) is a simple Deno application that processes HTTP requests and obtains the violations from a Redis database.

3. The birdnest violation observer service (`birdnest-observer`) is a simple Deno application that monitors the birdnest drones endpoint every 2 seconds and stores the violations in a Redis database.

`birdnest-observer` and `birdnest-reporter` also communicate with each other via Redis pub/sub. Redis database is configured to expire the violations after 10 minutes and send keyspace notifications when a violation is expired.

`birdnest-reporter` subscribes to the Redis pub/sub channel and sends the expired violations to the UI via `WebSocket`.

### Rendering of the UI

The UI is rendered on the server side using Vercel funcitons. The implementation is utilizing a Next.js 13 beta feature `appDir` where pages are now organized under `app` directory. The pages under the directory use React 18 **server side components** by default which allows the UI to be populated with recent data from the backend, then the client side takes over and the UI is updated in real time via `WebSocket`. So this fits the requirements that violations should be displayed "immidiately" and "updated in real time".

### Benefits of the architecture

- The UI and the backend are decoupled and can be deployed anywhere. For example, UI on a CDN with edge functions (Vercel) and the backend on a serverless platform (Deno Deploy). Both can be horizontally scaled independently.
- The birdnest violation observer performs a single task and the deployment method is flexible as long as it continuously runs. For example, it can be deployed on a Raspberry Pi not far away from the nest. Ideally, it should be deployed and integrated into a device with the drone monitoring system and report violations directly to a database (or message broker in case of an alternative architecture) without relying on HTTP networking and intermediaries. Then it is obvious that the service does not need scaling as long as the are limited number of drones in the area (which is the case). The only concern is updating the service across the devices.
- Redis database performs very fast reads and writes while staying suitable enough for the use case. The data expiry is very precise in recent versions of Redis, so data is never stored for more than 10 minutes. If there are structural changes or new requirements, it is easy to migrate the data to adopt the changes. It is also easy to scale if needed.
- If there are new nests to observe, `birdnest-observer` can be deployed for each nest and report data with a nest or NDZ identifier. Then the backend can be configured to store the data in different Redis databases or different keys in the same database. The `birdnest-reporter` can be configured to read the data from the correct database or key. One could add new endpoints to obtain data for a specific nest or NDZ. The UI would need to have another page to list the observed nests and display the number violations for each nest, but it all largely works the same way.
- NoSQL databases such as Redis or MongoDB work well with geolocation data points and easy to use. If geolocation data needs to be stored, processed, and visualized, it is not difficult to achieve, but it is not the focus of this assignment.

## Limitations and future improvements

- Sorting is done on the client side. It would be better to do it with database indexing, but there is not much data to sort, so I did not bother with configuring the Redis secondary indexes.
- If there is more structure and relationships between the data, the system should include a relational database to make it easier to query and process the data.
- It does not show when the violation was reported. Some strugle with timezones, but it is not too difficult.
- The are currently no tests. It is not a big issue as it is a simple application, but it would be nice to have some automated tests.
- Personally, I would separate the backend HTTP endpoints and the websocket connection to different services and develop them independently.
- Using Redis pub/sub is not optimal to receive real-time data between services. The system as a whole also does not guarantee that the data is correctly synced. There is a tiny time window between first UI render and the websocket connection where data could be altered and the UI would not be updated. This can be mitigated by trying to use RabbitMQ or Kafka and by occasionally polling the backend for the data from the UI to attempt to sync. Please let me know if you have any other ideas on how to improve this.
- Somehow indicate real-time updates on the UI. It jumps around and it is not obvious what data is updated in real-time.

## License
Idk, do whatever you want with this.
