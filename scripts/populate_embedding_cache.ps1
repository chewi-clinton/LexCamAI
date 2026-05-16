Param(
    [string]$Image = 'lexcam/embedding-service:from-test'
)

Write-Output "Using image: $Image"

$tmp = New-TemporaryFile
$tmpDir = Split-Path $tmp -Parent

try {
    $cid = (docker create $Image).Trim()
    Write-Output "Created container $cid"
    docker cp "$cid`:/cache/model.onnx" "$tmpDir\model.onnx"
    docker rm $cid | Out-Null

    # create temporary container with volume mounted
    $vcontainer = (docker create --name tmp_embedding_volume -v embedding_cache:/cache busybox).Trim()
    docker cp "$tmpDir\model.onnx" "$vcontainer`:/cache/model.onnx"
    docker rm $vcontainer | Out-Null
    Write-Output "Model copied into volume 'embedding_cache'"
} finally {
    Remove-Item "$tmpDir\model.onnx" -ErrorAction SilentlyContinue
}
