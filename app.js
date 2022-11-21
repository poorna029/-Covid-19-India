// console.log("save chages saved");
const express = require("express");
const app = express();
module.exports = app;

app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;
module.exports = app;
const dbpath = path.join(__dirname, "covid19India.db");
const initializeDBandServer = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server at port 3000 is running");
    });
  } catch (e) {
    console.log(`DBerror : ${e.Message}`);
    process.exit(1);
  }
};
initializeDBandServer();

// list of all states in the state table---------1
app.get("/states/", async (request, response) => {
  const stateInfoQuery = `select state_id as stateId,
    state_name as stateName ,population from state;`;
  const stateInfoList = await db.all(stateInfoQuery);
  response.send(stateInfoList);
  console.log(stateInfoList);
});

// state based on state ID----------------------2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const stateInfoQuery = `select state_id as stateId,
    state_name as stateName ,population from state where
     state_id=${stateId};`;
  const stateInfo = await db.get(stateInfoQuery);
  response.send(stateInfo);
  console.log(stateInfo);
});

// Create a district in the district table------3

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const createDistQuery = `insert into district (district_name,
        state_id,cases,cured,active,deaths) values 
        ("${districtName}",${stateId},${cases},${cured},${active},
        ${deaths});`;
  response.send("District Successfully Added");
  console.log("District Successfully Added");
});

// district based on the district ID ----------4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtQuery = `select district_id as districtId,
    district_name as districtName,
    state_id as stateId,
    cases,cured,active,deaths from district where 
    district_id=${districtId};`;
  const districtInfo = await db.get(districtQuery);
  response.send(districtInfo);
  console.log(districtInfo);
});

// Deletes a district from the district
// table based on the district ID--------------5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDelQry = `delete from district where 
    district_id=${districtId};`;
  await db.run(districtDelQry);
  response.send("District Removed");
  console.log("District Removed");
});

// Updates the details of a --------------------6
// specific district based on the district ID

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const distUpdateQry = `update district set 
  district_name="${districtName}",
    state_id=${stateId},cases=${cases},
    cured=${cured},active=${active},deaths=${deaths}
        where district_id=${districtId};`;
  const res = await db.run(distUpdateQry);
  response.send("District Details Updated");
  console.log("District Details Updated");
});

// statistics of total cases, cured, active, deaths---7
//  of a specific state based on state ID

app.get("/states/:stateId/stats", async (request, response) => {
  const { stateId } = request.params;
  const statisticsQry = `select sum(cases) as totalCases,
  sum(cured) as totalCured,sum(active) as totalActive,
  sum(deaths) as totalDeaths
  from state join district on
    state.state_id=district.state_id where state.state_id=${stateId};`;
  const statistics = await db.all(statisticsQry);
  response.send(statistics[0]);
  console.log(statistics[0]);
});

// stateName based on Dist_id
// {
//   stateName: "Maharashtra"
// }

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const StName_on_distID_Qry = `select state_name as stateName
     from district join state
    on state.state_id=district.state_id
     where district_id=${districtId};`;
  const StateName = await db.get(StName_on_distID_Qry);
  response.send(StateName);
  console.log(StateName);
});
