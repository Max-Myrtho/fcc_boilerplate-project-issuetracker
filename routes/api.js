"use strict";
const myDB = require("./connection");

const debug_log = process.env.DEBUG === "true" || false;
const clog = (l) => debug_log && console.log(l);
const now = new Date().toISOString();

// {
//     "_id": "5871dda29faedc3491ff93bb",
//     "issue_title": "Fix error in posting data",
//     "issue_text": "When we post data it has an error.",
//     "created_on": "2017-01-08T06:35:14.240Z",
//     "updated_on": "2017-01-08T06:35:14.240Z",
//     "created_by": "Joe",
//     "assigned_to": "Joe",
//     "open": true,
//     "status_text": "In QA"
//   }

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
    })

    .post(function (req, res) {
      let project = req.params.project;
      clog(req.body);
      myDB(async (client) => {
        const myDataBase = await client.db("database").collection("projects");
        clog(myDataBase);
        //  myDataBase.insertOne(
        //     {
        //       username: req.body.username,
        //       password: hash,
        //     },
        //     (err, doc) => {
        //       if (err) {
        //         res.redirect("/");
        //       } else {
        //         // The inserted document is held within
        //         // the ops property of the doc
        //         next(null, doc.ops[0]);
        //       }
        //     }
        //   )
      });
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
