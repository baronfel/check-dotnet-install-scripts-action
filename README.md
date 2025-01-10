# check-dotnet-install-scripts-action

A Github Actions script that checks if a local copy of the dotnet-install scripts is up to date or not, according to the official dotnet CDN.
This script uses the [ETag](https://developer.mozilla.org/docs/Web/HTTP/Headers/ETag), or Entity Tag, value of the script to determine up-to-date-d-ness.

## Inputs

### `script-file`

**Required** The name of the script file to check. Should be either 'dotnet-install.sh' or 'dotnet-install.ps1'. Defaults to 'dotnet-install.sh'

### `etag`

**Required** The ETag value of the script to check against. This is a string value that can be found in the 'ETag' HTTP response headers of the script URL. There is no default, so you will need to store and know this value. 

You can get the latest one by running the following command in your terminal:

```bash
curl -s --head https://builds.dotnet.microsoft.com/dotnet/scripts/v1/dotnet-install.sh | grep ETag | cut -d' ' -f2
```

```powershell
(curl -s --head https://builds.dotnet.microsoft.com/dotnet/scripts/v1/dotnet-install.ps1 | select-string ETag) -split " " | select-object -index 1
```

## Outputs

### `current-etag`

The current ETag of the script that was requested. This is the value that you can use to update your local copy of the script.

## Example usage

```yaml
uses: baronfel/check-dotnet-install-scripts-action@e76147da8e5c81eaf017dede5645551d4b94427b
with:
    script-file: dotnet-install.sh
    etag: 0x8DD2F3D8D65F264
```
