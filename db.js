const { Pool } = require("pg");
const url = require("url");
const { v4: uuidv4 } = require("uuid");

const dbConnectionString = process.env.DATABASE_URL;

const params = url.parse(dbConnectionString);

const auth = params.auth.split(":");
let SSL = process.env.SSL || { rejectUnauthorized: false };

const config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split("/")[1],
    ssl: SSL,
};

const pool = new Pool({
    connectionString: dbConnectionString,
    ssl: {
        rejectUnauthorized: false,
    },
    ...config,
});

let client;

const createTable = `
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  guid char(36),
  first_name text,
  last_name text,
  email varchar(50),
  age int
);
`;

const connectToDB = async () => {
    return new Promise((resolve, reject) => {
        pool.connect()
            .then((newClient) => {
                client = newClient;
                resolve();
            })
            .catch(reject);
    });
};

connectToDB().then(() => {
    console.log("DB Connected.");
    client.query(createTable).then(() => console.log("Table found."));

    // client
    //     .query(
    //         "INSERT INTO users(guid, first_name, last_name, email, age) VALUES ($1, $2, $3, $4, $5)",
    //         [uuidv4(), "Brandon", "Curtis", "Brandcurtis43@gmail.com", 27]
    //     )
    //     .then(() => console.log("User inserted."));
});

const getUsers = () => {
    return new Promise((resolve, reject) => {
        pool.query("select * from users", (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

const getOneUser = (req, res) => {
    const guid = req.query.userid;
    let oneUserSQL =
        "SELECT guid, first_name, last_name, email, age from users where guid = $1";
    return new Promise((resolve, reject) => {
        pool.query(oneUserSQL, [guid], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

const getSortedUsers = (sortDirection) => {
    let sortSQL = `select * from users order by first_name ${sortDirection}`;
    return new Promise((resolve, reject) => {
        pool.query(sortSQL, (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

const searchUsers = (searchReq) => {
    let searchSQL = `select first_name, last_name, email, age from users where first_name = $1 or last_name = $1`;
    return new Promise((resolve, reject) => {
        pool.query(searchSQL, [searchReq], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

const createUser = (req, res) => {
    const guid = uuidv4();
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const age = req.body.age;
    let addUserSQL =
        "insert into users (guid, first_name, last_name, email, age) values ($1, $2, $3, $4, $5)";
    return new Promise((resolve, reject) => {
        pool.query(
            addUserSQL,
            [guid, first_name, last_name, email, age],
            (err, results) => {
                if (err) reject(err);
                resolve(results);
            }
        );
    });
};

const deleteUser = (req, res) => {
    const guid = req.headers.userid;
    let deleteUserSQL = "delete from users where guid = $1";
    return new Promise((resolve, reject) => {
        pool.query(deleteUserSQL, [guid], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

const updateUser = (req, res) => {
    const guid = req.query.userid;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const age = req.body.age;
    let updateUserSQL =
        "update users set first_name = $1, last_name = $2, email = $3, age = $4 where guid = $5";
    return new Promise((resolve, reject) => {
        pool.query(
            updateUserSQL,
            [first_name, last_name, email, age, guid],
            (err, results) => {
                if (err) reject(err);
                resolve(results);
            }
        );
    });
};

module.exports = {
    getUsers,
    getOneUser,
    getSortedUsers,
    searchUsers,
    createUser,
    deleteUser,
    updateUser,
};
