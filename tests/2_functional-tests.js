const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");

chai.use(chaiHttp);
const assert = chai.assert;

suite("Functional Tests", function () {
  this.timeout(2000);

  const project_name = "chai_project";
  const now = new Date().toISOString();
  let updated_issue_id;
  let deleted_issue_id;

  test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/" + project_name)
      .send({
        issue_title: "Test 1",
        issue_text: "When we post data it has an error.",
        created_on: now,
        updated_on: now,
        created_by: "Chai",
        assigned_to: "Chai",
        open: true,
        status_text: "just testing stuff",
      })
      .end((req, res) => {
        assert.equal(res.status, 201);
        assert.equal(res.type, "application/json");
        assert.isNotNull(res.body._id, "res.body is not Null");
        deleted_issue_id = res.body._id;
        done();
      });
  });
  test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/" + project_name)
      .send({
        issue_title: "Test 2",
        issue_text: "When we post data it has an error.",
        created_on: now,
        updated_on: now,
        created_by: "Chai",
        open: true,
      })
      .end((req, res) => {
        assert.equal(res.status, 201);
        done();
      });
  });
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/" + project_name)
      .send({
        created_on: now,
        updated_on: now,
        created_by: "Chai",
        assigned_to: "Chai",
        open: true,
        status_text: "just testing stuff",
      })
      .end((req, res) => {
        assert.equal(res.text, "missing required fields");
        done();
      });
  });
  test("View issues on a project: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/" + project_name)
      // .send({
      //   _id: "5871dda29faedc3491ff93bb",
      // })
      .end((req, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
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
        done();
      });
  });
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/" + project_name + "?open=true&assigned_to=Chai")
      .end((req, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        done();
      });
  });
  test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/" + project_name)
      .send({
        _id: issue_id,
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_on: "2017-01-08T06:35:14.240Z",
        updated_on: "2017-01-08T06:35:14.240Z",
        created_by: "Joe",
        assigned_to: "Joe",
        open: true,
        status_text: "In QA",
      })
      .end((req, res) => {
        assert.equal(201, 200);
        done();
      });
  });
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/" + project_name)
      .end((req, res) => {
        assert.equal(201, 200);
        done();
      });
  });
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/" + project_name)
      .end((req, res) => {
        assert.equal(201, 200);
        done();
      });
  });
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/" + project_name)
      .end((req, res) => {
        assert.equal(201, 200);
        done();
      });
  });
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/" + project_name)
      .end((req, res) => {
        assert.equal(201, 200);
        done();
      });
  });
  test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/" + project_name)
      .end((req, res) => {
        assert.equal(201, 200);
        done();
      });
  });
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/" + project_name)
      .end((req, res) => {
        assert.equal(201, 200);
        done();
      });
  });
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/" + project_name)
      .end((req, res) => {
        assert.equal(201, 200);
        done();
      });
  });
});
