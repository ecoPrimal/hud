# Wildflower generator — each reedit post becomes a static HTML page for SEO
$jsonPath = Join-Path $PSScriptRoot "..\data\reedit-gaia-posts.json"
$data = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

$flairStyles = @{
    'art'      = 'background:rgba(255,69,0,0.12);color:#ff4500'
    'nft'      = 'background:rgba(63,185,80,0.12);color:#16a34a'
    'zk'       = 'background:rgba(188,140,255,0.12);color:#8b5cf6'
    'patent'   = 'background:rgba(255,180,0,0.15);color:#b8860b'
    'campfire' = 'background:rgba(210,153,34,0.12);color:#ca8a04'
    'bio'      = 'background:rgba(63,185,80,0.12);color:#2ea043'
    'rust'     = 'background:rgba(248,81,73,0.12);color:#dc2626'
    'anderson' = 'background:rgba(110,118,129,0.12);color:#6e7681'
    'process'  = 'background:rgba(88,166,255,0.12);color:#2563eb'
    'comm'     = 'background:rgba(255,69,0,0.12);color:#ff4500'
    'null'     = 'background:rgba(110,118,129,0.2);color:#6e7681'
}

$sitemapEntries = @()
$indexLinks = @()

foreach ($post in $data.posts) {
    $id = $post.id
    $title = [System.Web.HttpUtility]::HtmlEncode($post.title) 2>$null
    if (-not $title) { $title = $post.title -replace '<','&lt;' -replace '>','&gt;' -replace '&','&amp;' -replace '"','&quot;' }
    $body = $post.body -replace '<','&lt;' -replace '>','&gt;' -replace '&','&amp;'
    $desc = if ($body.Length -gt 160) { $body.Substring(0, 157) + "..." } else { $body }
    $descAttr = $desc -replace '"','&quot;'
    $titleAttr = $title -replace '"','&quot;'
    $flair = $post.flair -replace '<','&lt;'
    $sub = $post.sub
    $author = $post.author
    $score = $post.score
    $source = $post.source -replace '<','&lt;'
    $fs = if ($flairStyles.ContainsKey($sub)) { $flairStyles[$sub] } else { 'background:rgba(110,118,129,0.12);color:#6e7681' }

    # Build thread HTML
    $threadHtml = ""
    if ($post.thread -and $post.thread.Count -gt 0) {
        $threadHtml = "<div class=`"thread`"><h4>comments</h4>"
        foreach ($t in $post.thread) {
            $tbody = $t.body -replace '<','&lt;' -replace '>','&gt;'
            $threadHtml += "<div class=`"comment`"><strong>u/$($t.author)</strong> &middot; $($t.score) points<br>$tbody</div>"
        }
        $threadHtml += "</div>"
    }

    # Build painting/extra
    $extraHtml = ""
    if ($post.painting) {
        $paintText = $post.painting -replace '<','&lt;'
        $extraHtml += "<blockquote style=`"border-left:3px solid #ff4500;padding-left:12px;margin:12px 0;color:var(--meta);font-style:italic`">$paintText</blockquote>"
    }

    $jsonLdTitle = $post.title -replace '"','\"' -replace '\\','\\\\'
    $jsonLdDesc = $desc -replace '"','\"' -replace '\\','\\\\'

    $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>$titleAttr - reedit - Gaia</title>
