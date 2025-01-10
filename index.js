const core = require('@actions/core');
const httpClient = require('@actions/http-client');
const dotnet_cdn_domain = "https://builds.dotnet.microsoft.com";
const dotnet_script_path = "dotnet/scripts/v1";
const version = require('./package.json').version;
const util = require('util');

async function run() {
    try {
        const script_file = core.getInput('script-file', { required: true });
        const user_etag = core.getInput('etag', { required: true });

        const script_url = new URL(`${dotnet_cdn_domain}/${dotnet_script_path}/${script_file}`);
        const client = new httpClient.HttpClient(`actions/check-dotnet-install-scripts-action@${version}`);
        const { message } = await client.head(script_url.toString(), { "If-None-Match": user_etag });
        if (core.isDebug) {
            core.debug(`Received ${message.statusCode} from HEAD request to ${script_url.toString()}.`);
            core.debug(`Received the following headers:`);
            core.debug(message.headers);
        }
        if (message.statusCode === 304 || (message.statusCode === 200 && message.headers["etag"] === user_etag)) {
            // it's a match - set the etag and succeed
            core.setOutput("current-etag", user_etag);
            console.log(`No updates available for ${script_file}.`);
            return;
        }
        else if (message.statusCode === 200) {
            // not an ETag match, send the 'current' ETag and fail
            const current_etag = message.headers["etag"];
            core.setOutput("current-etag", current_etag);
            core.setFailed(`There is a more recent version of ${script_file} available with ETag ${current_etag}. Please update your repository to use the latest version.`);
            return;
        }
        else {
            // there was some kind of error, fail the action
            core.setFailed(`Error checking for updates to ${script_file}: ${message.statusCode}}`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()