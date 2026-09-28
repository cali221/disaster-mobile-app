/**
 * to start locally: npx wrangler dev --test-scheduled
 * to test run the worker locally: curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*" 
 */

import { createClient } from "@supabase/supabase-js";

export default {
	// code to run every minute:
	async scheduled(event, env, ctx) {
		/* Supabase client that bypasses RLS 
		   so that it can insert into tables with restricted inserts */
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
				detectSessionInUrl: false,
			},
			db: {
				schema: 'disasters_related_data'
			}
		});

		// Get BMKG latest earthquake data
		const bmkgLatestEarthquakeResp = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');

		if (bmkgLatestEarthquakeResp.ok){
			const bmkgLatestEarthquakeRespJson = await bmkgLatestEarthquakeResp.json();

			// construct JSON object for details data 
			// see PostgreSQL function insert_disaster_data_if_new for correct key names
			const detailsData = {
				'centerLocationText': bmkgLatestEarthquakeRespJson['Infogempa']['gempa']['Wilayah'],
				'potentialText': bmkgLatestEarthquakeRespJson['Infogempa']['gempa']['Potensi'],
				'depthInKm': parseFloat(bmkgLatestEarthquakeRespJson['Infogempa']['gempa']['Kedalaman'].split(' ')[0]),
				'magnitude': parseFloat(bmkgLatestEarthquakeRespJson['Infogempa']['gempa']['Magnitude']),
			};

			/* Insert the latest earthquake data into disasters table 
			   and earthquake_details table if no constraints were broken  */
			const { data, error } = await supabase.schema('public').rpc('insert_disaster_data_if_new', 
																		{
																			id_in_source_input: null,
																			source_name_input: 'Data Terbuka BMKG',
																			original_source_input: null,
																			disaster_type_input: 'earthquake',
																			latitude_input: parseFloat(bmkgLatestEarthquakeRespJson['Infogempa']['gempa']['Coordinates'].split(',')[0]),
																			longitude_input: parseFloat(bmkgLatestEarthquakeRespJson['Infogempa']['gempa']['Coordinates'].split(',')[1]),
																			datetime_input: bmkgLatestEarthquakeRespJson['Infogempa']['gempa']['DateTime'],
																			description_input: null,
																			img_url_input: `https://static.bmkg.go.id/${bmkgLatestEarthquakeRespJson['Infogempa']['gempa']['Shakemap']}`,
																			details_data: detailsData
																		});

			if(error){
				throw new Error(`Failed to conditionally insert disaster data using rpc. ${error.message}`)
			}
		}
		else{
			throw new Error(bmkgLatestEarthquakeResp);
		}
	},
};