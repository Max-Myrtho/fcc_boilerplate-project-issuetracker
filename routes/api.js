"use strict";
require("dotenv").config();
const { ObjectId } = require("mongodb");
const myDBConnection = require("./connection");

const debug_log = process.env.DEBUG === "true" || false;
const clog = (l) => debug_log && console.log(l);
const now = new Date().toISOString();

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      try {
        let { _id } = req.query;

        if (_id) {
          _id = new ObjectId(String(_id));
          req.query._id = new ObjectId(String(_id));
        }

        clog(req.query);
        let project =
          req.params.project || process.env.DEFAULT_MONGO_COLLECTION;
        myDBConnection(async (client) => {
          const myDataBase = await client
            .db(process.env.MONGO_DATABASE)
            .collection(project);

          const results = await myDataBase.find({
            ...req.query,
          });

          let issues = [];

          // Print returned documents
          for await (const doc of results) {
            issues.push(doc);
          }

          clog("issues");
          clog(issues);
          return res.json(issues);
        });
        0;
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "error_500" });
      }
    })

    .post(function (req, res) {
      clog(req.body);
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      //handling missing value
      if (!issue_title || !issue_text || !created_by)
        return res.status(422).send("invalid_request");

      try {
        let project =
          req.params.project || process.env.DEFAULT_MONGO_COLLECTION;
        myDBConnection(async (client) => {
          const myDataBase = await client
            .db(process.env.MONGO_DATABASE)
            .collection(project);
          const result = await myDataBase.insertOne({
            issue_title,
            issue_text,
            created_on: now,
            created_by,
            assigned_to,
            open: true,
            status_text,
          });
          clog("result");
          clog(result);

          const new_issue = await myDataBase.findOne({
            _id: result.insertedId,
          });
          clog("new_issue");
          clog(new_issue);
          return res.status(201).json(new_issue);
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "error_500" });
      }
    })

    .put(function (req, res) {
      try {
        let project =
          req.params.project || process.env.DEFAULT_MONGO_COLLECTION;
        let { _id } = req.body;

        //handling missing value
        if (!_id) return res.status(422).send("invalid_request");

        _id = new ObjectId(String(_id));
        delete req.body._id;
        clog(req.body);

        myDBConnection(async (client) => {
          const myDataBase = await client
            .db(process.env.MONGO_DATABASE)
            .collection(project);

          if (findTheIssueBy_id(myDataBase, _id) === null)
            return res.status(404).send("issue_not_found");

          const query = { _id };
          const update = { $set: { ...req.body, updated_on: now } };
          //Set true to create a new row if it doesn't find the row to update (UpdateOrCreate)
          const options = { upsert: false };
          const result = await myDataBase.updateOne(query, update, options);

          clog("result");
          clog(result);

          const updated_issue = await myDataBase.findOne({ _id });
          clog("updated_issue");
          clog(updated_issue);
          return res.json(updated_issue);
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "error_500" });
      }
    })

    .delete(function (req, res) {
      try {
        let project =
          req.params.project || process.env.DEFAULT_MONGO_COLLECTION;
        let { _id } = req.body;

        //handling missing value
        if (!_id) return res.status(422).send("invalid_request");

        _id = new ObjectId(String(_id));
        clog(req.body);

        myDBConnection(async (client) => {
          const myDataBase = await client
            .db(process.env.MONGO_DATABASE)
            .collection(project);

          if (findTheIssueBy_id(myDataBase, _id) === null)
            return res.status(404).send("issue_not_found");

          const query = { _id };
          const result = await myDataBase.deleteOne(query);

          clog("result");
          clog(result);

          return res.status(204).json(result);
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "error_500" });
      }
    });

  app.route("/api/issues/:project/reset").delete(function (req, res) {
    try {
      let project = req.params.project || process.env.DEFAULT_MONGO_COLLECTION;

      //handling missing value
      if (!project) return res.status(422).send("invalid_request");

      myDBConnection(async (client) => {
        const myDataBase = await client
          .db(process.env.MONGO_DATABASE)
          .collection(project);

        await myDataBase.drop();

        return res
          .status(204)
          .json("Collection " + project + " deleted successfully!");
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "error_500" });
    }
  });
};

const findTheIssueBy_id = async (dataBase, _id) => {
  const the_issue = await dataBase.findOne({ _id });
  clog("checking if issue " + _id + " exists...");
  clog("What we found for this issue:");
  clog(the_issue);
  return the_issue;
};
