$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $repoRoot

try {
    $output = & npx.cmd --yes supabase@latest db query --remote --read-only --output json --file supabase/schema_snapshot_query.sql
    if ($LASTEXITCODE -ne 0) {
        throw 'Read-only schema snapshot query failed.'
    }

    $text = [string]::Join("`n", $output)
    $start = $text.IndexOf('{')
    if ($start -lt 0) {
        throw 'Supabase CLI returned no JSON result.'
    }

    $payload = ConvertFrom-Json -InputObject $text.Substring($start)
    if (-not $payload.rows -or -not $payload.rows[0].catalog_snapshot) {
        throw 'Supabase CLI returned no catalog snapshot.'
    }

    $snapshot = $payload.rows[0].catalog_snapshot
    $snapshot | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath 'supabase/production_schema_snapshot.json' -Encoding utf8
    Write-Output 'Updated supabase/production_schema_snapshot.json (schema metadata only).'
}
finally {
    Pop-Location
}
