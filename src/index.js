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
      function getChangeWithTrendIcon(val) {
        if (val > 0) {
          // Positive change (Rising): Green Up Arrow
          return `<span style="color: green;">&#9650;</span> ${val}`; 
        } else if (val < 0) {
            // Negative change (Falling): Red Down Arrow
            return `<span style="color: red;">&#9660;</span> ${val}`; 
        } else {
            // No change: Grey Dash
            return `<span style="color: gray;">-</span> ${val}`;
        }
      }
      const url = new URL(request.url);
      const tableName = 'levels';
  
      // If the path is '/trigger-fetch', manually execute the data fetch logic.
      // if (url.pathname === '/trigger-fetch') {
      //   try {
      //     console.log(`Manual trigger received at ${new Date().toISOString()}`);
      //     await fetchDataAndInsertIntoD1(env);
      //     return new Response('Manual Data fetch and D1 insertion initiated successfully!', { status: 200 });
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
          //console.log('DB Query Result:', results);

          let chartScript = '';
          // Get Unique Timestamps and Lake Names for X Axis and Series
          const uniqueTimestamps = [...new Set(results.map(row => row.timestamp))].sort();
          const uniqueLakeNames = [...new Set(results.map(row => row.full_name))].sort();
  
          // Build the DataSet for each lake
          const datasets = uniqueLakeNames.map((lakeName, index) => {
            const dataPoints = uniqueTimestamps.map(timestamp => {
              const record = results.find(r => r.full_name === lakeName && r.timestamp === timestamp);
              return record ? record.percent_full : null;
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
  
          // Build the client-side javascript for the graph
          if (results.length > 0) {
            chartScript += `
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
            chartScript += '<p class="no-data">No data found in the table to graph yet.</p>';
          }



          function convertToUtcSafeDate(dateString) {
            const parts = dateString.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            return new Date(Date.UTC(year, month, day));
          }

          // Build the Tables for each Lake
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
            tableData += `<div class="lake-card">`;
            tableData += `  <h2>${lake}</h2>`;
            tableData += '  <table>';
            tableData += '    <thead>';
            tableData += '      <tr><th colspan="5" style="text-align:center">Latest Reading</th></tr>';
            tableData += '      <tr><th>Date</th><th>Full</th><th>Elevation</th><th>Percent</th><th>Feet Down</th></tr>';
            tableData += '    </thead>';
            tableData += '    <tbody>';           
            tableData += `      <tr><td data-label="Date">${ lakeData[0].timestamp }</td><td data-label="Full">${ lakeData[0].conservation_pool_elevation }</td><td data-label="Elevation">${ lakeData[0].elevation }</td><td data-label="Percent">${ lakeData[0].percent_full }%</td><td data-label="Feet Down">${ (lakeData[0].conservation_pool_elevation - lakeData[0].elevation).toFixed(1) }</td></tr>`;
            tableData += '      <tr><th colspan="5" style="text-align:center; color:white;">Past Readings</th></tr>';
            tableData += `      <tr><th style="background-color: #66B2FF; padding: 10px;">Date</th><th style="background-color: #66B2FF; padding: 10px;">Days Ago</th><th style="background-color: #66B2FF; padding: 10px;">Elevation</th><th style="background-color: #66B2FF; padding: 10px;">Percent</th><th style="background-color: #66B2FF; padding: 10px;">Change</th></tr>`;

            [1, 2, 3, 7, 14, 30, 90, 180, 365].forEach(num => {
              const date = convertToUtcSafeDate(lakeData[0].timestamp)
              date.setUTCDate(date.getUTCDate() - num)
              const data = lakeData.find(item => item.timestamp === date.toISOString().split('T')[0])
              if (data && data.elevation !== undefined && data.elevation !== null) {
                tableData += `<tr><td data-label="Date">${ data.timestamp }</td><td data-label="Days Ago">${ num }</td><td data-label="Elevation">${ data.elevation }</td><td data-label="Percent">${ data.percent_full }%</td><td data-label="Change">${ getChangeWithTrendIcon((lakeData[0].elevation - data.elevation).toFixed(2)) }</td></tr>`;
              }
            });

            tableData += '    </tbody>';
            tableData += '   </table>';
            tableData += '</div>';
          });


          // Build the Responsive Web UI
          let htmlData = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>My Lake Levels</title>
              <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
              <style>
                /* --- General Modern Styling --- */
                body { 
                  font-family: 'Roboto', sans-serif; 
                  margin: 0; 
                  background-color: #f8f9fa; 
                  color: #343a40; 
                }

                .container {
                  max-width: 80%;
                  margin: 0 auto;
                  padding: 20px;
                }

                header {
                  text-align: center;
                  padding: 20px 0;
                  border-bottom: 1px solid #dee2e6;
                  margin-bottom: 30px;
                }

                h1 { 
                  color: #0056b3; 
                  font-size: 2.5rem;
                  font-weight: 700;
                  margin: 0;
                }

                h2 {
                  font-size: 1.8rem;
                  color: #007bff;
                  border-bottom: 2px solid #007bff;
                  padding-bottom: 10px;
                  margin-top: 0;
                }

                /* --- Chart Styling --- */
                .chart-container {
                  width: 100%;
                  height: 500px; /* Reduced height for better balance */
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                  box-sizing: border-box; 
                  margin-bottom: 40px;
                }

                /* --- Card Layout for Lakes --- */
                .lakes-grid {
                  display: grid;
                  /* Creates 2 columns on medium screens, 3 on large */
                  grid-template-columns: repeat(auto-fit, minmax(550px, 1fr));
                  gap: 25px;
                }
                
                .lake-card {
                  background-color: #fff;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                  padding: 20px;
                  overflow-x: auto; /* Ensures table doesn't break card layout */
                }
                
                /* --- Modern Table Styling --- */
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 20px; 
                }

                th, td { 
                  border: 1px solid #dee2e6; 
                  padding: 12px 15px; 
                  text-align: left; 
                }

                thead th { 
                  background-color: #007bff; 
                  color: white; 
                  font-weight: 400;
                }
                
                /* Style for sub-headers like "Past Readings" */
                th[colspan="5"] {
                  background-color: #6c757d;
                  font-weight: 400;
                  text-align: center;
                }

                tbody tr:nth-child(even) { 
                  background-color: #f8f9fa; 
                }

                tbody tr:hover { 
                  background-color: #e9ecef; 
                }
                
                td.latest-reading {
                  font-weight: 700;
                  color: #333;
                }

                /* --- RESPONSIVE DESIGN --- */
                @media (max-width: 768px) {
                  h1 { font-size: 2rem; }
                  h2 { font-size: 1.5rem; }

                  .chart-container {
                    height: 350px; /* Shorter chart on mobile */
                  }

                  /* This is the magic for responsive tables */
                  .lake-card table thead {
                    display: none; /* Hide the desktop table headers */
                  }
                  
                  .lake-card table, 
                  .lake-card table tbody, 
                  .lake-card table tr, 
                  .lake-card table td {
                    display: block; /* Make table elements stack vertically */
                    width: 100%;
                  }

                  .lake-card table tr {
                    margin-bottom: 15px;
                  }

                  .lake-card table td {
                    text-align: right; /* Align value to the right */
                    padding-left: 50%; /* Make room for the label */
                    position: relative;
                    border-bottom: 1px solid #dee2e6;
                  }

                  /* Use the data-label attribute to create a pseudo-header */
                  .lake-card table td::before {
                    content: attr(data-label); /* The text comes from the data-label */
                    position: absolute;
                    left: 10px;
                    width: 45%;
                    text-align: left;
                    font-weight: bold;
                  }
                  
                  /* Clean up latest reading row on mobile */
                  .lake-card table tr:first-child td {
                    background-color: #007bff;
                    color: white;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <header>
                  <h1>My Favorite Lakes</h1>
                </header>

                <main>
                  <div class="chart-container">
                    <canvas id="myChart"></canvas>
                  </div>

                  <div class="lakes-grid">
                    ${ tableData }
                  </div>
                </main>

                <footer style="margin-top: 40px; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-family: sans-serif; color: #6b7280; font-size: 0.875rem;">
                    <p style="margin: 0;"> Data provided by <a href="https://www.waterdatafortexas.org" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none;">Water Data for Texas</a> (Texas Water Development Board).</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.75rem;">This application is for informational purposes only and is not officially affiliated with the TWDB.</p>
                </footer>
              </div>
              ${ chartScript }
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
    const externalApiUrl = 'https://waterdatafortexas.org/reservoirs/recent-conditions.json';
    const lakesToInclude = ['Canyon', 'Amistad', 'ChokeCanyon', 'Medina', 'OHIvie', 'Travis']
    const tableName = 'levels';

    const dateOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Chicago'
    };
    const dateFormatter = new Intl.DateTimeFormat('en-CA', dateOptions); //Using en-CA so the Date is formatted as YYYY-MM-DD

    try {
  	  const localDate = dateFormatter.format(new Date());
	    console.log('localDate:', localDate);

      const { results } = await env.DB.prepare(`SELECT * FROM ${tableName} WHERE timestamp = '${localDate}'`).all();
      console.log('Existing DB Query Result:', results);
      const lakesToExclude = results.map(item => item.condensed_name);
      console.log('Already Have Data From These Lakes for Today:', lakesToExclude);

      const keysToInclude = lakesToInclude.filter(key => !lakesToExclude.includes(key));
      console.log('Need Data From These Lakes for Today:', keysToInclude);

      if (!keysToInclude.length) {
        console.log('No Data Needed For Today.  Exiting....');
      } else {
        // Fetch JSON data from the external API
        console.log(`Fetching data from: ${externalApiUrl}`);
        const response = await fetch(externalApiUrl);
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Expecting an array of JSON objects
        const rawJsonDataAllData = await response.json();
        const rawJsonDataAll = Object.fromEntries(Object.entries(rawJsonDataAllData).filter(([key]) => keysToInclude.includes(key)));
        const rawJsonData = Object.fromEntries(Object.entries(rawJsonDataAll).filter(([key, lake]) => lake.timestamp === localDate));
        console.log('rawJsonData:', rawJsonData);
        
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
      }
    } catch (error) {
      console.error('Error during data fetching or D1 insertion:', error);
    }
  }
  