npm version minor --prefix "./web" --git-tag-version false

$web = Get-Content './web/package.json' -raw | ConvertFrom-Json
$app = Get-Content './app/.homeycompose/app.json' -raw
$version = "`"version`": `"" + $web.version + "`","
$app = $app -replace '\"version\"\:.*\"(.+)\"\,',$version
$app | Set-Content './app/.homeycompose/app.json'