import fs from 'fs';
import path from 'path';

const configPath = path.resolve(__dirname, '../../../sites/common_site_config.json');

let webserver_port = 8000;
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    webserver_port = config.webserver_port || 8000;
  } catch (e) {
    console.warn('Failed to parse common_site_config.json, using default port 8000.');
  }
} else {
  console.warn('common_site_config.json not found, using default port 8000 for proxy.');
}

export default {
	'^/(app|api|assets|files|private)': {
		target: `http://127.0.0.1:${webserver_port}`,
		ws: true,
		router: function(req: any) {
			const site_name = req.headers.host.split(':')[0];
			return `http://${site_name}:${webserver_port}`;
		}
	}
};
