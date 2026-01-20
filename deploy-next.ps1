# ================= CONFIG =================
$PEM_PATH = "$HOME\Downloads\pems\cred-2.pem"
$EC2_USER = "ec2-user"
$EC2_HOST = "ec2-13-201-83-62.ap-south-1.compute.amazonaws.com"

$LOCAL_RELEASES_DIR = "releases"
$REMOTE_BASE = "/home/ec2-user/crm"
$REMOTE_RELEASES_DIR = "$REMOTE_BASE/releases"

# ================= PICK LATEST RELEASE =================
$Release = Get-ChildItem $LOCAL_RELEASES_DIR |
    Sort-Object Name -Descending |
    Select-Object -First 1

if (-not $Release) {
    Write-Error "❌ No release found"
    exit 1
}

$ReleaseName = $Release.Name
$TarName = "$ReleaseName.tar.gz"
$TarPath = Join-Path $LOCAL_RELEASES_DIR $TarName

Write-Host "📦 Packaging $ReleaseName" -ForegroundColor Cyan

# ================= CREATE TAR =================
if (Test-Path $TarPath) {
    Remove-Item $TarPath
}

tar -C $LOCAL_RELEASES_DIR -czf $TarPath $ReleaseName

# ================= ENSURE REMOTE DIR =================
ssh -i $PEM_PATH "${EC2_USER}@${EC2_HOST}" `
    "mkdir -p $REMOTE_RELEASES_DIR"

Write-Host "🚀 Uploading $TarName" -ForegroundColor Cyan

# ================= SCP TAR =================
scp -q -i $PEM_PATH `
    $TarPath `
    "${EC2_USER}@${EC2_HOST}:$REMOTE_RELEASES_DIR/"

# ================= EXTRACT ON SERVER =================
ssh -i $PEM_PATH "${EC2_USER}@${EC2_HOST}" `
    "cd $REMOTE_RELEASES_DIR &&
     tar -xzf $TarName &&
     rm $TarName"

Write-Host "✅ Release deployed (not activated)" -ForegroundColor Green
