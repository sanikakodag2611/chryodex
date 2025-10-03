<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sampledata extends Model
{
    //
    protected $table = 'sample_data';
    public $timestamps = false;
    protected $fillable = [
        'user_name',
        'password',
    ];
}
