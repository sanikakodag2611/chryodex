<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StateMaster extends Model
{
    protected $table = 'state_masters';
    protected $fillable = [
        'state_name',
        'state_abbr',
        'state_ut',
        'country_id',
    ];
}
