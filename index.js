const core = require('@actions/core');

const dotnet_cdn_domain = "https://builds.dotnet.microsoft.com";
const dotnet_script_path = "dotnet/scripts/v1";

try {
    const script_file = core.getInput('script-file');
    const etag = core.getInput('etag');

    const script_url = new URL(`${dotnet_cdn_domain}/${dotnet_script_path}/${script_file}`);
    const check_response = await fetch({
        url: script_url,
        method: HEAD,
        headers: { "If-None-Match": etag }
    });

    if (check_response.status === 304) {
        // it's a match - set the etag and succeed
        core.setOutput("current-etag", etag);
        return;
    }
    else if (check_response.status === 200) {
        // not an ETag match, send the 'current' ETag and fail
        const current_etag = check_response.headers.get("ETag");
        core.setOutput("current-etag", current_etag);
        core.setFailed(`There is a more recent version of ${script_file} available with ETag ${current_etag}. Please update your repository to use the latest version.`);
        return;
    }
    else {
        // there was some kind of error, fail the action
        core.setFailed(`Error checking for updates to ${script_file}: ${check_response.status} ${check_response.statusText}`);
    }
} catch (error) {
    core.setFailed(error.message);
}