<meta name="description" content="$descAttr">
<meta property="og:title" content="$titleAttr">
<meta property="og:description" content="$descAttr">
<meta property="og:type" content="article">
<meta property="og:url" content="https://primals.eco/r/$id.html">
<meta property="og:site_name" content="Gaia - reedit">
<link rel="canonical" href="https://primals.eco/r/$id.html">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"$jsonLdTitle","description":"$jsonLdDesc","author":{"@type":"Organization","name":"Gaia","url":"https://primals.eco"},"publisher":{"@type":"Organization","name":"ecoPrimal","url":"https://primals.eco"},"mainEntityOfPage":"https://primals.eco/r/$id.html"}</script>
<style>
:root{--bg:#f6f7f8;--card:#fff;--text:#1a1a1b;--meta:#7c7c7c;--orange:#ff4500;--border:#edeff1;--link:#0079d3}
@media(prefers-color-scheme:dark){:root{--bg:#030303;--card:#1a1a1b;--text:#d7dadc;--meta:#818384;--border:#343536;--link:#4fbcff}}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6}
a{color:var(--link);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:700px;margin:0 auto;padding:16px}
.back{font-size:12px;color:var(--meta);margin-bottom:16px;display:block}
.card{background:var(--card);border:1px solid var(--border);border-radius:4px;padding:20px}
.flair{font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600;display:inline-block;margin-bottom:8px}
h1{font-size:22px;font-weight:600;margin-bottom:12px;line-height:1.3}
.meta{font-size:12px;color:var(--meta);margin-bottom:16px}
.body{font-size:15px;line-height:1.7}
.thread{margin-top:20px;border-top:1px solid var(--border);padding-top:12px}
.thread h4{font-size:14px;color:var(--meta);margin-bottom:8px}
.comment{padding:8px 0 8px 16px;border-left:2px solid var(--border);margin-top:8px;font-size:13px}
.comment strong{color:var(--meta);font-size:12px}
.nav{margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;font-size:13px}
.nav a{padding:6px 12px;border:1px solid var(--border);border-radius:4px;background:var(--card)}
.related{margin-top:16px;font-size:12px;color:var(--meta)}
.related a{display:block;padding:4px 0}
</style>
</head>
<body>
<div class="wrap">
<a class="back" href="/reedit.html">&larr; reedit</a>
<div class="card">
<span class="flair" style="$fs">$flair</span>
<h1>$title</h1>
<div class="meta">posted by <strong>u/$author</strong> &middot; score: $score &middot; source: $source</div>
<div class="body">$body</div>
$extraHtml
$threadHtml
</div>
<nav class="nav">
<a href="/gaia.html">Gaia</a>
<a href="/reedit.html">reedit</a>
<a href="/gaia.html#desk">[})O({] Desk</a>
<a href="https://nestgate.io">Spine</a>
</nav>
</div>
</body>
</html>
"@

    $outPath = Join-Path $PSScriptRoot "$id.html"
    [System.IO.File]::WriteAllText($outPath, $html, [System.Text.Encoding]::UTF8)
    $sitemapEntries += "  <url><loc>https://primals.eco/r/$id.html</loc></url>"
    $indexLinks += "<a href=`"/r/$id.html`">$($post.title)</a>"
    Write-Output "  wildflower: $id.html"
}

# Generate index page for /r/
$indexHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>reedit - All Posts - Gaia</title>
<meta name="description" content="All $($data.posts.Count) reedit posts from Gaia. Art, biology, patents, zero-knowledge, Rust, Anderson permeability, campfire stories, and sovereign process.">
<meta property="og:title" content="reedit - All Posts - Gaia">
<meta property="og:description" content="$($data.posts.Count) posts. Art, biology, patents, ZK, Rust, Anderson, campfire, sovereign process.">
<meta property="og:type" content="website">
<link rel="canonical" href="https://primals.eco/r/">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"reedit - Gaia","description":"All reedit posts from Gaia","numberOfItems":$($data.posts.Count),"publisher":{"@type":"Organization","name":"ecoPrimal","url":"https://primals.eco"}}</script>
<style>
:root{--bg:#f6f7f8;--card:#fff;--text:#1a1a1b;--meta:#7c7c7c;--orange:#ff4500;--border:#edeff1;--link:#0079d3}
@media(prefers-color-scheme:dark){:root{--bg:#030303;--card:#1a1a1b;--text:#d7dadc;--meta:#818384;--border:#343536;--link:#4fbcff}}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6}
a{color:var(--link);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:700px;margin:0 auto;padding:16px}
h1{font-size:24px;font-weight:700;margin-bottom:16px}
.posts a{display:block;padding:8px 0;border-bottom:1px solid var(--border)}
.back{font-size:12px;color:var(--meta);margin-bottom:16px;display:block}
</style>
</head>
<body>
<div class="wrap">
<a class="back" href="/reedit.html">&larr; reedit (full experience)</a>
<h1>reedit &mdash; All $($data.posts.Count) Posts</h1>
<p style="color:var(--meta);margin-bottom:16px">Gaia's wave. Each post is a wildflower. The field attracts the bees.</p>
<div class="posts">
$($indexLinks -join "`n")
</div>
<nav style="margin-top:24px;display:flex;gap:12px;font-size:13px">
<a href="/gaia.html" style="padding:6px 12px;border:1px solid var(--border);border-radius:4px;background:var(--card)">Gaia</a>
<a href="/reedit.html" style="padding:6px 12px;border:1px solid var(--border);border-radius:4px;background:var(--card)">reedit</a>
</nav>
</div>
</body>
</html>
"@

[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot "index.html"), $indexHtml, [System.Text.Encoding]::UTF8)
Write-Output "  wildflower index: index.html"

# Output sitemap fragment
$sitemapPath = Join-Path $PSScriptRoot "sitemap-reedit.xml"
$sitemapXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
$($sitemapEntries -join "`n")
  <url><loc>https://primals.eco/r/</loc></url>
  <url><loc>https://primals.eco/reedit.html</loc></url>
  <url><loc>https://primals.eco/gaia.html</loc></url>
</urlset>
"@
[System.IO.File]::WriteAllText($sitemapPath, $sitemapXml, [System.Text.Encoding]::UTF8)
Write-Output "  sitemap: sitemap-reedit.xml"
Write-Output "`nDONE: $($data.posts.Count) wildflowers planted + index + sitemap"
