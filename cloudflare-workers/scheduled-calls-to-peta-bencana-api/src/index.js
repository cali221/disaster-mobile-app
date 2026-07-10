/**
 * to start locally: npx wrangler dev --test-scheduled
 * to test run the worker locally: curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*" 
 */

import { createClient } from "@supabase/supabase-js";

export default {
	// code to run every minute:
	async scheduled(event, env, ctx) {
		/* Supabase client that bypasses RLS, 
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

		// set timeperiod to 60 seconds to get reports in the last minute
		const recentReportsResp = await fetch('https://api.petabencana.id/reports?geoformat=geojson&timeperiod=60');

		if (recentReportsResp.ok){
			const recentReportsJson = await recentReportsResp.json();
			const recentReportsArr = recentReportsJson['result']['features'];
		
			for(const report of recentReportsArr){
				const detailsData = report['properties']['report_data'];

				/* if the report is confirmed and has 'is_training' == false,
				   indicating it's not for training only, insert the data to database.
				   
				   NOTE: even then, some reports are simulation/for filming 
				   only as indicated in report['properties']['text'] */
				if (report['properties']['status'] == 'confirmed' && report['properties']['is_training'] == false){
					const { data, error } = await supabase.schema('public').rpc('insert_disaster_data_if_new', 
																		{
																			id_in_source_input: report['properties']['pkey'],
																			source_name_input: 'PetaBencana.id',
																			original_source_input: report['properties']['source'],
																			disaster_type_input: report['properties']['disaster_type'],
																			latitude_input: report['geometry']['coordinates'][1], // NOTE: using GeoJSON, longitude is the first element and latitude is the second
																			longitude_input: report['geometry']['coordinates'][0],
																			datetime_input: report['properties']['created_at'],
																			description_input: report['properties']['text'],
																			img_url_input: report['properties']['image_url'],
																			details_data: detailsData
																		});

					if(error){
						throw new Error(`Failed to conditionally insert disaster data using rpc. ${error.message}`)
					}
				}
			}
		}
		else{
			throw new Error(recentReportsResp);
		}
	},
};