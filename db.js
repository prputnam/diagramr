db = require('knex')({
    client: 'pg',
    connection: 'postgres://postgres:postgres@localhost:5432/test',
    searchPath: 'public'
});

module.exports = db;