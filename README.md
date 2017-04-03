# diagramr

A rather rough (and honestly not quite complete) application that allows users to create rooms where they can collobrate on shared diagrams and chat while doing so. This project was built out for RIT's ISTE-442 - Web Application Development. 

The application backend is built out in [Express](https://github.com/expressjs/express) and is serving pages templated with [Handlebars](https://github.com/wycats/handlebars.js/). On the client-side [fabric.js](https://github.com/kangax/fabric.js) is used to manipulate the canvas for the diagram. Chat and diagram changes are propogated via [socket.io](https://github.com/socketio/socket.io) to keep all clients in sync. The chat and diagrams are persisted in [Postgres](https://www.postgresql.org/).
