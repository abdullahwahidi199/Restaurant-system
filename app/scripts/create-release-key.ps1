[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$androidDirectory = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../android'))
$signingDirectory = Join-Path $androidDirectory '.signing'
$keystorePath = Join-Path $signingDirectory 'pakhlai-release.jks'
$propertiesPath = Join-Path $androidDirectory 'key.properties'
if ((Test-Path -LiteralPath $keystorePath) -or (Test-Path -LiteralPath $propertiesPath)) {
    throw 'Signing files already exist. They were left unchanged; reuse the existing key for updates.'
}
$keytoolPath = (Get-Command keytool -ErrorAction Stop).Source

function Protect-SigningFile([string] $Path) {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
    $acl = Get-Acl -LiteralPath $Path
    $acl.SetAccessRuleProtection($true, $false)
    $acl.SetAccessRule([Security.AccessControl.FileSystemAccessRule]::new(
        $identity, 'FullControl', 'Allow'))
    Set-Acl -LiteralPath $Path -AclObject $acl
}

New-Item -ItemType Directory -Path $signingDirectory -Force | Out-Null
Protect-SigningFile $signingDirectory
$randomBytes = New-Object byte[] 48
$generator = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $generator.GetBytes($randomBytes) } finally { $generator.Dispose() }
$signingPassword = [Convert]::ToBase64String($randomBytes)
$previousPassword = $env:PAKHLAI_SIGNING_PASSWORD
try {
    $env:PAKHLAI_SIGNING_PASSWORD = $signingPassword
    & $keytoolPath -genkeypair -keystore $keystorePath -storetype JKS `
        -keyalg RSA -keysize 3072 -validity 10000 -alias pakhlai `
        -storepass:env PAKHLAI_SIGNING_PASSWORD -keypass:env PAKHLAI_SIGNING_PASSWORD `
        -dname 'CN=Pakhlai Android, OU=Mobile, O=Pakhlai, C=AF' -noprompt
    if ($LASTEXITCODE -ne 0) { throw 'The release keystore could not be created.' }
    Protect-SigningFile $keystorePath
    # Generated local credentials, never source code or public download assets.
    $properties = "storePassword=$signingPassword`nkeyPassword=$signingPassword`nkeyAlias=pakhlai`nstoreFile=.signing/pakhlai-release.jks`n"
    [IO.File]::WriteAllText($propertiesPath, $properties, [Text.UTF8Encoding]::new($false))
    Protect-SigningFile $propertiesPath
    Write-Output 'Release signing files created privately in app/android. Back up key.properties and .signing/pakhlai-release.jks together; future updates require the same key.'
} finally {
    $env:PAKHLAI_SIGNING_PASSWORD = $previousPassword
    $signingPassword = $null
}
