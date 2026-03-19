<?php

namespace App\Mail;

use App\Models\Contract;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContractApprovalNotification extends Mailable
{
    use Queueable, SerializesModels;

    public Contract $contract;
    public string $messageText;

    public function __construct(Contract $contract, string $messageText)
    {
        $this->contract = $contract;
        $this->messageText = $messageText;
    }

    public function build()
    {
        return $this
            ->subject("Contract Update: {$this->contract->transaction_no}")
            ->view('emails.contract-approval-notification');
    }
}
