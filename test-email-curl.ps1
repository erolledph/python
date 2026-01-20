# Test email using PowerShell (equivalent to curl)
# Replace YOUR_BREVO_API_KEY with your actual API key

$apiKey = "YOUR_BREVO_API_KEY"
$senderEmail = "noreply@jumble.sbs"
$senderName = "Test Sender"
$recipientEmail = "erolledph+test@gmail.com"

$headers = @{
    'accept' = 'application/json'
    'api-key' = $apiKey
    'content-type' = 'application/json'
}

$body = @{
    sender = @{
        name = $senderName
        email = $senderEmail
    }
    to = @(
        @{
            email = $recipientEmail
            name = "Test Recipient"
        }
    )
    subject = "Direct Brevo API Test - $(Get-Date)"
    htmlContent = @"
<h1>Direct API Test</h1>
<p>This email was sent directly to Brevo API using PowerShell.</p>
<p><strong>Sent at:</strong> $(Get-Date)</p>
<p><strong>From:</strong> $senderEmail</p>
<p><strong>To:</strong> $recipientEmail</p>
"@
} | ConvertTo-Json -Depth 3

Write-Host "Sending test email to $recipientEmail..."
Write-Host "From: $senderEmail"
Write-Host "Subject: Direct Brevo API Test - $(Get-Date)"

try {
    $response = Invoke-WebRequest -Uri "https://api.brevo.com/v3/smtp/email" -Method POST -Headers $headers -Body $body
    Write-Host "✅ Email sent successfully!"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Failed to send email:"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
        Write-Host "Content: $($_.Exception.Response.Content)"
    }
}
