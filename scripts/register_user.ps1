param(
  [string]$BaseUrl = 'http://localhost:5153',
  [string]$Email = '',
  [string]$Password = 'Uye123!x',
  [string]$DisplayName = 'NormalUye'
)

$ErrorActionPreference = 'Stop'
if (-not $Email -or $Email.Trim().Length -eq 0) {
  $Email = 'normal' + (Get-Random -Minimum 10000 -Maximum 99999) + '@example.com'
}

$payload = @{ email = $Email; password = $Password; displayName = $DisplayName } | ConvertTo-Json

try {
  $res = Invoke-RestMethod -Method Post -Uri ($BaseUrl + '/api/auth/register') -ContentType 'application/json' -Body $payload
  Write-Output ("EMAIL=" + $Email)
  Write-Output ("PASSWORD=" + $Password)
  exit 0
} catch {
  Write-Output ("ERROR: " + $_.Exception.Message)
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream());
    $body = $reader.ReadToEnd(); Write-Output ('BODY=' + $body)
  }
  exit 1
}

