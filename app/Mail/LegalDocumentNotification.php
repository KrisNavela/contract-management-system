<?php

namespace App\Mail;

use App\Models\LegalDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LegalDocumentNotification extends Mailable
{
    use Queueable, SerializesModels;

    public LegalDocument $document;
    public string $messageText;

    public function __construct(LegalDocument $document, string $messageText)
    {
        $this->document = $document;
        $this->messageText = $messageText;
    }

    public function build()
    {
        return $this
            ->subject("Legal Document Update: {$this->document->reference_no}")
            ->view('emails.legal-document-notification');
    }
}
