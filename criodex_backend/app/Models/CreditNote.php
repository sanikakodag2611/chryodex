<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditNote extends Model
{
    protected $table = 'credit_note_records';

    
    protected $fillable = [
        'invoice_no',
        'date',
        'customer',
        'salesman',
        'bill_amount',
        'party_code',
        'item',
        'unit',
        'qty',
        'rate',
        'amount',
        'tax_per',
        'tax_amount',
        'destination',
        'hsn_code',
        'freight',
        'city',  
         'transport',
        'commission',       
    ];

    protected $casts = [
        'bill_amount' => 'float',
        'rate' => 'float',
        'amount' => 'float',
        'tax_per' => 'float',
        'tax_amount' => 'float',
        // 'cgst_rate' => 'float',
        // 'sgst_rate' => 'float',
        // 'igst_rate' => 'float',
        'freight' => 'float',
        'qty' => 'integer',  
         'transport' => 'float',
        'commission' => 'float', 
    ];
}
