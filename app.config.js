import 'dotenv/config';

module.exports = ({ config }) => {
  config.android.googleServicesFile = process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';
  return {
    ...config,
  };
};