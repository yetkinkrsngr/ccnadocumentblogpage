param(
  [string]$BaseUrl = 'http://localhost:5153',
  [string]$AdminEmail = 'yetkinkrsngr@gmail.com',
  [string]$OldPass = 'Admin123!',
  [string]$NewPass = 'Admin123!x'
)

$ErrorActionPreference = 'Stop'

function Step($name) { Write-Output "STEP:$name" }

try {
  Step 'HEALTH'
  Invoke-RestMethod -Method Get -Uri ($BaseUrl + '/health') | Out-Null
  Write-Output 'HEALTH_OK'

  Step 'DEV_SET_PASS'
  $body = @{ email = $AdminEmail; password = $OldPass } | ConvertTo-Json
  $dev = Invoke-RestMethod -Method Post -Uri ($BaseUrl + '/api/auth/dev/set-admin-user-password') -ContentType 'application/json' -Body $body
  Write-Output ("DEV_SET_PASS_OK message=" + $dev.message)

  Step 'LOGIN_OLD'
  $bodyLogin = @{ email = $AdminEmail; password = $OldPass } | ConvertTo-Json
  $login = Invoke-RestMethod -Method Post -Uri ($BaseUrl + '/api/auth/login-email') -ContentType 'application/json' -Body $bodyLogin
  $TOKEN = $login.token
  $MCP = $login.mustChangePassword
  Write-Output ("LOGIN_OLD_OK mustChangePassword=" + $MCP + " token_len=" + $TOKEN.Length)

  Step 'CHANGE_PASSWORD'
  $headers = @{ Authorization = ("Bearer " + $TOKEN) }
  $bodyCP = @{ currentPassword = $OldPass; newPassword = $NewPass } | ConvertTo-Json
  $cp = Invoke-RestMethod -Method Post -Uri ($BaseUrl + '/api/auth/change-password') -Headers $headers -ContentType 'application/json' -Body $bodyCP
  $TOKEN2 = $cp.token
  $MCP2 = $cp.mustChangePassword
  Write-Output ("CHANGE_PASS_OK mustChangePassword=" + $MCP2 + " token2_len=" + $TOKEN2.Length)

  Step 'ADMIN_LIST_COMMENTS'
  $headers2 = @{ Authorization = ("Bearer " + $TOKEN2) }
  $adm = Invoke-RestMethod -Method Get -Uri ($BaseUrl + '/api/comments') -Headers $headers2
  $count = ($adm | Measure-Object).Count
  Write-Output ("ADMIN_LIST_OK count=" + $count)

  Step 'LOGIN_NEW'
  $bodyLogin2 = @{ email = $AdminEmail; password = $NewPass } | ConvertTo-Json
  $login2 = Invoke-RestMethod -Method Post -Uri ($BaseUrl + '/api/auth/login-email') -ContentType 'application/json' -Body $bodyLogin2
  Write-Output ("LOGIN_NEW_OK mustChangePassword=" + $login2.mustChangePassword)
}
catch {
  Write-Output ("ERROR: " + $_.Exception.Message)
  exit 1
}

