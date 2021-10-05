using System;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.UserSecrets;
using System.IO;
using models;
using Newtonsoft.Json.Linq;

namespace CosmicDJ
{
    class Program
    {
        private static IConfigurationBuilder builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile(@"appSettings.json", optional: false, reloadOnChange: true)
            .AddUserSecrets<Secrets>();
        private static IConfigurationRoot config = builder.Build();
        private static readonly string uri = config["uri"];
        private static readonly string key = config["key"];
        private static readonly CosmosClient client = new CosmosClient(uri, key);

        public static async Task Main(string[] args)
        {
            bool exit = false;
            while (exit == false)
            {
                Console.Clear();
                Console.WriteLine($"Cosmos DB Modeling and Partitioning Demos");
                Console.WriteLine($"-----------------------------------------");
                Console.WriteLine($"[a]   Query for single DJ");
                Console.WriteLine($"[b]   Point read for single DJ");
                Console.WriteLine($"-------------------------------------------");
                Console.WriteLine($"[k]   Create databases and containers");
                Console.WriteLine($"[l]   Upload data to containers");
                Console.WriteLine($"[m]   Delete databases and containers");
                Console.WriteLine($"-------------------------------------------");
                Console.WriteLine($"[x]   Exit");

                ConsoleKeyInfo result = Console.ReadKey(true);

                if (result.KeyChar == 'a')
                {
                    Console.Clear();
                    await QueryDJ();
                }
                else if (result.KeyChar == 'b')
                {
                    Console.Clear();
                    await GetDJ();
                }
               /*  else if (result.KeyChar == 'k')
                {
                    // Create databases and containers
                    await Deployment.CreateDatabase(client);
                    Console.Clear();
                    
                }
                else if (result.KeyChar == 'l')
                {
                    //Upload data to containers
                    await Deployment.LoadDatabase(client);
                    Console.Clear();
                }
                else if (result.KeyChar == 'm')
                {
                    //Delete databases and containers
                    await Deployment.DeleteDatabase(client);
                    Console.Clear();
              
                } */
                else if (result.KeyChar == 'x')
                {
                    exit = true;
                }
            }

        }
         public static async Task QueryDJ() 
        {
            Database database = client.GetDatabase("MusicService");
            Container container = database.GetContainer("dj");

            string documemntId = "bb43dfa6-8622-4314-afaa-8451f38b04ed";

            //Get a customer with a query
            string sql = $"SELECT * FROM c WHERE c.id = @id";

            FeedIterator<dj> resultSet = container.GetItemQueryIterator<dj>(
                new QueryDefinition(sql)
                .WithParameter("@id", documemntId),
                requestOptions: new QueryRequestOptions()
                {
                    PartitionKey = new PartitionKey(documemntId)
                });

            Console.WriteLine("Query for a single DJ\n");
            while (resultSet.HasMoreResults)
            {
                FeedResponse<dj> response = await resultSet.ReadNextAsync();

                foreach (dj customer in response)
                {
                    //Print(customer);
                    Console.WriteLine($"customer {customer.dj_name}\n");
                }

                Console.WriteLine($"Customer Query Request Charge {response.RequestCharge}\n");
                Console.WriteLine("Press any key to continue...");
                Console.ReadKey();
            }
        }

        public static async Task GetDJ()
        {
            Database database = client.GetDatabase("MusicService");
            Container container = database.GetContainer("dj");

            string documentId = "bb43dfa6-8622-4314-afaa-8451f38b04ed";
            string pk = "2 ELEMENTS";

            Console.WriteLine("Point Read for a single DJ\n");

            //Get a customer with a point read
            ItemResponse<dj> response =  await container.ReadItemAsync<dj>(
                id: documentId, 
                partitionKey: new PartitionKey(pk));

            Console.WriteLine($"Point Read Request Charge {response.RequestCharge}\n");
            Console.WriteLine("Press any key to continue...");
            Console.ReadKey();
        }
    
        public static void Print(object obj)
        {
           Console.WriteLine($"{JObject.FromObject(obj).ToString()}\n");
        }
    
    }

    class Secrets
    {
        public string uri="";
        public string key="";
    }
}

