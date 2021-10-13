// @ts-check
//  <ImportConfiguration>
const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("./config");
const dbContext = require("./data/databaseContext");
//  </ImportConfiguration>

const newItem = {
  "dj_name": "Benito G",
  "name": "Ben Griffin",
  "country": "Australia",
  "genres": "EDM, Minimal Tech",
  "biography": "From being on stage with Miley and Pharrell at Wembley Stadium, to having the fashion and music magazine (of which she was Creative Director) on the coffee table of the legendary Absolutely Fabulous character Eddie Monsoon, Alexis Knox has established herself as an internationally known Fashion Stylist, TV Presenter, DJ and all round fashionista.\n\nAs a renowned celebrity and fashion stylist, she’s had her work on the runways of some of the most respected shows, from London to Milan, with a cheeky stop in Monaco somewhere in between. You’ll find her at all the fashion weeks, wearing the latest and greatest collections from some of her favourite designers, given a twist of course with her unique style. No doubt you’ll see her, Chihuahua Prince Knox in tow, at all the best parties, sharing the decks with Paris Hilton, dancing the night away with Jeremy Scott and being ‘papped’ by Jean Paul Gaultier. If anything, Alexis’ world of TV, fashion and fun is nothing short of being Absolutely Outrageous! \n\nWith 10 years of expertise in the industry, and a ‘LOL’ attitude in life, Alexis is the go-to for cutting edge fashion with a consumer friendly commercial understanding. Her bubbling personality, charming wit, and an insatiable love of all things pop culture make her a powerhouse in presenting with a one of a kind personal aesthetic. DJ’ing with a signature blend of hip hop, power pop, and 90s classics Alexis Knox always makes for a memorable and exciting performance in all capacities.",
}

async function main () {
  // <CreateClientObjectDatabaseContainer>
  const { endpoint, key, databaseId, containerId } = config;
  const client = new CosmosClient({ endpoint, key });

  const database = client.database(databaseId);
  const container = database.container(containerId);

  // Make sure the database is already setup. If not, create it.
  await dbContext.create(client, databaseId, containerId);
  // </CreateClientObjectDatabaseContainer>
  try {
    // <QueryItems>
    console.log(`Querying container: Getting all items`);

    // query to return all items
    const querySpec = {
      query: "SELECT * from c"
    };
    
    // read all items in the Items container
    /*const { resources: items } = await container.items.query(querySpec).fetchAll();
    items.forEach(item => {
      console.log(`${item.id} - ${item.dj_name}`);
    }
    var requestCharge1 = headers['x-ms-request-charge'];
    console.log(requestCharge1)*/
    const response = await container.items.query(querySpec).fetchAll();
    response.resources.forEach(item => console.log(`${item.id} - ${item.dj_name}`));
    console.log(response.requestCharge)

     // Query single item
    const response1 = await container.item("4be104bc-448e-4b39-934d-3a484c8df6a4", "NORA BEE").read();
    console.log(response1.resource)
    console.log(response1.requestCharge)
    
    const singleItemResponse = await container.item("4be104bc-448e-4b39-934d-3a484c8df6a4", "NORA BEE").read();
    const dj = singleItemResponse.resource
    console.log(`\r\nPoint Read\r\n${dj.id} - ${dj.dj_name}\r\n`);
    console.log(singleItemResponse.requestCharge)

    const { resource: dj1, headers: headers2 } = await container.item("4be104bc-448e-4b39-934d-3a484c8df6a4", "NORA BEE").read();
    //const {FeedResponse: resources: dj1, headers: requestCharge}
    console.log(`\r\nPoint Read\r\n${dj1.id} - ${dj1.dj_name}\r\n`);
    var requestCharge = headers2['x-ms-request-charge'];
    console.log(requestCharge)
    
     // Query single item with request charge
   
    /*const item = await client
    .database('MusicService')
    .container('dj')
    .item('4be104bc-448e-4b39-934d-3a484c8df6a4', 'NORA BEE')
    .read();
    console.log(`Pring read with request charges.`);
    var requestCharge1 = item.headers['x-ms-request-charge'];
    console.log(`\r\nPoint Read\r\n${items.id} - ${items.dj_name}\r\n`);
    console.log(requestCharge1)


  // end single item
    // </QueryItems>

    // <CreateItem>
    /** Create new item
     * newItem is defined at the top of this file
     */
  const { resource: createdItem } = await container.items.create(newItem);
    
  console.log(`\r\nCreated new item: ${createdItem.id} - ${createdItem.dj_name}\r\n`);
    // </CreateItem>
    
    // <UpdateItem>
    /** Update item
     * Pull the id and partition key value from the newly created item.
     * Update the isComplete field to true.
     */
  const { id, dj_name } = createdItem;

  createdItem.isComplete = true;

  const { resource: updatedItem } = await container
    .item(id, dj_name)
    .replace(createdItem);

  console.log(`Updated item: ${updatedItem.id} - ${updatedItem.dj_name}`); 
  console.log(`Updated isComplete to ${updatedItem.isComplete}\r\n`);
    // </UpdateItem>
    
    // <DeleteItem>    
    /**
     * Delete item
     * Pass the id and partition key value to delete the item
     */
  const { resource: result } = await container.item(id, dj_name).delete();
  console.log(`Deleted item with id: ${id}`);
    // </DeleteItem>  
    
  } catch (err) {
    console.log(err.message);
  }
};
main();