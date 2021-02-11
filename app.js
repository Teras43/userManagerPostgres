const express = require("express");
const db = require("./db");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./views"));

app.set("views", "./views");
app.set("view engine", "pug");

app.get("/", (req, res) => {
    db.getUsers()
        .then((data) => {
            res.render("userListing", { users: data.rows });
        })
        .catch(console.error);
});

app.get("/userCreate", (req, res) => {
    res.render("userCreate");
});

app.get("/editUser", (req, res) => {
    db.getOneUser(req, res).then((data) => {
        res.render("userEdit", { data: data.rows[0] });
    });
});

app.get("/sortAsc", (req, res) => {
    db.getSortedUsers("asc")
        .then((data) => {
            res.render("userListing", {
                users: data.rows,
            });
        })
        .catch(console.error);
});

app.get("/sortDesc", (req, res) => {
    db.getSortedUsers("desc")
        .then((data) => {
            res.render("userListing", {
                users: data.rows,
            });
        })
        .catch(console.error);
});

app.get("/userSearch", (req, res) => {
    const searchReq = String(req.query.search);
    db.searchUsers(searchReq).then((data) => {
        res.render("userListing", { users: data.rows });
    });
});

app.post("/createUser", (req, res) => {
    const requestBody = req.body;
    if (
        !requestBody.first_name ||
        !requestBody.last_name ||
        !requestBody.email ||
        !requestBody.age
    ) {
        res.redirect("/userCreate");
        console.log("Redirecting");
        return;
    }
    db.createUser(req, res)
        .then(() => {
            res.redirect("/");
        })
        .catch(console.error);
});

app.post("/updateUser", (req, res) => {
    db.updateUser(req, res).then(() => {
        res.redirect("/");
    });
});

app.post("/deleteUser", (req, res) => {
    db.deleteUser(req, res).then(() => {
        res.status(200).send("success");
    });
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}. Server is running.`);
});
