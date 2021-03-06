//@ts-check

require('dotenv').config();
const cosmos = require("@azure/cosmos");
const CosmosClient = cosmos.CosmosClient;

const endpoint = process.env.QUERY_SCENARIO_COSMOS_ENDPOINT || process.env.COSMOS_ENDPOINT;
const key = process.env.QUERY_SCENARIO_COSMOS_KEY || process.env.COSMOS_KEY;
const dbId = process.env.QUERY_SCENARIO_COSMOS_DB || process.env.COSMOS_DB;
const containerId = process.env.QUERY_SCENARIO_COSMOS_CONTAINER || process.env.COSMOS_CONTAINER;

async function run() {
  const client = new CosmosClient({
    endpoint,
    key
  });

  const query1 = "Select * from c order by c._ts";
  const query2 = "Select * from c";
  const query3 = "Select value count(c.id) from c";

  const container = client.database(dbId).container(containerId);
  const options = {
    maxItemCount: 10000,
    maxDegreeOfParallelism: 1000,
    bufferItems: true
  };

  const scenarios = [];
  scenarios.push({ container, query: query1, options });
  scenarios.push({ container, query: query2, options });
  scenarios.push({ container, query: query3, options });

  for (const scenario of scenarios) {
    try {
      console.log("Scenario starting: " + scenario.query);
      const start = Date.now();
      await runScenario(scenario.container, scenario.query, scenario.options);
      console.log('Scenario complete: "' + scenario.query + '" - took ' + (Date.now() - start) / 1000 + "s" + ' -');
    } catch (e) {
      console.log("Scenario failed: " + scenario.query + " - " + JSON.stringify(scenario.options));
    }
  }
}

async function runScenario(container, query, options) {
  const queryIterator = container.items.query(query, options);
  let count = 0;
  while (queryIterator.hasMoreResults() && count <= 100000) {
    const { resources: results, headers } = await queryIterator.fetchNext();
    var requestCharge = headers['x-ms-request-charge'];
    console.log(requestCharge)
    if (results != undefined) {
      count = count + results.length;
    }
  }
}

run().catch(console.error);