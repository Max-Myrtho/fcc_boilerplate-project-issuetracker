require("dotenv").config();
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");

chai.use(chaiHttp);
const assert = chai.assert;
const { ObjectId } = require("mongodb");

suite("Functional Tests", function () {
  // this.timeout(2000);

  const project_name = process.env.MONGO_TEST_COLLECTION;
  const invalid_id = new ObjectId("682e5e9ddd5bdf0d295bd2b9");

  test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .post("/api/issues/" + project_name)
      .send({
        issue_title: "Test 1",
        issue_text: "When we post data it has an error.",
        created_by: "Chai",
        assigned_to: "Chai",
        status_text: "just testing stuff",
      })
      .end((req, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.type, "application/json");

        assert.property(res.body, "_id", "error in _id");
        assert.equal(res.body.issue_title, "Test 1");
        assert.equal(res.body.issue_text, "When we post data it has an error.");
        assert.equal(res.body.created_by, "Chai");
        assert.equal(res.body.assigned_to, "Chai");
        assert.equal(res.body.status_text, "just testing stuff");

        assert.isBoolean(res.body.open, "error in open");
        assert.property(res.body, "created_on", "error in created_on");
        assert.notProperty(res.body, "updated_on", "error in updated_on");

        done();
      });
  });
  test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .post("/api/issues/" + project_name)
      .send({
        issue_title: "Test 2",
        issue_text: "When we post data it has an error.",
        created_by: "Chai",
      })
      .end((req, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.type, "application/json");

        assert.property(res.body, "_id", "error in _id");
        assert.equal(res.body.issue_title, "Test 2");
        assert.equal(res.body.issue_text, "When we post data it has an error.");
        assert.equal(res.body.created_by, "Chai");
        assert.isNull(res.body.status_text, "error in status_text");
        assert.isNull(res.body.assigned_to, "error in assigned_to");

        assert.isBoolean(res.body.open, "error in open");
        assert.property(res.body, "created_on", "error in created_on");
        assert.notProperty(res.body, "updated_on", "error in updated_on");

        done();
      });
  });
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .post("/api/issues/" + project_name)
      .send({
        created_by: "Chai",
        assigned_to: "Chai",
        status_text: "just testing stuff",
      })
      .end((req, res) => {
        assert.equal(res.status, 422);
        done();
      });
  });
  test("View issues on a project: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .get("/api/issues/" + project_name)
      .end((req, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.isNotNull(res.body, "res.body is null");
        done();
      });
  });
  test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/" + project_name + "?open=true")
      .end((req, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.isNotNull(res.body, "res.body is null");
        done();
      });
  });
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .get("/api/issues/" + project_name + "?open=true&assigned_to=Chai")
      .end((req, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.isNotNull(res.body, "res.body is null");
        done();
      });
  });
  test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
    // Insert a test issue and store its _id
    chai
      .request(server)
      .post("/api/issues/" + project_name)
      .send({
        issue_title: "Initial Title to be updated",
        issue_text: "Initial text to be updated",
        created_by: "Tester",
      })
      .end((err, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.body.issue_title, "Initial Title to be updated");
        assert.equal(res.body.issue_text, "Initial text to be updated");
        assert.equal(res.body.created_by, "Tester");

        chai
          .request(server)
          .put("/api/issues/" + project_name)
          .send({
            _id: res.body._id,
            issue_title: "(updated) Initial Title to be updated",
          })
          .end((err, res2) => {
            assert.equal(res2.status, 200);

            assert.equal(res2.body._id, res.body._id);
            assert.equal(
              res2.body.issue_title,
              "(updated) Initial Title to be updated"
            );
            assert.property(res2.body, "updated_on", "error in updated_on");

            done();
          });
      });
  });
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
    // Insert a test issue and store its _id
    chai
      .request(server)
      .post("/api/issues/" + project_name)
      .send({
        issue_title: "Initial Title to be updated",
        issue_text: "Initial text to be updated",
        created_by: "Tester",
      })
      .end((err, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.body.issue_title, "Initial Title to be updated");
        assert.equal(res.body.issue_text, "Initial text to be updated");
        assert.equal(res.body.created_by, "Tester");

        chai
          .request(server)
          .put("/api/issues/" + project_name)
          .send({
            _id: res.body._id,
            issue_text: "(2nd update) When we post data it has an error.",
            assigned_to: "(2nd update) Chai",
            status_text: "(2nd update) In QA",
          })
          .end((req, res2) => {
            assert.equal(res2.status, 200);
            assert.equal(res2.type, "application/json");
            assert.equal(res2.body._id, res.body._id);
            assert.equal(res2.body.issue_title, "Initial Title to be updated");
            assert.equal(
              res2.body.issue_text,
              "(2nd update) When we post data it has an error."
            );
            assert.equal(res2.body.assigned_to, "(2nd update) Chai");
            assert.equal(res2.body.status_text, "(2nd update) In QA");
            assert.property(res2.body, "updated_on", "error in updated_on");
            done();
          });
      });
  });
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .put("/api/issues/" + project_name)
      .send({
        issue_text: "(2nd update) When we post data it has an error.",
        assigned_to: "(2nd update) Chai",
        status_text: "(2nd update) In QA",
      })
      .end((req, res) => {
        assert.equal(res.status, 422);
        done();
      });
  });
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
    // Insert a test issue and store its _id
    chai
      .request(server)
      .post("/api/issues/" + project_name)
      .send({
        issue_title: "Initial Title to be updated",
        issue_text: "Initial text to be updated",
        created_by: "Tester",
      })
      .end((err, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.body.issue_title, "Initial Title to be updated");
        assert.equal(res.body.issue_text, "Initial text to be updated");
        assert.equal(res.body.created_by, "Tester");

        chai
          .request(server)
          .put("/api/issues/" + project_name)
          .send({
            _id: res.body._id,
          })
          .end((req, res2) => {
            assert.equal(res2.status, 200);
            assert.equal(res2.body._id, res.body._id);
            assert.equal(res2.body.issue_title, "Initial Title to be updated");
            assert.equal(res2.body.issue_text, "Initial text to be updated");
            assert.equal(res2.body.created_by, "Tester");
            assert.property(res2.body, "updated_on", "error in updated_on");
            done();
          });
      });
  });
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .put("/api/issues/" + project_name)
      .send({
        _id: invalid_id,
      })
      .end((req, res) => {
        assert.equal(res.status, 404);
        done();
      });
  });
  test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
    // Insert a test issue and store its _id
    chai
      .request(server)
      .post("/api/issues/" + project_name)
      .send({
        issue_title: "Initial Title to be deleted",
        issue_text: "Initial text to be deleted",
        created_by: "Tester",
      })
      .end((err, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.body.issue_title, "Initial Title to be deleted");
        assert.equal(res.body.issue_text, "Initial text to be deleted");
        assert.equal(res.body.created_by, "Tester");

        chai
          .request(server)
          .delete("/api/issues/" + project_name)
          .send({
            _id: res.body._id,
          })
          .end((req, res2) => {
            assert.equal(res2.status, 204);
            done();
          });
      });
  });
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .delete("/api/issues/" + project_name)
      .send({
        _id: invalid_id,
      })
      .end((req, res) => {
        assert.equal(res.status, 404);
        done();
      });
  });
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .delete("/api/issues/" + project_name)
      .end((req, res) => {
        assert.equal(res.status, 422);
        done();
      });
  });
});
