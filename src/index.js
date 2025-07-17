// This is the main entry point for your Cloudflare Worker.
// It listens for 'scheduled' events (cron triggers) and 'fetch' events (HTTP requests).
export default {
    // The 'scheduled' handler is invoked when the Worker is triggered by a cron schedule.
    async scheduled(event, env, ctx) {
      console.log(`[${event.cron}] Cron trigger received at ${new Date().toISOString()}`);
      await fetchDataAndInsertIntoD1(env);
    },
  
    // The 'fetch' handler is invoked when the Worker receives an HTTP request.
    // This is included for testing purposes, allowing you to manually trigger the data fetch.
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const tableName = 'levels';
  
      // If the path is '/trigger-fetch', manually execute the data fetch logic.
      if (url.pathname === '/trigger-fetch') {
        try {
          await fetchDataAndInsertIntoD1(env);
          return new Response('Data fetch and D1 insertion initiated successfully!', { status: 200 });
        } catch (error) {
          console.error('Error during manual data fetch:', error);
          return new Response(`Error: ${error.message}`, { status: 500 });
        }
      }
  
      if (url.pathname === '/read-data') {
        try {
          if (!env.DB) {
            throw new Error('D1 database binding (env.DB) is not configured. Please check wrangler.toml.');
          }
  
          console.log(`Attempting to read all data from D1 table: ${tableName}`);
          // Fetch all rows from the table
          const { results } = await env.DB.prepare(`SELECT * FROM ${tableName}`).all();
  
          console.log(`Successfully read ${results.length} rows from D1.`);
  
          // Return the data as JSON
          return new Response(JSON.stringify(results, null, 2), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          });
  
        } catch (error) {
          console.error('Error reading data from D1:', error);
          return new Response(`Error reading data: ${error.message}`, { status: 500 });
        }
      }
  
      // For any other path, return a simple response.
      return new Response('Cloudflare Worker is running. Try /trigger-fetch to manually run the data ingestion.', { status: 200 });
    },
  };
  
  /**
   * Fetches JSON data from an external API and inserts it into a D1 database.
   * @param {Object} env - The environment variables, including the D1 binding.
   */
  async function fetchDataAndInsertIntoD1(env) {
    const externalApiUrl = 'https://waterdatafortexas.org/reservoirs/recent-conditions.json'; // API endpoint
    const keysToInclude = ['Canyon', 'Amistad', 'ChokeCanyon', 'Medina', 'OHIvie'] // JSON Keys to filter on
    const tableName = 'levels'; // Name of your D1 table
  
    try {
      // 1. Fetch JSON data from the external API
      console.log(`Fetching data from: ${externalApiUrl}`);
      const response = await fetch(externalApiUrl);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Expecting an array of JSON objects
      const rawJsonDataAll = await response.json();
      const rawJsonData = Object.fromEntries(Object.entries(rawJsonDataAll).filter(([key]) => keysToInclude.includes(key)));
      
      //const jsonDataAll = await response.json();
      //const jsonData = Object.fromEntries(Object.entries(jsonDataAll).filter(([key]) => keysToInclude.includes(key)));
      //console.log('Successfully fetched JSON data:', JSON.stringify(jsonData, null, 2));
  
      let dataToInsert = [];

      // --- MODIFICATION START ---
      // Try to determine if the fetched data is a direct array, nested array, or an object of items.
      if (Array.isArray(rawJsonData)) {
        dataToInsert = rawJsonData;
        console.log(`Fetched data is a direct array with ${dataToInsert.length} objects.`);
      } else if (typeof rawJsonData === 'object' && rawJsonData !== null) {
        // If it's an object but doesn't contain a common array key,
        // assume its values are the individual items to be inserted.
        // This handles structures like { "item1_id": {item_data}, "item2_id": {item_data} }
        const values = Object.values(rawJsonData);
        // Check if the values are indeed objects and not empty, to avoid processing non-item data
        if (values.length > 0 && typeof values[0] === 'object' && values[0] !== null) {
            dataToInsert = values;
            console.log(`Fetched data is an object, extracted array from its values with ${dataToInsert.length} objects.`);
        } else {
            console.warn('Fetched data is an object but does not contain a recognized array (data, items, results) or valid item objects as its direct values. No data to insert.');
            return;
        }
      } else {
        console.warn('Fetched data is not a valid JSON array or object. No data to insert.');
        return;
      }
  
      if (dataToInsert.length === 0) {
        console.warn('No data objects found to insert after parsing. Exiting.');
        return;
      }
    


      // For this example, we'll assume the JSON has 'id', 'userId', 'title', and 'body' fields.
      // Ensure your D1 table schema matches these fields.
      //const { timestamp, full_name, condensed_name, short_name, conservation_pool_elevation, elevation, percent } = jsonData;
  
      // 3. Insert data into D1 database
      // The 'env.DB' refers to the D1 binding defined in your wrangler.toml
      if (!env.DB) {
        throw new Error('D1 database binding (env.DB) is not configured. Please check wrangler.toml.');
      }
  
      // Example: Insert or update data. Using INSERT OR REPLACE for simplicity.
      // In a real application, you might use INSERT INTO ... ON CONFLICT DO UPDATE.
      const insertStatement = `
        INSERT OR REPLACE INTO ${tableName} (timestamp, fetched_on, full_name, condensed_name, short_name, conservation_pool_elevation, elevation, percent_full)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;
      const fetchedAt = new Date().toISOString(); // Timestamp when data was fetched

      // Use a batch array to prepare multiple statements for atomic execution
      const statements = [];
      for (const item of dataToInsert) {
        // Safely extract properties, providing null if they are missing
        const timestamp = item.timestamp !== undefined ? item.timestamp : null;
        const full_name = item.full_name !== undefined ? item.full_name : null;
        const condensed_name = item.condensed_name !== undefined ? item.condensed_name : null;
        const short_name = item.short_name !== undefined ? item.short_name : null;
        const conservation_pool_elevation = item.conservation_pool_elevation !== undefined ? item.conservation_pool_elevation : null;
        const elevation = item.elevation !== undefined ? item.elevation : null;
        const percent_full = item.percent_full !== undefined ? item.percent_full : null;

        statements.push(env.DB.prepare(insertStatement).bind(timestamp, fetchedAt, full_name, condensed_name, short_name, conservation_pool_elevation, elevation, percent_full));
      }

      console.log(`Attempting to insert ${statements.length} records into D1 table: ${tableName}`);
      // Execute all prepared statements in a single batch transaction
      const batchResults = await env.DB.batch(statements);
  
      console.log(`Batch insertion into D1 completed. Results:`, batchResults);
      // You can inspect batchResults for success/error of individual statements if needed
  
  
    } catch (error) {
      console.error('Error during data fetching or D1 insertion:', error);
      // In a production worker, you might want to send alerts or log to a service like Sentry.
    }
  }
  