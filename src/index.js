// This is the main entry point for your Cloudflare Worker.
// It listens for 'scheduled' events (cron triggers) and 'fetch' events (HTTP requests).
export default {
    // The 'scheduled' handler is invoked when the Worker is triggered by a cron schedule.
    async scheduled(event, env, ctx) {
      console.log(`[${event.cron}] Cron trigger received at ${new Date().toISOString()}`);
      await fetchDataAndInsertIntoD1(env);
    },
  
    // The 'fetch' handler is invoked when the Worker receives an HTTP request.
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const tableName = 'levels';
  
      // If the path is '/trigger-fetch', manually execute the data fetch logic.
      // if (url.pathname === '/trigger-fetch') {
      //   try {
      //     await fetchDataAndInsertIntoD1(env);
      //     return new Response('Data fetch and D1 insertion initiated successfully!', { status: 200 });
      //   } catch (error) {
      //     console.error('Error during manual data fetch:', error);
      //     return new Response(`Error: ${error.message}`, { status: 500 });
      //   }
      // }

      // Serve favicon.ico
      if (url.pathname === '/favicon.ico') {
        // Replace with your actual base64 encoded favicon data
        const faviconBase64 = "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"; // Your base64 data
        const faviconBuffer = Uint8Array.from(atob(faviconBase64), c => c.charCodeAt(0));

        return new Response(faviconBuffer, {
          headers: {
            'Content-Type': 'image/png', // Adjust based on your favicon type (e.g., 'image/x-icon' for .ico)
            'Cache-Control': 'public, max-age=31536000' // Cache for a long time
          }
        });
      } else {
        console.log(`URL "${ url.pathname }" accessed from ${ request.headers.get('CF-Connecting-IP') }`);
      }

      if (url.pathname === '/') {
        try {
          if (!env.DB) {
            throw new Error('D1 database binding (env.DB) is not configured. Please check wrangler.toml.');
          }

          const { results } = await env.DB.prepare(`SELECT * FROM ${tableName}`).all();
          //console.log('DB Query Result:', results); // <-- Check this!


          let chartData = '';
          const uniqueTimestamps = [...new Set(results.map(row => row.timestamp))].sort();
          const uniqueLakeNames = [...new Set(results.map(row => row.full_name))].sort();
  
          const datasets = uniqueLakeNames.map((lakeName, index) => {
            const dataPoints = uniqueTimestamps.map(timestamp => {
              const record = results.find(r => r.full_name === lakeName && r.timestamp === timestamp);
              return record ? record.percent_full : null; // Use null for missing data points
            });
  
            // Generate a consistent color for each line
            const hue = (index * 137.508) % 360; // Golden angle approximation for distinct hues
            const color = `hsl(${hue}, 70%, 50%)`; // HSL for vibrant colors
  
            return {
              label: lakeName,
              data: dataPoints,
              borderColor: color,
              backgroundColor: color,
              fill: false, // For line graph, typically don't fill
              tension: 0.1 // Smoothness of the line
            };
          });
  
          if (results.length > 0) {
            chartData += `
                <h1>My Favorite Lakes</h1>
                <div class="chart-container">
                  <canvas id="myChart"></canvas>
                </div>

                <script>
                  const ctx = document.getElementById('myChart').getContext('2d');
                  const myChart = new Chart(ctx, {
                    type: 'line', // Can be 'bar', 'line', 'pie', 'doughnut', etc.
                    data: {
                        labels: ${JSON.stringify(uniqueTimestamps)},
                        datasets: ${JSON.stringify(datasets)}
                    },
                    options: {
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Date'
                          },
                          type: 'category', // Treat labels as categories
                          ticks: {
                            autoSkip: true,
                            maxTicksLimit: 10
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Percent Full'
                          },
                          min: 0,
                          max: 100
                        }
                      }
                    }
                  });
                </script>
            `;
          } else {
            chartData += '<p class="no-data">No data found in the table to graph yet.</p>';
          }



          function convertToUtcSafeDate(dateString) {
            const parts = dateString.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            return new Date(Date.UTC(year, month, day));
          }

          let tableData = '';
          uniqueLakeNames.forEach(lake => {
            const lakeData = results.filter(item => item.full_name === lake);
            lakeData.sort((a, b) => {
              // If b's timestamp is newer than a's, b comes first (return positive)
              if (b.timestamp < a.timestamp) {
                return -1; // b comes before a
              }
              // If a's timestamp is newer than b's, a comes first (return positive)
              if (b.timestamp > a.timestamp) {
                return 1; // a comes before b
              }
              return 0; // timestamps are equal
            });


            //console.log('lakeData: ', lakeData);
            tableData += `<h2>${lake}</h2>`;
            tableData += '<table>';
            tableData += '<thead>';
            tableData += '<tr><th colspan="5" style="text-align:center">Latest Reading</th></tr>';
            tableData += '<tr><th>Date</th><th>Full</th><th>Elevation</th><th>Percent</th><th>Feet Down</th></tr>';
            tableData += '</thead>';
            tableData += `<tr><td style="font-weight: bold;">${ lakeData[0].timestamp }</td><td style="font-weight: bold;">${ lakeData[0].conservation_pool_elevation }</td><td style="font-weight: bold;">${ lakeData[0].elevation }</td><td style="font-weight: bold;">${ lakeData[0].percent_full }%</td><td style="font-weight: bold;">${ (lakeData[0].conservation_pool_elevation - lakeData[0].elevation).toFixed(1) }</td></tr>`;
            tableData += '<tr><th colspan="5" style="text-align:center; background-color: #66B2FF; padding: 10px;">Past Readings</th></tr>';
            tableData += `<tr><th style="background-color: #66B2FF; padding: 10px;">Date</th><th style="background-color: #66B2FF; padding: 10px;">Days Ago</th><th style="background-color: #66B2FF; padding: 10px;">Elevation</th><th style="background-color: #66B2FF; padding: 10px;">Percent</th><th style="background-color: #66B2FF; padding: 10px;">Change</th></tr>`;

            [1, 2, 3, 7, 14, 30, 90, 180, 365].forEach(num => {
              const date = convertToUtcSafeDate(lakeData[0].timestamp)
              date.setUTCDate(date.getUTCDate() - num)
              const data = lakeData.find(item => item.timestamp === date.toISOString().split('T')[0])
              if (data && data.elevation !== undefined && data.elevation !== null) {
                tableData += `<tr><td>${ data.timestamp }</td><td>${ num }</td><td>${ data.elevation }</td><td>${ data.percent_full }%</td><td>${ (lakeData[0].elevation - data.elevation).toFixed(2) }</td></tr>`;
              }
            });

            tableData += '</table>';
            tableData += '<br /><hr />';
          });



          let htmlData = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>My Lake Levels</title>
              <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
              <style>
                body { font-family: sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
                h1 { color: #0056b3; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #007bff; color: white; }
                tr:nth-child(even) { background-color: #f2f2f2; }
                tr:hover { background-color: #ddd; }
                .no-data { text-align: center; color: #666; margin-top: 30px; font-size: 1.1em; }
                .chart-container {
                  width: 100%;
                  height: 800px;
                  max-width: 3000px;
                  margin: 20px auto;
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 15px rgba(0,0,0,0.15);
                  box-sizing: border-box; /* Include padding in width */
                }
                /* Responsive adjustments for smaller screens */
                @media (max-width: 3000px) {
                  .chart-container {
                    width: 100%;
                    padding: 15px;
                  }
                }
              </style>
            </head>
            <body>
              ${ chartData }
              <hr />
              ${ tableData }
            </body>
            </html>
          `;

          return new Response(htmlData, {
            headers: { 'Content-Type': 'text/html' },
            status: 200,
          });

        } catch (error) {
          console.error('Error reading data for HTML table:', error);
          return new Response(`Error displaying data: ${error.message}`, {
            headers: { 'Content-Type': 'text/html' },
            status: 500
          });
        }
      }

      // For any other path, return a simple response.
      return new Response('Cloudflare Worker is running.', { status: 200 });

    },
  };
  
  /**
   * Fetches JSON data from an external API and inserts it into a D1 database.
   * @param {Object} env - The environment variables, including the D1 binding.
   */
  async function fetchDataAndInsertIntoD1(env) {
    const externalApiUrl = 'https://waterdatafortexas.org/reservoirs/recent-conditions.json'; // API endpoint
    const keysToInclude = ['Canyon', 'Amistad', 'ChokeCanyon', 'Medina', 'OHIvie', 'Travis'] // JSON Keys to filter on
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
      
      let dataToInsert = [];

      // Try to determine if the fetched data is a direct array, nested array, or an object of items.
      if (Array.isArray(rawJsonData)) {
        dataToInsert = rawJsonData;
        console.log(`Fetched data is a direct array with ${dataToInsert.length} objects.`);
      } else if (typeof rawJsonData === 'object' && rawJsonData !== null) {
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
    
      if (!env.DB) {
        throw new Error('D1 database binding (env.DB) is not configured. Please check wrangler.toml.');
      }
  
      const insertStatement = `
        INSERT OR REPLACE INTO ${tableName} (timestamp, fetched_on, full_name, condensed_name, short_name, conservation_pool_elevation, elevation, percent_full)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;
      const fetchedAt = new Date().toISOString(); // Timestamp when data was fetched

      const statements = [];
      for (const item of dataToInsert) {
        const timestamp = item.timestamp !== undefined ? item.timestamp : null;
        const full_name = item.full_name !== undefined ? item.full_name : null;
        const condensed_name = item.condensed_name !== undefined ? item.condensed_name : null;
        const short_name = item.short_name !== undefined ? item.short_name : null;
        const conservation_pool_elevation = item.conservation_pool_elevation !== undefined ? item.conservation_pool_elevation : null;
        const elevation = item.elevation !== undefined ? item.elevation : null;
        const percent_full = item.percent_full !== undefined ? item.percent_full : null;

        statements.push(env.DB.prepare(insertStatement).bind(timestamp, fetchedAt, full_name, condensed_name, short_name, conservation_pool_elevation, elevation, percent_full));
      }

      const batchResults = await env.DB.batch(statements);
  
      console.log(`Batch insertion into D1 completed. Results:`, batchResults);
  
  
    } catch (error) {
      console.error('Error during data fetching or D1 insertion:', error);
    }
  }
  