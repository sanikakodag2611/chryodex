<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductMaster extends Model
{
    use HasFactory;

    protected $table = 'product_master';

    protected $fillable = [
        'product_name',
        'code',
        'hsn_code',
        'price',
        'company_id',
        'tax_rate',
    ];
}
